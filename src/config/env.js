import { z } from 'zod';

const optionalOAuthCredential = z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().trim().min(1).optional()
);

// Define the schema for environment variables
const envSchema = z
    .object({
        NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
        PORT: z.string().transform(Number).default('3000'),
        DB_URL: z.string().url(),
        SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters long'),
        OAUTH_CALLBACK_BASE_URL: z.string().url().default('http://localhost:3000'),
        GOOGLE_CLIENT_ID: optionalOAuthCredential,
        GOOGLE_CLIENT_SECRET: optionalOAuthCredential,
        GITHUB_CLIENT_ID: optionalOAuthCredential,
        GITHUB_CLIENT_SECRET: optionalOAuthCredential,
        ENABLE_SQL_LOGGING: z
            .enum(['true', 'false'])
            .default('false')
            .transform((val) => val === 'true')
    })
    .superRefine((values, context) => {
        for (const provider of ['GOOGLE', 'GITHUB']) {
            const clientId = values[`${provider}_CLIENT_ID`];
            const clientSecret = values[`${provider}_CLIENT_SECRET`];

            if (Boolean(clientId) !== Boolean(clientSecret)) {
                context.addIssue({
                    code: 'custom',
                    path: [`${provider}_CLIENT_SECRET`],
                    message: `${provider} OAuth requires both a client ID and a client secret`
                });
            }
        }

        const oauthConfigured =
            values.GOOGLE_CLIENT_ID ||
            values.GITHUB_CLIENT_ID ||
            values.GOOGLE_CLIENT_SECRET ||
            values.GITHUB_CLIENT_SECRET;

        if (
            oauthConfigured &&
            values.NODE_ENV === 'production' &&
            new URL(values.OAUTH_CALLBACK_BASE_URL).protocol !== 'https:'
        ) {
            context.addIssue({
                code: 'custom',
                path: ['OAUTH_CALLBACK_BASE_URL'],
                message: 'OAuth callback base URL must use HTTPS in production'
            });
        }
    });

// Validate the environment variables
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.format());
    process.exit(1);
}

export const env = parsed.data;
