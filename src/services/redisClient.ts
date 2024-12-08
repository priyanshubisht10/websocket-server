import { createClient } from 'redis';

const redisClient = createClient();

const redisSubscriber = redisClient.duplicate();

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

redisSubscriber.on('error', (err) => {
    console.error('Redis Subscriber Error', err);
});

(async () => {
    await redisClient.connect();
    await redisSubscriber.connect();
})();

export { redisClient, redisSubscriber };
