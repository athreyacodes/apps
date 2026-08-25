import { createApp } from './app';

async function start(): Promise<void> {
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? '0.0.0.0';
  const app = await createApp({
    logger: process.env.NODE_ENV !== 'test',
  });
  await app.listen({ port, host });
  app.log.info(`api-bff listening on ${host}:${port}`);
}

void start();
