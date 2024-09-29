# Etapa de construcción
FROM node:20-alpine AS build

# Establecer el directorio de trabajo
WORKDIR /app

# Instalar Node.js para ejecutar el servidor de desarrollo de React
RUN apt-get update && apt-get install -y nodejs npm

# Copiar package.json y package-lock.json
COPY package.json package-lock.json ./

# Instalar todas las dependencias
RUN npm install

# Copiar el resto de los archivos del proyecto
COPY . .

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
#
# Comando para iniciar la aplicación
CMD ["npm", "start"]