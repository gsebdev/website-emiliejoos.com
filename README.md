# Next.js Website with MySQL DB Connection

## Description
This Next.js application is designed to work with a MySQL database using the mysql2 package. It utilizes an .env file to set the database parameters and the JWT secret key for authentication.

# Routes
- '/' is the front office base route
- '/backend' is the administration route

## Environment Variables
Ensure you have the following environment variables set in your .env file:

DB_HOST: Hostname for the MySQL database
DB_USER: Username for the MySQL database
DB_PASSWORD: Password for the MySQL database
DB_DATABASE: Name of the MySQL database
JWT_SECRET: Secret key for JWT authentication
IMAGE_BLUR_DATA: example : data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8/R8AAtsB7JKxzdUAAAAASUVORK5CYII=
BASE_URL: base url of the website

## Getting Started
To start development on this application, run the following command:
```
npm run install
npm run dev
```
Make sure to set up your .env file with the necessary parameters before running the application.


## Scripts
```
npm run dev: Start the development server
```
## Author
gsebdev

