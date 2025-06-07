import { ChatRepository } from './ChatRepository';
import { SalaDeChat } from '../../domain/aggregates/SalaDeChat';
import { ChatMongoModel } from '../persistence/ChatMongoModel';
import { ModerationService } from '../../domain/services/ModerationService';
import { Mensaje } from '../../domain/entities/Mensaje';
import { UsuarioChat } from '../../domain/value-objects/UsuarioChat';
import { Emote } from '../../domain/value-objects/Emote';
import { Insignia } from '../../domain/value-objects/Insignia';
import { Timestamp } from '../../domain/value-objects/Timestamp';

export class ChatMongoRepository implements ChatRepository {
  constructor(private readonly moderationService: ModerationService) {}

  async findById(id: string): Promise<SalaDeChat | null> {
    const doc = await ChatMongoModel.findById(id);
    if (!doc) return null;
    
    return this.mapearADominio(doc);
  }

  async findByCanal(canalId: string): Promise<SalaDeChat | null> {
    const doc = await ChatMongoModel.findOne({ canalId });
    if (!doc) return null;

    return this.mapearADominio(doc);
  }

  async save(salaDeChat: SalaDeChat): Promise<void> {
    const doc = await ChatMongoModel.findById(salaDeChat.id);
    
    if (!doc) {
      // Crear nuevo documento
      await ChatMongoModel.create(this.mapearADocumento(salaDeChat));
    } else {
      // Actualizar documento existente
      await ChatMongoModel.updateOne(
        { _id: salaDeChat.id },
        this.mapearADocumento(salaDeChat)
      );
    }
  }

  async delete(id: string): Promise<void> {
    await ChatMongoModel.deleteOne({ _id: id });
  }

  private mapearADominio(doc: any): SalaDeChat {
    // Mapear mensajes
    const mensajes = doc.mensajes.map((m: any) => 
      new Mensaje(
        m.id,
        m.usuarioId,
        m.contenido,
        new Timestamp(m.timestamp),
        m.emotes.map((e: any) => Emote.crear(e.codigo, e.urlImagen))
      )
    );

    // Mapear usuarios conectados
    const usuariosConectados = doc.usuariosConectados.map((u: any) =>
      UsuarioChat.crear(
        u.usuarioId,
        u.esModerador,
        u.insignias.map((i: any) => Insignia.crear(i.nombre, i.urlImagen))
      )
    );

    // Crear sala de chat
    const sala = SalaDeChat.crear(
      doc._id,
      doc.canalId,
      this.moderationService
    );

    // Restaurar el estado
    doc.mensajes.forEach((m: any) => sala.publicarMensaje(m.usuarioId, m.contenido));
    doc.usuariosConectados.forEach((u: any) => sala.conectarUsuario(
      UsuarioChat.crear(u.usuarioId, u.esModerador, [])
    ));

    return sala;
  }

  private mapearADocumento(salaDeChat: SalaDeChat): any {
    return {
      _id: salaDeChat.id,
      canalId: salaDeChat.canalId,
      mensajes: salaDeChat.mensajes.map(m => ({
        id: m.id,
        usuarioId: m.usuarioId,
        contenido: m.contenido,
        timestamp: m.timestamp.valor,
        emotes: m.emotes.map(e => ({
          codigo: e.codigo,
          urlImagen: e.urlImagen
        }))
      })),
      usuariosConectados: salaDeChat.usuariosConectados.map(u => ({
        usuarioId: u.usuarioId,
        esModerador: u.esModerador,
        insignias: u.insignias.map(i => ({
          nombre: i.nombre,
          urlImagen: i.urlImagen
        }))
      }))
    };
  }
}
