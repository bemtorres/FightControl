-- FighterControl: MASTER SETUP & RESET (PROD READY)
-- VERSION: 3.1.0 (Con Soporte JSON Config y Fix Storage 403)

--------------------------------------------------------------------------------
-- 0. LIMPIEZA TOTAL (DROP)
--------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.game_state CASCADE;
DROP TABLE IF EXISTS public.characters CASCADE;
DROP TABLE IF EXISTS public.scenarios CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.scene_type CASCADE;

--------------------------------------------------------------------------------
-- 1. ESTRUCTURA DE TABLAS (SCHEMA)
--------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1.1 Perfiles de Usuario
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER', 'MODERATOR')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Enumerado de Escenas
DO $$ BEGIN
    CREATE TYPE public.scene_type AS ENUM (
        'INTRO', 'SELECT', 'VERSUS', 'COMBAT', 'WINNER', 'PRESENTATION'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1.3 Escenarios (Con columna settings para config flexible)
CREATE TABLE public.scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    name TEXT NOT NULL,
    chroma_key_color TEXT DEFAULT '#00FF00',
    background_url TEXT,
    tournament_logo TEXT,
    font_family TEXT DEFAULT 'font-sans',
    settings JSONB DEFAULT '{"is_public": false, "access_key": null}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 Personajes
CREATE TABLE public.characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID REFERENCES public.scenarios ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon_face TEXT,
    side_view_combat TEXT,
    victory_pose TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 Estado del Juego
CREATE TABLE public.game_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID REFERENCES public.scenarios ON DELETE CASCADE UNIQUE,
    current_scene public.scene_type DEFAULT 'INTRO' NOT NULL,
    p1_selected_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
    p2_selected_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
    p1_cursor_index INTEGER DEFAULT 0,
    p2_cursor_index INTEGER DEFAULT 0,
    winner_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
    presentation_char_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
    p1_locked BOOLEAN DEFAULT FALSE,
    p2_locked BOOLEAN DEFAULT FALSE,
    allow_duplicates BOOLEAN DEFAULT FALSE,
    presentation_cursor_index INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 2. AUTOMATIZACIÓN (TRIGGERS)
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'USER');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

--------------------------------------------------------------------------------
-- 3. STORAGE & REALTIME
--------------------------------------------------------------------------------
-- Bucket Público
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Habilitar Realtime
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_state;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

--------------------------------------------------------------------------------
-- 4. SEGURIDAD (RLS) - FIX 403 ERRORS
--------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_state ENABLE ROW LEVEL SECURITY;

-- 4.1 Escenarios: Solo el dueño gestiona, pero todos leen (para el Visor)
CREATE POLICY "Manage Scenarios" ON public.scenarios FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Read Scenarios" ON public.scenarios FOR SELECT TO public USING (true);

-- 4.2 Personajes: Solo el dueño del escenario gestiona, todos leen
CREATE POLICY "Read Characters" ON public.characters FOR SELECT TO public USING (true);
CREATE POLICY "Manage Characters" ON public.characters FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.scenarios s WHERE s.id = characters.scenario_id AND s.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.scenarios s WHERE s.id = scenario_id AND s.user_id = auth.uid()));

-- 4.3 Game State
CREATE POLICY "Read Game State" ON public.game_state FOR SELECT TO public USING (true);
CREATE POLICY "Manage Game State" ON public.game_state FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM public.scenarios s WHERE s.id = game_state.scenario_id AND s.user_id = auth.uid()));

-- 4.4 STORAGE: El fix para el error 403 al subir imágenes
CREATE POLICY "Allow Public Read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'assets');
CREATE POLICY "Allow Auth Uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'assets');
CREATE POLICY "Allow Auth Updates" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'assets');
CREATE POLICY "Allow Auth Deletes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'assets');