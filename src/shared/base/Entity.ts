// Clase base para entidades
export abstract class Entity<T> {
  constructor(public readonly props: T) {}
}
