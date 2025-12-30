import express from 'express';
import logger from './config/logger.js';

const app = express();

app.get('/', (req, res) => {
  logger.info('Hello from the dev(bablu)!')
  res.status(200).send('Hello, World!');
});

export default app;