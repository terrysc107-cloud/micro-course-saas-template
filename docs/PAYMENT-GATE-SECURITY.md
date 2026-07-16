# Payment gate security

**Status:** applied to production on 2026-07-16 after a passing Supabase preview-branch gate.  
**Migration:** `supabase/migrations/20260716124800_secure_course_purchase_rls.sql`  
**Verification:** baseline exploit returned `201` before the migration and `403` after it; production now has one SELECT-only policy and no authenticated write privileges.

---

## The vulnerability

`course-schema.sql` shipped this policy:

```sql
CREATE POLICY "own rows" ON course_purchases
  FOR ALL USING (auth.uid() = user_id);
```

That is a free-course bug.

Postgres rule: **when a policy specifies `USING` but no `WITH CHECK`, the `USING`
expression is also applied as the `WITH CHECK` expression for new rows.** With `FOR ALL`,
that covers `INSERT`. So the policy reads as "you may insert a `course_purchases` row as
long as `user_id` is your own id" — which is exactly what an attacker wants to do.

Supabase also grants `anon` and `authenticated` broad table privileges by default and
relies on RLS to constrain them, and the anon key plus PostgREST is reachable from any
browser. So the whole exploit is one call, from a legitimately signed-up account, with a
key we publish in our own client bundle:

```js
// Sign up normally, open devtools, run this. You now own the course.
await supabase.from('course_purchases').insert({
  user_id: (await supabase.auth.getUser()).data.user.id,
  stripe_session_id: 'forged',
  is_active: true,
});
```

`proxy.ts` checks `course_purchases` for an active row using the service role and then
grants access to `/dashboard` and `/learn`. It never verifies that Stripe put the row
there. A forged row is indistinguishable from a paid one.

Secondary issues from the same policy:
- **UPDATE** — a user could flip `is_active` back to `true` after a refund.
- **DELETE** — a user could delete purchase records, destroying our audit trail.

### Severity

High. No special tooling, no stolen credentials, no race condition. Any user who can sign
up can take the product for free, and we would have no reliable way to distinguish forged
grants from real ones after the fact.

### Exposure

Unknown but probably nil. The course has not been promoted and the flaw requires someone
to think to try it. **Before applying the fix, run the reconciliation query below** — the
fix locks the door but does not tell you whether anyone already walked through it.

---

## The fix

```sql
CREATE POLICY "course_purchases_select_own"
  ON course_purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON course_purchases FROM anon, authenticated;
GRANT SELECT ON course_purchases TO authenticated;
```

Three layers, deliberately redundant:

1. **SELECT-only policy.** RLS denies any command with no policy permitting it, so
   dropping the `FOR ALL` policy and adding a `FOR SELECT` one denies client writes.
2. **Revoked grants.** Even if someone later adds a permissive policy by mistake, the
   grant layer still blocks writes. The bug we are fixing was a one-line mistake; assume
   the next one will be too.
3. **Service role stays the only write path.** It bypasses RLS and is used only by the
   Stripe webhook, server-side. The service role key is never sent to the browser.

`lesson_progress`, `quiz_results`, and `user_course_state` keep their `FOR ALL` policies
**on purpose** — `/api/quiz` and `/api/progress` write them from the user's own session
using the anon key, so authenticated writes are required. A user faking their own quiz
score cheats only themselves; it does not bypass payment. Do not "fix" these by copying
the purchase policy.

---

## Deterministic bypass test

Proves an authenticated client cannot self-grant. Run against a **local or branch**
database, never production.

### Setup

```bash
supabase start
supabase db reset            # applies course-schema.sql + migrations
```

Create a throwaway user via the Supabase Studio auth panel, sign in as them in a scratch
client, and hold their session JWT.

### Test 1 — self-grant must fail (the actual exploit)

```js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, ANON_KEY);
await supabase.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD });
const { data: { user } } = await supabase.auth.getUser();

const { data, error } = await supabase.from('course_purchases').insert({
  user_id: user.id,
  stripe_session_id: 'forged_session_' + Date.now(),
  is_active: true,
});

// PASS: error is non-null (permission denied for table course_purchases,
//       or new row violates row-level security policy) and data is null.
// FAIL: error is null. The gate is open. Stop and escalate.
console.assert(error !== null, 'SECURITY FAIL: user self-granted a purchase');
```

### Test 2 — reactivation must fail

```js
const { error } = await supabase
  .from('course_purchases')
  .update({ is_active: true })
  .eq('user_id', user.id);

// PASS: error is non-null, OR zero rows affected.
```

### Test 3 — deletion must fail

```js
const { error } = await supabase.from('course_purchases').delete().eq('user_id', user.id);

// PASS: error is non-null, OR zero rows affected.
```

### Test 4 — reading your own row must still work

```js
const { data, error } = await supabase.from('course_purchases').select('*');

// PASS: error is null. Returns your row if you own the course, [] if you don't.
// A failure here breaks legitimate users — this test guards against over-tightening.
```

### Test 5 — you must not read anyone else's row

```js
const { data } = await supabase.from('course_purchases').select('*');
// PASS: every returned row has user_id === user.id (in practice: 0 or 1 rows).
```

### Test 6 — the webhook can still grant

With the service role key, upsert a purchase and confirm it succeeds. This proves the fix
did not break the real payment path.

### Test 7 — policy shape

```sql
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'course_purchases';
```

**PASS:** exactly one row — `course_purchases_select_own`, `cmd = SELECT`,
`roles = {authenticated}`, `with_check = NULL`.
**FAIL:** any row with `cmd = ALL`, `cmd = INSERT`, `cmd = UPDATE`, or `cmd = DELETE`.

---

## Applying to production — Terry's checklist

Do not run these until you have decided to.

1. **Reconcile first — before locking the door.** Find grants Stripe cannot account for:
   ```sql
   SELECT user_id, stripe_session_id, purchased_at, is_active
   FROM course_purchases
   ORDER BY purchased_at DESC;
   ```
   Every `stripe_session_id` should start with `cs_` and resolve to a real paid session in
   the Stripe dashboard. Anything that doesn't — a made-up string, a session id with no
   matching Stripe record — is a forged grant. Investigate before deleting; a legitimate
   row could look odd for boring reasons (a manual comp, a test purchase).
2. **Back up.** `pg_dump` the table, or snapshot the project.
3. **Apply to a branch first.** `supabase branches create` → apply → run tests 1–7 there.
4. **Apply to production:** `supabase db push` (or paste the migration into the SQL editor).
5. **Re-run tests 1, 4, and 7 against production** with a real throwaway account. Test 1
   must fail to insert; test 4 must succeed.
6. **Verify a real purchase end to end** in Stripe test mode: checkout → webhook → row
   created → `/learn` accessible.
7. **Confirm the service role key is not in any client bundle.** It must exist only in
   server env. `NEXT_PUBLIC_`-prefixed vars ship to the browser — the service role key must
   never carry that prefix.

## Notes for the reviewer

- The migration is transactional (`BEGIN`/`COMMIT`) and idempotent (`IF EXISTS` /
  `IF NOT EXISTS`), so a partial failure rolls back cleanly and a re-run is safe.
- It adds `stripe_customer_id`, `stripe_payment_intent_id`, and `updated_at` as nullable
  columns, so existing rows are untouched and remain valid.
- The new `UNIQUE` index on `stripe_session_id` will **fail on apply** if duplicate session
  ids already exist. That failure is a feature: duplicates mean either a webhook bug or
  forged rows, and you want to look at them rather than index over them. If it fails, run
  the reconciliation query in step 1.
- The webhook now also verifies `payment_status === 'paid'` before granting, so a completed
  but unpaid session (async payment methods) no longer opens the course.
