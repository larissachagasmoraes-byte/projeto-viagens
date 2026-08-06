'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: string;
  deadline: string | null;
  concluida: boolean;
  tipo: string;
  createdAt: string;
}

interface Sugestao {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: string;
  impacto: string;
}

export default function TarefasPage() {
  const router = useRouter();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('todas');
  const [showCompleted, setShowCompleted] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'media',
    deadline: '',
  });

  useEffect(() => {
    loadTarefas();
  }, []);

  async function loadTarefas() {
    try {
      const [tarefasRes, sugestoesRes] = await Promise.all([
        fetch('/api/tarefas'),
        fetch('/api/tarefas/sugestoes'),
      ]);

      if (tarefasRes.status === 401 || sugestoesRes.status === 401) {
        router.push('/login');
        return;
      }

      if (tarefasRes.ok) {
        const data = await tarefasRes.json();
        setTarefas(data);
      }

      if (sugestoesRes.ok) {
        const data = await sugestoesRes.json();
        setSugestoes(data);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  async function converterSugestaoEmTarefa(sugestaoId: string) {
    try {
      const res = await fetch('/api/tarefas/sugestoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sugestaoId }),
      });

      if (!res.ok) throw new Error('Erro ao converter');

      loadTarefas();
    } catch (error) {
      alert('Erro ao converter sugestão em tarefa');
      console.error(error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.titulo) {
      alert('Preencha o título');
      return;
    }

    try {
      const url = editingId ? `/api/tarefas/${editingId}` : '/api/tarefas';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      setFormData({ titulo: '', descricao: '', prioridade: 'media', deadline: '' });
      setShowForm(false);
      setEditingId(null);
      loadTarefas();
    } catch (error) {
      alert('Erro ao salvar tarefa');
      console.error(error);
    }
  }

  async function toggleConcluida(id: string, concluida: boolean) {
    try {
      const res = await fetch(`/api/tarefas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concluida: !concluida }),
      });

      if (!res.ok) throw new Error('Erro ao atualizar');

      loadTarefas();
    } catch (error) {
      alert('Erro ao atualizar tarefa');
      console.error(error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que quer deletar esta tarefa?')) return;

    try {
      const res = await fetch(`/api/tarefas/${id}`, { method: 'DELETE' });

      if (!res.ok) throw new Error('Erro ao deletar');

      loadTarefas();
    } catch (error) {
      alert('Erro ao deletar tarefa');
      console.error(error);
    }
  }

  function handleEdit(tarefa: Tarefa) {
    setFormData({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      prioridade: tarefa.prioridade,
      deadline: tarefa.deadline ? tarefa.deadline.split('T')[0] : '',
    });
    setEditingId(tarefa.id);
    setShowForm(true);
  }

  const priorityColors: Record<string, { bg: string; icon: string }> = {
    alta: { bg: 'bg-red-100 text-red-800', icon: '🔴' },
    media: { bg: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
    baixa: { bg: 'bg-green-100 text-green-800', icon: '🟢' },
  };

  const tarefasAtivas = tarefas.filter(t => !t.concluida);
  const tarefasConcluidas = tarefas.filter(t => t.concluida);

  const filtradas = showCompleted ? tarefasConcluidas : tarefasAtivas;
  const exibidas =
    filterPriority === 'todas'
      ? filtradas
      : filtradas.filter(t => t.prioridade === filterPriority);

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">✅ Tarefas</h1>
            <p className="text-gray-600 mt-2">Gerencie suas tarefas e lembretes</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ titulo: '', descricao: '', prioridade: 'media', deadline: '' });
            }}
            className="btn-primary"
          >
            {showForm ? '✕ Cancelar' : '+ Nova Tarefa'}
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  placeholder="Ex: Postar 3 vídeos no TikTok"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  placeholder="Detalhes sobre a tarefa..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridade
                  </label>
                  <select
                    className="input"
                    value={formData.prioridade}
                    onChange={(e) =>
                      setFormData({ ...formData, prioridade: e.target.value })
                    }
                  >
                    <option value="baixa">🟢 Baixa</option>
                    <option value="media">🟡 Média</option>
                    <option value="alta">🔴 Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prazo (opcional)
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full">
                {editingId ? 'Atualizar' : 'Criar'} Tarefa
              </button>
            </form>
          </div>
        )}

        {/* Sugestões da IA */}
        {sugestoes.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              🤖 Sugestões Baseadas nos Seus Dados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sugestoes.map((sugestao) => (
                <div
                  key={sugestao.id}
                  className="bg-white rounded-lg p-4 border border-blue-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">
                      {sugestao.titulo}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        sugestao.impacto === 'alto'
                          ? 'bg-red-100 text-red-800'
                          : sugestao.impacto === 'medio'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {sugestao.impacto === 'alto'
                        ? '🔥 Alto'
                        : sugestao.impacto === 'medio'
                        ? '⚡ Médio'
                        : '✓ Baixo'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {sugestao.descricao}
                  </p>
                  <button
                    onClick={() => converterSugestaoEmTarefa(sugestao.id)}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    ✓ Criar Tarefa
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowCompleted(false)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              !showCompleted
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ativas ({tarefasAtivas.length})
          </button>
          <button
            onClick={() => setShowCompleted(true)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              showCompleted
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Concluídas ({tarefasConcluidas.length})
          </button>

          <div className="ml-auto flex gap-2">
            {['todas', 'alta', 'media', 'baixa'].map(priority => (
              <button
                key={priority}
                onClick={() => setFilterPriority(priority)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  filterPriority === priority
                    ? priorityColors[priority]?.bg || 'bg-gray-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {priority === 'todas' ? 'Todas' : priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Tarefas */}
        {exibidas.length > 0 ? (
          <div className="space-y-3">
            {exibidas.map((tarefa) => (
              <div
                key={tarefa.id}
                className={`card flex items-start gap-4 transition ${
                  tarefa.concluida ? 'bg-gray-50 opacity-75' : ''
                }`}
              >
                <button
                  onClick={() => toggleConcluida(tarefa.id, tarefa.concluida)}
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                    tarefa.concluida
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {tarefa.concluida && '✓'}
                </button>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold ${
                      tarefa.concluida
                        ? 'line-through text-gray-500'
                        : 'text-gray-800'
                    }`}
                  >
                    {tarefa.titulo}
                  </h3>

                  {tarefa.descricao && (
                    <p className="text-sm text-gray-600 mt-1">
                      {tarefa.descricao}
                    </p>
                  )}

                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        priorityColors[tarefa.prioridade]?.bg
                      }`}
                    >
                      {priorityColors[tarefa.prioridade]?.icon} {tarefa.prioridade}
                    </span>

                    {tarefa.deadline && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        📅{' '}
                        {new Date(tarefa.deadline).toLocaleDateString('pt-BR')}
                      </span>
                    )}

                    {tarefa.tipo === 'sugestao' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                        💡 Sugestão
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {!tarefa.concluida && (
                    <button
                      onClick={() => handleEdit(tarefa)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                      title="Editar"
                    >
                      ✏️
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(tarefa.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                    title="Deletar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              {showCompleted
                ? 'Nenhuma tarefa concluída'
                : 'Nenhuma tarefa pendente'}
            </p>
            {!showCompleted && (
              <button onClick={() => setShowForm(true)} className="btn-primary">
                + Criar Primeira Tarefa
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
