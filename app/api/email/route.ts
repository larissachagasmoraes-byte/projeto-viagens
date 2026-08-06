import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { readFile } from 'fs/promises';
import { join } from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, nome, roteiros } = await request.json();

    if (!email || !roteiros || roteiros.length === 0) {
      return NextResponse.json(
        { error: 'Email e roteiros são obrigatórios' },
        { status: 400 }
      );
    }

    // Preparar anexos dos PDFs
    const attachments = [];
    for (const roteiro of roteiros) {
      if (roteiro.pdfPath) {
        try {
          const pdfPath = join(process.cwd(), 'public', roteiro.pdfPath);
          const fileContent = await readFile(pdfPath);

          attachments.push({
            filename: `${roteiro.nome}.pdf`,
            content: fileContent,
          });
        } catch (error) {
          console.error(`Erro ao ler PDF ${roteiro.nome}:`, error);
        }
      }
    }

    // Montar lista de roteiros comprados
    const roteirosHtml = roteiros
      .map((r: any) => `<li>${r.nome} - R$ ${r.preco.toFixed(2)}</li>`)
      .join('');

    const totalPrice = roteiros.reduce((sum: number, r: any) => sum + r.preco, 0);

    // Enviar email
    const result = await resend.emails.send({
      from: 'noreply@roteiros-viagem.com',
      to: email,
      subject: '✈️ Seus Roteiros Estão Prontos!',
      html: `
        <h2>Olá ${nome}! 🎉</h2>
        <p>Obrigado pela compra! Aqui estão seus roteiros:</p>

        <ul style="list-style: none; padding: 0;">
          ${roteirosHtml}
        </ul>

        <hr style="margin: 20px 0;">

        <p style="font-size: 18px; font-weight: bold;">
          Total: R$ ${totalPrice.toFixed(2)}
        </p>

        <p>Os PDFs estão anexados neste email. Bom proveito na sua viagem! ✈️</p>

        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Qualquer dúvida, responda este email ou nos contacte pelo Instagram/TikTok.
        </p>
      `,
      attachments: attachments,
    });

    if (result.error) {
      console.error('Erro ao enviar email:', result.error);
      return NextResponse.json(
        { error: 'Erro ao enviar email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao processar email:', error);
    return NextResponse.json(
      { error: 'Erro ao processar email' },
      { status: 500 }
    );
  }
}
