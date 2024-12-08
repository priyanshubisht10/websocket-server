import { redisClient } from '../redisClient';
import WebSocket from 'ws';

export const saveWebSocketToRedis = async (studentId: string, ws: WebSocket) => {
   const websocketIdentifier = (ws as any)._socket.remoteAddress; 
   if (websocketIdentifier) {
      await redisClient.set(`student:${studentId}`, websocketIdentifier);
      console.log(`saved ${studentId} in Redis.`);
   }
};

export const removeWebSocketFromRedis = async (studentId: string) => {
   await redisClient.del(`student:${studentId}`);
   console.log(`removed ${studentId} from redis.`);
};

export const findWebSocketInRedis = async (studentId: string, clients: Set<WebSocket>): Promise<WebSocket | null> => {
   const websocketIdentifier = await redisClient.get(`student:${studentId}`);
   if (!websocketIdentifier) return null;

   const client = Array.from(clients).find(
      (ws) => (ws as any)._socket.remoteAddress === websocketIdentifier
   );
   return client || null;
};
