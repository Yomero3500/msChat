import mongoose, { Schema, Document } from 'mongoose';
import { Emote } from '../../domain/value-objects/Emote';
import { UsuarioChat } from '../../domain/value-objects/UsuarioChat';
import { Mensaje } from '../../domain/entities/Mensaje';

interface IMensaje {
  id: string;
  usuarioId: string;
  contenido: string;
  timestamp: number;
  emotes: {
    codigo: string;
    urlImagen: string;
  }[];
}

interface ISalaDeChat extends Document {
  _id: string;
  canalId: string;
  mensajes: IMensaje[];
  usuariosConectados: {
    usuarioId: string;
    esModerador: boolean;
    insignias: {
      nombre: string;
      urlImagen: string;
    }[];
  }[];
  usuariosBaneados: string[];
  usuariosSilenciados: {
    usuarioId: string;
    finalizaEn: number;
  }[];
}

const MensajeSchema = new Schema<IMensaje>({
  id: { type: String, required: true },
  usuarioId: { type: String, required: true },
  contenido: { type: String, required: true },
  timestamp: { type: Number, required: true },
  emotes: [{
    codigo: String,
    urlImagen: String
  }]
});

const SalaDeChatSchema = new Schema<ISalaDeChat>({
  _id: { type: String, required: true },
  canalId: { type: String, required: true, index: true },
  mensajes: [MensajeSchema],
  usuariosConectados: [{
    usuarioId: { type: String, required: true },
    esModerador: { type: Boolean, default: false },
    insignias: [{
      nombre: String,
      urlImagen: String
    }]
  }],
  usuariosBaneados: [String],
  usuariosSilenciados: [{
    usuarioId: String,
    finalizaEn: Number
  }]
});

// Índices para optimizar consultas
SalaDeChatSchema.index({ canalId: 1 });
SalaDeChatSchema.index({ "usuariosConectados.usuarioId": 1 });

export const ChatMongoModel = mongoose.model<ISalaDeChat>('SalaDeChat', SalaDeChatSchema);
