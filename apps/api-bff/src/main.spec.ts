import { describe, expect, it } from 'vitest';
import { handleRequest } from './main';
import type { IncomingMessage, ServerResponse } from 'node:http';

describe('api-bff', () => {
  it('responds with ok status', () => {
    const chunks: Buffer[] = [];
    let statusCode = 0;
    const res = {
      writeHead(code: number) {
        statusCode = code;
        return this;
      },
      end(payload?: string | Buffer) {
        if (payload) {
          chunks.push(typeof payload === 'string' ? Buffer.from(payload) : payload);
        }
        return this;
      },
    } as unknown as ServerResponse;

    handleRequest({} as IncomingMessage, res);

    expect(statusCode).toBe(200);
    expect(JSON.parse(Buffer.concat(chunks).toString('utf8'))).toEqual({ status: 'ok' });
  });
});
