# Vueless Quickstart

## Run the Application Locally

### 1. Install Dependencies

Install project dependencies:

```bash
npm install
```

### 2. Setup Environment Variables

Create a local environment file by copying the example:

```bash
cp .env.local.example .env.local
```

### 3. Run the Application (Development Mode)

Start the application in development mode:

```bash
npm run dev
```

## Run Storybook (UI Component Explorer)

Useful for viewing and debugging UI components:

```bash
# Start Storybook with documentation only
npm run sb:dev:docs

# Start Storybook with documentation and stories
npm run sb:dev

# Build Storybook for deployment
npm run sb:build

# Preview the built Storybook app
npm run sb:preview
```

## Code Style and Formatting

Run linting checks to maintain code quality:

```bash
# Show style errors and warnings
npm run lint

# Automatically fix style issues
npm run lint:fix

# Run linter in CI mode (fails on warnings and errors)
npm run lint:ci
```

## TypeScript Checks

Run TypeScript checks to ensure type safety:

```bash
npm run ts:check
```

## Unit Tests

Run automated unit tests:

```bash
npm run test:unit
```

## Build the application

Prepare the app for production:

```bash
# Create the production environment file
cp .env.example .env

# Replace environment placeholders with actual values
sed -i "s|{{DOMAIN}}|$FE_URL|g" .env              # Set VITE_DOMAIN
sed -i "s|{{API_DOMAIN}}|$API_URL|g" .env         # Set VITE_API_DOMAIN

# Build the app
npm run build

# Copy the built files to the deployment directory
cp -r dist/. $DEPLOY_PATH
```

## Run the Built Application (Production Mode)

Start the built app from the `/dist` directory:

```bash
npm run preview
```

## Update Browserslist Database

Keep the [Browserslist DB](https://browsersl.ist/) up to date:

```bash
npx browserslist@latest --update-db
```
