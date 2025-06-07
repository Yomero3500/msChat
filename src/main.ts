import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import helmet from 'helmet';
import { ChatController } from './chat/infrastructure/controllers/ChatController';
import { ChatSocketServer } from './chat/infrastructure/websocket/ChatSocketServer';
import { ModerationService } from './chat/domain/services/ModerationService';
import { SendMessageUseCase } from './chat/application/SendMessageUseCase';
import { ModerateChatUseCase } from './chat/application/ModerateChatUseCase';
import { ChatMongoRepository } from './chat/infrastructure/repositories/ChatMongoRepository';

// Cargar variables de entorno
config();

class App {
    private readonly app: express.Application;
    private readonly server: any;
    private readonly port: number;
    private readonly mongoUri: string;

    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.port = parseInt(process.env.PORT || '3000');
        this.mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mschat';

        this.configurarMiddlewares();
        this.configurarRutas();
        this.configurarWebSocket();
    }

    private configurarMiddlewares(): void {
        this.app.use(express.json());
        this.app.use(helmet());
        this.app.use(express.urlencoded({ extended: true }));
    }    private configurarRutas(): void {
        // Servicios de dominio
        const moderationService = new ModerationService();

        // Repositorios
        const chatRepository = new ChatMongoRepository(moderationService);

        // Casos de uso
        const sendMessageUseCase = new SendMessageUseCase(chatRepository);
        const moderateChatUseCase = new ModerateChatUseCase(chatRepository);

        // Controladores
        const chatController = new ChatController(
            sendMessageUseCase,
            moderateChatUseCase
        );

        // Rutas de la API
        this.app.use('/api/chat', chatController.router);

        // Manejo de errores global
        this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error(err.stack);
            res.status(500).json({
                error: 'Error interno del servidor',
                message: err.message
            });
        });
    }    private configurarWebSocket(): void {
        const moderationService = new ModerationService();
        const chatRepository = new ChatMongoRepository(moderationService);
        new ChatSocketServer(this.server, chatRepository);
    }

    private async conectarBaseDeDatos(): Promise<void> {
        try {
            await mongoose.connect(this.mongoUri);
            console.log('✅ Conexión exitosa a MongoDB');
        } catch (error) {
            console.error('❌ Error conectando a MongoDB:', error);
            process.exit(1);
        }
    }

    public async iniciar(): Promise<void> {
        await this.conectarBaseDeDatos();
        
        this.server.listen(this.port, () => {
            console.log(`🚀 Servidor iniciado en http://localhost:${this.port}`);
            console.log('⭐ Entorno:', process.env.NODE_ENV || 'desarrollo');
        });
    }
}

// Iniciar la aplicación
const app = new App();
app.iniciar().catch(console.error);