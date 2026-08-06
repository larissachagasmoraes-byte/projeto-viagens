# 🌍 Projeto Viagens - Sistema de Gestão de Empresa de Viagens

Um sistema completo e moderno para gerenciar sua empresa de venda de roteiros de viagem. Com dashboard intuitivo, gestão de vendas, clientes, tarefas e sugestões de crescimento automáticas.

## 🚀 Funcionalidades Principais

- **Dashboard**: Visão geral do negócio com métricas em tempo real
- **Roteiros**: Cadastro e gestão de pacotes de viagem
- **Vendas**: Registro de vendas com histórico completo
- **Clientes**: CRM simples com informações de clientes
- **Tarefas**: Sistema de tarefas para não esquecer do que fazer
- **Sugestões**: IA gerando sugestões de crescimento baseadas em dados
- **Financeiro**: Análise financeira e previsões

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:
- Node.js 18+ (https://nodejs.org/)
- PostgreSQL 12+ (https://www.postgresql.org/)
- Git (https://git-scm.com/)

## 🔧 Instalação

### 1. Clone ou copie o projeto
```bash
cd seu-projeto
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e configure:
- `DATABASE_URL`: URL de conexão com PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT (gere uma string aleatória forte)
- `NEXTAUTH_SECRET`: Chave secreta para NextAuth (gere uma string aleatória forte)
- `NEXTAUTH_URL`: URL da aplicação (http://localhost:3000 para desenvolvimento)

Exemplo de `DATABASE_URL`:
```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/projeto_viagens"
```

### 4. Configure o banco de dados
Crie o banco de dados PostgreSQL:
```bash
createdb projeto_viagens
```

### 5. Execute as migrações do Prisma
```bash
npm run prisma:migrate
```

### 6. (Opcional) Popular com dados de teste
```bash
npm run prisma:seed
```

Isso criará um usuário de teste:
- Email: `teste@viagens.com`
- Senha: `senha123`

## 🏃 Como executar

### Desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Build para produção
```bash
npm run build
npm start
```

## 📖 Como usar

### 1. Login
Acesse `http://localhost:3000/login` e faça login com suas credenciais.

### 2. Dashboard
No dashboard você vê:
- Total faturado (mês e total)
- Número de vendas
- Ticket médio
- Roteiro mais vendido
- Últimas vendas
- Tarefas prioritárias

### 3. Criar um Roteiro
Vá para "✈️ Roteiros" e clique em "Novo Roteiro". Preencha:
- Nome do roteiro
- Descrição
- Preço
- Duração em dias

### 4. Registrar uma Venda
Vá para "💰 Vendas" e clique em "Nova Venda". Selecione:
- Cliente (ou crie novo)
- Roteiro
- Valor
- Status (Pendente PIX / Pago / Entregue)

### 5. Tarefas
Na seção "✅ Tarefas" você pode:
- Ver tarefas prioritárias
- Marcar como concluída
- Criar novas tarefas

### 6. Sugestões
A seção "💡 Sugestões" mostra recomendações de crescimento baseadas em seus dados:
- Roteiros mais vendidos para duplicar
- Mensagens lembrando de postar no TikTok
- Oportunidades de upsell

## 📊 Estrutura do Projeto

```
projeto-viagens/
├── app/                 # Páginas Next.js
│   ├── (auth)/         # Páginas de autenticação
│   ├── dashboard/      # Dashboard principal
│   ├── api/            # Rotas de API
│   └── globals.css     # Estilos globais
├── components/         # Componentes React
├── lib/                # Utilitários (auth, db)
├── prisma/             # Configuração do banco
│   ├── schema.prisma   # Modelos de dados
│   └── seed.js         # Dados iniciais
└── public/             # Arquivos estáticos
```

## 🔐 Segurança

- Senhas são criptografadas com bcrypt
- Autenticação via JWT
- Cookies httpOnly para segurança
- Validação de entrada em todas as APIs
- Isolamento por usuário (cada usuário só vê seus dados)

## 🌐 Deploy

### Vercel (Recomendado - Gratuito)
1. Faça push do código para GitHub
2. Conecte o repositório no Vercel (https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy automático

### Outras plataformas
O projeto é compatível com Railway, Render, Heroku, etc.

## 📞 Suporte e Contribuição

Tem dúvidas ou sugestões? Você pode:
- Verificar a documentação do Next.js: https://nextjs.org/docs
- Ver exemplos Prisma: https://www.prisma.io/docs
- Abrir uma issue no GitHub

## 📄 Licença

Este projeto é de código aberto. Sinta-se livre para usá-lo e modificá-lo como quiser.

## 🎯 Roadmap Futuro

- [ ] Integração com TikTok API
- [ ] Integração com Stripe/Mercado Pago
- [ ] Gráficos de crescimento mais detalhados
- [ ] Email de confirmação automático
- [ ] Notificações push
- [ ] App mobile
- [ ] Integração com WhatsApp

---

Desenvolvido com ❤️ para empreendedores de viagem
