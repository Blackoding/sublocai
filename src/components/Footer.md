# Footer Component

## ⚠️ IMPORTANTE: Renderização Global

Este componente é renderizado **GLOBALMENTE** no arquivo `_app.tsx` e aparece automaticamente em todas as páginas da aplicação.

## ❌ NÃO FAÇA ISSO

**NÃO** importe ou use este componente em páginas individuais:

```tsx
// ❌ ERRADO - NÃO faça isso
import Footer from '@/components/Footer';

const MinhaPage = () => {
  return (
    <div>
      <h1>Minha Página</h1>
      <Footer /> {/* ❌ Footer será renderizado DUAS VEZES */}
    </div>
  );
};
```

## ✅ FAÇA ASSIM

O Footer já está sendo renderizado automaticamente, então suas páginas devem ser assim:

```tsx
// ✅ CORRETO
const MinhaPage = () => {
  return (
    <div>
      <h1>Minha Página</h1>
      {/* Footer já está sendo renderizado globalmente */}
    </div>
  );
};
```

## 🔧 Como Modificar o Footer

Para fazer alterações no Footer:

1. Edite o arquivo `src/components/Footer.tsx`
2. As alterações serão aplicadas automaticamente em **todas as páginas**
3. Não é necessário modificar nenhuma página individual

## 📁 Estrutura do Projeto

```
src/
├── pages/
│   └── _app.tsx          # Footer renderizado aqui globalmente
├── components/
│   ├── Footer.tsx        # Componente do Footer
│   └── Footer.md         # Esta documentação
```

## 🐛 Problemas Comuns

### Footer aparece duas vezes
- **Causa**: Footer foi importado e usado em uma página individual
- **Solução**: Remover o import e uso do Footer da página

### Footer não aparece
- **Causa**: Footer foi removido do `_app.tsx`
- **Solução**: Verificar se o Footer está sendo renderizado no `_app.tsx`

## 📝 Exemplo do _app.tsx

```tsx
import Footer from '@/components/Footer';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Header />
      <Component {...pageProps} />
      <Footer /> {/* Renderizado globalmente */}
    </div>
  );
}
```

---

**Última atualização**: Dezembro 2024
