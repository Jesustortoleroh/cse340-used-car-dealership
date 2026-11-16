import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default('3000'),
    DB_URL: z.string().url(),
    SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters long'),
    ENABLE_SQL_LOGGING: z.enum(['true', 'false']).default('false').transform((val) => val === 'true'),
});

// Validate the environment variables
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.format());
    process.exit(1);
}

export const env = parsed.data;