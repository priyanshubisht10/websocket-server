import { redisClient } from '../redisClient';
import WebSocket from 'ws';

export const saveWebSocketToRedis = async (studentId: string, ws: WebSocket): Promise<void> => {
   try {
      const websocketIdentifier = `${(ws as any)._socket.remoteAddress}:${(ws as any)._socket.remotePort}`;
      if (websocketIdentifier) {
         await redisClient.set(`student:${studentId}`, websocketIdentifier);
         console.log(`Saved student ID ${studentId} in Redis with identifier ${websocketIdentifier}.`);
      } else {
         console.error(`Unable to generate WebSocket identifier for student ID ${studentId}`);
      }
   } catch (error) {
      console.error(`Error saving WebSocket for student ID ${studentId} to Redis:`, error);
   }
};

export const removeWebSocketFromRedis = async (studentId: string): Promise<void> => {
   try {
      const result = await redisClient.del(`student:${studentId}`);
      if (result) {
         console.log(`Removed student ID ${studentId} from Redis.`);
      } else {
         console.warn(`No entry found in Redis for student ID ${studentId} to remove.`);
      }
   } catch (error) {
      console.error(`Error removing WebSocket for student ID ${studentId} from Redis:`, error);
   }
};

export const findWebSocketInRedis = async (
    studentId: string,
    clients: Set<WebSocket>
): Promise<WebSocket | null> => {
    try {
      const websocketIdentifier = await redisClient.get(`student:${studentId}`);
      if (!websocketIdentifier) {
         console.log(`No WebSocket identifier found in Redis for student ID ${studentId}.`);
         return null;
      }

      const client = Array.from(clients).find((ws) => {
         const currentIdentifier = `${(ws as any)._socket.remoteAddress}:${(ws as any)._socket.remotePort}`;
         return currentIdentifier === websocketIdentifier;
     });

      if (client) {
         console.log(`Found active WebSocket connection for student ID ${studentId}.`);
      } else {
         console.warn(`No active WebSocket connection matches Redis entry for student ID ${studentId}.`);
      }

      return client || null;
   } catch (error) {
      console.error(`Error finding WebSocket for student ID ${studentId} in Redis:`, error);
     return null;
   }
};
