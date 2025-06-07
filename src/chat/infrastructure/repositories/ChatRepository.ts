import { SalaDeChat } from "../../domain/aggregates/SalaDeChat";

export interface ChatRepository {
  findById(id: string): Promise<SalaDeChat | null>;
  save(salaDeChat: SalaDeChat): Promise<void>;
  delete(id: string): Promise<void>;
  findByCanal(canalId: string): Promise<SalaDeChat | null>;
}
