export interface SendMessageDTO {
  idSalaChat: string;
  idUsuario: string;
  contenido: string;
  emotes: {
    codigo: string;
    urlImagen: string;
  }[];
  timestampEnvio?: number;
}
