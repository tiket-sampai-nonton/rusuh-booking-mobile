/**
 * BuyerEmailStorage — domain port for the signed-in email used by checkout.
 * Platform implementations are selected by the composition root. The email is
 * personally identifying, so native adapters must use OS-protected storage.
 */
export interface BuyerEmailStorage {
  save(email: string): Promise<void>;
  load(): Promise<string | null>;
  clear(): Promise<void>;
}
