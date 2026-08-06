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
        cliente: { select: { nome: true, email: true } },
        roteiro: { select: { nome: true } },
      },
      orderBy: { dataVenda: 'desc' },
    });

    return NextResponse.json(vendas);
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    return NextResponse.json(
      { error: 'Erro ao listar vendas' },
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

    const { roteiroId, clienteNome, clienteEmail, clienteTelefone, preco, status } = await request.json();

    if (!roteiroId || !clienteNome || !clienteEmail || !preco) {
      return NextResponse.json(
        { error: 'Preenchimento obrigatório: roteiro, cliente, email e preço' },
        { status: 400 }
      );
    }

    // Verificar se roteiro existe
    const roteiro = await prisma.roteiro.findFirst({
      where: { id: roteiroId, userId },
    });

    if (!roteiro) {
      return NextResponse.json(
        { error: 'Roteiro não encontrado' },
        { status: 404 }
      );
    }

    // Criar ou atualizar cliente
    let cliente = await prisma.cliente.findFirst({
      where: { userId, email: clienteEmail },
    });

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          userId,
          nome: clienteNome,
          email: clienteEmail,
          telefone: clienteTelefone || null,
          totalGasto: parseFloat(preco),
        },
      });
    } else {
      await prisma.cliente.update({
        where: { id: cliente.id },
        data: {
          totalGasto: { increment: parseFloat(preco) },
        },
      });
    }

    // Criar venda
    const venda = await prisma.venda.create({
      data: {
        userId,
        roteiroId,
        clienteId: cliente.id,
        preco: parseFloat(preco),
        status: status || 'pendente',
      },
    });

    return NextResponse.json(venda, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    return NextResponse.json(
      { error: 'Erro ao criar venda' },
      { status: 500 }
    );
  }
}
