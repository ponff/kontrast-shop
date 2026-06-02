# Деплой с предварительной сборкой фронтенда

Этот метод позволяет собрать фронтенд локально (или на мощной машине) и задеплоить уже готовый билд на сервер, что экономит ресурсы сервера.

## Способ 1: Сборка локально, деплой на сервер

### Шаг 1: Локальная сборка (на вашем компьютере)

```bash
cd D:\документы\GitHub\kontrast-shop

# Соберите фронтенд
bash prebuild_frontend.sh

# Или вручную:
cd front
npm ci
npm run build
cd ..
```

### Шаг 2: Коммит и пуш

```bash
# Добавьте изменения (если есть)
git add .

# Закоммитьте
git commit -m "Update frontend build"

# Отправьте на GitHub
git push origin update
```

### Шаг 3: Деплой на сервере

SSH на ваш сервер и выполните:

```bash
cd /path/to/kontrast-shop

# Получите последние изменения
git pull origin update

# Остановите контейнеры
docker-compose down

# Запустите с пребилженным фронтендом
docker-compose -f docker-compose.prebuilt.yml up -d --build

# Проверьте логи
docker-compose -f docker-compose.prebuilt.yml logs -f
```

## Способ 2: Сборка на сервере (более простой)

Если у сервера достаточно ресурсов:

```bash
# На сервере
cd /path/to/kontrast-shop

# Соберите фронтенд
cd front
npm ci
npm run build
cd ..

# Запустите с пребилженным Dockerfile
docker-compose -f docker-compose.prebuilt.yml up -d --build
```

## Отличия файлов

- **docker-compose.yml** - собирает фронтенд в Docker (медленно, требует ресурсов)
- **docker-compose.prebuilt.yml** - использует готовый .next (быстро, меньше ресурсов)

## Преимущества пребилда

✓ Сервер не тратит время и память на сборку Next.js  
✓ Быстрый деплой  
✓ Можно собирать на мощной локальной машине  
✓ Меньше нагрузка на сервер

## Недостатки

✗ Нужно коммитить папку .next (она большая)  
✗ Конфликты при работе в команде

## Обновление .gitignore (если используете этот метод)

Закомментируйте строку в .gitignore:

```
# front/.next/
```

Чтобы git отслеживал собранный фронтенд.
