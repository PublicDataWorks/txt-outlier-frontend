type StorageValue = Record<string, unknown> | unknown[] | string

interface Organization {
  teams: Team[]
}

interface Team {
  users: User[]
  id: string
  name: string
}

interface User {
  me: boolean
}

declare class MissiveClass {
  public constructor()

  public storeGet<T extends StorageValue>(key: string): Promise<T>

  public storeSet(key: string, data: StorageValue): void

  public openForm(data: {
    buttons: { label: string; type: string }[]
    name: string
    fields: { data: { subtitle: string[] }; type: string }[]
  }): Promise<never>

  public closeForm(): Promise<never>

  public alert(options: { title: string; message: string; note: string }): Promise<never>

  public async fetchOrganizations(): Promise<Organization[]>
}

declare const Missive: InstanceType<typeof MissiveClass>
