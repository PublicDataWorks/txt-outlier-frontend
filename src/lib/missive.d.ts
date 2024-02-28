type StorageValue = Record<string, unknown> | unknown[] | string

interface FormData {
  name: string;
  fields: never[];
  comments: never[];
  notes: never[];
  buttons: never[];
  options: {
    autoClose: boolean;
  };
}


declare class MissiveClass {
  public constructor()

  public storeGet<T extends StorageValue>(key: string): Promise<T>

  public storeSet(key: string, data: StorageValue): void

  public openForm(data: {
    buttons: ({ label: string; type: string })[];
    name: string;
    fields: { data: { subtitle: string[] }; type: string }[]
  }): Promise<never>
}

declare const Missive: InstanceType<typeof MissiveClass>
