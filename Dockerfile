FROM node:18-alpine AS builder

WORKDIR /app

ARG VITE_API_URL
ARG VITE_GEOAPIFY_API_KEY

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GEOAPIFY_API_KEY=$VITE_GEOAPIFY_API_KEY

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]