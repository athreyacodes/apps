import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

export function handleRequest(_req: IncomingMessage, res: ServerResponse): void {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok' }));
}

export function createApp() {
  return createServer(handleRequest);
}

const port = Number(process.env.PORT ?? 3000);

if (require.main === module) {
  createApp().listen(port, () => {
    console.log(`api-bff listening on ${port}`);
  });
}
