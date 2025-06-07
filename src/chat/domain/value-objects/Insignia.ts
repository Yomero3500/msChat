import { ValueObject } from '../../../shared/base/ValueObject';
import { DomainError } from '../../../shared/errors/DomainError';

interface InsigniaProps {
  nombre: string;
  urlImagen: string;
}

export class Insignia extends ValueObject<InsigniaProps> {
  private constructor(props: InsigniaProps) {
    super(props);
  }

  public static crear(nombre: string, urlImagen: string): Insignia {
    if (!nombre || nombre.trim().length < 2) {
      throw new DomainError('El nombre de la insignia debe tener al menos 2 caracteres');
    }

    if (!urlImagen || !urlImagen.match(/^https?:\/\/.+\/.+$/)) {
      throw new DomainError('La URL de la insignia debe ser válida');
    }

    return new Insignia({ nombre, urlImagen });
  }

  get nombre(): string {
    return this.props.nombre;
  }

  get urlImagen(): string {
    return this.props.urlImagen;
  }
}
