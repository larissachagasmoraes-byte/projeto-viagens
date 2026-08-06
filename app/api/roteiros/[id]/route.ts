import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(
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

    const roteiro = await prisma.roteiro.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!roteiro) {
      return NextResponse.json(
        { error: 'Roteiro não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(roteiro);
  } catch (error) {
    console.error('Erro ao buscar roteiro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar roteiro' },
      { status: 500 }
    );
  }
}

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

    const { nome, descricao, preco, duracaoDias } = await request.json();

    const roteiro = await prisma.roteiro.updateMany({
      where: {
        id: params.id,
        userId,
      },
      data: {
        nome: nome || undefined,
        descricao: descricao || undefined,
        preco: preco ? parseFloat(preco) : undefined,
        duracaoDias: duracaoDias ? parseInt(duracaoDias) : undefined,
      },
    });

    if (roteiro.count === 0) {
      return NextResponse.json(
        { error: 'Roteiro não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Roteiro atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar roteiro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar roteiro' },
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

    const roteiro = await prisma.roteiro.deleteMany({
      where: {
        id: params.id,
        userId,
      },
    });

    if (roteiro.count === 0) {
      return NextResponse.json(
        { error: 'Roteiro não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Roteiro deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar roteiro:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar roteiro' },
      { status: 500 }
    );
  }
}
