-- Additive Build Lab series. Existing ccc_lab_* founding-run records are untouched.
CREATE TABLE IF NOT EXISTS public.ccc_bl_cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  program_slug text NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'applications_open' CHECK (status IN ('draft','applications_open','enrollment_open','running','complete','cancelled')),
  capacity integer NOT NULL CHECK (capacity BETWEEN 1 AND 40),
  price_cents integer NOT NULL CHECK (price_cents > 0),
  currency text NOT NULL DEFAULT 'usd' CHECK (currency = 'usd'),
  starts_at timestamptz,
  timezone text NOT NULL DEFAULT 'America/New_York',
  session_dates jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(session_dates) = 'array'),
  stripe_price_id text,
  terms text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (status <> 'enrollment_open' OR (starts_at IS NOT NULL AND stripe_price_id IS NOT NULL AND length(terms) > 20 AND jsonb_array_length(session_dates) = 4))
);

CREATE TABLE IF NOT EXISTS public.ccc_bl_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.ccc_bl_cohorts(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  email text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','accepted','waitlisted','declined')),
  intake jsonb NOT NULL DEFAULT '{}',
  intake_status text NOT NULL DEFAULT 'draft' CHECK (intake_status IN ('draft','submitted')),
  intake_revision integer NOT NULL DEFAULT 0,
  ai_consent boolean NOT NULL DEFAULT false,
  draft_plan jsonb,
  plan_revision integer,
  published_plan jsonb,
  published_revision integer,
  published_at timestamptz,
  generation_started_at timestamptz,
  generation_error text,
  instructor_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cohort_id,user_id)
);

CREATE TABLE IF NOT EXISTS public.ccc_bl_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.ccc_bl_applications(id),
  cohort_id uuid NOT NULL REFERENCES public.ccc_bl_cohorts(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'held' CHECK (status IN ('held','paid','released','refunded')),
  price_cents integer NOT NULL,
  currency text NOT NULL,
  stripe_price_id text NOT NULL,
  stripe_session_id text UNIQUE,
  checkout_url text,
  stripe_payment_intent_id text UNIQUE,
  terms text NOT NULL,
  checkout_expires_at timestamptz NOT NULL DEFAULT now() + interval '35 minutes',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS ccc_bl_one_live_reservation ON public.ccc_bl_reservations(application_id) WHERE status IN ('held','paid');
CREATE INDEX IF NOT EXISTS ccc_bl_reservations_capacity ON public.ccc_bl_reservations(cohort_id,status);

CREATE TABLE IF NOT EXISTS public.ccc_bl_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL UNIQUE REFERENCES public.ccc_bl_applications(id),
  reservation_id uuid NOT NULL UNIQUE REFERENCES public.ccc_bl_reservations(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  cohort_id uuid NOT NULL REFERENCES public.ccc_bl_cohorts(id),
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','refunded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cohort_id,user_id)
);

CREATE TABLE IF NOT EXISTS public.ccc_bl_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.ccc_bl_applications(id),
  week integer NOT NULL CHECK (week BETWEEN 1 AND 4),
  notes text NOT NULL CHECK (length(notes) BETWEEN 1 AND 4000),
  evidence_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','revision_requested','approved')),
  feedback text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(application_id,week)
);

CREATE TABLE IF NOT EXISTS public.ccc_bl_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_slug text NOT NULL,
  email text NOT NULL CHECK (length(email) <= 254),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(program_slug,email)
);
CREATE TABLE IF NOT EXISTS public.ccc_bl_rate_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  hits integer NOT NULL DEFAULT 1
);

-- All private data goes through authenticated server routes. No broad client grants.
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['ccc_bl_cohorts','ccc_bl_applications','ccc_bl_reservations','ccc_bl_enrollments','ccc_bl_submissions','ccc_bl_interest','ccc_bl_rate_limits'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated',t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role',t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.ccc_bl_rate_limit(p_key text,p_limit integer,p_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer; BEGIN
  INSERT INTO ccc_bl_rate_limits(key) VALUES(p_key)
  ON CONFLICT(key) DO UPDATE SET
    hits = CASE WHEN ccc_bl_rate_limits.window_start < now() - make_interval(secs=>p_seconds) THEN 1 ELSE ccc_bl_rate_limits.hits+1 END,
    window_start = CASE WHEN ccc_bl_rate_limits.window_start < now() - make_interval(secs=>p_seconds) THEN now() ELSE ccc_bl_rate_limits.window_start END
  RETURNING hits INTO n;
  DELETE FROM ccc_bl_rate_limits WHERE window_start < now() - interval '2 days';
  RETURN n <= p_limit;
END $$;

-- Serializes ALL reservations for a cohort. Held seats count until Stripe confirms
-- expiration. A late webhook can never race an automatic timestamp-based release.
CREATE OR REPLACE FUNCTION public.ccc_bl_reserve(p_application uuid,p_user uuid,p_price integer,p_terms text)
RETURNS public.ccc_bl_reservations LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a ccc_bl_applications; c ccc_bl_cohorts; r ccc_bl_reservations; n integer;
BEGIN
  SELECT * INTO a FROM ccc_bl_applications WHERE id=p_application AND user_id=p_user FOR UPDATE;
  IF NOT FOUND OR a.status <> 'accepted' THEN RAISE EXCEPTION 'Application must be accepted'; END IF;
  SELECT * INTO c FROM ccc_bl_cohorts WHERE id=a.cohort_id FOR UPDATE;
  IF c.status <> 'enrollment_open' OR c.starts_at <= now() THEN RAISE EXCEPTION 'Enrollment is closed'; END IF;
  SELECT * INTO r FROM ccc_bl_reservations WHERE application_id=a.id AND status IN ('held','paid');
  IF FOUND THEN
    IF r.price_cents IS DISTINCT FROM p_price OR r.terms IS DISTINCT FROM p_terms THEN RAISE EXCEPTION 'Checkout terms changed'; END IF;
    RETURN r;
  END IF;
  IF c.price_cents IS DISTINCT FROM p_price OR c.terms IS DISTINCT FROM p_terms THEN RAISE EXCEPTION 'Checkout terms changed'; END IF;
  SELECT count(*) INTO n FROM ccc_bl_reservations WHERE cohort_id=c.id AND status IN ('held','paid');
  IF n >= c.capacity THEN RAISE EXCEPTION 'Cohort is full'; END IF;
  INSERT INTO ccc_bl_reservations(application_id,cohort_id,user_id,price_cents,currency,stripe_price_id,terms)
    VALUES(a.id,c.id,p_user,c.price_cents,c.currency,c.stripe_price_id,c.terms) RETURNING * INTO r;
  RETURN r;
END $$;

-- One transaction grants the paid seat, so a retry cannot partially fulfill it.
CREATE OR REPLACE FUNCTION public.ccc_bl_fulfill(p_reservation uuid,p_session text,p_amount integer,p_currency text,p_intent text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r ccc_bl_reservations; result uuid;
BEGIN
  SELECT * INTO r FROM ccc_bl_reservations WHERE id=p_reservation FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Unknown reservation'; END IF;
  IF r.status IN ('released','refunded') THEN RAISE EXCEPTION 'Reservation no longer payable'; END IF;
  IF r.price_cents IS DISTINCT FROM p_amount OR r.currency IS DISTINCT FROM p_currency THEN RAISE EXCEPTION 'Payment amount mismatch'; END IF;
  IF p_session IS NULL OR length(p_session)=0 OR p_intent IS NULL OR length(p_intent)=0 THEN RAISE EXCEPTION 'Payment identity missing'; END IF;
  IF r.stripe_payment_intent_id IS NOT NULL AND r.stripe_payment_intent_id <> p_intent THEN RAISE EXCEPTION 'Payment identity mismatch'; END IF;
  IF r.stripe_session_id IS NOT NULL AND r.stripe_session_id <> p_session THEN RAISE EXCEPTION 'Session mismatch'; END IF;
  UPDATE ccc_bl_reservations SET status='paid',stripe_session_id=p_session,stripe_payment_intent_id=p_intent WHERE id=r.id;
  INSERT INTO ccc_bl_enrollments(application_id,reservation_id,user_id,cohort_id)
    VALUES(r.application_id,r.id,r.user_id,r.cohort_id)
    ON CONFLICT(application_id) DO UPDATE SET reservation_id=excluded.reservation_id,status='paid' WHERE ccc_bl_enrollments.status='refunded';
  SELECT id INTO result FROM ccc_bl_enrollments WHERE application_id=r.application_id;
  RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.ccc_bl_refund(p_intent text,p_reservation uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r ccc_bl_reservations; BEGIN
  SELECT * INTO r FROM ccc_bl_reservations WHERE id=p_reservation AND (stripe_payment_intent_id IS NULL OR stripe_payment_intent_id=p_intent) FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  UPDATE ccc_bl_reservations SET status='refunded',stripe_payment_intent_id=p_intent WHERE id=r.id;
  UPDATE ccc_bl_enrollments SET status='refunded' WHERE reservation_id=r.id;
END $$;

-- Shares the application lock with reserve so acceptance cannot change mid-checkout.
CREATE OR REPLACE FUNCTION public.ccc_bl_review(p_application uuid,p_status text,p_notes text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM 1 FROM ccc_bl_applications WHERE id=p_application FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Application not found'; END IF;
  IF p_status IS NULL OR p_status NOT IN ('accepted','waitlisted','declined','submitted') THEN RAISE EXCEPTION 'Invalid review status'; END IF;
  IF p_status <> 'accepted' AND EXISTS(SELECT 1 FROM ccc_bl_reservations WHERE application_id=p_application AND status IN ('held','paid')) THEN
    RAISE EXCEPTION 'Reconcile held or paid enrollment before changing acceptance';
  END IF;
  UPDATE ccc_bl_applications SET status=p_status,instructor_notes=left(coalesce(p_notes,''),4000),updated_at=now() WHERE id=p_application;
END $$;
REVOKE ALL ON FUNCTION public.ccc_bl_review(uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.ccc_bl_review(uuid,text,text) TO service_role;

REVOKE ALL ON FUNCTION public.ccc_bl_rate_limit(text,integer,integer) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.ccc_bl_reserve(uuid,uuid,integer,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.ccc_bl_fulfill(uuid,text,integer,text,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.ccc_bl_refund(text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.ccc_bl_rate_limit(text,integer,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.ccc_bl_reserve(uuid,uuid,integer,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.ccc_bl_fulfill(uuid,text,integer,text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.ccc_bl_refund(text,uuid) TO service_role;

-- Applications can open first. Payment requires real dates, terms and Stripe price.
INSERT INTO public.ccc_bl_cohorts(slug,program_slug,title,capacity,price_cents)
VALUES('operating-company-founding','ai-operating-company','Your AI Operating Company · Founding cohort',8,199500)
ON CONFLICT(slug) DO NOTHING;
