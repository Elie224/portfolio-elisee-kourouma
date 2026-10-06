export interface D1Like {
  prepare: (sql: string) => {
    bind: (...args: unknown[]) => {
      run: () => Promise<unknown>;
      first: <T>() => Promise<T | null>;
      all: <T>() => Promise<{ results: T[] }>;
    };
  };
}

export function createDbClient(db: D1Like): D1Like {
  return db;
}
