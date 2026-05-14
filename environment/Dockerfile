# --- Stage 1: Build Vue Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /build/frontend

# Set up Chinese npm mirror for faster dependencies install
RUN npm config set registry https://registry.npmmirror.com

# Copy lockfile and package descriptor for deterministic installs
COPY environment/repo/frontend/package*.json ./
RUN npm ci

# Copy frontend source and build static compiled html/css/js
COPY environment/repo/frontend/ ./
RUN npm run build

# --- Stage 2: Production Server Runner ---
FROM node:20-alpine
WORKDIR /app

# Set up Chinese npm mirror
RUN npm config set registry https://registry.npmmirror.com

# Copy backend lockfile and descriptor for dev-omitted installs
COPY environment/repo/backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source code
COPY environment/repo/backend/ ./

# Copy compiled frontend assets to backend public directory for Express hosting
COPY --from=frontend-builder /build/frontend/dist ./public

# Environment Configurations
ENV PORT=3014
ENV NODE_ENV=production
ENV DB_PATH=/app/data/fruit_shop.sqlite

# Create volume directory for persistence
RUN mkdir -p /app/data

# Expose unified process port
EXPOSE 3014

# Launch application
CMD ["node", "src/server.js"]
