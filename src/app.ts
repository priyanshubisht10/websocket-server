import express, { Request, Response } from 'express';
import http from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';
import { redisSubscriber, redisClient } from './services/redisClient';
import { saveWebSocketToRedis, removeWebSocketFromRedis, findWebSocketInRedis } from './services/redisHelpers/connectionManager';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

redisSubscriber.subscribe('positive-processed', async (message) => {
    const parsedData = JSON.parse(message);
    const studentId = String(parsedData.studentId);
    const client = await findWebSocketInRedis(studentId, wss.clients);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send('positive');
    } else {
        console.log("Connection not active: ", studentId);
    }
});

redisSubscriber.subscribe('negative-processed', async (message) => {
    const parsedData = JSON.parse(message);
    const studentId = String(parsedData.studentId);
    const client = await findWebSocketInRedis(studentId, wss.clients);
    if (client && client.readyState === WebSocket.OPEN) {
        client.send('negative');
    } else {
        console.log("Connection not active: ", studentId);
    }
});

wss.on('connection', (ws: WebSocket) => {
    ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));
    ws.on('message', async (data: string) => {
        const parsedData = JSON.parse(data);
        const { studentid } = parsedData;
        if (studentid) {
            await saveWebSocketToRedis(studentid, ws);
        }
    });
    ws.on('close', async () => {
        const keys = await redisClient.keys('student:*');
        for (const key of keys) {
            const websocketIdentifier = await redisClient.get(key);
            if (websocketIdentifier === (ws as any)._socket.remoteAddress) {
                const studentId = key.split(':')[1];
                await removeWebSocketFromRedis(studentId);
            }
        }
    });
});

app.get('/', (req: Request, res: Response) => {
    res.send('WebSocket server is running');
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
