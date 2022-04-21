import amqp from 'amqplib';
import { appConfig } from '../config';

const { 
  amqpExchange, 
  amqpHostName, 
  amqpPort, 
  amqpBarQueue,
  amqpDeadExchangeDLX,
  amqpDeadRoutingKey,
  amqpDeadQueueDLQ,
} = appConfig;

const connectOptions: amqp.Options.Connect = {
  port: amqpPort,
  hostname: amqpHostName,
};

const queueOptions: amqp.Options.AssertQueue= {
  durable: true,
  autoDelete: false,
  deadLetterExchange: amqpDeadExchangeDLX,
  deadLetterRoutingKey: amqpDeadRoutingKey,
};

const consumeOptions = {
  noAck: false,
};

const processMessage = async (connection: amqp.Connection) => {

  const channelConsumer = await connection.createChannel();
  await channelConsumer.assertQueue(
    amqpBarQueue,
    queueOptions,
  );
  await channelConsumer.bindQueue(amqpBarQueue, amqpExchange, 'bar');
  await channelConsumer.consume(
    amqpBarQueue,
    (message) => {
      const parsedMessage = JSON.parse(message.content.toString());
      // console.log(message.properties.headers)
      try {
        console.log('chegou', parsedMessage)
        console.log('count', message.properties.headers['x-death'][0].count)
        throw new Error('error in processing message');
      } catch (error) {
        channelConsumer.nack(message, false, false,)
      }

    },
    consumeOptions,
  );
}

const createConnection = async () => {
  try {
    const connection = await amqp.connect(connectOptions);
    await setupDeadLetterExchange(connection);
    await processMessage(connection);
  } catch (error) {
    console.log(error);
  }
}

const setupDeadLetterExchange = async (connection: amqp.Connection) => {
  const channel = await connection.createChannel();

  await channel.assertExchange(amqpDeadExchangeDLX, 'direct', { durable: true, });
  await channel.assertQueue(amqpDeadQueueDLQ, {
    deadLetterExchange: amqpExchange,
    deadLetterRoutingKey: 'bar',
    messageTtl: 2000,
    expires: 100000,
  });

  await channel.bindQueue(amqpDeadQueueDLQ, amqpDeadExchangeDLX, amqpDeadRoutingKey);
};

createConnection();