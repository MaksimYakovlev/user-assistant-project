# Руководство по развертыванию

## Развертывание Backend (Express.js)

### Вариант 1: VPS / Dedicated Server

```bash
# 1. Подключитесь к серверу
ssh user@your-server.com

# 2. Установите Node.js (если не установлен)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Клонируйте проект
git clone your-repo-url
cd pomoshchnik/server

# 4. Установите зависимости
npm install --production

# 5. Настройте переменные окружения
nano .env
# Добавьте ваши GigaChat ключи

# 6. Установите PM2 для управления процессом
sudo npm install -g pm2

# 7. Запустите сервер
pm2 start index.js --name pomoshchnik-api
pm2 save
pm2 startup

# 8. Настройте Nginx как reverse proxy
sudo nano /etc/nginx/sites-available/pomoshchnik-api

# Добавьте конфигурацию:
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Активируйте конфигурацию
sudo ln -s /etc/nginx/sites-available/pomoshchnik-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 9. Установите SSL сертификат
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### Вариант 2: Heroku

```bash
# 1. Установите Heroku CLI
# 2. Войдите в аккаунт
heroku login

# 3. Создайте приложение
heroku create pomoshchnik-api

# 4. Добавьте переменные окружения
heroku config:set GIGACHAT_API_KEY=your_key
heroku config:set GIGACHAT_CLIENT_ID=your_client_id
heroku config:set GIGACHAT_CLIENT_SECRET=your_secret

# 5. Деплой
cd server
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a pomoshchnik-api
git push heroku main
```

### Вариант 3: Docker

```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

```bash
# Сборка и запуск
docker build -t pomoshchnik-api ./server
docker run -p 3001:3001 --env-file server/.env pomoshchnik-api
```

## Развертывание Frontend (React)

### Вариант 1: Vercel

```bash
# 1. Установите Vercel CLI
npm i -g vercel

# 2. Войдите в аккаунт
vercel login

# 3. Деплой
vercel

# 4. Настройте переменную окружения
# В Vercel Dashboard -> Settings -> Environment Variables
# Добавьте: VITE_API_URL = https://api.yourdomain.com
```

### Вариант 2: Netlify

```bash
# 1. Установите Netlify CLI
npm install netlify-cli -g

# 2. Войдите в аккаунт
netlify login

# 3. Соберите проект
npm run build

# 4. Деплой
netlify deploy --prod --dir=dist

# 5. Настройте переменные окружения в Netlify Dashboard
```

### Вариант 3: Nginx (статический хостинг)

```bash
# 1. Соберите проект локально
npm run build

# 2. Скопируйте dist/ на сервер
scp -r dist/* user@your-server.com:/var/www/pomoshchnik

# 3. Настройте Nginx
sudo nano /etc/nginx/sites-available/pomoshchnik

# Добавьте:
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/pomoshchnik;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Активируйте
sudo ln -s /etc/nginx/sites-available/pomoshchnik /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Production чеклист

- [ ] Настроены все переменные окружения
- [ ] Backend API доступен по HTTPS
- [ ] Frontend указывает на production API URL
- [ ] Настроен CORS для production доменов
- [ ] Установлены лимиты rate limiting
- [ ] Настроено логирование ошибок
- [ ] Создана папка для uploads с правильными правами
- [ ] Настроен мониторинг (PM2, или другой)
- [ ] SSL сертификаты установлены и обновляются
- [ ] Настроен firewall
