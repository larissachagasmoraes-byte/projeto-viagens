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

    const tarefas = await prisma.tarefa.findMany({
      where: { userId },
      orderBy: [{ concluida: 'asc' }, { prioridade: 'desc' }, { deadline: 'asc' }],
    });

    return NextResponse.json(tarefas);
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    return NextResponse.json(
      { error: 'Erro ao listar tarefas' },
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

    const { titulo, descricao, prioridade, deadline, tipo } = await request.json();

    if (!titulo) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      );
    }

    const tarefa = await prisma.tarefa.create({
      data: {
        userId,
        titulo,
        descricao: descricao || '',
        prioridade: prioridade || 'media',
        deadline: deadline ? new Date(deadline) : null,
        tipo: tipo || 'manual',
      },
    });

    return NextResponse.json(tarefa, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return NextResponse.json(
      { error: 'Erro ao criar tarefa' },
      { status: 500 }
    );
  }
}
