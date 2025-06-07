import { NextRequest, NextResponse } from 'next/server';
import { SendGridService, InboundEmail } from '@/services/sendgrid.service';
import { prisma } from '@/lib/prisma';
import { processInboundEmail } from '@/trigger/email-processing';

export async function POST(request: NextRequest) {
  try {
    // Parse do corpo da requisição
    const body = await request.formData();
    const emailData: any = {};
    
    // Converte FormData para objeto
    for (const [key, value] of body.entries()) {
      emailData[key] = value;
    }

    // Parse do e-mail usando o serviço SendGrid
    const inboundEmail = SendGridService.parseInboundEmail(emailData);
    
    // Validação básica de segurança
    if (!SendGridService.isEmailSecure(inboundEmail)) {
      console.warn('E-mail rejeitado por falha na validação de segurança:', {
        from: inboundEmail.from,
        spf: inboundEmail.spf,
        dkim: inboundEmail.dkim
      });
      
      return NextResponse.json({ 
        status: 'rejected',
        reason: 'Falha na validação de segurança'
      }, { status: 400 });
    }

    // Extrai o e-mail do remetente
    const customerEmail = SendGridService.extractEmailAddress(inboundEmail.from);
    
    if (!customerEmail || !customerEmail.includes('@')) {
      return NextResponse.json({ 
        status: 'rejected',
        reason: 'E-mail do remetente inválido'
      }, { status: 400 });
    }

    // Log do e-mail recebido
    const emailLog = await prisma.emailLog.create({
      data: {
        messageId: `inbound_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        from: inboundEmail.from,
        to: inboundEmail.to,
        subject: inboundEmail.subject,
        body: inboundEmail.text,
        status: 'RECEIVED',
        direction: 'INBOUND',
      },
    });

    // Busca ou cria o cliente
    let customer = await prisma.customer.findUnique({
      where: { email: customerEmail },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email: customerEmail,
          name: extractNameFromEmail(customerEmail),
        },
      });
    }

    // Verifica se é resposta a um ticket existente ou novo ticket
    let ticket = await findExistingTicket(inboundEmail.subject, customer.id);
    
    if (!ticket) {
      // Cria novo ticket
      ticket = await prisma.ticket.create({
        data: {
          subject: cleanSubject(inboundEmail.subject),
          description: inboundEmail.text,
          customerId: customer.id,
          status: 'OPEN',
          priority: 'MEDIUM',
        },
      });
    }

    // Cria a mensagem
    const message = await prisma.message.create({
      data: {
        content: inboundEmail.text,
        isFromCustomer: true,
        ticketId: ticket.id,
        messageId: emailLog.messageId,
      },
    });

    // Atualiza o log do e-mail com o ticket
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { 
        ticketId: ticket.id,
        status: 'PROCESSING'
      },
    });

    // Atualiza o ticket com a nova atividade
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { 
        updatedAt: new Date(),
        status: ticket.status === 'RESOLVED' ? 'OPEN' : ticket.status,
      },
    });

    console.log(`E-mail processado com sucesso: Ticket ${ticket.id}, Cliente ${customer.email}`);

    // Trigger do workflow Trigger.dev para processamento com IA
    try {
      const triggerPayload = {
        from: customerEmail,
        to: inboundEmail.to,
        subject: inboundEmail.subject,
        text: inboundEmail.text,
        html: inboundEmail.html,
        messageId: emailLog.messageId,
      };

      // Dispara o processamento assíncrono com IA
      await processInboundEmail.trigger(triggerPayload);
      console.log(`🚀 Trigger.dev workflow disparado para ticket ${ticket.id}`);
    } catch (triggerError: any) {
      console.error('Erro ao disparar Trigger.dev workflow:', triggerError);
      // Não falha o webhook por causa do trigger
    }

    return NextResponse.json({
      status: 'success',
      ticketId: ticket.id,
      messageId: message.id,
    });

  } catch (error: any) {
    console.error('Erro ao processar e-mail inbound:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro interno no processamento do e-mail',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }, { status: 500 });
  }
}

// Funções auxiliares
function extractNameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  return localPart
    .replace(/[._-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function cleanSubject(subject: string): string {
  return subject.replace(/^(Re:|Fwd?:)\s*/i, '').trim();
}

async function findExistingTicket(subject: string, customerId: string) {
  const cleanedSubject = cleanSubject(subject);
  
  // Busca tickets do cliente com assunto similar
  const tickets = await prisma.ticket.findMany({
    where: {
      customerId,
      status: {
        not: 'CLOSED'
      }
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: 5,
  });

  // Procura por correspondência exata ou similar
  return tickets.find((ticket: any) => {
    const ticketSubject = ticket.subject.toLowerCase();
    const emailSubject = cleanedSubject.toLowerCase();
    
    return ticketSubject === emailSubject || 
           ticketSubject.includes(emailSubject) || 
           emailSubject.includes(ticketSubject);
  }) || null;
}

// Método GET para verificação de saúde
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'SendGrid Inbound Webhook',
    timestamp: new Date().toISOString(),
  });
}
