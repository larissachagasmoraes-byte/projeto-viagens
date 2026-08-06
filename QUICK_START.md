# ⚡ Início Rápido - Projeto Viagens

## 1️⃣ Primeira coisa: Instalar Node.js
Se você não tem Node.js instalado, baixe em: https://nodejs.org/ (versão LTS recomendada)

Verifique se funcionou:
```bash
node --version
npm --version
```

## 2️⃣ Instalar dependências do projeto
```bash
npm install
```

## 3️⃣ Configurar banco de dados (PostgreSQL)

### Opção A: PostgreSQL Local
Se você não tem PostgreSQL instalado:
- Windows: https://www.postgresql.org/download/windows/
- Mac: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`

Após instalar, abra o terminal/PowerShell e crie o banco:
```bash
createdb projeto_viagens
```

### Opção B: PostgreSQL Online (Mais Fácil!)
Use um serviço gratuito como:
- **Neon** (Recomendado): https://neon.tech - até 3 projetos grátis
- **Railway**: https://railway.app - $5/mês grátis
- **Render**: https://render.com

Depois pegue a URL de conexão.

## 4️⃣ Configurar variáveis de ambiente
Crie um arquivo chamado `.env.local` na raiz do projeto com:

```
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/projeto_viagens"
JWT_SECRET="sua-chave-super-secreta-aleatoria-12345"
NEXTAUTH_SECRET="outra-chave-super-secreta-aleatoria-67890"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

**Para gerar chaves seguras, use este comando:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 5️⃣ Executar migrações do banco
```bash
npm run prisma:migrate
```

Pressione Enter quando perguntado o nome da migração.

## 6️⃣ Popular com dados de teste (OPCIONAL)
```bash
npm run prisma:seed
```

Isso cria um usuário para você testar:
- Email: `teste@viagens.com`
- Senha: `senha123`

## 7️⃣ Iniciar o servidor
```bash
npm run dev
```

Se tudo funcionar, você verá:
```
> projeto-viagens@0.1.0 dev
> next dev

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
```

## 🌐 Acessar a aplicação
Abra seu navegador e vá para: **http://localhost:3000**

Você será redirecionado para o login. Use:
- Email: `teste@viagens.com`
- Senha: `senha123`

## 🎯 Primeiro teste
1. Vá para o Dashboard - veja as métricas
2. Vá para "✈️ Roteiros" - já deve ter o roteiro NYC criado
3. Vá para "✅ Tarefas" - veja as tarefas sugeridas
4. Clique em "Feito" em uma tarefa

## 🆘 Se der algum erro

**"Cannot find database"**
- Verifique se PostgreSQL está rodando
- Verifique se criou o banco: `createdb projeto_viagens`
- Confira a CONNECTION STRING no `.env.local`

**"Port 3000 is already in use"**
```bash
npm run dev -- -p 3001
```
(Isso vai rodar na porta 3001)

**"MODULE_NOT_FOUND"**
```bash
npm install
```
(Reinstale as dependências)

## 📚 Próximas fases
Após testar tudo funcionando:
1. Criar páginas de Roteiros (CRUD completo)
2. Criar páginas de Vendas
3. Criar páginas de Clientes
4. Criar sistema de Tarefas
5. Criar sistema de Sugestões de crescimento

## 💬 Precisa de ajuda?
Sim! Avisa que algo não funcionou que a gente corrige juntos.

---

**Parabéns! 🎉 Você tem um sistema profissional de gestão de negócio de viagens!**
