'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

interface Roteiro {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracaoDias: number;
  pdfPath?: string;
  createdAt: string;
}

export default function RoteirosPage() {
  const router = useRouter();
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    duracaoDias: '',
    pdfPath: '',
  });
  const [uploadingPdf, setUploadingPdf] = useState(false);

  useEffect(() => {
    loadRoteiros();
  }, []);

  async function loadRoteiros() {
    try {
      const res = await fetch('/api/roteiros');

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (!res.ok) throw new Error('Erro ao carregar');

      const data = await res.json();
      setRoteiros(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!res.ok) throw new Error('Erro ao fazer upload');

      const data = await res.json();
      setFormData({ ...formData, pdfPath: data.path });
      alert('✓ PDF enviado com sucesso!');
    } catch (error) {
      alert('Erro ao fazer upload do PDF');
      console.error(error);
    } finally {
      setUploadingPdf(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.nome || !formData.preco || !formData.duracaoDias) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const url = editingId ? `/api/roteiros/${editingId}` : '/api/roteiros';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      setFormData({ nome: '', descricao: '', preco: '', duracaoDias: '', pdfPath: '' });
      setShowForm(false);
      setEditingId(null);
      loadRoteiros();
    } catch (error) {
      alert('Erro ao salvar roteiro');
      console.error(error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que quer deletar este roteiro?')) return;

    try {
      const res = await fetch(`/api/roteiros/${id}`, { method: 'DELETE' });

      if (!res.ok) throw new Error('Erro ao deletar');

      loadRoteiros();
    } catch (error) {
      alert('Erro ao deletar roteiro');
      console.error(error);
    }
  }

  function handleEdit(roteiro: Roteiro) {
    setFormData({
      nome: roteiro.nome,
      descricao: roteiro.descricao,
      preco: roteiro.preco.toString(),
      duracaoDias: roteiro.duracaoDias.toString(),
      pdfPath: roteiro.pdfPath || '',
    });
    setEditingId(roteiro.id);
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
            <h1 className="text-4xl font-bold text-gray-800">✈️ Roteiros</h1>
            <p className="text-gray-600 mt-2">Gerencie seus pacotes de viagem</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ nome: '', descricao: '', preco: '', duracaoDias: '' });
            }}
            className="btn-primary"
          >
            {showForm ? '✕ Cancelar' : '+ Novo Roteiro'}
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Editar Roteiro' : 'Novo Roteiro'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Roteiro *
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Ex: Nova York por 3 dias"
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
                  placeholder="Ex: Roteiro completo com dicas para CLT..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$) *
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
                    Duração (dias) *
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={formData.duracaoDias}
                    onChange={(e) =>
                      setFormData({ ...formData, duracaoDias: e.target.value })
                    }
                    placeholder="3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📄 Upload do PDF (Roteiro em PDF)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    disabled={uploadingPdf}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {uploadingPdf && <span className="text-blue-600 text-sm">Enviando...</span>}
                </div>
                {formData.pdfPath && (
                  <p className="text-sm text-green-600 mt-2">✓ PDF enviado com sucesso!</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Envie o PDF do seu roteiro. Ele será entregue automaticamente aos clientes após a compra.
                </p>
              </div>

              <button type="submit" className="btn-primary w-full">
                {editingId ? 'Atualizar' : 'Criar'} Roteiro
              </button>
            </form>
          </div>
        )}

        {/* Lista de Roteiros */}
        {roteiros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roteiros.map((roteiro) => (
              <div key={roteiro.id} className="card hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {roteiro.nome}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {roteiro.duracaoDias} dias
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    R$ {roteiro.preco.toFixed(2)}
                  </div>
                </div>

                {roteiro.descricao && (
                  <p className="text-gray-600 text-sm mb-4">
                    {roteiro.descricao}
                  </p>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleEdit(roteiro)}
                    className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition font-medium text-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(roteiro.id)}
                    className="flex-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Nenhum roteiro criado ainda</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              + Criar o Primeiro Roteiro
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
