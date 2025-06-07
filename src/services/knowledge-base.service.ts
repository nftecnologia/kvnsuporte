import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIService } from './openai.service';
import { prisma } from '@/lib/prisma';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    title: string;
    category?: string;
    source: string;
    chunkIndex: number;
  };
}

export interface SearchResult {
  documents: Array<{
    id: string;
    title: string;
    content: string;
    relevance: number;
    category?: string;
  }>;
  totalResults: number;
}

export class KnowledgeBaseService {
  private static async getIndex() {
    const indexName = process.env.PINECONE_INDEX || 'kvn-knowledge-base';
    return pinecone.index(indexName);
  }

  static async testConnection(): Promise<any> {
    try {
      const index = await this.getIndex();
      const stats = await index.describeIndexStats();
      return {
        connected: true,
        indexName: process.env.PINECONE_INDEX || 'kvn-knowledge-base',
        stats
      };
    } catch (error: any) {
      throw new Error(`Falha na conexão com Pinecone: ${error.message}`);
    }
  }

  static async addDocument(
    id: string,
    title: string,
    content: string,
    metadata: {
      category?: string;
      filename?: string;
      fileType?: string;
    } = {}
  ): Promise<void> {
    try {
      // Divide o documento em chunks menores
      const chunks = this.splitIntoChunks(content);
      const index = await this.getIndex();

      // Salva no banco de dados
      const kbDocument = await prisma.knowledgeBase.create({
        data: {
          id,
          title,
          content,
          category: metadata.category,
          filename: metadata.filename,
          fileType: metadata.fileType,
          fileSize: content.length,
        },
      });

      // Processa cada chunk
      const vectors = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await OpenAIService.generateEmbedding(chunk);
        
        vectors.push({
          id: `${id}_chunk_${i}`,
          values: embedding,
          metadata: {
            title,
            content: chunk,
            category: metadata.category || 'general',
            source: id,
            chunkIndex: i,
            documentId: id,
          },
        });
      }

      // Envia para Pinecone em lotes
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.upsert(batch);
      }

      // Atualiza o documento com informação de embedding
      await prisma.knowledgeBase.update({
        where: { id },
        data: {
          embedding: JSON.stringify({ chunks: chunks.length }),
        },
      });

      console.log(`Documento ${title} adicionado à base de conhecimento com ${chunks.length} chunks`);
    } catch (error: any) {
      console.error('Erro ao adicionar documento:', error);
      throw new Error(`Falha ao adicionar documento: ${error.message}`);
    }
  }

  static async searchSimilar(
    query: string,
    limit: number = 5,
    filter?: {
      category?: string;
      source?: string;
    }
  ): Promise<SearchResult> {
    try {
      const queryEmbedding = await OpenAIService.generateEmbedding(query);
      const index = await this.getIndex();

      const searchParams: any = {
        vector: queryEmbedding,
        topK: limit * 3, // Busca mais para depois filtrar duplicatas
        includeMetadata: true,
        includeValues: false,
      };

      // Aplica filtros se fornecidos
      if (filter) {
        searchParams.filter = {};
        if (filter.category) {
          searchParams.filter.category = filter.category;
        }
        if (filter.source) {
          searchParams.filter.source = filter.source;
        }
      }

      const searchResponse = await index.query(searchParams);
      
      // Agrupa por documento para evitar duplicatas
      const documentMap = new Map<string, {
        id: string;
        title: string;
        content: string;
        relevance: number;
        category?: string;
      }>();

      searchResponse.matches?.forEach((match) => {
        const metadata = match.metadata as any;
        const documentId = metadata.source || metadata.documentId;
        const relevance = match.score || 0;

        if (!documentMap.has(documentId) || documentMap.get(documentId)!.relevance < relevance) {
          documentMap.set(documentId, {
            id: documentId,
            title: metadata.title,
            content: metadata.content,
            relevance,
            category: metadata.category,
          });
        }
      });

      // Converte para array e ordena por relevância
      const documents = Array.from(documentMap.values())
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit);

      return {
        documents,
        totalResults: documents.length,
      };
    } catch (error: any) {
      console.error('Erro na busca semântica:', error);
      throw new Error(`Falha na busca: ${error.message}`);
    }
  }

  static async deleteDocument(id: string): Promise<void> {
    try {
      const index = await this.getIndex();
      
      // Remove do banco de dados
      await prisma.knowledgeBase.delete({
        where: { id },
      });

      // Lista todos os chunks do documento no Pinecone
      const listResponse = await index.listPaginated({
        prefix: `${id}_chunk_`,
      });

      if (listResponse.vectors && listResponse.vectors.length > 0) {
        const chunkIds = listResponse.vectors.map(v => v.id!);
        await index.deleteMany(chunkIds);
      }

      console.log(`Documento ${id} removido da base de conhecimento`);
    } catch (error: any) {
      console.error('Erro ao remover documento:', error);
      throw new Error(`Falha ao remover documento: ${error.message}`);
    }
  }

  static async getDocuments(
    page: number = 1,
    limit: number = 10,
    category?: string
  ): Promise<{
    documents: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const where = category ? { category, isActive: true } : { isActive: true };
      
      const [documents, total] = await Promise.all([
        prisma.knowledgeBase.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            category: true,
            filename: true,
            fileType: true,
            fileSize: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.knowledgeBase.count({ where }),
      ]);

      return {
        documents,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      console.error('Erro ao buscar documentos:', error);
      throw new Error(`Falha ao buscar documentos: ${error.message}`);
    }
  }

  private static splitIntoChunks(content: string, maxChunkSize: number = 1000): string[] {
    const chunks: string[] = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (currentChunk.length + trimmedSentence.length + 1 <= maxChunkSize) {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + '.');
        }
        currentChunk = trimmedSentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk + '.');
    }
    
    return chunks.length > 0 ? chunks : [content.substring(0, maxChunkSize)];
  }

  static async updateDocumentStatus(id: string, isActive: boolean): Promise<void> {
    try {
      await prisma.knowledgeBase.update({
        where: { id },
        data: { isActive },
      });
    } catch (error: any) {
      console.error('Erro ao atualizar status do documento:', error);
      throw new Error(`Falha ao atualizar documento: ${error.message}`);
    }
  }
}
