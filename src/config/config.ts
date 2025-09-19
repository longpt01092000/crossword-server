export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),

  swagger: {
    title: process.env.SWAGGER_TITLE || 'My API',
    description: process.env.SWAGGER_DESCRIPTION || 'API description',
    version: process.env.SWAGGER_VERSION || '1.0',
    path: process.env.SWAGGER_PATH || 'docs',
  },

  s3: {
    region: process.env.AWS_REGION || 'ap-southeast-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    bucketName: process.env.AWS_BUCKET_NAME || '',
  },

  mongodb:
    process.env.MONGODB_URI || 'mongodb://localhost:27017/brand-analysis',

  domain: process.env.APP_DOMAIN || 'http://localhost:3000',

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  },
});
