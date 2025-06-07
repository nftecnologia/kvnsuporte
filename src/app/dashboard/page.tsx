'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MailIcon, TicketIcon, UsersIcon, SettingsIcon } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [databaseStatus, setDatabaseStatus] = useState<{
    status: 'loading' | 'connected' | 'error';
    message: string;
  }>({ status: 'loading', message: 'Verificando...' });

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) router.push('/auth/signin'); // Redirect if not authenticated
  }, [session, status, router]);

  useEffect(() => {
    // Verifica o status do banco
    const checkDatabaseStatus = async () => {
      try {
        const response = await fetch('/api/status/database');
        const data = await response.json();
        
        if (response.ok) {
          setDatabaseStatus({
            status: 'connected',
            message: data.message
          });
        } else {
          setDatabaseStatus({
            status: 'error',
            message: data.message || 'Erro na conexão'
          });
        }
      } catch (error) {
        setDatabaseStatus({
          status: 'error',
          message: 'Erro ao verificar conexão'
        });
      }
    };

    checkDatabaseStatus();
  }, []);

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.125rem',
        color: '#6b7280'
      }}>
        Carregando...
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            Dashboard - Kvn Suporte
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{ color: '#6b7280' }}>
              Olá, {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <MailIcon size={40} color="#2563eb" />
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>0</h3>
              <p style={{ color: '#6b7280' }}>E-mails Recebidos</p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <TicketIcon size={40} color="#16a34a" />
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>0</h3>
              <p style={{ color: '#6b7280' }}>Tickets Abertos</p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <UsersIcon size={40} color="#9333ea" />
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>0</h3>
              <p style={{ color: '#6b7280' }}>Clientes</p>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#1f2937'
          }}>
            Configuração do Sistema
          </h2>
          <p style={{
            color: '#6b7280',
            marginBottom: '1.5rem'
          }}>
            Para começar a usar o sistema, você precisa configurar o banco de dados:
          </p>
          
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#92400e',
              marginBottom: '0.5rem'
            }}>
              Configurar Neon Postgres
            </h3>
            <ol style={{
              color: '#92400e',
              listStyle: 'decimal',
              listStylePosition: 'inside',
              lineHeight: '1.6'
            }}>
              <li>Acesse <strong>https://neon.tech</strong></li>
              <li>Crie uma conta gratuita</li>
              <li>Crie um novo projeto</li>
              <li>Copie a URL de conexão</li>
              <li>Cole no arquivo <code style={{
                backgroundColor: '#fbbf24',
                padding: '0.125rem 0.25rem',
                borderRadius: '0.25rem'
              }}>.env</code> na variável <code>DATABASE_URL</code></li>
              <li>Execute: <code style={{
                backgroundColor: '#fbbf24',
                padding: '0.125rem 0.25rem',
                borderRadius: '0.25rem'
              }}>npx prisma migrate dev</code></li>
            </ol>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: '#f3f4f6',
              textAlign: 'center'
            }}>
              <h4 style={{
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>
                Status do Banco
              </h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: 
                    databaseStatus.status === 'loading' ? '#eab308' :
                    databaseStatus.status === 'connected' ? '#16a34a' : '#ef4444',
                  borderRadius: '50%'
                }}></div>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {databaseStatus.status === 'loading' ? 'Verificando...' :
                   databaseStatus.status === 'connected' ? 'Conectado' : 'Erro'}
                </span>
              </div>
            </div>

            <div style={{
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: '#f3f4f6',
              textAlign: 'center'
            }}>
              <h4 style={{
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>
                Webhook Status
              </h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#16a34a',
                  borderRadius: '50%'
                }}></div>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Funcionando
                </span>
              </div>
            </div>

            <div style={{
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: '#f3f4f6',
              textAlign: 'center'
            }}>
              <h4 style={{
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>
              APIs Externas
              </h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#eab308',
                  borderRadius: '50%'
                }}></div>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Configurar
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#1f2937'
          }}>
            Atividade Recente
          </h2>
          <div style={{
            textAlign: 'center',
            color: '#6b7280',
            padding: '2rem'
          }}>
            <p>Nenhuma atividade ainda.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Configure o banco de dados para começar a receber e-mails.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
