export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: AppError };

export const appErrors = {
  VALIDATION_FAIL: {
    code: 'VALIDATION_FAIL',
    message: 'Dados de entrada inválidos'
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Acesso não autorizado'
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'Recurso não encontrado'
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'Erro interno do servidor'
  },
  UNEXPECTED_ERROR: {
    code: 'UNEXPECTED_ERROR',
    message: 'Erro inesperado'
  },
  EMAIL_SEND_FAILED: {
    code: 'EMAIL_SEND_FAILED',
    message: 'Falha ao enviar e-mail'
  },
  TICKET_CREATE_FAILED: {
    code: 'TICKET_CREATE_FAILED',
    message: 'Falha ao criar ticket'
  },
  AI_RESPONSE_FAILED: {
    code: 'AI_RESPONSE_FAILED',
    message: 'Falha ao gerar resposta com IA'
  }
} as const;
