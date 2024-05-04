# Use a newer version of Node
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle app source inside the Docker image
COPY . .

# Make port 9000 available to the world outside this container
EXPOSE 9000

# Run app.js when the container launches
CMD ["node", "server.js"]
