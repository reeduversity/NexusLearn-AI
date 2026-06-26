-- Migration: Add missing tables (quizzes, chat_sessions, savings_goals) to public schema

-- 1. Create quizzes table (separate from mock_tests)
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id) ON DELETE SET NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  difficulty TEXT,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on quizzes
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Create Policies for quizzes
CREATE POLICY "Users can access own quizzes" ON public.quizzes FOR ALL USING (auth.uid() = user_id);

-- Create Indexes on quizzes for query speed
CREATE INDEX idx_quizzes_user_id ON public.quizzes(user_id);
CREATE INDEX idx_quizzes_created_at ON public.quizzes(created_at);


-- 2. Create chat_sessions table for AI tutor dialogue logs
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  context_type TEXT,
  messages JSONB NOT NULL DEFAULT '[]',
  material_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on chat_sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create Policies for chat_sessions
CREATE POLICY "Users can access own chat_sessions" ON public.chat_sessions FOR ALL USING (auth.uid() = user_id);

-- Create Indexes on chat_sessions
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON public.chat_sessions(created_at);


-- 3. Create savings_goals table for finance planner
CREATE TABLE public.savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target NUMERIC NOT NULL,
  current NUMERIC NOT NULL DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on savings_goals
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- Create Policies for savings_goals
CREATE POLICY "Users can access own savings_goals" ON public.savings_goals FOR ALL USING (auth.uid() = user_id);

-- Create Indexes on savings_goals
CREATE INDEX idx_savings_goals_user_id ON public.savings_goals(user_id);
CREATE INDEX idx_savings_goals_created_at ON public.savings_goals(created_at);
