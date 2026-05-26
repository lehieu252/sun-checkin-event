import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

export interface NewCheckinPayload {
  id: number;
  name: string;
  message: string;
  photoUrl: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CheckinGateway {
  @WebSocketServer()
  server: Server;

  broadcastNewCheckin(payload: NewCheckinPayload) {
    this.server.emit('new-checkin', payload);
  }

  broadcastReset() {
    this.server.emit('reset-checkins');
  }

  broadcastDeleteCheckin(payload: { id: number; count: number }) {
    this.server.emit('delete-checkin', payload);
  }
}
