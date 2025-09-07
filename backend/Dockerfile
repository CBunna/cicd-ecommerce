FROM node:18-alpine

WORKDIR /app

# install dependencies first for better caching
COPY package.json ./

RUN npm install

#COPY source code
COPY . .

#Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5002

# Start development server

CMD [ "npm","run","dev" ]