import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUser();

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const sugestoes = [];

    // Buscar dados do TikTok
    const tiktokDados = await prisma.tiktokDados.findUnique({
      where: { userId },
    });

    // Análise 1: Verificar vendas da semana
    const umaSemanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const vendasSemana = await prisma.venda.count({
      where: {
        userId,
        dataVenda: { gte: umaSemanaAtras },
      },
    });

    if (vendasSemana === 0) {
      sugestoes.push({
        id: 'sem-vendas',
        titulo: '📊 Nenhuma venda essa semana',
        descricao: 'Considere aumentar seus esforços de marketing no TikTok',
        prioridade: 'alta',
        impacto: 'alto',
      });
    }

    // Análise 2: Frequência de postagem no TikTok
    if (tiktokDados) {
      if (tiktokDados.taxaPostagem === 'irregular') {
        sugestoes.push({
          id: 'frequencia-postagem',
          titulo: '📅 Aumentar frequência de postagem',
          descricao:
            'Você está postando irregularmente. Tente postar 3-4 vezes por semana para melhorar alcance e vendas',
          prioridade: 'alta',
          impacto: 'alto',
        });
      }

      // Análise 3: Engajamento do TikTok
      if (
        tiktokDados.ultimoVideoEngajamento &&
        tiktokDados.ultimoVideoVisualizacoes
      ) {
        const taxaEngajamento =
          (tiktokDados.ultimoVideoEngajamento /
            tiktokDados.ultimoVideoVisualizacoes) *
          100;

        if (taxaEngajamento < 2) {
          sugestoes.push({
            id: 'melhorar-engajamento',
            titulo: '💬 Melhorar engajamento dos vídeos',
            descricao:
              'Sua taxa de engajamento está baixa. Tente fazer perguntas, chamar para comentar e responder comentários dos seguidores',
            prioridade: 'media',
            impacto: 'alto',
          });
        }
      }

      // Análise 4: Crescimento de seguidores
      if (tiktokDados.seguidores && tiktokDados.seguidores > 5000) {
        sugestoes.push({
          id: 'monetizacao',
          titulo: '💰 Você está pronto para monetizar!',
          descricao: `Com ${tiktokDados.seguidores.toLocaleString(
            'pt-BR'
          )} seguidores, seus roteiros podem virar uma renda extra significativa. Aumente preços e crie pacotes premium`,
          prioridade: 'media',
          impacto: 'alto',
        });
      }
    }

    // Análise 5: Clientes que compraram apenas 1x
    const clientesUmaCompra = await prisma.cliente.findMany({
      where: { userId },
      include: { vendas: { select: { id: true } } },
    });

    const clientesRepetir = clientesUmaCompra.filter(c => c.vendas.length === 1);

    if (clientesRepetir.length > 0) {
      sugestoes.push({
        id: 'clientes-repeticao',
        titulo: '👥 Recuperar clientes que compraram 1x',
        descricao: `Você tem ${clientesRepetir.length} cliente(s) que comprou uma vez. Envie mensagem oferecendo desconto ou novo roteiro`,
        prioridade: 'media',
        impacto: 'alto',
      });
    }

    // Análise 6: Roteiros menos vendidos
    const roteiros = await prisma.roteiro.findMany({
      where: { userId },
      include: { vendas: { select: { id: true } } },
    });

    const roteirosPocos = roteiros.filter(r => r.vendas.length === 0);

    if (roteirosPocos.length > 0) {
      sugestoes.push({
        id: 'roteiros-pocos-vendidos',
        titulo: '🔍 Revisar roteiros com poucas vendas',
        descricao: `${roteirosPocos.length} roteiro(s) não tem vendas ainda. Considere revisar preço, descrição ou estratégia de venda`,
        prioridade: 'media',
        impacto: 'medio',
      });
    }

    // Análise 7: Criar roteiros similares aos mais vendidos
    const roteirosOrdenados = [...roteiros].sort(
      (a, b) => b.vendas.length - a.vendas.length
    );

    if (roteirosOrdenados.length > 0 && roteirosOrdenados[0].vendas.length > 3) {
      sugestoes.push({
        id: 'roteiros-similares',
        titulo: '✈️ Criar roteiros similares aos mais vendidos',
        descricao: `Seu roteiro "${roteirosOrdenados[0].nome}" tem ${roteirosOrdenados[0].vendas.length} vendas! Crie roteiros para destinos parecidos`,
        prioridade: 'alta',
        impacto: 'alto',
      });
    }

    // Análise 8: Conteúdo no TikTok baseado em dados reais
    const ultimosMeses = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const vendaUltimosMeses = await prisma.venda.count({
      where: {
        userId,
        dataVenda: { gte: ultimosMeses },
      },
    });

    if (vendaUltimosMeses < 5 && (!tiktokDados || tiktokDados.seguidores < 1000)) {
      sugestoes.push({
        id: 'conteudo-tiktok',
        titulo: '📱 Criar mais conteúdo viral',
        descricao:
          'Você tem poucos seguidores. Tente criar conteúdo com dicas práticas, histórias de viagem e curiosidades sobre destinos. Use som popular!',
        prioridade: 'alta',
        impacto: 'alto',
      });
    }

    // Análise 9: Diversificar portfólio
    if (roteiros.length < 3) {
      sugestoes.push({
        id: 'diversificar',
        titulo: '🗺️ Diversificar portfólio de roteiros',
        descricao: `Você tem apenas ${roteiros.length} roteiro(s). Crie mais destinos para atrair públicos diferentes`,
        prioridade: 'media',
        impacto: 'alto',
      });
    }

    // Análise 10: Total faturado
    const totalFaturado = await prisma.venda.aggregate({
      where: { userId },
      _sum: { preco: true },
    });

    if ((totalFaturado._sum.preco || 0) > 100) {
      sugestoes.push({
        id: 'crescimento',
        titulo: '🚀 Parabéns! Crescimento detectado',
        descricao: `Você já faturou R$ ${(totalFaturado._sum.preco || 0).toFixed(
          2
        )}! Considere formalizar o negócio (MEI, CNPJ)`,
        prioridade: 'baixa',
        impacto: 'medio',
      });
    }

    return NextResponse.json(sugestoes);
  } catch (error) {
    console.error('Erro ao gerar sugestões:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar sugestões' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUser();

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { sugestaoId } = await request.json();

    const sugestoes: Record<string, { titulo: string; descricao: string; prioridade: string }> = {
      'sem-vendas': {
        titulo: 'Intensificar marketing no TikTok',
        descricao: 'Postar mais conteúdo para aumentar vendas',
        prioridade: 'alta',
      },
      'clientes-repeticao': {
        titulo: 'Enviar mensagens para clientes que compraram 1x',
        descricao: 'Ofereça desconto ou novo roteiro para estimular recompra',
        prioridade: 'media',
      },
      'roteiros-pocos-vendidos': {
        titulo: 'Revisar roteiros com poucas vendas',
        descricao: 'Analise preço, descrição, fotos e estratégia de divulgação',
        prioridade: 'media',
      },
      'roteiros-similares': {
        titulo: 'Criar roteiros para destinos similares',
        descricao: 'Aproveite o sucesso do seu roteiro mais vendido',
        prioridade: 'alta',
      },
      'conteudo-tiktok': {
        titulo: 'Postar 3 vídeos no TikTok essa semana',
        descricao: 'Dicas de viagem, resenhas de roteiros, histórias de clientes',
        prioridade: 'alta',
      },
      'diversificar': {
        titulo: 'Criar novos roteiros',
        descricao: 'Expanda seu portfólio para atrair mais clientes',
        prioridade: 'media',
      },
    };

    const sugestaoData = sugestoes[sugestaoId];

    if (!sugestaoData) {
      return NextResponse.json(
        { error: 'Sugestão não encontrada' },
        { status: 404 }
      );
    }

    // Criar a tarefa
    const tarefa = await prisma.tarefa.create({
      data: {
        userId,
        titulo: sugestaoData.titulo,
        descricao: sugestaoData.descricao,
        prioridade: sugestaoData.prioridade,
        tipo: 'sugestao',
      },
    });

    return NextResponse.json(tarefa, { status: 201 });
  } catch (error) {
    console.error('Erro ao converter sugestão:', error);
    return NextResponse.json(
      { error: 'Erro ao converter sugestão' },
      { status: 500 }
    );
  }
}
