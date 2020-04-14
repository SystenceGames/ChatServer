# specify the node base image with your desired version node:<version>
FROM node:6
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# replace this with your application's default port
EXPOSE 10400
EXPOSE 10700

CMD [ "node", "app.js" ]