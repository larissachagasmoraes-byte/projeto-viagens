'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

interface Roteiro {
  id: string;
  nome: string;
  preco: number;
  pdfPath?: string;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const total = parseFloat(searchParams.get('total') || '0');
  const items = parseInt(searchParams.get('items') || '0');
  const roteirosParam = searchParams.get('roteiros');
  const roteiros: Roteiro[] = roteirosParam ? JSON.parse(decodeURIComponent(roteirosParam)) : [];

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
  });

  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Simular processamento de pagamento
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('Pagamento processado:', {
        ...formData,
        total,
        items,
      });

      // Enviar email com PDFs
      setEnviandoEmail(true);
      try {
        const emailRes = await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            nome: formData.nome,
            roteiros: roteiros,
          }),
        });

        if (!emailRes.ok) {
          console.error('Erro ao enviar email');
        } else {
          console.log('Email enviado com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao enviar email:', error);
      } finally {
        setEnviandoEmail(false);
      }

      setPagamentoConfirmado(true);
    } catch (error) {
      alert('Erro ao processar pagamento');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (pagamentoConfirmado) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border-2 border-green-600 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">Pagamento Confirmado!</h1>

          <div className="bg-white rounded-lg p-6 mb-6">
            <p className="text-gray-700 mb-4">
              Obrigada pela compra! 🎉
            </p>
            <p className="text-gray-600 mb-2">
              ✉️ Email enviado com sucesso!
            </p>
            <p className="text-gray-600 mb-4">
              Verifique sua caixa de entrada (e spam) para o PDF do seu roteiro.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Email:</strong> {formData.email}
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>✓ Roteiros adquiridos: {items}</p>
              <p>✓ Total pago: R$ {total.toFixed(2)}</p>
              <p>✓ PDFs enviados automaticamente</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/loja')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            ← Voltar à Loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Seus Dados</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="seu@email.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                O roteiro será enviado para este email
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                required
                value={formData.telefone}
                onChange={(e) =>
                  setFormData({ ...formData, telefone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="11999999999"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold disabled:bg-gray-400"
            >
              {loading ? 'Processando...' : '💳 Continuar para Pagamento'}
            </button>
          </form>
        </div>

        {/* Resumo do Pedido */}
        <div>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Resumo do Pedido</h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between">
                <p className="text-gray-600">Roteiros:</p>
                <p className="font-semibold">{items} item(ns)</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <p className="font-semibold text-gray-800">Total:</p>
                <p className="font-bold text-blue-600 text-2xl">
                  R$ {total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Info PIX */}
          <div className="bg-green-50 border-2 border-green-600 rounded-lg p-6">
            <h3 className="font-bold text-green-800 mb-3">💚 Pagamento com PIX</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p>✓ Seguro e rápido</p>
              <p>✓ Sem taxas adicionais</p>
              <p>✓ Confirmação instantânea</p>
              <p className="text-xs text-gray-600 mt-4">
                Após preencher os dados, você receberá a chave PIX para transferência
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
