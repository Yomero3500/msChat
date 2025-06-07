import { Router, Request, Response } from 'express';
import { SendMessageUseCase } from '../../application/SendMessageUseCase';
import { ModerateChatUseCase } from '../../application/ModerateChatUseCase';
import { DomainError } from '../../../shared/errors/DomainError';

export class ChatController {
  public readonly router: Router;

  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly moderateChatUseCase: ModerateChatUseCase
  ) {
    this.router = Router();
    this.configurarRutas();
  }

  private configurarRutas(): void {
    this.router.post('/mensaje', this.enviarMensaje.bind(this));
    this.router.post('/moderar', this.moderarUsuario.bind(this));
  }

  private async enviarMensaje(req: Request, res: Response): Promise<void> {
    try {
      await this.sendMessageUseCase.execute({
        idSalaChat: req.body.idSalaChat,
        idUsuario: req.body.idUsuario,
        contenido: req.body.contenido,
        emotes: req.body.emotes || []
      });

      res.status(201).send();
    } catch (error) {
      if (error instanceof DomainError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  }

  private async moderarUsuario(req: Request, res: Response): Promise<void> {
    try {
      await this.moderateChatUseCase.execute({
        idSalaChat: req.body.idSalaChat,
        idUsuarioAfectado: req.body.idUsuarioAfectado,
        idModerador: req.body.idModerador,
        tipoAccion: req.body.tipoAccion,
        duracion: req.body.duracion
      });

      res.status(200).send();
    } catch (error) {
      if (error instanceof DomainError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  }
}
