FROM denoland/deno:1.42.0
WORKDIR /app_prod

# Set the User
USER deno

# Expose Bindable Ports. Remapped via docker-compose.yml.
EXPOSE 4000/tcp

# Compile Dependencies and Main Application
COPY . .
RUN deno cache mod.ts

# Execute Application
CMD ["run", "--unstable-broadcast-channel", "--unstable-cron", "--unstable-temporal", "--unstable-worker-options", "--allow-net", "--allow-env", "--allow-sys", "--allow-hrtime", "--allow-read=/app_prod/", "--allow-write=/app_prod/", "mod.ts"]
