import { ValueObject } from '../../../shared/base/ValueObject';
import { DomainError } from '../../../shared/errors/DomainError';

interface TimestampProps {
  valor: number;
}

export class Timestamp extends ValueObject<TimestampProps> {
  private constructor(props: TimestampProps) {
    super(props);
  }

  public static crear(valor?: number): Timestamp {
    const timestamp = valor || Date.now();
    
    if (timestamp < 0) {
      throw new DomainError('El timestamp no puede ser negativo');
    }

    if (timestamp > Date.now() + 1000) { // 1 segundo de tolerancia
      throw new DomainError('El timestamp no puede ser futuro');
    }

    return new Timestamp({ valor: timestamp });
  }

  get valor(): number {
    return this.props.valor;
  }

  public esMasRecienteQue(otro: Timestamp): boolean {
    return this.props.valor > otro.props.valor;
  }
}
