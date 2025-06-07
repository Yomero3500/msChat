import { AggregateRoot } from '../../../shared/base/AggregateRoot';
import { DomainError } from '../../../shared/errors/DomainError';
import { Mensaje } from '../entities/Mensaje';
import { MessageSentEvent } from '../events/MessageSentEvent';
import { UserBannedEvent } from '../events/UserBannedEvent';
import { ModerationService } from '../services/ModerationService';
import { Emote } from '../value-objects/Emote';
import { UsuarioChat } from '../value-objects/UsuarioChat';

interface SalaDeChatProps {
  id: string;
  canalId: string;
  mensajes: Mensaje[];
  usuariosConectados: UsuarioChat[];
  usuariosBaneados: Set<string>;
  usuariosSilenciados: Map<string, number>; // userId -> timestampFinTimeout
}

export class SalaDeChat extends AggregateRoot<SalaDeChatProps> {
  private readonly moderationService: ModerationService;

  private constructor(props: SalaDeChatProps, moderationService: ModerationService) {
    super(props);
    this.moderationService = moderationService;
  }

  public static crear(
    id: string,
    canalId: string,
    moderationService: ModerationService
  ): SalaDeChat {
    if (!id || id.trim().length === 0) {
      throw new DomainError('El ID de la sala no puede estar vacío');
    }

    if (!canalId || canalId.trim().length === 0) {
      throw new DomainError('El ID del canal no puede estar vacío');
    }

    return new SalaDeChat(
      {
        id,
        canalId,
        mensajes: [],
        usuariosConectados: [],
        usuariosBaneados: new Set<string>(),
        usuariosSilenciados: new Map<string, number>()
      },
      moderationService
    );
  }

  public publicarMensaje(
    usuarioId: string,
    contenido: string,
    emotes: Emote[] = []
  ): void {
    const usuario = this.obtenerUsuario(usuarioId);
    if (!usuario) {
      throw new DomainError('El usuario debe estar conectado para enviar mensajes');
    }

    if (this.props.usuariosBaneados.has(usuarioId)) {
      throw new DomainError('Usuario baneado no puede enviar mensajes');
    }

    const tiempoSilenciado = this.props.usuariosSilenciados.get(usuarioId);
    if (tiempoSilenciado && tiempoSilenciado > Date.now()) {
      throw new DomainError('Usuario silenciado temporalmente');
    }

    if (!this.moderationService.validarMensaje(contenido)) {
      throw new DomainError('El mensaje no cumple con las políticas del chat');
    }

    const mensaje = Mensaje.crear(
      `${this.props.id}-${this.props.mensajes.length + 1}`,
      usuarioId,
      contenido,
      emotes
    );

    this.props.mensajes.push(mensaje);
    this.addDomainEvent(new MessageSentEvent(mensaje));

    // Limitar el historial a los últimos 100 mensajes
    if (this.props.mensajes.length > 100) {
      this.props.mensajes.shift();
    }
  }

  public conectarUsuario(usuario: UsuarioChat): void {
    if (this.props.usuariosBaneados.has(usuario.usuarioId)) {
      throw new DomainError('Usuario baneado no puede conectarse al chat');
    }

    if (!this.props.usuariosConectados.some(u => u.usuarioId === usuario.usuarioId)) {
      this.props.usuariosConectados.push(usuario);
    }
  }

  public desconectarUsuario(usuarioId: string): void {
    this.props.usuariosConectados = this.props.usuariosConectados.filter(
      u => u.usuarioId !== usuarioId
    );
  }

  public aplicarAccionModeracion(
    moderadorId: string,
    usuarioAfectadoId: string,
    tipoAccion: 'ban' | 'timeout',
    duracionMs?: number
  ): void {
    const moderador = this.obtenerUsuario(moderadorId);
    const usuarioAfectado = this.obtenerUsuario(usuarioAfectadoId);

    if (!moderador || !usuarioAfectado) {
      throw new DomainError('Moderador o usuario afectado no encontrado');
    }

    const evento = this.moderationService.aplicarAccionModeracion(
      moderador,
      usuarioAfectado,
      tipoAccion,
      duracionMs
    );

    if (tipoAccion === 'ban') {
      this.props.usuariosBaneados.add(usuarioAfectadoId);
      this.desconectarUsuario(usuarioAfectadoId);
    } else if (tipoAccion === 'timeout') {
      this.props.usuariosSilenciados.set(usuarioAfectadoId, Date.now() + (duracionMs ?? 0));
    }

    this.addDomainEvent(new UserBannedEvent(
      usuarioAfectadoId,
      this.props.id,
      moderadorId,
      tipoAccion,
      duracionMs
    ));
  }

  private obtenerUsuario(usuarioId: string): UsuarioChat | undefined {
    return this.props.usuariosConectados.find(u => u.usuarioId === usuarioId);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get canalId(): string {
    return this.props.canalId;
  }

  get mensajes(): Mensaje[] {
    return [...this.props.mensajes]; // Copia defensiva
  }

  get usuariosConectados(): UsuarioChat[] {
    return [...this.props.usuariosConectados]; // Copia defensiva
  }

  get cantidadUsuariosConectados(): number {
    return this.props.usuariosConectados.length;
  }
}
