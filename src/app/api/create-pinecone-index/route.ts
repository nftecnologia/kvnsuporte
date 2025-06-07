import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export async function POST() {
  try {
    const indexName = process.env.PINECONE_INDEX || 'kvn-knowledge-base';
    
    // Verifica se o índice já existe
    const existingIndexes = await pinecone.listIndexes();
    const indexExists = existingIndexes.indexes?.some(index => index.name === indexName);
    
    if (indexExists) {
      return NextResponse.json({
        status: 'success',
        message: 'Índice já existe',
        indexName
      });
    }

    // Cria o índice
    await pinecone.createIndex({
      name: indexName,
      dimension: 1536, // Dimensão dos embeddings do OpenAI
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });

    // Aguarda o índice ficar pronto (pode demorar alguns minutos)
    let isReady = false;
    let attempts = 0;
    const maxAttempts = 30; // 5 minutos máximo

    while (!isReady && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Aguarda 10 segundos
      
      try {
        const index = pinecone.index(indexName);
        const stats = await index.describeIndexStats();
        isReady = true;
        break;
      } catch (error) {
        attempts++;
        console.log(`Tentativa ${attempts}/${maxAttempts} - Aguardando índice ficar pronto...`);
      }
    }

    if (!isReady) {
      return NextResponse.json({
        status: 'warning',
        message: 'Índice criado, mas ainda está inicializando. Tente novamente em alguns minutos.',
        indexName
      });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Índice criado com sucesso',
      indexName
    });

  } catch (error) {
    console.error('Erro ao criar índice Pinecone:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao criar índice Pinecone',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
