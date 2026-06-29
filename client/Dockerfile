FROM oven/bun:1 AS builder
WORKDIR /app/client
COPY client/package.json ./
RUN bun install
COPY client/ .
COPY shared/ ../shared/
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN bun run build

FROM nginx:alpine
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
