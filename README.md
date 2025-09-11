[![CI Pipeline](https://github.com/CBunna/cicd-ecommerce/actions/workflows/ci.yml/badge.svg)](https://github.com/CBunna/cicd-ecommerce/actions/workflows/ci.yml)# E-Commerce Project

A simple e-commerce website built with React frontend and Node.js backend. This is a learning project for practicing full-stack development.

## What's Inside

- **Frontend**: React app with TypeScript and Tailwind CSS
- **Backend**: Express.js API with PostgreSQL database
- **Database**: PostgreSQL with user authentication and product management
- **Docker**: Everything runs in containers for easy setup

## Quick Start

### 1. Start Everything with Docker
```bash
# Make sure Docker is running on your computer
docker-compose up

# Or run in background
docker-compose up -d
```

Wait a few minutes for everything to start up.

### 2. Access the Application
- **Website**: http://localhost:3000
- **API Docs**: http://localhost:5002/api/docs
- **Database Admin**: Available on localhost:5432

### 3. Test Login Credentials
- **Admin**: admin@example.com / admin123
- **Customer**: customer@example.com / customer123

## If Something Breaks

### Reset Everything
```bash
# Stop everything
docker-compose down

# Remove old data (warning: deletes everything!)
docker-compose down -v

# Start fresh
docker-compose up
```

### Add Sample Data
```bash
# Go to backend folder
cd backend

# Add sample users and products
npm run seed
```

### Run Tests
```bash
# Go to backend folder
cd backend

# Run all tests
npm test

# Run only auth tests
npm run test:auth
```

## Working Features

✅ User registration and login  
✅ Admin and customer roles  
✅ API documentation  
✅ Database with sample data  
✅ Tests for authentication  

## Common Issues

**"Can't connect to database"**
- Make sure Docker is running
- Try `docker-compose down` then `docker-compose up`

**"Login doesn't work"**
- Run `npm run seed` in the backend folder
- Use the test credentials above

**"Frontend shows errors"**
- Check if backend is running on port 5002
- Look at browser console for error messages

**"Tests fail"**
- Run `npm run seed` to add test data back
- Make sure Docker containers are running

## File Structure
```
├── frontend/          # React app
├── backend/           # Express API
├── docker-compose.yml # Docker setup
└── README.md         # This file
```

## Useful Commands

```bash
# See what's running
docker ps

# View logs
docker-compose logs backend
docker-compose logs frontend

# Stop everything
docker-compose down

# Rebuild if you change code
docker-compose up --build
```

## Next Steps (Ideas for Learning)

- Add more products
- Create shopping cart
- Add order history
- Improve the UI design
- Add payment processing (fake)
- Add product search
- Add user profiles

