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

    const tiktokDados = await prisma.tiktokDados.findUnique({
      where: { userId },
    });

    return NextResponse.json(tiktokDados || {});
  } catch (error) {
    console.error('Erro ao buscar dados TikTok:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados' },
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

    const {
      usuario,
      seguidores,
      ultimoVideoData,
      ultimoVideoVisualizacoes,
      ultimoVideoEngajamento,
      nicho,
      taxaPostagem,
    } = await request.json();

    // Verificar se já existe
    const existe = await prisma.tiktokDados.findUnique({
      where: { userId },
    });

    let resultado;

    if (existe) {
      // Atualizar
      resultado = await prisma.tiktokDados.update({
        where: { userId },
        data: {
          usuario: usuario || undefined,
          seguidores: seguidores ? parseInt(seguidores) : undefined,
          ultimoVideoData: ultimoVideoData ? new Date(ultimoVideoData) : undefined,
          ultimoVideoVisualizacoes: ultimoVideoVisualizacoes
            ? parseInt(ultimoVideoVisualizacoes)
            : undefined,
          ultimoVideoEngajamento: ultimoVideoEngajamento
            ? parseInt(ultimoVideoEngajamento)
            : undefined,
          nicho: nicho || undefined,
          taxaPostagem: taxaPostagem || undefined,
        },
      });
    } else {
      // Criar
      resultado = await prisma.tiktokDados.create({
        data: {
          userId,
          usuario: usuario || null,
          seguidores: seguidores ? parseInt(seguidores) : 0,
          ultimoVideoData: ultimoVideoData ? new Date(ultimoVideoData) : null,
          ultimoVideoVisualizacoes: ultimoVideoVisualizacoes
            ? parseInt(ultimoVideoVisualizacoes)
            : 0,
          ultimoVideoEngajamento: ultimoVideoEngajamento
            ? parseInt(ultimoVideoEngajamento)
            : 0,
          nicho: nicho || null,
          taxaPostagem: taxaPostagem || null,
        },
      });
    }

    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    console.error('Erro ao salvar dados TikTok:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar dados' },
      { status: 500 }
    );
  }
}
