import Link from 'next/link';
import { MailIcon, BotIcon, DatabaseIcon, ZapIcon } from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff, #e0e7ff)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 1rem'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Kvn Suporte
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#6b7280',
            marginBottom: '2rem'
          }}>
            Sistema de Suporte Inteligente com IA
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              href="/auth/signin"
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
            >
              Fazer Login
            </Link>
            <Link
              href="/dashboard"
              style={{
                border: '2px solid #2563eb',
                color: '#2563eb',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
            >
              Ver Dashboard
            </Link>
          </div>
        </div>

        {/* Recursos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          marginBottom: '4rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <MailIcon 
              size={48} 
              color="#2563eb" 
              style={{ marginBottom: '1rem', margin: '0 auto 1rem auto' }}
            />
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#1f2937'
            }}>
              Recepção de E-mails
            </h3>
            <p style={{ color: '#6b7280', lineHeight: '1.5' }}>
              Recebe e-mails automaticamente via SendGrid e cria tickets
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <BotIcon 
              size={48} 
              color="#16a34a" 
              style={{ marginBottom: '1rem', margin: '0 auto 1rem auto' }}
            />
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#1f2937'
            }}>
              IA Integrada
            </h3>
            <p style={{ color: '#6b7280', lineHeight: '1.5' }}>
              Gera respostas automáticas usando OpenAI GPT-4
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <DatabaseIcon 
              size={48} 
              color="#9333ea" 
              style={{ marginBottom: '1rem', margin: '0 auto 1rem auto' }}
            />
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#1f2937'
            }}>
              Base de Conhecimento
            </h3>
            <p style={{ color: '#6b7280', lineHeight: '1.5' }}>
              Busca semântica com Pinecone para respostas precisas
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <ZapIcon 
              size={48} 
              color="#ca8a04" 
              style={{ marginBottom: '1rem', margin: '0 auto 1rem auto' }}
            />
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#1f2937'
            }}>
              Automação
            </h3>
            <p style={{ color: '#6b7280', lineHeight: '1.5' }}>
              Workflows automatizados com Trigger.dev
            </p>
          </div>
        </div>

        {/* Status do Sistema */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          marginBottom: '4rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            color: '#1f2937'
          }}>
            Status do Sistema
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#16a34a',
                borderRadius: '50%',
                margin: '0 auto 0.5rem auto'
              }}></div>
              <p style={{ fontWeight: '500', color: '#1f2937' }}>API Webhooks</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Funcionando</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#16a34a',
                borderRadius: '50%',
                margin: '0 auto 0.5rem auto'
              }}></div>
              <p style={{ fontWeight: '500', color: '#1f2937' }}>Banco de Dados</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Conectado</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#eab308',
                borderRadius: '50%',
                margin: '0 auto 0.5rem auto'
              }}></div>
              <p style={{ fontWeight: '500', color: '#1f2937' }}>SendGrid</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Configurar API Key</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#eab308',
                borderRadius: '50%',
                margin: '0 auto 0.5rem auto'
              }}></div>
              <p style={{ fontWeight: '500', color: '#1f2937' }}>OpenAI</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Configurar API Key</p>
            </div>
          </div>
        </div>

        {/* Próximos Passos */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#1f2937'
          }}>
            Próximos Passos
          </h2>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            textAlign: 'left',
            maxWidth: '768px',
            margin: '0 auto'
          }}>
            <ol style={{
              listStyle: 'decimal',
              listStylePosition: 'inside',
              color: '#374151',
              lineHeight: '1.75'
            }}>
              <li>Configure as variáveis de ambiente no arquivo .env</li>
              <li>Execute as migrações do banco: <code style={{
                backgroundColor: '#f3f4f6',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontFamily: 'monospace'
              }}>npx prisma migrate dev</code></li>
              <li>Configure o webhook do SendGrid para: <code style={{
                backgroundColor: '#f3f4f6',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontFamily: 'monospace'
              }}>/api/webhooks/inbound-email</code></li>
              <li>Adicione documentos à base de conhecimento</li>
              <li>Teste enviando um e-mail para o sistema</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
