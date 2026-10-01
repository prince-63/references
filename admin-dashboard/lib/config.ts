export type Environment = 'development' | 'staging' | 'production';

const ALL_ENVIRONMENTS: Environment[] = [
  'development',
  'staging',
  'production',
];
const ONLY_DEVELOPMENT: Environment[] = ['development', 'staging'];

function parseBooleanEnv(value: string | undefined): boolean {
  return value?.toUpperCase() === 'TRUE';
}

function normalizePostgresUrl(url: string): string {
  if (!url) return '';

  const match = url.match(/^(postgres(?:ql)?:\/\/)([^:/?#]+):([^@]+)@(.+)$/i);
  if (!match) return url;

  const [, protocol, username, password, rest] = match;

  let normalizedPassword: string;
  try {
    normalizedPassword = encodeURIComponent(decodeURIComponent(password));
  } catch {
    normalizedPassword = encodeURIComponent(password);
  }

  return `${protocol}${username}:${normalizedPassword}@${rest}`;
}

export function getAllowedEnvironments(): Environment[] {
  const enableDev = parseBooleanEnv(
    process.env.NEXT_PUBLIC_ENABLE_DEV ?? process.env.ENABLE_DEV
  );
  const enableStage = parseBooleanEnv(
    process.env.NEXT_PUBLIC_ENABLE_STAGE ?? process.env.ENABLE_STAGE
  );
  const enableProd = parseBooleanEnv(
    process.env.NEXT_PUBLIC_ENABLE_PROD ?? process.env.ENABLE_PROD
  );

  if (enableStage && enableStage && enableProd) return [...ALL_ENVIRONMENTS];
  if (enableDev && enableStage) return [...ONLY_DEVELOPMENT];
  if (enableProd) return ['production'];

  return ['development'];
}

export function resolveEnvironment(
  value: string | null | undefined
): Environment {
  const allowed = getAllowedEnvironments();
  if (value && allowed.includes(value as Environment)) {
    return value as Environment;
  }
  return allowed[0];
}

export const DATABASE_CONFIGS: Record<Environment, string> = {
  development: normalizePostgresUrl(process.env.DATABASE_URL_DEV || ''),
  staging: normalizePostgresUrl(process.env.DATABASE_URL_STAGING || ''),
  production: normalizePostgresUrl(process.env.DATABASE_URL_PROD || ''),
};
