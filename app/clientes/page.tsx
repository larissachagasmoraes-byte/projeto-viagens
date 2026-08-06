'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  instagram: string | null;
  tiktok: string | null;
  notas: string | null;
  primeiraCompra: string;
  totalGasto: number;
  vendas?: Array<{
    id: string;
    preco: number;
    dataVenda: string;
    roteiro: { nome: string };
  }>;
}

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    instagram: '',
    tiktok: '',
    notas: '',
  });

  useEffect(() => {
    loadClientes();
  }, []);

  async function loadClientes() {
    try {
      const res = await fetch('/api/clientes');

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (!res.ok) throw new Error('Erro ao carregar');

      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.nome || !formData.email) {
      alert('Preencha nome e email');
      return;
    }

    try {
      const url = editingId ? `/api/clientes/${editingId}` : '/api/clientes';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      setFormData({ nome: '', email: '', telefone: '', instagram: '', tiktok: '', notas: '' });
      setShowForm(false);
      setEditingId(null);
      loadClientes();
    } catch (error) {
      alert(`Erro: ${error}`);
      console.error(error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que quer deletar este cliente?')) return;

    try {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });

      if (!res.ok) throw new Error('Erro ao deletar');

      loadClientes();
    } catch (error) {
      alert('Erro ao deletar cliente');
      console.error(error);
    }
  }

  function handleEdit(cliente: Cliente) {
    setFormData({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone || '',
      instagram: cliente.instagram || '',
      tiktok: cliente.tiktok || '',
      notas: cliente.notas || '',
    });
    setEditingId(cliente.id);
    setShowForm(true);
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">👥 Clientes</h1>
            <p className="text-gray-600 mt-2">Gerencie seus clientes e histórico de compras</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ nome: '', email: '', telefone: '', instagram: '', tiktok: '', notas: '' });
            }}
            className="btn-primary"
          >
            {showForm ? '✕ Cancelar' : '+ Novo Cliente'}
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    placeholder="João Silva"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="input"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="joao@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    className="input"
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone: e.target.value })
                    }
                    placeholder="11999999999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.instagram}
                    onChange={(e) =>
                      setFormData({ ...formData, instagram: e.target.value })
                    }
                    placeholder="@usuario"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TikTok
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.tiktok}
                    onChange={(e) =>
                      setFormData({ ...formData, tiktok: e.target.value })
                    }
                    placeholder="@usuario"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.notas}
                  onChange={(e) =>
                    setFormData({ ...formData, notas: e.target.value })
                  }
                  placeholder="Anotações sobre o cliente..."
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                {editingId ? 'Atualizar' : 'Criar'} Cliente
              </button>
            </form>
          </div>
        )}

        {/* Lista de Clientes */}
        {clientes.length > 0 ? (
          <div className="space-y-4">
            {clientes.map((cliente) => (
              <div key={cliente.id} className="card">
                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() =>
                    setExpandedId(expandedId === cliente.id ? null : cliente.id)
                  }
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">
                      {cliente.nome}
                    </h3>
                    <p className="text-gray-600 text-sm">{cliente.email}</p>
                    {cliente.telefone && (
                      <p className="text-gray-500 text-sm">📱 {cliente.telefone}</p>
                    )}
                    <div className="flex gap-4 mt-2">
                      <span className="text-sm font-semibold text-green-600">
                        Total: R$ {cliente.totalGasto.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Vendas: {cliente.vendas?.length || 0}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Desde: {new Date(cliente.primeiraCompra).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {expandedId === cliente.id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    {/* Redes sociais */}
                    <div className="grid grid-cols-2 gap-2">
                      {cliente.instagram && (
                        <div className="text-sm">
                          <span className="font-medium">Instagram:</span>{' '}
                          <span className="text-gray-600">{cliente.instagram}</span>
                        </div>
                      )}
                      {cliente.tiktok && (
                        <div className="text-sm">
                          <span className="font-medium">TikTok:</span>{' '}
                          <span className="text-gray-600">{cliente.tiktok}</span>
                        </div>
                      )}
                    </div>

                    {/* Notas */}
                    {cliente.notas && (
                      <div className="bg-yellow-50 p-3 rounded text-sm">
                        <span className="font-medium">Notas:</span>{' '}
                        <span className="text-gray-600">{cliente.notas}</span>
                      </div>
                    )}

                    {/* Histórico de compras */}
                    {cliente.vendas && cliente.vendas.length > 0 && (
                      <div>
                        <p className="font-semibold text-sm mb-2">Histórico de Compras:</p>
                        <div className="space-y-2">
                          {cliente.vendas.map((venda) => (
                            <div
                              key={venda.id}
                              className="flex justify-between text-sm bg-gray-50 p-2 rounded"
                            >
                              <span>{venda.roteiro.nome}</span>
                              <span className="font-semibold">
                                R$ {venda.preco.toFixed(2)}
                              </span>
                              <span className="text-gray-500">
                                {new Date(venda.dataVenda).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botões de ação */}
                    <div className="flex gap-2 pt-2 border-t">
                      <button
                        onClick={() => handleEdit(cliente)}
                        className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition font-medium text-sm"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cliente.id)}
                        className="flex-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                      >
                        🗑️ Deletar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Nenhum cliente cadastrado ainda</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              + Cadastrar Primeiro Cliente
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
