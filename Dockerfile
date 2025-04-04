# Use official Node.js image, specify version 18 for compatibility with Playwright
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install necessary dependencies for Playwright
RUN apt-get update && apt-get install -y \
  libjpeg62-turbo \
  libvpx5 \
  libicu63 \
  libenchant1c2a \
  wget \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libxss1 \
  libxtst6 \
  libnss3 \
  libgdk-pixbuf2.0-0 \
  libx11-xcb1 \
  libdbus-glib-1-2 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libgdk-pixbuf2.0-0 \
  && rm -rf /var/lib/apt/lists/*

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
