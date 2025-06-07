import { DomainError } from '../../../shared/errors/DomainError';
import { UsuarioChat } from '../value-objects/UsuarioChat';
import { UserBannedEvent } from '../events/UserBannedEvent';

export class ModerationService {
  public aplicarAccionModeracion(
    moderador: UsuarioChat,
    usuarioAfectado: UsuarioChat,
    tipoAccion: 'ban' | 'timeout',
    duracionMs?: number
  ): UserBannedEvent {
    if (!moderador.puedeModerar()) {
      throw new DomainError('El usuario no tiene permisos de moderación');
    }

    if (moderador.usuarioId === usuarioAfectado.usuarioId) {
      throw new DomainError('Un moderador no puede aplicar acciones sobre sí mismo');
    }

    if (tipoAccion === 'timeout' && (!duracionMs || duracionMs <= 0)) {
      throw new DomainError('La duración del timeout debe ser positiva');
    }

    if (tipoAccion === 'timeout' && duracionMs > 24 * 60 * 60 * 1000) { // máximo 24 horas
      throw new DomainError('La duración del timeout no puede exceder 24 horas');
    }

    return new UserBannedEvent(
      usuarioAfectado.usuarioId,
      'sala-id', // Este valor se actualizará en el agregado
      moderador.usuarioId,
      tipoAccion,
      duracionMs
    );
  }

  public validarMensaje(contenido: string): boolean {
    // Aquí podrías implementar validaciones de contenido
    // como palabras prohibidas, spam, etc.
    if (!contenido.trim()) {
      return false;
    }

    // Ejemplo básico: no permitir mensajes que sean solo caracteres repetidos
    const repeticionesCaracter = contenido.match(/(.)\1{9,}/);
    if (repeticionesCaracter) {
      return false;
    }

    return true;
  }
}
