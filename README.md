# Modelo Expo com Login Firebase

Este é um projeto Expo com sistema completo de autenticação usando Firebase, incluindo:

- 🔐 Tela de login e cadastro
- ⏳ Tela de carregamento
- 🔒 Navegação protegida
- 🚪 Sistema de logout
- 🎨 Design moderno e responsivo
- 🌙 Suporte a tema claro/escuro

## 🚀 Como usar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **"Configurações do projeto"** > **"Geral"**
4. Role para baixo até **"Seus aplicativos"** e clique em **"Adicionar app"** > **"Web"**
5. Registre seu app e copie as credenciais
6. Copie o arquivo `firebase.config.example.ts` para `firebase.config.ts`
7. Cole suas credenciais no arquivo `firebase.config.ts`
8. No Firebase Console, vá em **"Authentication"** > **"Sign-in method"**
9. Ative o método **"Email/Password"**

### 3. Atualizar o contexto de autenticação

Edite o arquivo `contexts/AuthContext.tsx` e importe sua configuração:

```typescript
import { firebaseConfig } from '../firebase.config';
```

Substitua a configuração hardcoded pela importada.

### 4. Executar o projeto

```bash
npm start
```

## 📱 Funcionalidades

### Tela de Login/Cadastro
- Validação de email e senha
- Alternância entre login e cadastro
- Tratamento de erros em português
- Design responsivo

### Tela de Carregamento
- Exibida durante a verificação de autenticação
- Indicador de carregamento animado

### Navegação Protegida
- Redirecionamento automático baseado no estado de autenticação
- Usuários não autenticados são direcionados para login
- Usuários autenticados acessam as abas principais

### Página Inicial
- Exibe informações do usuário logado
- Botão de logout com confirmação
- Lista de funcionalidades implementadas

## 🛠️ Tecnologias Utilizadas

- **Expo Router** - Navegação
- **Firebase Auth** - Autenticação
- **TypeScript** - Tipagem
- **React Native** - Interface
- **Async Storage** - Armazenamento local

## 📁 Estrutura do Projeto

```
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx     # Layout das abas
│   │   ├── index.tsx       # Página inicial
│   │   └── explore.tsx     # Página explorar
│   ├── _layout.tsx         # Layout principal
│   └── login.tsx           # Tela de login/cadastro
├── components/
│   └── LoadingScreen.tsx   # Componente de carregamento
├── contexts/
│   └── AuthContext.tsx     # Contexto de autenticação
└── firebase.config.ts      # Configuração do Firebase
```

## 🔧 Personalização

### Cores e Temas
As cores são definidas em `constants/Colors.ts` e seguem automaticamente o tema do sistema.

### Textos e Idioma
Todos os textos estão em português e podem ser facilmente modificados nos componentes.

### Validações
As validações de email e senha podem ser customizadas no arquivo `app/login.tsx`.

## 📝 Próximos Passos

- [ ] Adicionar recuperação de senha
- [ ] Implementar perfil do usuário
- [ ] Adicionar autenticação social (Google, Facebook)
- [ ] Implementar verificação de email
- [ ] Adicionar testes unitários

## 🐛 Solução de Problemas

### Erro de configuração do Firebase
- Verifique se o arquivo `firebase.config.ts` existe e está configurado corretamente
- Confirme se a autenticação por email/senha está ativada no Firebase Console

### Problemas de navegação
- Limpe o cache do Expo: `expo start -c`
- Verifique se todas as dependências estão instaladas

### Erros de build
- Execute `npm install` novamente
- Verifique se a versão do Node.js é compatível

## 📄 Licença

Este projeto é livre para uso pessoal e comercial.
