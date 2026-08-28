# Learning candidates

Lessons the seat proposes. **The seat writes here freely. Terry promotes to
`LEARNINGS.md`, and only after the same lesson has appeared in two independent
runs.**

The two-run rule exists because one run is an anecdote. A system that promotes
on a single observation ends up confidently believing things nobody checked, and
the belief is invisible afterwards because it now reads as established fact.

Exception: a safety issue, a destructive failure, or a demonstrably false
instruction may be promoted on one run.

| Proposed | Candidate lesson | Evidence | Runs seen | Status |
|---|---|---|---|---|
| 2026-08-27 | A correction can go stale. Re-verify previous corrections, not just the original claims | The fact base recorded "`/cost` no longer exists"; it exists again as an alias for `/usage`. The correction outlived the condition that justified it | 1 | proposed |
| 2026-08-27 | A count query against a missing table can return no error. Verify a table exists with a real select before trusting a head-count | `ccc_entitlements` returned a clean count of 0 on `head: true`, and a direct select returned `PGRST205`. The first result would have been read as "table exists, no rows" | 1 | proposed |
| 2026-08-27 | When a theme inverts, colour tokens whose names imply lightness silently swap meaning. Audit computed contrast, do not eyeball it | Inverting the slate ramp turned `text-slate-950` from near-black to near-white, putting paper-coloured text on the gold buy button at 2.21:1. Scripted measurement found 18 failures that looked fine | 1 | proposed |
