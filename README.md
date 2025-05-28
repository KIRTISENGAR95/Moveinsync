# Event Booking System API

A RESTful API for an event booking system built with Node.js, Express, and PostgreSQL.

## Features

- User Authentication (JWT-based)
- Role-based Access Control (User, Admin)
- Event Management
- Booking System
- Input Validation
- Error Handling
- Pagination and Filtering

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd event-booking-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a PostgreSQL database:
```sql
CREATE DATABASE event_booking_db;
```

4. Create a `.env` file in the root directory with the following variables:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_NAME=event_booking_db
DB_USER=anantgarg
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=10
```