-- Create tables for training plan application
-- Migration file: 20250424000000_training_plan_schema.sql

-- Create the training_plans table
CREATE TABLE IF NOT EXISTS public.training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_accessed_at TIMESTAMPTZ DEFAULT now()
);

-- Create the plan_access_log table
CREATE TABLE IF NOT EXISTS public.plan_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.training_plans(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_training_plans_created_at ON public.training_plans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_plan_access_log_plan_id ON public.plan_access_log(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_access_log_accessed_at ON public.plan_access_log(accessed_at DESC);
