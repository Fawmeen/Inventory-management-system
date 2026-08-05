const amqplib = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const STOCK_UPDATES_QUEUE = process.env.RABBITMQ_STOCK_QUEUE || 'stock_updates';

let connection;
let channel;

async function connect() {
  if (channel) return channel;

  connection = await amqplib.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue(STOCK_UPDATES_QUEUE, { durable: true });

  return channel;
}

async function publishStockUpdate(message) {
  const ch = await connect();
  const payload = Buffer.from(JSON.stringify(message));
  return ch.sendToQueue(STOCK_UPDATES_QUEUE, payload, { persistent: true });
}

async function consumeStockUpdate() {
  const ch = await connect();
  const msg = await ch.get(STOCK_UPDATES_QUEUE, { noAck: false });

  if (!msg) {
    return null;
  }

  const content = JSON.parse(msg.content.toString());
  ch.ack(msg);
  return content;
}

module.exports = {
  publishStockUpdate,
  consumeStockUpdate,
  STOCK_UPDATES_QUEUE,
};
