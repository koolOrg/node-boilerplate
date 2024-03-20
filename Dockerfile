FROM node:18-alpine as builder
WORKDIR /app
COPY package.json .
RUN npm install
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
