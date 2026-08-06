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

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total de vendas
    const totalVendas = await prisma.venda.count({
      where: { userId },
    });

    // Vendas deste mês
    const vendasMês = await prisma.venda.count({
      where: {
        userId,
        dataVenda: { gte: firstDayOfMonth },
      },
    });

    // Total faturado
    const totalFaturado = await prisma.venda.aggregate({
      where: { userId },
      _sum: { preco: true },
    });

    // Faturado este mês
    const faturadoMês = await prisma.venda.aggregate({
      where: {
        userId,
        dataVenda: { gte: firstDayOfMonth },
      },
      _sum: { preco: true },
    });

    // Número de roteiros
    const totalRoteiros = await prisma.roteiro.count({
      where: { userId },
    });

    // Número de clientes
    const totalClientes = await prisma.cliente.count({
      where: { userId },
    });

    // Roteiro mais vendido
    const roteiroPlusVendido = await prisma.venda.groupBy({
      by: ['roteiroId'],
      where: { userId },
      _count: true,
      orderBy: {
        _count: {
          roteiroId: 'desc',
        },
      },
      take: 1,
    });

    let roteiroMaisVendido = null;
    if (roteiroPlusVendido.length > 0) {
      const roteiro = await prisma.roteiro.findUnique({
        where: { id: roteiroPlusVendido[0].roteiroId },
      });
      roteiroMaisVendido = {
        nome: roteiro?.nome,
        vendas: roteiroPlusVendido[0]._count,
      };
    }

    return NextResponse.json({
      totalVendas,
      vendasMês,
      totalFaturado: totalFaturado._sum.preco || 0,
      faturadoMês: faturadoMês._sum.preco || 0,
      totalRoteiros,
      totalClientes,
      roteiroMaisVendido,
      ticketMédio: totalVendas > 0 ? (totalFaturado._sum.preco || 0) / totalVendas : 0,
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar métricas' },
      { status: 500 }
    );
  }
}
