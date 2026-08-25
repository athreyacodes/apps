FROM node:22-alpine
WORKDIR /app
COPY dist/apps/api-bff/package.json ./
RUN npm install --omit=dev
COPY dist/apps/api-bff ./
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
USER node
CMD ["node", "main.js"]
