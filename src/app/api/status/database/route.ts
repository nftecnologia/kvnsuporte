import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Tenta fazer uma consulta simples para verificar a conexão
    await prisma.$queryRaw`SELECT 1`;
    
    // Se chegou até aqui, o banco está funcionando
    return NextResponse.json({
      status: 'connected',
      message: 'Banco de dados conectado e funcionando'
    });
  } catch (error: any) {
    console.error('Erro ao conectar com o banco:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Erro na conexão com o banco'
    }, { status: 500 });
  }
}
