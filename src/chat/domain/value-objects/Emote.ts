import { ValueObject } from '../../../shared/base/ValueObject';
import { DomainError } from '../../../shared/errors/DomainError';

interface EmoteProps {
  codigo: string;
  urlImagen: string;
}

export class Emote extends ValueObject<EmoteProps> {
  private constructor(props: EmoteProps) {
    super(props);
  }

  public static crear(codigo: string, urlImagen: string): Emote {
    if (!codigo || codigo.trim().length === 0) {
      throw new DomainError('El código del emote no puede estar vacío');
    }

    if (!urlImagen || !urlImagen.match(/^https?:\/\/.+\/.+$/)) {
      throw new DomainError('La URL del emote debe ser válida');
    }

    return new Emote({ codigo, urlImagen });
  }

  get codigo(): string {
    return this.props.codigo;
  }

  get urlImagen(): string {
    return this.props.urlImagen;
  }
}
