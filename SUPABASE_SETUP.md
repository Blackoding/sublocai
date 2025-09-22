# Configuração do Supabase

## Estrutura do Banco de Dados

Para que o sistema de autenticação funcione corretamente, você precisa criar a seguinte tabela no seu projeto Supabase:

### Tabela `users`

```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Campos para profissionais
  full_name TEXT,
  cpf TEXT UNIQUE,
  birth_date DATE,
  specialty TEXT,
  registration_code TEXT,
  
  -- Campos para empresas
  user_type TEXT CHECK (user_type IN ('professional', 'company')),
  company_name TEXT,
  trade_name TEXT,
  cnpj TEXT UNIQUE,
  responsible_name TEXT,
  responsible_cpf TEXT,
  
  -- Constraint para garantir integridade dos dados
  CONSTRAINT check_user_fields CHECK (
    (user_type = 'professional' AND full_name IS NOT NULL AND cpf IS NOT NULL AND birth_date IS NOT NULL) OR
    (user_type = 'company' AND company_name IS NOT NULL AND cnpj IS NOT NULL AND responsible_name IS NOT NULL) OR
    (user_type IS NULL) -- Para compatibilidade com registros existentes
  )
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Política para permitir que usuários atualizem apenas seus próprios dados
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Política para permitir inserção de novos usuários
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Migração da Tabela `users` (se já existir)

Se você já tem uma tabela `users` criada com a estrutura antiga, execute o script `update_users_table.sql` para atualizar a estrutura:

```sql
-- Execute o arquivo update_users_table.sql no SQL Editor do Supabase
-- Este script irá:
-- 1. Tornar campos obrigatórios opcionais
-- 2. Adicionar novos campos para empresas
-- 3. Adicionar constraints para garantir integridade dos dados
-- 4. Adicionar índices únicos
```

### Função para atualizar `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(  );
```

### Tabela `comments`

Para permitir comentários nos consultórios, execute o script `create_comments_table.sql`:

```sql
-- Criar tabela de comentários
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) >= 10 AND length(content) <= 500),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que um usuário só pode comentar uma vez por consultório
  UNIQUE(clinic_id, user_id)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);
```

### Tabela `appointments`

Para permitir agendamentos de consultórios, execute o script `create_appointments_table.sql`:

```sql
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
```

### Storage para Avatars

Para permitir upload de fotos de perfil, você precisa configurar um bucket no Supabase Storage:

1. No painel do Supabase, vá para **Storage**
2. Crie um novo bucket chamado `avatars`
3. Configure as seguintes políticas:

```sql
-- Política para permitir que usuários façam upload de suas próprias imagens
CREATE POLICY "Users can upload own avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política para permitir que usuários vejam suas próprias imagens
CREATE POLICY "Users can view own avatars" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política para permitir que usuários atualizem suas próprias imagens
CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política para permitir que usuários deletem suas próprias imagens
CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Configuração de Autenticação

1. No painel do Supabase, vá para **Authentication > Settings**
2. Configure as seguintes opções:
   - **Site URL**: `http://localhost:3000` (para desenvolvimento)
   - **Redirect URLs**: Adicione `http://localhost:3000/**`
   - **Email confirmation**: Desabilite se quiser pular a confirmação por email durante desenvolvimento

## Variáveis de Ambiente

As seguintes variáveis já estão configuradas no arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lpakvzfeeekkdjmjpsuii.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYWt2emZlZWtrZGptanBzdWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MTU0NzYsImV4cCI6MjA3MzI5MTQ3Nn0.vlXkJWr6zXfexSHa9a5YrU4QsN-bSq1VGh3wHh6oEa8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYWt2emZlZWtrZGptanBzdWlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzcxNTQ3NiwiZXhwIjoyMDczMjkxNDc2fQ._IfqQ6OLBZrWAVn_82BSWxIRe77jfgOclmowVFIY944
```

## Como Usar

### Login
- Acesse `/entrar`
- Digite email e senha
- O sistema irá autenticar via Supabase

### Cadastro
- Acesse `/cadastrar`
- Preencha todos os campos obrigatórios
- O sistema criará o usuário no Supabase Auth e na tabela `users`

### Estado Global
O estado de autenticação é gerenciado pelo Zustand e persiste no localStorage:
- `user`: Dados do usuário logado
- `isAuthenticated`: Status de autenticação
- `isLoading`: Estado de carregamento
- `error`: Mensagens de erro

### Funções Disponíveis
- `signIn(data)`: Fazer login
- `signUp(data)`: Criar conta
- `signOut()`: Fazer logout
- `getCurrentUser()`: Carregar usuário atual
- `clearError()`: Limpar erros
