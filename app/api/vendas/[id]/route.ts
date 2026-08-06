import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUser();

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { status } = await request.json();

    const venda = await prisma.venda.updateMany({
      where: {
        id: params.id,
        userId,
      },
      data: {
        status: status || undefined,
        dataPagamento: status === 'pago' ? new Date() : undefined,
      },
    });

    if (venda.count === 0) {
      return NextResponse.json(
        { error: 'Venda não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Venda atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar venda' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getAuthUser();

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const venda = await prisma.venda.deleteMany({
      where: {
        id: params.id,
        userId,
      },
    });

    if (venda.count === 0) {
      return NextResponse.json(
        { error: 'Venda não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Venda deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar venda:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar venda' },
      { status: 500 }
    );
  }
}
