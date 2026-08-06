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

    const clientes = await prisma.cliente.findMany({
      where: { userId },
      include: {
        vendas: {
          select: { id: true, preco: true, dataVenda: true },
        },
      },
      orderBy: { primeiraCompra: 'desc' },
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    return NextResponse.json(
      { error: 'Erro ao listar clientes' },
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

    const { nome, email, telefone, instagram, tiktok, notas } = await request.json();

    if (!nome || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se cliente já existe
    const existente = await prisma.cliente.findFirst({
      where: { userId, email },
    });

    if (existente) {
      return NextResponse.json(
        { error: 'Cliente com este email já existe' },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.create({
      data: {
        userId,
        nome,
        email,
        telefone: telefone || null,
        instagram: instagram || null,
        tiktok: tiktok || null,
        notas: notas || null,
      },
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    );
  }
}
