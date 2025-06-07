import { SalaDeChat } from "../domain/aggregates/SalaDeChat";
import { Emote } from "../domain/value-objects/Emote";
import { ChatRepository } from "../infrastructure/repositories/ChatRepository";
import { SendMessageDTO } from "./dtos/SendMessageDTO";

export class SendMessageUseCase {
  constructor(
    private readonly chatRepository: ChatRepository,
  ) {}

  async execute(dto: SendMessageDTO): Promise<void> {
    // Recuperar la sala de chat
    const salaDeChat = await this.chatRepository.findById(dto.idSalaChat);
    if (!salaDeChat) {
      throw new Error('Sala de chat no encontrada');
    }

    // Crear los emotes
    const emotes = dto.emotes.map(e => Emote.crear(e.codigo, e.urlImagen));

    // Publicar el mensaje
    salaDeChat.publicarMensaje(
      dto.idUsuario,
      dto.contenido,
      emotes
    );

    // Persistir los cambios y propagar eventos
    await this.chatRepository.save(salaDeChat);
  }
}
