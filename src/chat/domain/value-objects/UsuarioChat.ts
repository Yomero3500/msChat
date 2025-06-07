import { ValueObject } from '../../../shared/base/ValueObject';
import { DomainError } from '../../../shared/errors/DomainError';
import { Insignia } from './Insignia';

interface UsuarioChatProps {
  usuarioId: string;
  esModerador: boolean;
  insignias: Insignia[];
}

export class UsuarioChat extends ValueObject<UsuarioChatProps> {
  private constructor(props: UsuarioChatProps) {
    super(props);
  }

  public static crear(usuarioId: string, esModerador: boolean, insignias: Insignia[]): UsuarioChat {
    if (!usuarioId || usuarioId.trim().length === 0) {
      throw new DomainError('El ID del usuario no puede estar vacío');
    }

    return new UsuarioChat({
      usuarioId,
      esModerador,
      insignias: [...insignias] // Copia defensiva
    });
  }

  get usuarioId(): string {
    return this.props.usuarioId;
  }

  get esModerador(): boolean {
    return this.props.esModerador;
  }

  get insignias(): Insignia[] {
    return [...this.props.insignias]; // Copia defensiva
  }

  public puedeModerar(): boolean {
    return this.props.esModerador;
  }

  public tieneInsignia(nombreInsignia: string): boolean {
    return this.props.insignias.some(insignia => insignia.nombre === nombreInsignia);
  }
}
