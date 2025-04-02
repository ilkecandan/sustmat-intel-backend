# Use official Node image
FROM mcr.microsoft.com/playwright:v1.41.1-jammy

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN npm install

# (Optional but safer) Install the browsers
RUN npx playwright install --with-deps

# Set environment variable (Railway passes PORT)
ENV PORT=8080

# Run your app
CMD ["npm", "start"]
