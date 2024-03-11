export interface Listener {
  name: string,
  once?: boolean,
  execute: (...args: any[]) => void
}