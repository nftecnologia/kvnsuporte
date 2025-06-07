import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { KnowledgeBaseService } from "@/services/knowledge-base.service";
import { OpenAIService } from "@/services/openai.service";
import { SendGridService } from "@/services/sendgrid.service";

export interface EmailProcessingPayload {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  messageId?: string;
  inReplyTo?: string;
  references?: string;
}

export const processInboundEmail = task({
  id: "process-inbound-email",
  maxDuration: 300, // 5 minutes
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
  },
  run: async (payload: EmailProcessingPayload) => {
    console.log("🚀 Processing inbound email:", payload.subject);

    try {
      // 1. Verificar se é um e-mail válido
      if (!payload.from || !payload.text) {
        throw new Error("Invalid email payload");
      }

      // 2. Buscar ou criar cliente
      let customer = await prisma.customer.findUnique({
        where: { email: payload.from }
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: payload.from.split('@')[0], // Nome temporário
            email: payload.from,
            phone: null,
          }
        });
        console.log("✅ Cliente criado:", customer.email);
      }

      // 3. Buscar ou criar ticket
      let ticket = await prisma.ticket.findFirst({
        where: {
          customerId: customer.id,
          subject: payload.subject,
          status: { in: ['OPEN', 'IN_PROGRESS'] }
        }
      });

      if (!ticket) {
        ticket = await prisma.ticket.create({
          data: {
            subject: payload.subject,
            description: payload.text,
            customerId: customer.id,
            status: 'OPEN',
            priority: 'MEDIUM',
            source: 'EMAIL',
          }
        });
        console.log("✅ Ticket criado:", ticket.id);
      }

      // 4. Adicionar mensagem ao histórico
      const message = await prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: customer.id,
          senderType: 'CUSTOMER',
          content: payload.text,
          messageType: 'EMAIL',
          metadata: {
            messageId: payload.messageId,
            inReplyTo: payload.inReplyTo,
            references: payload.references,
          }
        }
      });

      console.log("✅ Mensagem adicionada ao histórico");

      // 5. Buscar na base de conhecimento
      console.log("🔍 Buscando na base de conhecimento...");
      const searchResults = await KnowledgeBaseService.searchSimilar(
        payload.text,
        3 // top 3 resultados
      );

      // 6. Gerar resposta com IA
      console.log("🤖 Gerando resposta com IA...");
      const knowledgeContext = searchResults.documents.length > 0 
        ? {
            documents: searchResults.documents.map(doc => ({
              title: doc.title,
              content: doc.content,
              relevance: doc.relevance
            }))
          }
        : undefined;

      const aiResponse = await OpenAIService.generateResponse(
        payload.text,
        {
          subject: ticket.subject,
          customerName: customer.name,
        },
        knowledgeContext
      );

      // 7. Salvar resposta como rascunho
      const responseMessage = await prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: null, // Sistema
          senderType: 'SYSTEM',
          content: aiResponse.content,
          messageType: 'EMAIL',
          status: 'DRAFT',
          metadata: {
            generatedByAI: true,
            searchResultsUsed: searchResults.documents.length,
          }
        }
      });

      console.log("✅ Resposta IA salva como rascunho");

      // 8. Enviar resposta automática
      console.log("📧 Enviando resposta automática...");
      
      const emailSubject = payload.subject.startsWith('Re:') 
        ? payload.subject 
        : `Re: ${payload.subject}`;

      const emailSent = await SendGridService.sendEmail({
        to: payload.from,
        subject: emailSubject,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>Olá,</p>
            <p>Obrigado por entrar em contato. Aqui está nossa resposta:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              ${aiResponse.content.replace(/\n/g, '<br>')}
            </div>
            <p>Se precisar de mais informações, responda este e-mail.</p>
            <hr>
            <p style="font-size: 12px; color: #666;">
              Ticket #${ticket.id} | Sistema KVN Suporte
            </p>
          </div>
        `,
        inReplyTo: payload.messageId || '',
        references: payload.references || '',
      });

      if (emailSent) {
        // Marcar resposta como enviada
        await prisma.ticketMessage.update({
          where: { id: responseMessage.id },
          data: { status: 'SENT' }
        });

        // Atualizar status do ticket
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { 
            status: 'IN_PROGRESS',
            lastResponseAt: new Date(),
          }
        });

        console.log("✅ E-mail enviado com sucesso");
      }

      // 9. Resultado final
      const result = {
        success: true,
        customerId: customer.id,
        ticketId: ticket.id,
        messageId: message.id,
        responseId: responseMessage.id,
        aiResponse: aiResponse,
        searchResults: searchResults.totalResults,
        emailSent: emailSent,
        processingTime: Date.now(),
      };

      console.log("🎉 Processamento concluído:", result);
      return result;

    } catch (error: any) {
      console.error("❌ Erro no processamento:", error);
      
      // Log do erro
      await prisma.systemLog.create({
        data: {
          level: 'ERROR',
          source: 'EMAIL_PROCESSING',
          message: `Erro ao processar e-mail: ${error.message}`,
          metadata: {
            payload,
            error: error.stack,
          }
        }
      }).catch(() => {}); // Evitar erro duplo

      throw error;
    }
  }
});
