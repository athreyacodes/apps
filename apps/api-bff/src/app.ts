import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyInstance } from 'fastify';
import { createOpenMeteoClient, type UpstreamClient } from './weather/open-meteo';
import { registerWeatherRoutes } from './weather/routes';

export type CreateAppOptions = {
  fetch?: typeof fetch;
  now?: () => number;
  upstream?: UpstreamClient;
  rateLimit?: false | { max: number; timeWindow: string };
  logger?: boolean;
};

const DEFAULT_TIMEOUT_MS = 8_000;

export async function createApp(options: CreateAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? false,
    trustProxy: true,
  });

  await app.register(cors, { origin: true });

  if (options.rateLimit !== false) {
    await app.register(rateLimit, {
      max: options.rateLimit?.max ?? 60,
      timeWindow: options.rateLimit?.timeWindow ?? '1 minute',
    });
  }

  const timeoutMs = Number(process.env.UPSTREAM_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const upstream = options.upstream ?? createOpenMeteoClient(options.fetch ?? fetch, timeoutMs);

  app.get('/api/health', async (_request, reply) => {
    return reply.header('cache-control', 'no-store').send({ status: 'ok' });
  });

  registerWeatherRoutes(app, { upstream, now: options.now });

  return app;
}
