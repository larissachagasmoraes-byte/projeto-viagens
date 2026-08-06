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

    const roteiros = await prisma.roteiro.findMany({
      where: { userId },
      select: {
        id: true,
        nome: true,
        descricao: true,
        preco: true,
        duracaoDias: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(roteiros);
  } catch (error) {
    console.error('Erro ao listar roteiros:', error);
    return NextResponse.json(
      { error: 'Erro ao listar roteiros' },
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

    const { nome, descricao, preco, duracaoDias } = await request.json();

    if (!nome || !preco || !duracaoDias) {
      return NextResponse.json(
        { error: 'Nome, preço e duração são obrigatórios' },
        { status: 400 }
      );
    }

    const roteiro = await prisma.roteiro.create({
      data: {
        userId,
        nome,
        descricao: descricao || '',
        preco: parseFloat(preco),
        duracaoDias: parseInt(duracaoDias),
      },
    });

    return NextResponse.json(roteiro, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar roteiro:', error);
    return NextResponse.json(
      { error: 'Erro ao criar roteiro' },
      { status: 500 }
    );
  }
}
