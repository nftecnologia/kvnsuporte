import sgMail from '@sendgrid/mail';

// Configurar SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailData {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  inReplyTo?: string; // Para threading
  references?: string; // Para threading
}

export interface InboundEmail {
  dkim: string;
  spf: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  envelope: string;
  attachments?: number;
  'attachment-info'?: string;
}

export class SendGridService {
  static async sendEmail(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY não configurada');
      }

      const msg: any = {
        to: data.to,
        from: data.from || process.env.SENDGRID_FROM_EMAIL || 'suporte@exemplo.com',
        subject: data.subject,
        ...(data.text && { text: data.text }),
        ...(data.html && { html: data.html }),
        ...(data.replyTo && { replyTo: data.replyTo }),
        headers: {
          ...(data.inReplyTo && { 'In-Reply-To': data.inReplyTo }),
          ...(data.references && { 'References': data.references }),
        }
      };

      const response = await sgMail.send(msg);
      
      return {
        success: true,
        messageId: response[0].headers['x-message-id']
      };
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido ao enviar email'
      };
    }
  }

  static parseInboundEmail(body: any): InboundEmail {
    return {
      dkim: body.dkim || 'none',
      spf: body.spf || 'none',
      from: body.from || '',
      to: body.to || '',
      subject: body.subject || '',
      text: body.text || '',
      html: body.html || '',
      envelope: body.envelope || '{}',
      attachments: parseInt(body.attachments) || 0,
      'attachment-info': body['attachment-info'] || ''
    };
  }

  static isEmailSecure(email: InboundEmail): boolean {
    // Verificação básica de SPF e DKIM
    const spfValid = email.spf === 'pass';
    const dkimValid = email.dkim && email.dkim !== 'none' && email.dkim !== 'fail';
    
    return spfValid || Boolean(dkimValid);
  }

  static extractEmailAddress(emailString: string): string {
    const match = emailString.match(/<(.+?)>/) || emailString.match(/(\S+@\S+)/);
    return match ? match[1] : emailString;
  }

  static generateThreadingId(subject: string, from: string): string {
    // Gera um ID único para threading baseado no assunto e remetente
    const cleanSubject = subject.replace(/^(Re:|Fwd?:)\s*/i, '').trim();
    return `<${Buffer.from(`${cleanSubject}-${from}`).toString('base64')}@kvnsuporte.com>`;
  }
}
