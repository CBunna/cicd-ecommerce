
⏺ Detailed Line-by-Line Explanation of CI.yml

  Header Section (Lines 1-2) 

  name: CI Pipeline

  - Line 1: name: CI Pipeline - This is just a human-readable name for your
  workflow. It appears in the GitHub Actions UI. You could call it anything like
  "My Tests" or "Backend Testing".
  - Line 2: Empty line for readability.

  Trigger Section (Lines 3-7)

  on:
    push:
      branches: [main, develop]
    pull_request:
      branches: [main]
  What this does: Tells GitHub WHEN to run this workflow.

  - Line 3: on: - Starts the trigger configuration
  - Lines 4-5: push: branches: [main, develop] - Run this workflow whenever
  someone pushes code to the main OR develop branch
  - Lines 6-7: pull_request: branches: [main] - Run this workflow whenever someone
   creates/updates a pull request targeting the main branch

  Why we need this: Without triggers, the workflow would never run. This ensures
  your tests run on important code changes.

  Jobs Section Start (Lines 9-11)

  jobs:
    test-backend:
      runs-on: ubuntu-latest
  - Line 9: jobs: - Starts defining what work to do
  - Line 10: test-backend: - Names this job (you can have multiple jobs)
  - Line 11: runs-on: ubuntu-latest - Tells GitHub to use a Ubuntu Linux virtual
  machine

  Why Ubuntu: It's free, fast, and most server applications run on Linux.

  Database Service Setup (Lines 13-25)

  services:
    postgres:
      image: postgres:15
      env:
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: ecommerce_test
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5
      ports:
        - 5432:5432
  What this does: Starts a PostgreSQL database that your tests can use.

  - Line 13: services: - Starts service configuration
  - Line 14: postgres: - Names this service
  - Line 15: image: postgres:15 - Uses PostgreSQL version 15 Docker image
  - Lines 16-18: env: section sets up database credentials:
    - POSTGRES_PASSWORD: postgres - Sets database password
    - POSTGRES_DB: ecommerce_test - Creates a database called "ecommerce_test"
  - Lines 19-23: options: - Health check configuration:
    - --health-cmd pg_isready - Command to check if database is ready
    - --health-interval 10s - Check every 10 seconds
    - --health-timeout 5s - Wait 5 seconds for each check
    - --health-retries 5 - Try 5 times before giving up
  - Lines 24-25: ports: - 5432:5432 - Maps database port so your app can connect

  Why we need this: Your backend tests need a real database to test against. This
  creates a temporary database just for testing.

  Workflow Steps (Lines 27-55)

  steps:
  - Line 27: steps: - Starts defining the actual work to do

  Step 1: Get the Code (Lines 28-29)

  - name: Checkout code
    uses: actions/checkout@v4
  - Line 28: name: Checkout code - Human-readable step name
  - Line 29: uses: actions/checkout@v4 - Downloads your repository code to the
  runner

  Why we need this: The runner starts empty. This gets your actual code so it can
  be tested.

  Step 2: Setup Node.js (Lines 31-35)

  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: "20"
      cache: "npm"
  - Line 31: Step name
  - Line 32: uses: actions/setup-node@v4 - Installs Node.js
  - Line 34: node-version: "20" - Specifically installs Node.js version 20
  - Line 35: cache: "npm" - Caches npm dependencies for faster future runs

  Why Node.js 20: Your backend is written in JavaScript/TypeScript, so you need
  Node.js to run it. Version 20 has better support for modern tools like tsx.

  Why caching: Installing dependencies takes time. Caching speeds up future runs.

  Step 3: Install Dependencies (Lines 37-38)

  - name: Install dependencies
    run: npm ci
  - Line 38: npm ci - Installs exact versions from package-lock.json

  Why npm ci instead of npm install:
  - npm ci is faster
  - Uses exact versions from lockfile
  - Better for automated environments
  - Deletes node_modules first (clean install)

  Step 4: Database Migration (Lines 40-46)

  - name: Run database migrations
    env:
      NODE_ENV: test
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ecommerce_test
    run: |
      cd backend
      npm run migrate
  - Lines 41-43: env: - Sets environment variables for this step:
    - NODE_ENV: test - Tells your app it's in test mode
    - DATABASE_URL: postgresql://... - Connection string to the test database
  - Lines 44-46: run: - Commands to execute:
    - cd backend - Navigate to backend directory
    - npm run migrate - Run database migrations (creates tables)

  Why we need migration: The PostgreSQL service starts empty. Migration creates
  your database tables (users, products, orders, etc.).

  Database URL breakdown:
  - postgresql:// - Database type
  - postgres:postgres - username:password
  - @localhost:5432 - host:port
  - /ecommerce_test - database name

  Step 5: Run Tests (Lines 48-55)

  - name: Run backend tests
    env:
      NODE_ENV: test
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ecommerce_test
      JWT_SECRET: test-secret
    run: |
      cd backend
      npm test
  - Lines 49-52: Environment variables for tests:
    - NODE_ENV: test - Test environment mode
    - DATABASE_URL: ... - Same database connection
    - JWT_SECRET: test-secret - Secret key for JWT tokens in tests
  - Lines 53-55: Run the actual tests:
    - cd backend - Go to backend folder
    - npm test - Run Jest tests

  Why JWT_SECRET: Your backend uses JWT tokens for authentication. Tests need a
  secret key to create/verify test tokens.

  Summary of the Complete Flow:

  1. Trigger: Code pushed to main/develop → workflow starts
  2. Environment: Ubuntu VM with PostgreSQL database starts
  3. Setup: Download code, install Node.js 20, cache dependencies
  4. Install: Install all npm packages
  5. Database: Run migrations to create database schema
  6. Test: Run all backend tests against the real database
  7. Result: ✅ Pass or ❌ Fail gets reported to GitHub

  This ensures your backend code works correctly before it gets merged!
