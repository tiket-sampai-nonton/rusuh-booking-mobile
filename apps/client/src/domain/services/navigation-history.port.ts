/** Restores the current route after a browser history action is prevented. */
export interface NavigationHistory {
  captureRestorePoint(path: string): () => void;
}
