# Use Node LTS
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript app
RUN npm run build

# Expose port
EXPOSE 3001

# Start the API
CMD ["npm", "run", "start"] 