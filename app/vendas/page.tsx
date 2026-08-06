'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

interface Venda {
  id: string;
  roteiroId: string;
  clienteId: string;
  preco: number;
  status: string;
  dataVenda: string;
  dataPagamento: string | null;
  cliente: { nome: string; email: string };
  roteiro: { nome: string };
}

interface Roteiro {
  id: string;
  nome: string;
  preco: number;
}

export default function VendasPage() {
  const router = useRouter();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    roteiroId: '',
    clienteNome: '',
    clienteEmail: '',
    clienteTelefone: '',
    preco: '',
    status: 'pendente',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [vendasRes, roteirosRes] = await Promise.all([
        fetch('/api/vendas'),
        fetch('/api/roteiros'),
      ]);

      if (vendasRes.status === 401 || roteirosRes.status === 401) {
        router.push('/login');
        return;
      }

      if (vendasRes.ok) {
        const data = await vendasRes.json();
        setVendas(data);
      }

      if (roteirosRes.ok) {
        const data = await roteirosRes.json();
        setRoteiros(data);
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.roteiroId || !formData.clienteNome || !formData.clienteEmail || !formData.preco) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const res = await fetch('/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      setFormData({
        roteiroId: '',
        clienteNome: '',
        clienteEmail: '',
        clienteTelefone: '',
        preco: '',
        status: 'pendente',
      });
      setShowForm(false);
      loadData();
    } catch (error) {
      alert(`Erro: ${error}`);
      console.error(error);
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      const res = await fetch(`/api/vendas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Erro ao atualizar');

      loadData();
    } catch (error) {
      alert('Erro ao atualizar venda');
      console.error(error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que quer deletar esta venda?')) return;

    try {
      const res = await fetch(`/api/vendas/${id}`, { method: 'DELETE' });

      if (!res.ok) throw new Error('Erro ao deletar');

      loadData();
    } catch (error) {
      alert('Erro ao deletar venda');
      console.error(error);
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

  const statusOptions = [
    { value: 'pendente', label: '⏳ Pendente PIX', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'pago', label: '✓ Pago', color: 'bg-green-100 text-green-800' },
    { value: 'entregue', label: '📦 Entregue', color: 'bg-blue-100 text-blue-800' },
  ];

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(s => s.value === status);
    return option?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">💰 Vendas</h1>
            <p className="text-gray-600 mt-2">Registro de vendas de roteiros</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setFormData({
                roteiroId: '',
                clienteNome: '',
                clienteEmail: '',
                clienteTelefone: '',
                preco: '',
                status: 'pendente',
              });
            }}
            className="btn-primary"
          >
            {showForm ? '✕ Cancelar' : '+ Nova Venda'}
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Registrar Nova Venda</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roteiro *
                </label>
                <select
                  className="input"
                  value={formData.roteiroId}
                  onChange={(e) => {
                    const roteiro = roteiros.find(r => r.id === e.target.value);
                    setFormData({
                      ...formData,
                      roteiroId: e.target.value,
                      preco: roteiro?.preco.toString() || '',
                    });
                  }}
                >
                  <option value="">Selecione um roteiro</option>
                  {roteiros.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.nome} (R$ {r.preco.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.clienteNome}
                  onChange={(e) =>
                    setFormData({ ...formData, clienteNome: e.target.value })
                  }
                  placeholder="João Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="input"
                    value={formData.clienteEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, clienteEmail: e.target.value })
                    }
                    placeholder="joao@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    className="input"
                    value={formData.clienteTelefone}
                    onChange={(e) =>
                      setFormData({ ...formData, clienteTelefone: e.target.value })
                    }
                    placeholder="11999999999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={formData.preco}
                    onChange={(e) =>
                      setFormData({ ...formData, preco: e.target.value })
                    }
                    placeholder="10.00"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="input"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    {statusOptions.map(s => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full">
                Registrar Venda
              </button>
            </form>
          </div>
        )}

        {/* Lista de Vendas */}
        {vendas.length > 0 ? (
          <div className="space-y-4">
            {vendas.map((venda) => (
              <div key={venda.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">
                      {venda.cliente.nome}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Roteiro: <strong>{venda.roteiro.nome}</strong>
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {venda.cliente.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      R$ {venda.preco.toFixed(2)}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {new Date(venda.dataVenda).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 items-center justify-between pt-4 border-t">
                  <div className="flex gap-2">
                    {statusOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => updateStatus(venda.id, option.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                          venda.status === option.value
                            ? option.color + ' ring-2 ring-offset-1'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleDelete(venda.id)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Nenhuma venda registrada ainda</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              + Registrar Primeira Venda
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
