# ─── Stage 1: Build ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifests primero para aprovechar cache de capas
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# ─── Stage 2: Serve con nginx ───────────────────────────────────
FROM nginx:alpine AS runner

# Limpiar configuración por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar artefacto del stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración nginx para SPA (React Router)
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
