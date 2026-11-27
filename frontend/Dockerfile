FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ARG VITE_SITE_BASENAME=/
ENV VITE_API_URL=$VITE_API_URL VITE_SITE_BASENAME=$VITE_SITE_BASENAME
RUN npm run build

FROM nginx:alpine AS final
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
