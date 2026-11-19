# Candy Loves 🍰

Projeto de uma página de receitas de confeitaria, desenvolvido com React, Vite e Firebase Firestore. Interface em português, responsiva e com modo demonstração para que o site possa ser visualizado mesmo antes de configurar o Firebase.

## Executar localmente

Requisitos: Node.js 18 ou superior.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra a URL mostrada pelo Vite (normalmente `http://localhost:5173`). Sem as variáveis do Firebase, o site apresenta receitas de exemplo e novos cadastros ficam disponíveis apenas durante a sessão do navegador.

## Configurar o Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/) e registre um aplicativo Web.
2. Ative o Cloud Firestore.
3. Copie os dados de configuração do aplicativo para as variáveis `VITE_FIREBASE_*` em `.env.local`.
4. Crie uma coleção chamada `recipes`. A primeira receita cadastrada cria os documentos automaticamente.
5. Publique regras de segurança adequadas ao seu uso. Para uma aplicação pública real, não deixe o Firestore aberto para escrita irrestrita; considere autenticação, validação e regras específicas.

A aplicação ouve a coleção `recipes` em tempo real e armazena nome, descrição, ingredientes, modo de preparo, tempo, categoria e data de cadastro. A imagem de cada receita é ilustrativa, escolhida pela categoria.

## Comandos

- `npm run dev` — servidor de desenvolvimento.
- `npm run build` — gera a versão de produção em `dist/`.
- `npm run preview` — pré-visualiza a versão de produção.

## Tecnologias

React · Vite · Firebase Firestore · Lucide · CSS responsivo
