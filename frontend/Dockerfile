FROM node:18-alpine

WORKDIR /app

#COPY package.json

COPY package*.json ./

# Install dependencis

RUN npm ci

# COPY source code

COPY . .

# EXPOSE port

EXPOSE 3000

# Start development server

CMD [ "npm", "run", "dev", "--", "--host" ]