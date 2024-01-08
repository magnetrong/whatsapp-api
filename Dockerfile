# Node runtime as a parent image
FROM arm64v8/node:14

# Sets the working directory
WORKDIR /usr/src/app

# Copies package.json and package-lock.json
COPY package*.json ./

# Installs needed packages
RUN npm install

# Bundles the source code inside the Docker image
COPY . .

# Exposes port 1995
EXPOSE 1995

# Executes the entrypoint of the program
CMD ["node", "server.js"]
