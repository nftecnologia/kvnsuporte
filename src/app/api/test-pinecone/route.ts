import { NextRequest, NextResponse } from 'next/server';
import { KnowledgeBaseService } from '@/services/knowledge-base.service';

export async function GET() {
  try {
    // Testa a conexão com o Pinecone
    const testResult = await KnowledgeBaseService.testConnection();
    
    return NextResponse.json({
      status: 'success',
      message: 'Pinecone conectado com sucesso',
      data: testResult
    });
  } catch (error) {
    console.error('Erro ao conectar com Pinecone:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao conectar com Pinecone',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, title = 'Documento de teste' } = await request.json();
    
    if (!text) {
      return NextResponse.json({
        status: 'error',
        message: 'Texto é obrigatório'
      }, { status: 400 });
    }

    // Adiciona documento à base de conhecimento
    const result = await KnowledgeBaseService.addDocument(
      `doc-${Date.now()}`,
      title,
      text,
      {
        category: 'teste',
        filename: 'api-test.txt',
        fileType: 'text'
      }
    );

    return NextResponse.json({
      status: 'success',
      message: 'Documento adicionado com sucesso',
      data: result
    });
  } catch (error) {
    console.error('Erro ao adicionar documento:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao adicionar documento',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
