FROM mcr.microsoft.com/playwright:v1.55.0-noble

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

EXPOSE 3001

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node src/app/server.js"]