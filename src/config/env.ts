import * as z from 'zod';

/**
 * Client-side environment variables (available in browser)
 * Must be prefixed with NEXT_PUBLIC_
 */
const clientEnvSchema = z.object({
  API_URL: z.string(),
  ENABLE_API_MOCKING: z
    .string()
    .refine((s) => s === 'true' || s === 'false')
    .transform((s) => s === 'true')
    .optional(),
  APP_URL: z.string().optional().default('http://localhost:3000'),
});

/**
 * Server-side environment variables (only available on server)
 * These should NOT be accessed from client components
 */
const serverEnvSchema = z.object({
  KEYCLOAK_ISSUER: z.string(),
  KEYCLOAK_CLIENT_ID: z.string(),
  KEYCLOAK_CLIENT_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string(),
  NEXTAUTH_SECRET: z.string(),
});

const createClientEnv = () => {
  const envVars = {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    ENABLE_API_MOCKING: process.env.NEXT_PUBLIC_ENABLE_API_MOCKING,
    APP_URL: process.env.NEXT_PUBLIC_URL,
  };

  const parsedEnv = clientEnvSchema.safeParse(envVars);

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid client env provided.
The following variables are missing or invalid:
${Object.entries(parsedEnv.error.flatten().fieldErrors)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}
`,
    );
  }

  return parsedEnv.data;
};

const createServerEnv = () => {
  // Skip validation on client-side - these vars are not available in browser
  if (typeof window !== 'undefined') {
    return {
      KEYCLOAK_ISSUER: '',
      KEYCLOAK_CLIENT_ID: '',
      KEYCLOAK_CLIENT_SECRET: '',
      NEXTAUTH_URL: '',
      NEXTAUTH_SECRET: '',
    };
  }

  const envVars = {
    KEYCLOAK_ISSUER: process.env.KEYCLOAK_ISSUER,
    KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  };

  const parsedEnv = serverEnvSchema.safeParse(envVars);

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid server env provided.
The following variables are missing or invalid:
${Object.entries(parsedEnv.error.flatten().fieldErrors)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join('\n')}
`,
    );
  }

  return parsedEnv.data;
};

// Client env - safe to use anywhere (browser + server)
export const clientEnv = createClientEnv();

// Server env - only use in server components, API routes, middleware
export const serverEnv = createServerEnv();

// Combined env for backward compatibility
export const env = {
  ...clientEnv,
  ...serverEnv,
};
