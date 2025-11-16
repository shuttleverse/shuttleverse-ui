FROM node:18-alpine AS builder

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ARG VITE_API_URL
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_EMAIL_SERVICE_ID
ARG VITE_EMAIL_TEMPLATE_ID
ARG VITE_EMAIL_PRIVATE_KEY
ARG VITE_GA_MEASUREMENT_ID

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY 
ENV VITE_EMAIL_SERVICE_ID=$VITE_EMAIL_SERVICE_ID
ENV VITE_EMAIL_TEMPLATE_ID=$VITE_EMAIL_TEMPLATE_ID
ENV VITE_EMAIL_PRIVATE_KEY=$VITE_EMAIL_PRIVATE_KEY
ENV VITE_GA_MEASUREMENT_ID=$VITE_GA_MEASUREMENT_ID

# Copy lockfile and package.json
COPY pnpm-lock.yaml package.json ./

# Install dependencies with BuildKit cache mount for pnpm store
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:18-alpine AS production

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]