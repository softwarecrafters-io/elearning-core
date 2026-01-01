FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY common ./common
COPY frontend ./frontend
RUN npm ci --workspace=@app/common --workspace=@app/frontend --ignore-scripts
RUN npm run build -w @app/frontend

FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
