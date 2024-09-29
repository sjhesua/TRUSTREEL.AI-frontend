# Etapa de construcción
FROM node:20-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY ["package.json", "package-lock.json", "./"]

# Instalar dependencias
RUN npm install --production=false

# Copiar el resto de los archivos del proyecto
COPY . .

# Ejecutar pruebas
RUN npm run test

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar solo los archivos necesarios desde la etapa de construcción
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build

# Exponer el puerto 3000
EXPOSE 3000

# Definir el comando para iniciar la aplicación
CMD ["npm", "start"]