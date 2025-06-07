// DTO para moderar chat
export interface ModerateChatDTO {
  idSalaChat: string;
  idUsuarioAfectado: string;
  idModerador: string;
  tipoAccion: string;
  duracion?: number;
}
