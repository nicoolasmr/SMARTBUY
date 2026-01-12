-- P0 Ops Safety: Job Locks
-- Date: 2026-01-12

-- 1. Create Job Locks Table
CREATE TABLE IF NOT EXISTS public.job_locks (
  job_name text PRIMARY KEY,
  locked_at timestamptz NOT NULL DEFAULT NOW(),
  locked_by text NOT NULL,
  expires_at timestamptz NOT NULL
);

-- 2. Index for expiration queries
CREATE INDEX IF NOT EXISTS idx_job_locks_expires
ON public.job_locks (expires_at);

-- 3. RPC: Acquire Lock
CREATE OR REPLACE FUNCTION public.fn_acquire_job_lock(p_job_name text, p_locked_by text, p_ttl_seconds int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now timestamptz := NOW();
BEGIN
  -- Attempt to insert a new lock
  -- OR update an EXISTING lock ONLY IF it has expired
  INSERT INTO public.job_locks(job_name, locked_by, locked_at, expires_at)
  VALUES (p_job_name, p_locked_by, v_now, v_now + make_interval(secs => p_ttl_seconds))
  ON CONFLICT (job_name) DO UPDATE
    SET locked_by = EXCLUDED.locked_by,
        locked_at = EXCLUDED.locked_at,
        expires_at = EXCLUDED.expires_at
    WHERE public.job_locks.expires_at < v_now;

  -- Check if we successfully secured the lock
  -- Returns TRUE if the current lock row matches OUR owner and expiration > now
  RETURN EXISTS (
    SELECT 1 FROM public.job_locks
    WHERE job_name = p_job_name 
      AND locked_by = p_locked_by 
      AND expires_at > v_now
  );
END;
$$;

-- 4. RPC: Release Lock
CREATE OR REPLACE FUNCTION public.fn_release_job_lock(p_job_name text, p_locked_by text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.job_locks
  WHERE job_name = p_job_name AND locked_by = p_locked_by;
$$;

-- 5. Enable RLS (and allow Service Role bypass effectively)
ALTER TABLE public.job_locks ENABLE ROW LEVEL SECURITY;

-- But since these are RPC SECURITY DEFINER, we might not strictly need policies if accessed via RPC.
-- However, for robustness, let's allow service role access if accessed directly.
CREATE POLICY "Service Role Full Access"
ON public.job_locks
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
