'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Roteiro {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracaoDias: number;
}

export default function LojaPage() {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [carrinho, setCarrinho] = useState<Roteiro[]>([]);
  const [showCarrinho, setShowCarrinho] = useState(false);

  useEffect(() => {
    loadRoteiros();
  }, []);

  async function loadRoteiros() {
    try {
      const res = await fetch('/api/roteiros');
      if (res.ok) {
        const data = await res.json();
        setRoteiros(data);
      }
    } catch (error) {
      console.error('Erro ao carregar roteiros:', error);
    } finally {
      setLoading(false);
    }
  }

  function adicionarAoCarrinho(roteiro: Roteiro) {
    setCarrinho([...carrinho, roteiro]);
    alert(`✓ ${roteiro.nome} adicionado ao carrinho!`);
  }

  function removerDoCarrinho(index: number) {
    setCarrinho(carrinho.filter((_, i) => i !== index));
  }

  const totalCarrinho = carrinho.reduce((sum, r) => sum + r.preco, 0);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Carregando roteiros...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 rounded-lg mb-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Descubra Seus Próximos Destinos</h2>
          <p className="text-xl mb-2">Roteiros planejados para quem ama viajar mas tem pouco tempo</p>
          <p className="text-blue-100">Dicas de uma viajante CLT que entende sua rotina</p>
        </div>
      </section>

      {/* Layout Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roteiros */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Roteiros Disponíveis</h2>

          {roteiros.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roteiros.map((roteiro) => (
                <div key={roteiro.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                  {/* Imagem Placeholder */}
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 h-40 flex items-center justify-center text-white text-4xl">
                    ✈️
                  </div>

                  {/* Conteúdo */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {roteiro.nome}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4">
                      {roteiro.descricao}
                    </p>

                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          R$ {roteiro.preco.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {roteiro.duracaoDias} dias
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => adicionarAoCarrinho(roteiro)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      🛒 Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-600 text-lg">Nenhum roteiro disponível no momento</p>
            </div>
          )}
        </div>

        {/* Carrinho Lateral */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              🛒 Seu Carrinho ({carrinho.length})
            </h3>

            {carrinho.length > 0 ? (
              <>
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {carrinho.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm">
                          {item.nome}
                        </p>
                        <p className="text-blue-600 font-semibold">
                          R$ {item.preco.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removerDoCarrinho(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-600">Total:</p>
                    <p className="text-2xl font-bold text-blue-600">
                      R$ {totalCarrinho.toFixed(2)}
                    </p>
                  </div>

                  <Link
                    href={`/loja/checkout?total=${totalCarrinho}&items=${carrinho.length}&roteiros=${encodeURIComponent(JSON.stringify(carrinho))}`}
                    className="w-full block text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-bold"
                  >
                    💳 Ir para Checkout
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Seu carrinho está vazio</p>
                <p className="text-sm text-gray-400">
                  Adicione um roteiro para começar!
                </p>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm">
              <p className="text-gray-700">
                <strong>💡 Dica:</strong> Após o pagamento, você receberá um email com o roteiro completo em PDF!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
