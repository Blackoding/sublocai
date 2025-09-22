-- Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  value DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que não há conflitos de horário no mesmo consultório
  UNIQUE(clinic_id, date, time)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Anyone can view appointments" ON appointments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert appointments" ON appointments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments" ON appointments
  FOR DELETE USING (auth.uid() = user_id);

-- Política para permitir que proprietários de consultórios vejam agendamentos de seus consultórios
CREATE POLICY "Clinic owners can view clinic appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinics 
      WHERE clinics.id = appointments.clinic_id 
      AND clinics.user_id = auth.uid()
    )
  );

-- Política para permitir que proprietários de consultórios atualizem status dos agendamentos
CREATE POLICY "Clinic owners can update appointment status" ON appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clinics 
      WHERE clinics.id = appointments.clinic_id 
      AND clinics.user_id = auth.uid()
    )
  );

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date ON appointments(clinic_id, date);

-- Função para atualizar updated_at
CREATE TRIGGER update_appointments_updated_at 
  BEFORE UPDATE ON appointments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
