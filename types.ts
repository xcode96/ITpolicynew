export interface Category {
  id: string;
  name: string;
  icon?: string; // We might store icon name string if we want dynamic icons later
}

export interface Policy {
  id: number;
  name: string;
  categoryId?: string;
  content?: string; // Making explicit
}

export type SyncStatus = 'not-connected' | 'connecting' | 'connected' | 'failed';
