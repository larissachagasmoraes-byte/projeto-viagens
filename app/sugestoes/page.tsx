'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

interface Sugestao {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: string;
  impacto: string;
}

export default function SuggestoesPage() {
  const router = useRouter();
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterImpacto, setFilterImpacto] = useState<string>('todos');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSugestoes();
  }, []);

  async function loadSugestoes() {
    try {
      const res = await fetch('/api/tarefas/sugestoes');

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setSugestoes(data);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  async function converterEmTarefa(sugestaoId: string) {
    try {
      const res = await fetch('/api/tarefas/sugestoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sugestaoId }),
      });

      if (!res.ok) throw new Error('Erro ao converter');

      setDismissedIds(new Set([...dismissedIds, sugestaoId]));
      setTimeout(() => loadSugestoes(), 500);
    } catch (error) {
      alert('Erro ao converter sugestão em tarefa');
      console.error(error);
    }
  }

  function dismissSugestao(sugestaoId: string) {
    setDismissedIds(new Set([...dismissedIds, sugestaoId]));
  }

  const impactoConfig: Record<string, { icon: string; color: string; label: string }> = {
    alto: { icon: '🔥', color: 'bg-red-100 text-red-800', label: 'Alto Impacto' },
    medio: { icon: '⚡', color: 'bg-yellow-100 text-yellow-800', label: 'Médio Impacto' },
    baixo: { icon: '✓', color: 'bg-green-100 text-green-800', label: 'Baixo Impacto' },
  };

  const prioridadeConfig: Record<string, { icon: string; color: string }> = {
    alta: { icon: '🔴', color: 'bg-red-50 border-red-200' },
    media: { icon: '🟡', color: 'bg-yellow-50 border-yellow-200' },
    baixa: { icon: '🟢', color: 'bg-green-50 border-green-200' },
  };

  const sugestoesFiltradas = sugestoes.filter((s) => {
    if (dismissedIds.has(s.id)) return false;
    if (filterImpacto === 'todos') return true;
    return s.impacto === filterImpacto;
  });

  const sugestoesDescartadas = sugestoes.filter((s) => dismissedIds.has(s.id));

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Carregando sugestões...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">💡 Sugestões de Crescimento</h1>
          <p className="text-gray-600 mt-2">
            Recomendações geradas pela IA baseado nos dados do seu negócio e TikTok
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          {['todos', 'alto', 'medio', 'baixo'].map((impacto) => (
            <button
              key={impacto}
              onClick={() => setFilterImpacto(impacto)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterImpacto === impacto
                  ? impactoConfig[impacto]?.color || 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {impacto === 'todos'
                ? `Todas (${sugestoesFiltradas.length})`
                : `${impactoConfig[impacto]?.icon} ${
                    impactoConfig[impacto]?.label
                  } (${sugestoes.filter((s) => s.impacto === impacto && !dismissedIds.has(s.id)).length})`}
            </button>
          ))}
        </div>

        {/* Sugestões Ativas */}
        {sugestoesFiltradas.length > 0 ? (
          <div className="space-y-4">
            {sugestoesFiltradas.map((sugestao) => (
              <div
                key={sugestao.id}
                className={`card border-l-4 ${
                  prioridadeConfig[sugestao.prioridade]?.color
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{sugestao.titulo.split(' ')[0]}</span>
                      <h3 className="text-lg font-bold text-gray-800">
                        {sugestao.titulo}
                      </h3>
                    </div>

                    <p className="text-gray-600">{sugestao.descricao}</p>

                    <div className="flex gap-2 mt-3 flex-wrap">
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          impactoConfig[sugestao.impacto]?.color
                        }`}
                      >
                        {impactoConfig[sugestao.impacto]?.icon}{' '}
                        {impactoConfig[sugestao.impacto]?.label}
                      </span>

                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          sugestao.prioridade === 'alta'
                            ? 'bg-red-100 text-red-800'
                            : sugestao.prioridade === 'media'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {sugestao.prioridade === 'alta'
                          ? '🔴 Prioridade Alta'
                          : sugestao.prioridade === 'media'
                          ? '🟡 Prioridade Média'
                          : '🟢 Prioridade Baixa'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => converterEmTarefa(sugestao.id)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    ✓ Criar Tarefa
                  </button>
                  <button
                    onClick={() => dismissSugestao(sugestao.id)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    ✕ Descartar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              {filterImpacto === 'todos'
                ? 'Você descartou todas as sugestões!'
                : 'Nenhuma sugestão com este impacto'}
            </p>
            {filterImpacto !== 'todos' && (
              <button
                onClick={() => setFilterImpacto('todos')}
                className="btn-primary"
              >
                Ver todas as sugestões
              </button>
            )}
          </div>
        )}

        {/* Sugestões Descartadas */}
        {sugestoesDescartadas.length > 0 && (
          <div className="card bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              📌 Sugestões Descartadas ({sugestoesDescartadas.length})
            </h2>
            <div className="space-y-2">
              {sugestoesDescartadas.map((sugestao) => (
                <div
                  key={sugestao.id}
                  className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div>
                    <p className="text-gray-800 font-medium">{sugestao.titulo}</p>
                    <p className="text-xs text-gray-500">{sugestao.descricao}</p>
                  </div>
                  <button
                    onClick={() =>
                      setDismissedIds(
                        new Set([...dismissedIds].filter((id) => id !== sugestao.id))
                      )
                    }
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                  >
                    Restaurar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="card bg-blue-50 border border-blue-200">
          <p className="text-sm text-gray-700">
            <strong>🤖 Como funciona:</strong> O sistema analisa seus dados (vendas,
            roteiros, clientes, dados do TikTok) e gera sugestões automáticas. Clique
            em "✓ Criar Tarefa" para adicionar à sua lista de tarefas. Atualizar seus
            dados do TikTok gera sugestões mais precisas!
          </p>
        </div>
      </div>
    </Layout>
  );
}
