import express, { Request, Response } from 'express';
import http from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';
import { redisSubscriber, redisClient } from './services/redisClient';
import { saveWebSocketToRedis, removeWebSocketFromRedis, findWebSocketInRedis } from './services/redisHelpers/connectionManager';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

redisSubscriber.subscribe('positive-processed', async (message) => {
    console.log(`Message received on positive-processed: ${message}`);
    const parsedData = JSON.parse(message);
    const studentId = String(parsedData.studentId);

    const client = await findWebSocketInRedis(studentId, wss.clients);

    if (client && client.readyState === WebSocket.OPEN) {
        client.send('positive', (error) => {
            if (error) {
                console.error(`Error sending message to student ID ${studentId}:`, error);
            } else {
                console.log(`Message forwarded to student ID ${studentId}: ${message}`);
            }
        });
    } else {
        console.error(`No active connection found for student ID ${studentId}`);
    }
});

redisSubscriber.subscribe('negative-processed', async (message) => {
    console.log(`Message received on negative-processed: ${message}`);
    const parsedData = JSON.parse(message);
    const studentId = String(parsedData.studentId);

    const client = await findWebSocketInRedis(studentId, wss.clients);

    if (client && client.readyState === WebSocket.OPEN) {
        client.send('negative', (error) => {
            if (error) {
                console.error(`Error sending message to student ID ${studentId}:`, error);
            } else {
                console.log(`Message forwarded to student ID ${studentId}: ${message}`);
            }
        });
    } else {
        console.error(`No active connection found for student ID ${studentId}`);
    }
});

wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established.');

    ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));

    ws.on('message', async (data: string) => {
        try {
            const parsedData = JSON.parse(data);
            const { studentid } = parsedData;

            if (studentid) {
                await saveWebSocketToRedis(studentid, ws);
                console.log(`Client registered with student ID: ${studentid}`);
            } else {
                console.error('No student ID provided by the client.');
            }
        } catch (error) {
            console.error('Invalid message format from client:', error);
        }
    });

    ws.on('close', async () => {
        console.log('WebSocket connection closed.');
        const keys = await redisClient.keys('student:*');
        for (const key of keys) {
            const websocketIdentifier = await redisClient.get(key);
            if (websocketIdentifier === (ws as any)._socket.remoteAddress) {
                const studentId = key.split(':')[1];
                await removeWebSocketFromRedis(studentId);
                console.log(`Client with student ID ${studentId} disconnected.`);
            }
        }
    });

    ws.on('error', (error: Error) => {
        console.log(error);
    });
});

app.get('/', (req: Request, res: Response) => {
    res.send('WebSocket server is running');
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
