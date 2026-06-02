import { Injectable } from '@nestjs/common';
import { IVectorStore, IVectorStoreResult } from './interfaces/vector-store.interface';

@Injectable()
export class VectorStoreService implements IVectorStore {
  private documents: Map<string, { vector: number[]; metadata: any }> = new Map();

  async addDocument(id: string, vector: number[], metadata: any): Promise<void> {
    this.documents.set(id, { vector, metadata });
  }

  async searchSimilar(
    vector: number[],
    limit: number,
  ): Promise<IVectorStoreResult[]> {
    const results: IVectorStoreResult[] = [];

    this.documents.forEach((doc, id) => {
      const score = this.calculateCosineSimilarity(vector, doc.vector);
      results.push({
        id,
        score,
        metadata: doc.metadata,
      });
    });

    // Sort by descending similarity score
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit);
  }

  async removeDocument(id: string): Promise<void> {
    this.documents.delete(id);
  }

  async clear(): Promise<void> {
    this.documents.clear();
  }

  private calculateCosineSimilarity(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length || v1.length === 0) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < v1.length; i++) {
      dotProduct += v1[i] * v2[i];
      norm1 += v1[i] * v1[i];
      norm2 += v2[i] * v2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
}
