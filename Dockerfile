# Use a base image of Node.js
FROM node:20.15.1

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Copy the rest of the application code to the container
COPY . .

# Install dependencies
RUN npm install
# Build the application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Define the command to start the application
CMD ["npm", "start"]