import { NextRequest, NextResponse } from 'next/server';
import { SendGridService } from '@/services/sendgrid.service';

export async function POST(request: NextRequest) {
  try {
    const { to, subject = 'Teste do Sistema Kvn Suporte', message = 'Este é um e-mail de teste do sistema.' } = await request.json();
    
    if (!to) {
      return NextResponse.json({
        status: 'error',
        message: 'E-mail destinatário é obrigatório'
      }, { status: 400 });
    }

    // Testa o envio de e-mail
    await SendGridService.sendEmail({
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Kvn Suporte - Teste de E-mail</h2>
          <p>${message}</p>
          <hr style="margin: 20px 0; border: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Este e-mail foi enviado automaticamente pelo sistema Kvn Suporte.<br>
            Sistema funcionando corretamente! 🎉
          </p>
        </div>
      `,
      text: `${subject}\n\n${message}\n\nEste e-mail foi enviado automaticamente pelo sistema Kvn Suporte.`
    });

    return NextResponse.json({
      status: 'success',
      message: 'E-mail enviado com sucesso',
      to
    });

  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao enviar e-mail',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Testa apenas a configuração do SendGrid
    const isConfigured = !!(process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL);
    
    return NextResponse.json({
      status: 'success',
      message: isConfigured ? 'SendGrid configurado' : 'SendGrid não configurado',
      configured: isConfigured,
      fromEmail: process.env.SENDGRID_FROM_EMAIL
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao verificar configuração SendGrid',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
