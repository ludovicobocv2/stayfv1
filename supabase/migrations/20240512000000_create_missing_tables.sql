-- Criação da tabela priorities
CREATE TABLE IF NOT EXISTS public.priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  version INTEGER DEFAULT 1,
  device_id TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE
);

-- Criação da tabela mood_records
CREATE TABLE IF NOT EXISTS public.mood_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_date TIMESTAMP WITH TIME ZONE NOT NULL,
  mood_level INTEGER NOT NULL,
  factors TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Criação da tabela medications
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT NOT NULL,
  schedule TEXT[] DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  last_taken TIMESTAMP WITH TIME ZONE,
  interval_minutes INTEGER,
  observation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Criação da tabela medication_doses
CREATE TABLE IF NOT EXISTS public.medication_doses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criação de índices para melhorar a performance
CREATE INDEX IF NOT EXISTS priorities_user_id_idx ON public.priorities(user_id);
CREATE INDEX IF NOT EXISTS priorities_due_date_idx ON public.priorities(due_date);
CREATE INDEX IF NOT EXISTS mood_records_user_id_idx ON public.mood_records(user_id);
CREATE INDEX IF NOT EXISTS mood_records_record_date_idx ON public.mood_records(record_date);
CREATE INDEX IF NOT EXISTS medications_user_id_idx ON public.medications(user_id);
CREATE INDEX IF NOT EXISTS medication_doses_medication_id_idx ON public.medication_doses(medication_id);
CREATE INDEX IF NOT EXISTS medication_doses_user_id_idx ON public.medication_doses(user_id);

-- Configuração de RLS (Row Level Security) para as tabelas
ALTER TABLE public.priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_doses ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes da tabela priorities
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias prioridades" ON public.priorities;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias prioridades" ON public.priorities;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias prioridades" ON public.priorities;
DROP POLICY IF EXISTS "Usuários podem excluir suas próprias prioridades" ON public.priorities;

-- Criar novas políticas para tabela priorities
CREATE POLICY "Usuários podem inserir suas próprias prioridades" 
  ON public.priorities FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver suas próprias prioridades" 
  ON public.priorities FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias prioridades" 
  ON public.priorities FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias prioridades" 
  ON public.priorities FOR DELETE 
  USING (auth.uid() = user_id);

-- Remover políticas existentes da tabela mood_records
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios registros de humor" ON public.mood_records;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios registros de humor" ON public.mood_records;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios registros de humor" ON public.mood_records;
DROP POLICY IF EXISTS "Usuários podem excluir seus próprios registros de humor" ON public.mood_records;

-- Criar novas políticas para tabela mood_records
CREATE POLICY "Usuários podem inserir seus próprios registros de humor" 
  ON public.mood_records FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver seus próprios registros de humor" 
  ON public.mood_records FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios registros de humor" 
  ON public.mood_records FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios registros de humor" 
  ON public.mood_records FOR DELETE 
  USING (auth.uid() = user_id);

-- Remover políticas existentes da tabela medications
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios medicamentos" ON public.medications;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios medicamentos" ON public.medications;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios medicamentos" ON public.medications;
DROP POLICY IF EXISTS "Usuários podem excluir seus próprios medicamentos" ON public.medications;

-- Criar novas políticas para tabela medications
CREATE POLICY "Usuários podem inserir seus próprios medicamentos" 
  ON public.medications FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver seus próprios medicamentos" 
  ON public.medications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios medicamentos" 
  ON public.medications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios medicamentos" 
  ON public.medications FOR DELETE 
  USING (auth.uid() = user_id);

-- Remover políticas existentes da tabela medication_doses
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias doses de medicamentos" ON public.medication_doses;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias doses de medicamentos" ON public.medication_doses;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias doses de medicamentos" ON public.medication_doses;
DROP POLICY IF EXISTS "Usuários podem excluir suas próprias doses de medicamentos" ON public.medication_doses;

-- Criar novas políticas para tabela medication_doses
CREATE POLICY "Usuários podem inserir suas próprias doses de medicamentos" 
  ON public.medication_doses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver suas próprias doses de medicamentos" 
  ON public.medication_doses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias doses de medicamentos" 
  ON public.medication_doses FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias doses de medicamentos" 
  ON public.medication_doses FOR DELETE 
  USING (auth.uid() = user_id); 