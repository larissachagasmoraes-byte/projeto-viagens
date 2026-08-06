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
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total geral
    const vendas = await prisma.venda.findMany({
      where: { userId },
      include: { roteiro: { select: { nome: true } } },
    });

    const totalFaturado = vendas.reduce((sum, v) => sum + v.preco, 0);

    // Vendas este mês
    const vendasMês = vendas.filter((v) => v.dataVenda >= firstDayOfMonth);
    const totalMês = vendasMês.reduce((sum, v) => sum + v.preco, 0);

    // Vendas mês passado
    const vendaUltimoMês = vendas.filter(
      (v) => v.dataVenda >= firstDayOfLastMonth && v.dataVenda <= lastDayOfLastMonth
    );
    const totalUltimoMês = vendaUltimoMês.reduce((sum, v) => sum + v.preco, 0);

    // Roteiros e suas vendas
    const roteiros = await prisma.roteiro.findMany({
      where: { userId },
      include: { vendas: { select: { preco: true } } },
    });

    const roteirosComVendas = roteiros.map((r) => ({
      nome: r.nome,
      preco: r.preco,
      vendas: r.vendas.length,
      total: r.vendas.reduce((sum, v) => sum + v.preco, 0),
    }));

    // Tendência dos últimos 30 dias
    const ultimosMeses = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const vendasÚltimos30 = vendas.filter((v) => v.dataVenda >= ultimosMeses);

    // Agrupar por semana
    const tendencia = Array.from({ length: 4 }, (_, i) => {
      const semanaInicio = new Date(ultimosMeses);
      semanaInicio.setDate(semanaInicio.getDate() + i * 7);
      const semanaFim = new Date(semanaInicio);
      semanaFim.setDate(semanaFim.getDate() + 7);

      const vendasSemana = vendasÚltimos30.filter(
        (v) => v.dataVenda >= semanaInicio && v.dataVenda < semanaFim
      );

      return {
        semana: `Sem ${i + 1}`,
        vendas: vendasSemana.length,
        total: vendasSemana.reduce((sum, v) => sum + v.preco, 0),
      };
    });

    // Previsão simples (média dos últimos 30 dias * 30 dias)
    const vendiasMédiaDia =
      vendasÚltimos30.length > 0 ? vendasÚltimos30.length / 30 : 0;
    const previsãoMês = Math.round(vendiasMédiaDia * 30);
    const previsãoFaturamento =
      vendasÚltimos30.reduce((sum, v) => sum + v.preco, 0) > 0
        ? (vendasÚltimos30.reduce((sum, v) => sum + v.preco, 0) / 30) *
          (new Date().getDate() + (30 - new Date().getDate()))
        : 0;

    return NextResponse.json({
      totalFaturado,
      totalMês,
      totalUltimoMês,
      crescimento:
        totalUltimoMês > 0
          ? (((totalMês - totalUltimoMês) / totalUltimoMês) * 100).toFixed(1)
          : 0,
      roteirosComVendas,
      tendencia,
      previsãoMês,
      previsãoFaturamento: previsãoFaturamento.toFixed(2),
      diasDoMês: new Date().getDate(),
    });
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados financeiros' },
      { status: 500 }
    );
  }
}
