### Running the Project

1. Start the application and database using Docker Compose:
   ```bash
   docker-compose up -d
   ```

2. The application should now be running on `http://localhost:3000` (or your configured port)


 # Email configuration
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@example.com
   EMAIL_PASSWORD=your_email_password
   
  # Moralis API configuration
   MORALIS_API_KEY=your_moralis_api_key_here
   
   # Add any other required environment variables
   ```

   Make sure to replace the placeholder values with your actual configuration:
   - Configure your email service provider details
   - Add your Moralis API key

3. These environment variables will be used by the application container as defined in the `docker-compose.yml` file.