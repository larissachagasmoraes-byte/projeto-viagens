export default function LojaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da Loja */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🌍 Roteiros de Viagem</h1>
            <p className="text-gray-600 text-sm mt-1">Destinos incríveis para CLT</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Dúvidas? Entre em contato!</p>
            <p className="text-blue-600 font-semibold">@larissachagasdiario</p>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© 2026 Roteiros de Viagem - Todos os direitos reservados</p>
          <p className="text-gray-400 text-sm mt-2">
            Siga no TikTok para dicas de viagem: @larissachagasdiario
          </p>
        </div>
      </footer>
    </div>
  );
}
