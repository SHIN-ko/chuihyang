-- Enable RLS (Row Level Security)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create custom types
CREATE TYPE project_status AS ENUM ('planning', 'in_progress', 'completed', 'paused');
CREATE TYPE project_type AS ENUM ('whiskey', 'gin', 'rum', 'fruit_wine', 'vodka', 'other');

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nickname TEXT NOT NULL,
  birthdate DATE,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type project_type NOT NULL,
  recipe_id TEXT,
  start_date DATE NOT NULL,
  expected_end_date DATE NOT NULL,
  actual_end_date DATE,
  status project_status DEFAULT 'in_progress',
  notes TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ingredients table
CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity TEXT,
  unit TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress_logs table
CREATE TABLE IF NOT EXISTS public.progress_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[],
  ratings JSONB,
  color TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Ingredients policies
CREATE POLICY "Users can view ingredients of own projects" ON public.ingredients
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id));

CREATE POLICY "Users can insert ingredients to own projects" ON public.ingredients
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id));

CREATE POLICY "Users can update ingredients of own projects" ON public.ingredients
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id));

CREATE POLICY "Users can delete ingredients from own projects" ON public.ingredients
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id));

-- Progress logs policies
CREATE POLICY "Users can view progress logs of own projects" ON public.progress_logs
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id));

CREATE POLICY "Users can insert progress logs to own projects" ON public.progress_logs
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id));

CREATE POLICY "Users can update progress logs of own projects" ON public.progress_logs
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id));

CREATE POLICY "Users can delete progress logs from own projects" ON public.progress_logs
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.projects WHERE id = project_id));

-- Create functions and triggers for updated_at

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_projects_updated
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_ingredients_updated
  BEFORE UPDATE ON public.ingredients
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_progress_logs_updated
  BEFORE UPDATE ON public.progress_logs
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create storage bucket for images (run this in Storage section)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('progress-images', 'progress-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);

-- Storage policies will be created automatically when you create buckets in the dashboard
