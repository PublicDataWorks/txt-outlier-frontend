type StorageValue = Record<string, unknown> | unknown[] | string

declare class MissiveClass {
  public constructor()

  public storeGet<T extends StorageValue>(key: string): Promise<T>

  public storeSet(key: string, data: StorageValue): void
}

declare const Missive: InstanceType<typeof MissiveClass>
