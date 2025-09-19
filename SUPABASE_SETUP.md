# Configuração do Supabase

## Estrutura do Banco de Dados

Para que o sistema de autenticação funcione corretamente, você precisa criar a seguinte tabela no seu projeto Supabase:

### Tabela `users`

```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  phone TEXT,
  birth_date DATE NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
