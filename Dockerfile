# Use official Node.js image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Install Playwright dependencies
RUN npx playwright install --with-deps

# Expose the port the app will run on
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
