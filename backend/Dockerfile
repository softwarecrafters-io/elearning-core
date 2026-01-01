# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY common ./common
COPY backend ./backend
RUN npm ci --workspace=@app/common --workspace=@app/backend --ignore-scripts
RUN npm run build -w @app/backend

# Production stage
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY common ./common
COPY backend/package*.json ./backend/
RUN npm ci --workspace=@app/common --workspace=@app/backend --omit=dev --ignore-scripts
COPY --from=builder /app/backend/lib ./backend/lib
COPY --from=builder /app/common/src ./common/src
EXPOSE 3000
USER node
CMD ["node", "backend/lib/main.js"]
