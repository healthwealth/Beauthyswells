FROM node:22-alpine AS build
WORKDIR /build
COPY index.html styles.css script.js dressing-guide.css dressing-guide.js sample-portraits.css manus-routes.json favicon.svg ./
COPY scripts/build.mjs ./scripts/build.mjs
RUN node scripts/build.mjs

FROM node:22-alpine
WORKDIR /app
ENV PORT=3000 STATIC_ROOT=/app/dist
COPY --from=build /build/dist ./dist
COPY scripts/server.mjs scripts/inquiry-handler.mjs ./scripts/
EXPOSE 3000
CMD ["node", "scripts/server.mjs"]
