import {
  Chain,
  Resource,
} from "https://esm.sh/@drashland/drash/modules/chains/RequestChain/mod.native.js";
import { Chains } from "./lib/chains.ts";
import { Bundled } from "./lib/resources/api-base.resource.ts";

Chains.add(
  Chains.hone().resources(...Bundled).pathPrefixes("/api/v1", "/api/latest"),
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
                "Oops! This page was not found. Please verify the URL is correct or report an issue to us!",
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
