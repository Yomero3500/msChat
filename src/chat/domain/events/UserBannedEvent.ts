// Evento de dominio: UserBannedEvent
export class UserBannedEvent {
  constructor(
    public readonly usuarioId: string,
    public readonly salaDeChatId: string,
    public readonly moderadorId: string,
    public readonly tipoAccion: string,
    public readonly duracion?: number // ms
  ) {}
}
