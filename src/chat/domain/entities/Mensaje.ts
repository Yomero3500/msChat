import { Entity } from '../../../shared/base/Entity';
import { DomainError } from '../../../shared/errors/DomainError';
import { Emote } from '../value-objects/Emote';
import { Timestamp } from '../value-objects/Timestamp';

interface MensajeProps {
  id: string;
  usuarioId: string;
  contenido: string;
  timestamp: Timestamp;
  emotes: Emote[];
}

export class Mensaje extends Entity<MensajeProps> {
  private constructor(props: MensajeProps) {
    super(props);
  }

  public static crear(
    id: string,
    usuarioId: string,
    contenido: string,
    emotes: Emote[] = []
  ): Mensaje {
    if (!id || id.trim().length === 0) {
      throw new DomainError('El ID del mensaje no puede estar vacío');
    }

    if (!usuarioId || usuarioId.trim().length === 0) {
      throw new DomainError('El ID del usuario no puede estar vacío');
    }

    if (!contenido || contenido.trim().length === 0) {
      throw new DomainError('El contenido del mensaje no puede estar vacío');
    }

    if (contenido.length > 500) {
      throw new DomainError('El contenido del mensaje no puede exceder los 500 caracteres');
    }

    return new Mensaje({
      id,
      usuarioId,
      contenido: contenido.trim(),
      timestamp: Timestamp.crear(),
      emotes: [...emotes] // Copia defensiva
    });
  }

  get id(): string {
    return this.props.id;
  }

  get usuarioId(): string {
    return this.props.usuarioId;
  }

  get contenido(): string {
    return this.props.contenido;
  }

  get timestamp(): Timestamp {
    return this.props.timestamp;
  }

  get emotes(): Emote[] {
    return [...this.props.emotes]; // Copia defensiva
  }

  public contieneEmote(codigoEmote: string): boolean {
    return this.props.emotes.some(emote => emote.codigo === codigoEmote);
  }

  public esReciente(tiempoLimiteMs: number = 300000): boolean { // 5 minutos por defecto
    return Date.now() - this.props.timestamp.valor <= tiempoLimiteMs;
  }
}
