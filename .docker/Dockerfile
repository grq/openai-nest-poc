# --- Stage 1: Build Stage ---
  FROM node:20 AS build

  # Устанавливаем рабочую директорию
  WORKDIR /app
  
  # Копируем package.json и package-lock.json
  COPY package*.json ./
  
  # Устанавливаем зависимости
  RUN npm install
  
  # Копируем исходный код
  COPY . .
  
  # Сборка проекта NestJS
  RUN npm run build
  
  # --- Stage 2: Production Stage ---
  FROM node:20
  
  # Устанавливаем рабочую директорию
  WORKDIR /app
  
  # Копируем собранные файлы из Stage 1
  COPY --from=build /app/dist ./dist
  COPY --from=build /app/node_modules ./node_modules
  COPY package.json ./
  
  # Указываем переменные окружения (они могут быть переопределены при запуске)
  ENV NODE_ENV=production
  ENV PORT=4010
  
  # Открываем порт для приложения
  EXPOSE 4010
  
  # Запуск приложения
  CMD ["node", "dist/main"]