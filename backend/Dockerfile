FROM node:18

WORKDIR /app

# Only copy package files first so Docker caches npm install
COPY package*.json ./

RUN npm install --production

# Copy app source
COPY . .

# don't copy local node_modules into image
# Expose port
EXPOSE 5000

CMD ["node", "server.js"]