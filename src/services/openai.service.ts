import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIResponse {
  content: string;
  confidence: number;
  usedKnowledgeBase: boolean;
}

export interface KnowledgeContext {
  documents: Array<{
    title: string;
    content: string;
    relevance: number;
  }>;
}

export class OpenAIService {
  static async generateResponse(
    customerMessage: string,
    ticketContext: {
      subject: string;
      previousMessages?: string[];
      customerName?: string;
    },
    knowledgeContext?: KnowledgeContext
  ): Promise<AIResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(customerMessage, ticketContext, knowledgeContext);

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = completion.choices[0]?.message?.content || '';
      
      return {
        content,
        confidence: this.calculateConfidence(completion),
        usedKnowledgeBase: Boolean(knowledgeContext?.documents?.length)
      };
    } catch (error: any) {
      console.error('Erro ao gerar resposta com OpenAI:', error);
      throw new Error(`Falha na geração de resposta: ${error.message}`);
    }
  }

  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
      });

      return response.data[0].embedding;
    } catch (error: any) {
      console.error('Erro ao gerar embedding:', error);
      throw new Error(`Falha na geração de embedding: ${error.message}`);
    }
  }

  private static buildSystemPrompt(): string {
    return `Você é um assistente de suporte ao cliente especializado e prestativo. Suas responsabilidades incluem:

1. Responder dúvidas de clientes de forma clara e profissional
2. Usar informações da base de conhecimento quando disponível
3. Manter um tom cordial e empático
4. Fornecer soluções práticas e específicas
5. Solicitar mais informações quando necessário

Diretrizes:
- Sempre cumprimente o cliente respeitosamente
- Use as informações da base de conhecimento quando relevante
- Se não souber a resposta, seja honesto e ofereça alternativas
- Mantenha as respostas concisas mas completas
- Finalize oferecendo ajuda adicional
- Use português brasileiro
- Evite jargões técnicos desnecessários`;
  }

  private static buildUserPrompt(
    customerMessage: string,
    ticketContext: {
      subject: string;
      previousMessages?: string[];
      customerName?: string;
    },
    knowledgeContext?: KnowledgeContext
  ): string {
    let prompt = `CONTEXTO DO TICKET:
Assunto: ${ticketContext.subject}
${ticketContext.customerName ? `Cliente: ${ticketContext.customerName}` : ''}

`;

    if (ticketContext.previousMessages?.length) {
      prompt += `HISTÓRICO DA CONVERSA:
${ticketContext.previousMessages.join('\n---\n')}

`;
    }

    if (knowledgeContext?.documents?.length) {
      prompt += `INFORMAÇÕES DA BASE DE CONHECIMENTO:
${knowledgeContext.documents
  .map(doc => `[Relevância: ${doc.relevance.toFixed(2)}] ${doc.title}\n${doc.content}`)
  .join('\n\n---\n\n')}

`;
    }

    prompt += `MENSAGEM ATUAL DO CLIENTE:
${customerMessage}

Por favor, gere uma resposta adequada para o cliente.`;

    return prompt;
  }

  private static calculateConfidence(completion: any): number {
    // Calcula uma confiança baseada na resposta da API
    // Esta é uma implementação simples, pode ser melhorada
    const hasContent = completion.choices[0]?.message?.content?.length > 0;
    const finishReason = completion.choices[0]?.finish_reason;
    
    if (!hasContent) return 0;
    if (finishReason === 'stop') return 0.9;
    if (finishReason === 'length') return 0.7;
    
    return 0.5;
  }

  static async summarizeText(text: string, maxLength: number = 200): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Resuma o texto a seguir em no máximo ${maxLength} caracteres, mantendo as informações mais importantes.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: Math.ceil(maxLength / 2),
      });

      return completion.choices[0]?.message?.content || text.substring(0, maxLength);
    } catch (error: any) {
      console.error('Erro ao resumir texto:', error);
      return text.substring(0, maxLength);
    }
  }
}
