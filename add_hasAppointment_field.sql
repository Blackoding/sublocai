-- Adicionar campo hasAppointment na tabela clinics
-- Este campo controla se o consultório permite agendamento na plataforma ou redireciona para WhatsApp

ALTER TABLE clinics 
ADD COLUMN hasAppointment BOOLEAN DEFAULT true;

-- Comentário explicativo
COMMENT ON COLUMN clinics.hasAppointment IS 'Se true, permite agendamento na plataforma; se false, redireciona para WhatsApp';

-- Atualizar todos os registros existentes para ter o valor padrão true
UPDATE clinics 
SET hasAppointment = true 
WHERE hasAppointment IS NULL;
