import express, { Request, Response } from 'express';
import http from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';
import { redisSubscriber } from './services/redisClient'; 

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

//Move the logic to redis datastore instead of storing it in a local variable
const clients: Map<string, WebSocket> = new Map();

redisSubscriber.subscribe('positive-processed', (message) => {
    console.log(`Message received on positive-processed: ${message}`);
    const parsedData = JSON.parse(message);
    const client = clients.get(String(parsedData.studentId));
 
    if (client && client.readyState === WebSocket.OPEN) {
     client.send(message, (error) => {
         if (error) {
             console.error(`Error sending message to student ID ${parsedData.studentId}:, error`);
         } else {
             console.log(`Message forwarded to student ID ${parsedData.studentId}: ${message}`);
         }});
     } else {
         console.error(`No active connection found for student ID ${parsedData.studentId}`);
     }
 
 });

redisSubscriber.subscribe('negative-processed', (message) => {
   console.log(`Message received on negative-processed: ${message}`); 

   const parsedData = JSON.parse(message);
   const client = clients.get(String(parsedData.studentId));

   if (client && client.readyState === WebSocket.OPEN) {
    client.send(message, (error) => {
        if (error) {
            console.error(`Error sending message to student ID ${parsedData.studentId}:`, error);
        } else {
            console.log(`Message forwarded to student ID ${parsedData.studentId}: ${message}`);
        }});
    } else {
        console.error(`No active connection found for student ID ${parsedData.studentId}`);
    }
});

wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established.');

    ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));

    ws.on('message', (data: string) => {
        try {
            const parsedData = JSON.parse(data);
            const { studentid } = parsedData;

            if (studentid) {
                clients.set(studentid, ws);
                console.log(`Client registered with student ID: ${studentid}`);
            } else {
                console.error('No student ID provided by the client.');
            }
        } catch (error) {
            console.error('Invalid message format from client:', error);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed.');
        clients.forEach((client, studentid) => {
            if (client === ws) {
                clients.delete(studentid);
                console.log(`Client with student ID ${studentid} disconnected.`);
            }
        });
    });

    ws.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
    });
});

app.get('/', (req: Request, res: Response) => {
    res.send('WebSocket server is running');
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
