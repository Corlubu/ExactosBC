# ==========================================
# STAGE 1: BUILDER (Instala dependencias y compila)
# ==========================================
FROM node:22-alpine AS builder

# Habilitar corepack para usar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar solo archivos de dependencias primero (Optimización de caché de Docker)
COPY package.json pnpm-lock.yaml prisma/ ./

# TRUCO: Crear el directorio vacío que TanStack Router busca durante el postinstall
RUN mkdir -p src/routes && \
    echo 'import { createRootRoute } from "@tanstack/react-router"; export const Route = createRootRoute();' > src/routes/__root.tsx

# Permitir explícitamente a pnpm ejecutar scripts de construcción
# para herramientas confiables como Prisma o esbuild (requerido en pnpm v10+)
RUN pnpm config set dangerouslyAllowAllBuilds true
# Instalar dependencias NORMALMENTE (sin --ignore-scripts) para que los binarios se enlacen
RUN pnpm install --frozen-lockfile

# Generar cliente de Prisma
RUN pnpm prisma generate

# Copiar el resto del código fuente
COPY . .

# Inyectar variables de entorno de build si son necesarias
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG ADMIN_PASSWORD
ARG JWT_SECRET

ENV ADMIN_PASSWORD=${ADMIN_PASSWORD}
ENV JWT_SECRET=${JWT_SECRET}

# Compilar la aplicación (Vinxi / Vite / React / tRPC)
RUN pnpm build

# ==========================================
# STAGE 2: RUNNER (Imagen limpia solo con lo necesario)
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

# Crear usuario no root por seguridad (Best Practice)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 reactjs

# Instalar bash y OpenSSL (requerido por Prisma en Alpine)
RUN apk add --no-cache bash openssl

# Copiar node_modules y el build desde la fase 1
COPY --from=builder --chown=reactjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=reactjs:nodejs /app/.vinxi ./.vinxi
COPY --from=builder --chown=reactjs:nodejs /app/package.json ./package.json

# Cambiar al usuario sin privilegios
USER reactjs

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Comando de arranque nativo de Vinxi
CMD ["pnpm", "start"]
