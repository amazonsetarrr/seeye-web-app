FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start development server with host flag to allow external access
CMD ["npm", "run", "dev", "--", "--host"]
