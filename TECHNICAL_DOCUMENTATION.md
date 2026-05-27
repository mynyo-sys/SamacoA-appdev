# Samaco Brewery App - Technical Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Installation Guide](#installation-guide)
3. [Configuration](#configuration)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Development Setup](#development-setup)
7. [Deployment](#deployment)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)

---

## System Architecture

### Overview

The Samaco Brewery App follows a client-server architecture with a React Native frontend and Symfony backend.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ React Native │  │   Redux     │  │ AsyncStorage │      │
│  │    App       │  │   Store      │  │   (Local)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS/REST API
┌───────────────────────────▼─────────────────────────────────┐
│                       Backend Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Symfony    │  │   JWT Auth   │  │   Mercure    │      │
│  │   Framework  │  │   Middleware │  │   WebSocket  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      Data Layer                              │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │   MySQL      │  │   Doctrine   │                         │
│  │  Database    │  │     ORM      │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **React Native** - Mobile app framework
- **Redux Toolkit** - State management
- **React Navigation** - Navigation library
- **AsyncStorage** - Local data persistence
- **React Native Google Sign-In** - Google authentication
- **Toast** - User notifications

#### Backend
- **Symfony 7** - PHP framework
- **Doctrine ORM** - Database abstraction
- **Lexik JWT Authentication** - JWT token management
- **KnpU OAuth2 Client Bundle** - OAuth integration
- **Mercure Bundle** - Real-time updates
- **Nelmio CORS Bundle** - Cross-origin resource sharing

---

## Installation Guide

### Prerequisites

#### For Frontend Development
- Node.js v18 or higher
- npm v9 or higher
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

#### For Backend Development
- PHP v8.1 or higher
- Composer v2 or higher
- MySQL v8.0 or higher
- Symfony CLI
- Git

---

### Frontend Installation

#### Step 1: Clone the Repository

```bash
git clone https://github.com/your-repo/samaco-app.git
cd samaco-app
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```env
API_BASE_URL=https://webdev2-staging.up.railway.app/api
MERCURE_URL=https://webdev2-staging.up.railway.app/.well-known/mercure
```

#### Step 4: Run the App

**For Android:**
```bash
npm run android
```

**For iOS:**
```bash
npm run ios
```

**For Web (Expo):**
```bash
npm start
```

---

### Backend Installation

#### Step 1: Clone the Repository

```bash
git clone https://github.com/your-repo/brewery-backend.git
cd brewery-backend
```

#### Step 2: Install Dependencies

```bash
composer install
```

#### Step 3: Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="mysql://user:password@127.0.0.1:3306/brewery_db?serverVersion=8.0"
JWT_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
APP_ENV=dev
APP_SECRET="your-app-secret"
CORS_ALLOW_ORIGIN="*"
```

#### Step 4: Create Database

```bash
php bin/console doctrine:database:create
```

#### Step 5: Run Migrations

```bash
php bin/console doctrine:migrations:migrate
```

#### Step 6: Load Fixtures (Optional)

```bash
php bin/console doctrine:fixtures:load
```

#### Step 7: Start the Server

```bash
symfony server:start
```

The backend will be available at `http://localhost:8000`

---

## Configuration

### Frontend Configuration

#### API Configuration

Located in `src/app/api/config.ts`:

```typescript
export const API_BASE_URL = 'https://webdev2-staging.up.railway.app/api';
export const MERCURE_URL = 'https://webdev2-staging.up.railway.app/.well-known/mercure';
```

#### Google Sign-In Configuration

Located in `src/utils/firebase.ts`:

```typescript
GoogleSignin.configure({
  webClientId: '317197442052-0vlbmcdmgl429o8hvsi5i1hlphujl23a.apps.googleusercontent.com',
});
```

### Backend Configuration

#### Database Configuration

Located in `.env`:

```env
DATABASE_URL="mysql://user:password@127.0.0.1:3306/brewery_db?serverVersion=8.0"
```

#### JWT Configuration

Located in `config/packages/lexik_jwt_authentication.yaml`:

```yaml
lexik_jwt_authentication:
  secret_key: '%env(resolve:JWT_SECRET)%'
  token_ttl: 86400
```

#### CORS Configuration

Located in `config/packages/nelmio_cors.yaml`:

```yaml
nelmio_cors:
  defaults:
    origin_regex: true
    allow_origin: ['%env(CORS_ALLOW_ORIGIN)%']
    allow_methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']
    allow_headers: ['Content-Type', 'Authorization']
    expose_headers: ['Link']
    max_age: 3600
```

---

## API Documentation

### Base URL

```
https://webdev2-staging.up.railway.app/api
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication

**POST /api/auth/google**
Google Sign-In authentication

**Request Body:**
```json
{
  "idToken": "google-id-token"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "roles": ["ROLE_USER"],
    "verified": true
  }
}
```

#### Products

**GET /api/products**
Get all products

**Response:**
```json
[
  {
    "id": 1,
    "name": "Pale Ale",
    "description": "A smooth pale ale",
    "price": 5.99,
    "category": "Local Craft Beers",
    "stock": 50,
    "imageUrl": "https://example.com/image.jpg"
  }
]
```

**GET /api/products/{id}**
Get a specific product

#### Orders

**GET /api/orders**
Get all orders (requires authentication)

**Response:**
```json
[
  {
    "id": 1,
    "customer": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe"
    },
    "items": [
      {
        "product": {
          "id": 1,
          "name": "Pale Ale"
        },
        "quantity": 2,
        "unitPrice": 5.99
      }
    ],
    "totalAmount": 11.98,
    "status": "pending",
    "createdAt": "2024-05-26T10:00:00Z"
  }
]
```

**POST /api/orders**
Create a new order (requires authentication)

**Request Body:**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "items": [...],
  "totalAmount": 11.98,
  "status": "pending",
  "createdAt": "2024-05-26T10:00:00Z"
}
```

#### Customer Profile

**GET /api/customer/profile**
Get customer profile (requires authentication)

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(180) NOT NULL UNIQUE,
    roles JSON NOT NULL,
    password VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    google_id VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table

```sql
CREATE TABLE product (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(255),
    stock INT DEFAULT 0,
    image_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Orders Table

```sql
CREATE TABLE `order` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES user(id)
);
```

### Order Items Table

```sql
CREATE TABLE order_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES `order`(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);
```

### Customers Table

```sql
CREATE TABLE customer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES user(id)
);
```

---

## Development Setup

### Running Tests

#### Frontend Tests

```bash
npm test
```

#### Backend Tests

```bash
php bin/phpunit
```

### Code Style

#### Frontend

```bash
npm run lint
npm run format
```

#### Backend

```bash
composer cs-check
composer cs-fix
```

### Database Migrations

#### Create a Migration

```bash
php bin/console doctrine:migrations:generate
```

#### Run Migrations

```bash
php bin/console doctrine:migrations:migrate
```

#### Rollback Last Migration

```bash
php bin/console doctrine:migrations:migrate prev
```

---

## Deployment

### Frontend Deployment (Railway)

1. Connect your GitHub repository to Railway
2. Set environment variables:
   - `API_BASE_URL`: Your backend API URL
   - `MERCURE_URL`: Your Mercure hub URL
3. Railway will automatically build and deploy

### Backend Deployment (Railway)

1. Connect your GitHub repository to Railway
2. Add a MySQL database service
3. Set environment variables:
   - `DATABASE_URL`: Railway MySQL connection string
   - `JWT_SECRET`: Generate a secure random key
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
   - `APP_ENV`: `prod`
   - `APP_SECRET`: Generate a secure random key
   - `CORS_ALLOW_ORIGIN`: `*` (or specific domains)
4. Railway will automatically build and deploy

### Manual Deployment

#### Backend

```bash
# Build for production
composer install --no-dev --optimize-autoloader
php bin/console cache:clear
php bin/console doctrine:migrations:migrate --no-interaction
```

#### Frontend

```bash
# Build for production
npm run build
```

---

## Security Considerations

### Authentication & Authorization

- JWT tokens expire after 24 hours
- Tokens are stored securely in AsyncStorage
- Role-based access control (RBAC)
- Google OAuth 2.0 for secure authentication

### Data Protection

- All API endpoints use HTTPS
- Passwords are hashed using bcrypt
- SQL injection prevention via Doctrine ORM
- XSS prevention via React Native's built-in protections

### CORS Configuration

- CORS is configured to allow specific origins
- In production, restrict to your frontend domain only

### Environment Variables

- Sensitive data stored in environment variables
- Never commit `.env` files to version control
- Use Railway's secret management for production

### API Security

- Rate limiting on public endpoints
- Input validation on all endpoints
- Error messages don't expose sensitive information

---

## Troubleshooting

### Common Issues

#### Frontend

**Issue: App won't build**
- Solution: Clear node_modules and reinstall
```bash
rm -rf node_modules
npm install
```

**Issue: Google Sign-In fails**
- Solution: Verify Google OAuth configuration
- Check that redirect URIs are correctly set in Google Cloud Console

**Issue: AsyncStorage errors**
- Solution: Clear app data and restart

#### Backend

**Issue: Database connection fails**
- Solution: Verify DATABASE_URL in `.env`
- Check MySQL service is running

**Issue: JWT token invalid**
- Solution: Verify JWT_SECRET is set correctly
- Check token expiration time

**Issue: CORS errors**
- Solution: Verify CORS_ALLOW_ORIGIN configuration
- Check that frontend URL is allowed

### Debug Mode

Enable debug mode in `.env`:

```env
APP_DEBUG=1
```

### Logging

Backend logs are available in:
- Development: `var/log/dev.log`
- Production: Railway logs dashboard

---

## Support

For technical support, contact:
- Email: tech-support@samacobrewery.com
- GitHub Issues: https://github.com/your-repo/issues

---

**Version:** 1.0
**Last Updated:** May 2026
