# ==========================================
# STAGE 1: BUILDER (Instala dependencias y compila)
# ==========================================
FROM node:20-alpine AS builder

# Habilitar corepack para usar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar solo archivos de dependencias primero (Optimización de caché de Docker)
COPY package.json pnpm-lock.yaml prisma/ ./
RUN pnpm install --frozen-lockfile

# Generar cliente de Prisma
RUN pnpm prisma generate

# Copiar el resto del código fuente
COPY . .

# Inyectar variables de entorno de build si son necesarias
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Compilar la aplicación (Vinxi / Vite / React / tRPC)
RUN pnpm build

# ==========================================
# STAGE 2: RUNNER (Imagen limpia solo con lo necesario)
# ==========================================
FROM node:20-alpine AS runner

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
CMD ["npm", "run", "start"]
