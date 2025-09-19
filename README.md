# Crossword Management Server

A comprehensive backend service built with NestJS for managing crossword puzzles. This application provides APIs for creating, updating, and retrieving crossword puzzles with hashtag management and AI-powered generation capabilities.

## 🚀 Features

- **Crossword Management**: Create, read, update, and delete crossword puzzles
- **Hashtag System**: Organize crosswords with hashtags for better categorization
- **AI Integration**: Generate crosswords using OpenAI's GPT models
- **Authentication**: JWT-based authentication system
- **File Uploads**: Support for uploading crossword-related files
- **API Documentation**: Swagger/OpenAPI documentation
- **Caching**: Redis integration for improved performance
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Request validation with class-validator
- **Rate Limiting**: Built-in throttling protection

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Authentication**: JWT
- **AI**: OpenAI API
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Redis
- OpenAI API Key

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://your-repo-url.git
cd crossword-server
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Application
PORT=3000
NODE_ENV=development
APP_DOMAIN=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/crossword-server

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1d

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo

# Swagger Documentation
SWAGGER_TITLE=Crossword Management API
SWAGGER_DESCRIPTION=API for managing crossword puzzles
SWAGGER_VERSION=1.0
SWAGGER_PATH=docs
```

### 4. Run the application

#### Development mode
```bash
npm run start:dev
# or
yarn start:dev
```

#### Production mode
```bash
npm run build
npm run start:prod
# or
yarn build
yarn start:prod
```

The application will be available at `http://localhost:3000`

## 📚 API Documentation

Once the server is running, you can access the Swagger documentation at:
- **Local**: `http://localhost:3000/docs`
- **Production**: `https://your-domain.com/docs`

## 🗃️ Database Seeding

The application includes seed scripts for initial data:

```bash
# Seed admin user
npm run seed:admin

# Seed test crossword data
npm run seed:crossword-test

# Run all seeds
npm run seed
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 🏗️ Project Structure

```
src/
├── common/           # Shared decorators and DTOs
├── config/           # Configuration files
├── core/             # Core services and utilities
├── infras/           # Infrastructure setup (Redis, Swagger)
├── interceptors/     # Global interceptors
├── interfaces/       # TypeScript interfaces
├── modules/          # Feature modules
│   ├── auth/         # Authentication module
│   ├── crossword/    # Crossword management
│   ├── hashtag/      # Hashtag management
│   └── uploads/      # File upload handling
├── seed/             # Database seeding scripts
├── services/         # External services (OpenAI)
├── types/            # Type definitions
└── utils/            # Utility functions
```

## 🔧 Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run seed` - Run database seeds

## 🚀 Deployment

This application is configured for deployment on Vercel. The `vercel.json` file contains the necessary configuration for serverless deployment.

### Vercel Deployment

1. Connect your repository to Vercel
2. Set the environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the UNLICENSED License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue in the repository.
