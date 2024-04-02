import { Bundler } from "./lib/bundler.ts";
import { Chains } from "./lib/chains.ts";
import { Connector } from "./lib/database/connector.ts";

// Load Database
await Connector.connect();
await Connector.client.execute(`
  USE am_api;
`)

// Load Resource and Middleware Chains
Chains.add(
  Chains.defaults(Chains.hone().resources(...Bundler.get('open'))),
  // Chains.defaults(Chains.hone().resources(...Bundler.get('authenticated')))
);
Chains.finalize();

// Define server variables for reuse below
const hostname = "localhost";
const port = 4000;

// Listen
Deno.serve({
  hostname,
  port,
  onListen: ({ hostname, port }) => {
    console.log(`AM-API @ http://${hostname}:${port}`);
  },
  handler: (request: Request): Promise<Response> => {
    // Pass the request to the chain
    return Chains.get()
      .handle<Response>(request)
      .catch((error) => {
        // Handle favicon Loads.
        if (request.url.includes("favicon")) {
          return new Response();
        }
        // Handle Group 404.
        if (error.status_code === 404) {
            return new Response(
                "Oops! This page was not found. Please verify the url is correct and try again, or report an issue to us!",
                {
                    status: 404,
                    statusText: "Not Found",
                }
            );
        }

        // Fallback Error.
        return new Response(
          "Sorry, but we hit an error! Please try this request again or report an issue to us!",
          {
            status: 500,
            statusText: "Internal Server Error",
          },
        );
      });
  },
});
