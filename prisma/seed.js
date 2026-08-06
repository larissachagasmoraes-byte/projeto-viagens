const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Limpar dados existentes
  await prisma.sugestao.deleteMany({});
  await prisma.tarefa.deleteMany({});
  await prisma.venda.deleteMany({});
  await prisma.cliente.deleteMany({});
  await prisma.roteiro.deleteMany({});
  await prisma.user.deleteMany({});

  // Criar usuário de teste
  const hashedPassword = await bcrypt.hash('senha123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'teste@viagens.com',
      password: hashedPassword,
      nome: 'Larissa Chagas',
      telefone: '11999999999',
      chavePix: '123456789-0000-0000-0000-000000000000',
    },
  });

  // Criar roteiros de teste
  const roteiro1 = await prisma.roteiro.create({
    data: {
      userId: user.id,
      nome: 'Nova York por 3 dias',
      descricao: 'Roteiro completo de Nova York com dicas para CLT',
      preco: 10,
      duracaoDias: 3,
    },
  });

  const roteiro2 = await prisma.roteiro.create({
    data: {
      userId: user.id,
      nome: 'Orlando Parques Temáticos',
      descricao: 'Guia para aproveitar os melhores parques de Orlando',
      preco: 12,
      duracaoDias: 5,
    },
  });

  // Criar clientes de teste
  const cliente1 = await prisma.cliente.create({
    data: {
      userId: user.id,
      nome: 'João Silva',
      email: 'joao@email.com',
      telefone: '11988888888',
      instagram: '@joaosilva',
      tiktok: '@joaosilva_travels',
      totalGasto: 10,
    },
  });

  const cliente2 = await prisma.cliente.create({
    data: {
      userId: user.id,
      nome: 'Maria Santos',
      email: 'maria@email.com',
      telefone: '11987777777',
      instagram: '@mariasantos',
      tiktok: '@maria_trips',
      totalGasto: 22,
    },
  });

  // Criar vendas de teste
  await prisma.venda.create({
    data: {
      userId: user.id,
      roteiroId: roteiro1.id,
      clienteId: cliente1.id,
      preco: 10,
      status: 'pago',
      dataPagamento: new Date(),
    },
  });

  await prisma.venda.create({
    data: {
      userId: user.id,
      roteiroId: roteiro1.id,
      clienteId: cliente2.id,
      preco: 10,
      status: 'pago',
      dataPagamento: new Date(),
    },
  });

  await prisma.venda.create({
    data: {
      userId: user.id,
      roteiroId: roteiro2.id,
      clienteId: cliente2.id,
      preco: 12,
      status: 'pago',
      dataPagamento: new Date(),
    },
  });

  // Criar tarefas de teste
  await prisma.tarefa.create({
    data: {
      userId: user.id,
      titulo: 'Postar 3 vídeos no TikTok',
      descricao: 'Criar conteúdo sobre roteiros e dicas de viagem',
      prioridade: 'alta',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      tipo: 'sugestao',
    },
  });

  await prisma.tarefa.create({
    data: {
      userId: user.id,
      titulo: 'Responder mensagens de clientes',
      descricao: 'Verificar e responder todas as DMs e comentários',
      prioridade: 'alta',
      tipo: 'manual',
    },
  });

  // Criar sugestões de teste
  await prisma.sugestao.create({
    data: {
      userId: user.id,
      descricao: 'Seu roteiro NYC tem 100% de aprovação! Continue criando mais.',
      acaoSugerida: 'Crie roteiros para Rio de Janeiro e São Paulo',
      impacto: 'alto',
    },
  });

  console.log('✅ Banco de dados populado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
