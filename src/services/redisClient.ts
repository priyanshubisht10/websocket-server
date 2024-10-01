import { createClient } from 'redis';

// Create Redis client for general use
const redisClient = createClient();

// Create Redis client for Pub/Sub
const redisSubscriber = redisClient.duplicate();

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

redisSubscriber.on('error', (err) => {
    console.error('Redis Subscriber Error', err);
});

// Connect both clients
(async () => {
    await redisClient.connect();
    await redisSubscriber.connect();
})();

export { redisClient, redisSubscriber };
