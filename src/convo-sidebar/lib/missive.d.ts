type StorageValue = Record<string, unknown> | unknown[] | string

interface Conversation {
  id: string
  labels: Label[]
  authors: Author[]
  messages: Message[]
  phone_numbers: Phone[]
}

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

interface Label {
  id: string
  name: string
  parent_id: string
}

interface Author {
  name: string
  phone_number: string
}

interface Message {
  from_field: { phone_number: string }
  delivered_at: number
  author: { first_name: string; last_name: string } | null
}

interface Phone {
  id: string
  name: string
  type: string
  value: string
}

declare class MissiveClass {
  public constructor()

  public async storeGet<T extends StorageValue>(key: string): Promise<T>

  public storeSet(key: string, data: StorageValue): void

  public on(event: string, callback: (ids: string[]) => void): void

  public async fetchConversations(ids: string[]): Promise<Conversation[]>

  public async fetchLabels(): Promise<Label[]>

  public reload(): void;
}

declare const Missive: InstanceType<typeof MissiveClass>
