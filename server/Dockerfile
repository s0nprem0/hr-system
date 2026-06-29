FROM oven/bun:1
WORKDIR /app/server
COPY server/package.json server/lock.yaml ./
RUN bun install --frozen-lockfile
COPY server/ .
EXPOSE 5000
CMD ["bun", "run", "index.ts"]
