export interface IVectorStoreResult {
  id: string;
  score: number;
  metadata: any;
}

export interface IVectorStore {
  /**
   * Adds an indexed document with its associated embedding vector.
   */
  addDocument(id: string, vector: number[], metadata: any): Promise<void>;

  /**
   * Performs semantic similarity lookup against stored vectors.
   */
  searchSimilar(
    vector: number[],
    limit: number,
  ): Promise<IVectorStoreResult[]>;

  /**
   * Deletes a document from the vector indexing space.
   */
  removeDocument(id: string): Promise<void>;

  /**
   * Wipes all documents from the vector registry.
   */
  clear(): Promise<void>;
}
