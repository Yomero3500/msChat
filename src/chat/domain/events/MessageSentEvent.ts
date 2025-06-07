// Evento de dominio: MessageSentEvent
import { Mensaje } from '../entities/Mensaje';

export class MessageSentEvent {
  constructor(
    public readonly mensaje: Mensaje
  ) {}
}
