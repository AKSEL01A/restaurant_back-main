// notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

handleConnection(client: any) {
  const userId = client.handshake.query.userId; // 👈 نجيبو userId من query
  if (userId) {
    client.join(userId); // 👈 نعملوه join في الغرفة متاعو
    console.log(`🟢 Client ${client.id} joined room ${userId}`);
  } else {
    console.warn('⚠️ No userId provided in socket connection');
  }
}
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(userId).emit('newNotification', notification);
  }
}
