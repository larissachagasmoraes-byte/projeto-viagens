'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

interface TiktokDados {
  id?: string;
  usuario?: string;
  seguidores?: number;
  ultimoVideoData?: string;
  ultimoVideoVisualizacoes?: number;
  ultimoVideoEngajamento?: number;
  nicho?: string;
  taxaPostagem?: string;
}

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [tiktokDados, setTiktokDados] = useState<TiktokDados>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadTiktokDados();
  }, []);

  async function loadTiktokDados() {
    try {
      const res = await fetch('/api/tiktok');

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setTiktokDados(data);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/tiktok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tiktokDados),
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      setSuccessMessage('✓ Dados salvos com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadTiktokDados();
    } catch (error) {
      alert('Erro ao salvar dados');
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">⚙️ Configurações</h1>
          <p className="text-gray-600 mt-2">Personalize seus dados e integrações</p>
        </div>

        {/* Seção TikTok */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📱</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">TikTok</h2>
              <p className="text-gray-600 text-sm">
                Conecte seus dados do TikTok para sugestões mais precisas
              </p>
            </div>
          </div>

          {successMessage && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Usuário TikTok */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuário do TikTok
              </label>
              <div className="flex gap-2">
                <span className="flex items-center text-gray-600">@</span>
                <input
                  type="text"
                  className="input flex-1"
                  value={tiktokDados.usuario || ''}
                  onChange={(e) =>
                    setTiktokDados({ ...tiktokDados, usuario: e.target.value })
                  }
                  placeholder="seu_usuario"
                />
              </div>
            </div>

            {/* Seguidores */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👥 Número de Seguidores
              </label>
              <input
                type="number"
                className="input"
                value={tiktokDados.seguidores || ''}
                onChange={(e) =>
                  setTiktokDados({
                    ...tiktokDados,
                    seguidores: e.target.value ? parseInt(e.target.value) : 0,
                  })
                }
                placeholder="1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ajude o sistema a fazer sugestões baseado em seu tamanho de audiência
              </p>
            </div>

            {/* Último Vídeo */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <p className="font-semibold text-gray-800">📹 Último Vídeo Postado</p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Postagem
                </label>
                <input
                  type="date"
                  className="input"
                  value={
                    tiktokDados.ultimoVideoData
                      ? tiktokDados.ultimoVideoData.split('T')[0]
                      : ''
                  }
                  onChange={(e) =>
                    setTiktokDados({
                      ...tiktokDados,
                      ultimoVideoData: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👁️ Visualizações
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={tiktokDados.ultimoVideoVisualizacoes || ''}
                    onChange={(e) =>
                      setTiktokDados({
                        ...tiktokDados,
                        ultimoVideoVisualizacoes: e.target.value
                          ? parseInt(e.target.value)
                          : 0,
                      })
                    }
                    placeholder="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💬 Engajamento (curtidas + comentários)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={tiktokDados.ultimoVideoEngajamento || ''}
                    onChange={(e) =>
                      setTiktokDados({
                        ...tiktokDados,
                        ultimoVideoEngajamento: e.target.value
                          ? parseInt(e.target.value)
                          : 0,
                      })
                    }
                    placeholder="50"
                  />
                </div>
              </div>
            </div>

            {/* Nicho */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Nicho / Tema do Seu TikTok
              </label>
              <select
                className="input"
                value={tiktokDados.nicho || ''}
                onChange={(e) =>
                  setTiktokDados({ ...tiktokDados, nicho: e.target.value })
                }
              >
                <option value="">Selecione um nicho</option>
                <option value="viagens">✈️ Viagens e Turismo</option>
                <option value="dicas">💡 Dicas e Tutoriais</option>
                <option value="lifestyle">🌟 Lifestyle</option>
                <option value="educacao">📚 Educação</option>
                <option value="entretenimento">🎬 Entretenimento</option>
                <option value="negocios">💼 Negócios</option>
                <option value="outro">🔧 Outro</option>
              </select>
            </div>

            {/* Frequência de Postagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Frequência de Postagem
              </label>
              <select
                className="input"
                value={tiktokDados.taxaPostagem || ''}
                onChange={(e) =>
                  setTiktokDados({ ...tiktokDados, taxaPostagem: e.target.value })
                }
              >
                <option value="">Selecione a frequência</option>
                <option value="diaria">📱 Diária (todos os dias)</option>
                <option value="frequente">📱 Frequente (4-6 vezes/semana)</option>
                <option value="semanal">📅 Semanal (1-3 vezes/semana)</option>
                <option value="irregular">❓ Irregular</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                O sistema usará isso para sugerir quando você deve postar
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving ? 'Salvando...' : '💾 Salvar Dados'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>💡 Dica:</strong> Atualize esses dados a cada semana para
              sugestões mais precisas sobre o que fazer para crescer no TikTok e
              aumentar suas vendas!
            </p>
          </div>
        </div>

        {/* Resumo dos Dados */}
        {tiktokDados.usuario && (
          <div className="card bg-gradient-to-br from-purple-50 to-pink-50">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Resumo</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tiktokDados.usuario && (
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-gray-600 text-sm">Usuário</p>
                  <p className="text-lg font-bold text-gray-800">
                    @{tiktokDados.usuario}
                  </p>
                </div>
              )}
              {tiktokDados.seguidores !== undefined && (
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-gray-600 text-sm">Seguidores</p>
                  <p className="text-lg font-bold text-blue-600">
                    {tiktokDados.seguidores.toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
              {tiktokDados.ultimoVideoVisualizacoes && (
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-gray-600 text-sm">Últimas Visualizações</p>
                  <p className="text-lg font-bold text-green-600">
                    {tiktokDados.ultimoVideoVisualizacoes.toLocaleString(
                      'pt-BR'
                    )}
                  </p>
                </div>
              )}
              {tiktokDados.nicho && (
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-gray-600 text-sm">Nicho</p>
                  <p className="text-lg font-bold text-gray-800">
                    {tiktokDados.nicho}
                  </p>
                </div>
              )}
              {tiktokDados.taxaPostagem && (
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-gray-600 text-sm">Frequência</p>
                  <p className="text-lg font-bold text-gray-800">
                    {tiktokDados.taxaPostagem}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
