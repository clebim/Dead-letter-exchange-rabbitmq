export const appConfig = {
  amqpHostName: 'localhost',
  amqpPort: 5672,
  amqpExchange: 'restaurant',
  amqpBarQueue: 'bar.queue',
  amqpDeadExchangeDLX: 'restaurant.dlx',
  amqpDeadRoutingKey: 'bar-routing-key.dlx',
  amqpDeadQueueDLQ: 'bar.queue.DLQ',
  expressPort: 3333,
  expressHostName: 'localhost',
}