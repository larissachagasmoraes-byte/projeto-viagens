'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

interface FinanceirosData {
  totalFaturado: number;
  totalMês: number;
  totalUltimoMês: number;
  crescimento: string | number;
  roteirosComVendas: Array<{
    nome: string;
    preco: number;
    vendas: number;
    total: number;
  }>;
  tendencia: Array<{
    semana: string;
    vendas: number;
    total: number;
  }>;
  previsãoMês: number;
  previsãoFaturamento: string;
  diasDoMês: number;
}

export default function FinanceiroPage() {
  const router = useRouter();
  const [dados, setDados] = useState<FinanceirosData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDados();
  }, []);

  async function loadDados() {
    try {
      const res = await fetch('/api/financeiro');

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (!res.ok) throw new Error('Erro ao carregar');

      const data = await res.json();
      setDados(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Carregando dados financeiros...</p>
        </div>
      </Layout>
    );
  }

  if (!dados) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-xl text-red-600">Erro ao carregar dados</p>
        </div>
      </Layout>
    );
  }

  const crescimentoPositivo = Number(dados.crescimento) >= 0;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">📈 Financeiro</h1>
          <p className="text-gray-600 mt-2">Análise detalhada de suas finanças e tendências</p>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-gray-600 text-sm">Total Faturado</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              R$ {dados.totalFaturado.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Desde o início</p>
          </div>

          <div className="card">
            <p className="text-gray-600 text-sm">Faturado Este Mês</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              R$ {dados.totalMês.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Dia {dados.diasDoMês}/30</p>
          </div>

          <div className="card">
            <p className="text-gray-600 text-sm">Crescimento Mês</p>
            <p
              className={`text-3xl font-bold mt-2 ${
                crescimentoPositivo ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {crescimentoPositivo ? '+' : ''}
              {dados.crescimento}%
            </p>
            <p className="text-xs text-gray-500 mt-2">vs. mês passado</p>
          </div>

          <div className="card">
            <p className="text-gray-600 text-sm">Previsão Este Mês</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              R$ {Number(dados.previsãoFaturamento).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {dados.previsãoMês} vendas estimadas
            </p>
          </div>
        </div>

        {/* Tendência dos últimos 30 dias */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-6">📊 Tendência (Últimas 4 Semanas)</h2>
          <div className="grid grid-cols-4 gap-4">
            {dados.tendencia.map((semana, i) => (
              <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">{semana.semana}</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{semana.vendas}</p>
                <p className="text-xs text-gray-500 mt-1">vendas</p>
                <p className="text-lg font-semibold text-green-600 mt-2">
                  R$ {semana.total.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown por Roteiro */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-6">✈️ Performance por Roteiro</h2>
          {dados.roteirosComVendas.length > 0 ? (
            <div className="space-y-3">
              {dados.roteirosComVendas
                .sort((a, b) => b.total - a.total)
                .map((roteiro, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{roteiro.nome}</h3>
                      <span className="text-lg font-bold text-green-600">
                        R$ {roteiro.total.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (roteiro.total / Math.max(...dados.roteirosComVendas.map(r => r.total))) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="text-right min-w-fit">
                        <p className="text-sm font-medium text-gray-600">
                          {roteiro.vendas} vendas
                        </p>
                        <p className="text-xs text-gray-500">
                          R$ {(roteiro.total / roteiro.vendas).toFixed(2)} média
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhuma venda registrada</p>
          )}
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Melhor Roteiro */}
          {dados.roteirosComVendas.length > 0 && (
            <div className="card bg-gradient-to-br from-green-50 to-emerald-50">
              <h3 className="text-lg font-bold text-gray-800 mb-3">🏆 Melhor Roteiro</h3>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-green-600">
                  {dados.roteirosComVendas.sort((a, b) => b.total - a.total)[0].nome}
                </p>
                <p className="text-gray-600">
                  Faturamento:{' '}
                  <strong className="text-green-600">
                    R$ {dados.roteirosComVendas.sort((a, b) => b.total - a.total)[0].total.toFixed(2)}
                  </strong>
                </p>
                <p className="text-gray-600">
                  Vendas:{' '}
                  <strong>
                    {dados.roteirosComVendas.sort((a, b) => b.total - a.total)[0].vendas}
                  </strong>
                </p>
              </div>
            </div>
          )}

          {/* Recomendação */}
          <div className="card bg-gradient-to-br from-blue-50 to-cyan-50">
            <h3 className="text-lg font-bold text-gray-800 mb-3">💡 Recomendação</h3>
            <div className="space-y-2">
              {dados.crescimento > 0 ? (
                <>
                  <p className="text-gray-700">
                    ✓ Você cresceu <strong>{dados.crescimento}%</strong> esse mês!
                  </p>
                  <p className="text-sm text-gray-600">
                    Continue a estratégia de conteúdo no TikTok e aumente os preços dos roteiros mais vendidos.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-700">
                    Procure aumentar o volume de vendas
                  </p>
                  <p className="text-sm text-gray-600">
                    Intensifique o conteúdo no TikTok e entre em contato com clientes antigos oferecendo novos roteiros.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Info Extra */}
        <div className="card bg-yellow-50 border border-yellow-200">
          <p className="text-sm text-gray-700">
            <strong>📌 Nota:</strong> Os dados são calculados baseado nas vendas registradas.
            Certifique-se de registrar todas as vendas para ter uma análise precisa. Atualize seus dados do TikTok para sugestões mais precisas sobre estratégia de preço.
          </p>
        </div>
      </div>
    </Layout>
  );
}
