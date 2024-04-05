import { HTTPError } from './deps.ts';
import * as env from './env.json' with { type: 'json' };
import { Chains } from './lib/chains.ts';
import { jsonHTTPResponse } from './lib/util/json.ts';

// Load Deno KV
await Deno.mkdir('./persistence/', { recursive: true });

// Load Resource and Middleware Chains
await Chains.link();
Chains.finalize();

// Serve to Deno Handler.
Deno.serve({
  hostname: env.default.server.hostname,
  port: env.default.server.port,
  onListen: ({ hostname, port }) => {
    console.log(`AM-API @ http://${hostname}:${port}`);
  },
  handler: async (request: Request): Promise<Response> => {
    try {
      return await Chains
        .get()
        .handle<Response>(request);
    } catch (error: unknown) {
      if (request.url.includes('favicon')) {
        return new Response();
      }

      if ((error as HTTPError).status_code === 404) {
        return jsonHTTPResponse(404, 'Routing Failed');
      }

      return jsonHTTPResponse(500, 'Internal Server Error');
    }
  },
});
