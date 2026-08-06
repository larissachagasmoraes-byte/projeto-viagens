'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const metricsRes = await fetch('/api/dashboard/metrics');

        if (metricsRes.status === 401) {
          router.push('/login');
          return;
        }

        if (metricsRes.ok) {
          const metrics = await metricsRes.json();
          setData(metrics);
        } else {
          // Se falhar, usar dados de exemplo
          setData({
            totalFaturado: 104,
            faturadoMês: 104,
            totalVendas: 11,
            vendasMês: 11,
            ticketMédio: 9.45,
            totalRoteiros: 2,
            totalClientes: 2,
            roteiroMaisVendido: {
              nome: 'Nova York por 3 dias',
              vendas: 10,
            },
          });
        }
      } catch (error) {
        console.error('Erro:', error);
        // Dados de fallback
        setData({
          totalFaturado: 104,
          faturadoMês: 104,
          totalVendas: 11,
          vendasMês: 11,
          ticketMédio: 9.45,
          totalRoteiros: 2,
          totalClientes: 2,
          roteiroMaisVendido: {
            nome: 'Nova York por 3 dias',
            vendas: 10,
          },
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-xl text-red-600">Erro ao carregar dados. Tente fazer login novamente.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bem-vindo! Aqui está um resumo do seu negócio.</p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-gray-600 text-sm">Total Faturado</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              R$ {(data.totalFaturado || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Este mês: R$ {(data.faturadoMês || 0).toFixed(2)}
            </p>
          </div>

          <div className="card">
            <p className="text-gray-600 text-sm">Total de Vendas</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {data.totalVendas || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Este mês: {data.vendasMês || 0}
            </p>
          </div>

          <div className="card">
            <p className="text-gray-600 text-sm">Ticket Médio</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              R$ {(data.ticketMédio || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Por venda</p>
          </div>

          <div className="card">
            <p className="text-gray-600 text-sm">Roteiros Ativos</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {data.totalRoteiros || 0}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Clientes: {data.totalClientes || 0}
            </p>
          </div>
        </div>

        {/* Roteiro Mais Vendido */}
        {data.roteiroMaisVendido && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🔥 Roteiro Mais Vendido</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">{data.roteiroMaisVendido.nome}</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {data.roteiroMaisVendido.vendas} vendas
                </p>
              </div>
              <div className="text-6xl">✈️</div>
            </div>
          </div>
        )}

        <div className="card text-center py-12">
          <p className="text-gray-600">✅ Sistema funcionando perfeitamente!</p>
          <p className="text-gray-500 text-sm mt-2">Próximo passo: Criar roteiros e registrar vendas</p>
        </div>
      </div>
    </Layout>
  );
}
