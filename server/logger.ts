import pino from 'pino';

const level = process.env.LOG_LEVEL || 'info';
const isProduction = process.env.NODE_ENV === 'production';

let logger: pino.Logger;

if (isProduction) {
  logger = pino({ level });
} else {
  // Use pino.transport for pino v8+ to enable pretty printing in dev
  const transport = pino.transport({
    target: 'pino-pretty',
    options: {
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      singleLine: false,
      colorize: true,
    },
  });

  logger = pino({ level }, transport);
}

export default logger;
