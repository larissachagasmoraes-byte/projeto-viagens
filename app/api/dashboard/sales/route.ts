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

    const vendas = await prisma.venda.findMany({
      where: { userId },
      include: {
        cliente: {
          select: { nome: true, email: true },
        },
        roteiro: {
          select: { nome: true },
        },
      },
      orderBy: { dataVenda: 'desc' },
      take: 10,
    });

    const vendaFormatada = vendas.map((venda) => ({
      id: venda.id,
      cliente: venda.cliente.nome,
      roteiro: venda.roteiro.nome,
      valor: venda.preco,
      status: venda.status,
      data: venda.dataVenda.toLocaleDateString('pt-BR'),
    }));

    return NextResponse.json(vendaFormatada);
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar vendas' },
      { status: 500 }
    );
  }
}
