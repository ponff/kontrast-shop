FROM nginx:1.27-alpine

# Установка минимума необходимых зависимостей
RUN apk add --no-cache certbot certbot-nginx

# Копирование конфигурации Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf.prod /etc/nginx/conf.d/prod.conf
