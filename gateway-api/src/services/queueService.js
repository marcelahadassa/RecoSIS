const amqp = require('amqplib');
require('dotenv').config();

let channel = null;

const connect = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    // garante que a fila existe, se não existir, ela será criada
    await channel.assertQueue('recommendation_queue', { durable: true });
    console.log('Conectado ao RabbitMQ e fila garantida.');
  } catch (error) {
    console.error('Falha ao conectar no RabbitMQ:', error);
    // reconexão após 10 segundos
    setTimeout(connect, 10000);
  }
};

const publishToQueue = (queueName, message) => {
  if (channel) {
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true, // garante que a mensagem não se perca se o RabbitMQ reiniciar
    });
    console.log(`Mensagem enviada para a fila ${queueName}`);
  } else {
    console.error('Canal do RabbitMQ não está disponível.');
  }
};

module.exports = {
  connect,
  publishToQueue,
};