# Samaco Brewery App - Final Presentation

## Project Overview

Samaco Brewery App is a mobile application built with React Native for customers to browse and order craft beers from Samaco Brewery. The app features product browsing, category filtering, shopping cart functionality, and order management with local storage for offline capability.

## Architecture

### Frontend (React Native)
- **Framework:** React Native with Expo
- **State Management:** Redux
- **Navigation:** React Navigation
- **Storage:** AsyncStorage for local cart and orders
- **Authentication:** Google Sign-In with JWT tokens

### Backend (Symfony)
- **Framework:** Symfony 7
- **Database:** MySQL
- **API:** RESTful API with JWT authentication
- **Authentication:** Google OAuth 2.0
- **Real-time:** Mercure for WebSocket updates

## Data Flow Diagram Level 1

```
┌─────────────────┐
│   React Native  │
│      App        │
└────────┬────────┘
         │
         │ HTTP/HTTPS
         │
┌────────▼────────┐
│   Symfony API   │
│   (Backend)     │
└────────┬────────┘
         │
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│ MySQL │ │Mercure│
│Database│ │Hub    │
└───────┘ └───────┘
```

### Data Flow Description

1. **User Authentication Flow**
   - User signs in with Google → React Native app sends ID token to `/api/auth/google`
   - Backend verifies token with Google API → Generates JWT token
   - Frontend stores JWT token → Uses for authenticated requests

2. **Product Browsing Flow**
   - Frontend requests products from `/api/products`
   - Backend queries MySQL database → Returns product data
   - Frontend displays products with category filtering

3. **Order Creation Flow**
   - User adds items to cart → Stored in AsyncStorage (local)
   - User places order → Frontend sends cart data to backend
   - Backend creates order record in MySQL → Returns confirmation
   - Frontend clears local cart → Updates order history

4. **Real-time Updates Flow**
   - Backend publishes updates to Mercure hub
   - Frontend subscribes to Mercure topic
   - Updates pushed to connected clients in real-time

## System Requirements

### Software Requirements

#### Frontend (React Native)
- **Operating System:** Windows 10/11, macOS, or Linux
- **Node.js:** v18 or higher
- **npm:** v9 or higher
- **React Native CLI:** Latest version
- **Expo CLI:** Latest version (optional)
- **Code Editor:** VS Code (recommended)
- **Git:** For version control

#### Backend (Symfony)
- **Operating System:** Windows 10/11, macOS, or Linux
- **PHP:** v8.1 or higher
- **Composer:** v2 or higher
- **MySQL:** v8.0 or higher
- **Symfony CLI:** Latest version
- **Docker:** (optional) for containerized development
- **Git:** For version control

#### Development Tools
- **Postman:** For API testing
- **MySQL Workbench:** For database management
- **Google Cloud Console:** For OAuth configuration

### Hardware Requirements

#### Minimum Requirements
- **Processor:** Intel Core i5 or AMD equivalent
- **RAM:** 8GB
- **Storage:** 20GB free space
- **Network:** Stable internet connection

#### Recommended Requirements
- **Processor:** Intel Core i7 or AMD Ryzen 7
- **RAM:** 16GB
- **Storage:** 50GB SSD
- **Network:** High-speed internet connection

#### Mobile Device Requirements (for Testing)
- **Android:** Android 5.0 (Lollipop) or higher
- **iOS:** iOS 12 or higher
- **RAM:** 2GB minimum
- **Storage:** 100MB free space

## Key Features

### 1. User Authentication
- Google Sign-In integration
- JWT token-based authentication
- Secure session management

### 2. Product Management
- Browse all available products
- Category-based filtering
- Search functionality
- Product details with images
- Stock availability indicators

### 3. Shopping Cart
- Add items to cart
- View cart contents
- Calculate total amount
- Local storage for offline capability

### 4. Order Management
- Place orders
- View order history
- Track order status
- Cancel pending orders

### 5. User Profile
- View account information
- Update profile details
- View order statistics
- Logout functionality

## Technology Stack

### Frontend
- React Native
- Redux Toolkit
- React Navigation
- AsyncStorage
- React Native Google Sign-In
- Toast notifications

### Backend
- Symfony 7
- Doctrine ORM
- Lexik JWT Authentication
- KnpU OAuth2 Client Bundle
- Mercure Bundle
- Nelmio CORS Bundle

### Database
- MySQL 8.0
- Doctrine Migrations

### Deployment
- Railway (Backend)
- Expo (Frontend - optional)

## Security Features

1. **Authentication:** JWT token-based authentication
2. **OAuth 2.0:** Google Sign-In integration
3. **CORS:** Configured for cross-origin requests
4. **Input Validation:** Server-side validation
5. **SQL Injection Prevention:** Doctrine ORM parameterized queries
6. **Environment Variables:** Sensitive data stored in environment variables

## Future Enhancements

1. Payment gateway integration
2. Order tracking with real-time updates
3. Product reviews and ratings
4. Wishlist functionality
5. Push notifications
6. Admin dashboard for inventory management
7. Analytics and reporting

## Conclusion

The Samaco Brewery App provides a comprehensive mobile solution for customers to browse and order craft beers. The application uses modern technologies and follows best practices for security, scalability, and user experience. The local storage feature ensures offline capability, while the backend API provides robust data management and authentication.

---

**Prepared by:** Development Team
**Date:** May 2026
**Version:** 1.0
