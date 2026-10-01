export type Environment = 'development' | 'staging' | 'production';

export const AUTH_BASE_URL_BY_ENV: Record<Environment, string> = {
  development: 'https://auth.dev.dental-stack.com',
  staging: 'https://auth.stage.dental-stack.com',
  production: 'https://auth.dental-stack.com',
};

export function getAuthBaseUrlClient(environment: Environment): string {
  return AUTH_BASE_URL_BY_ENV[environment];
}
