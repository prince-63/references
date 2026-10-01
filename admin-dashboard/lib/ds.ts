import { Pool } from 'pg';
import { DATABASE_CONFIGS, Environment } from './config';

const prodSslEnabled =
  (process.env.DATABASE_SSL_PROD || 'TRUE').toUpperCase() === 'TRUE';

const pools: Record<Environment, Pool> = {
  development: new Pool({ connectionString: DATABASE_CONFIGS.development }),
  staging: new Pool({ connectionString: DATABASE_CONFIGS.staging }),
  production: new Pool({
    connectionString: DATABASE_CONFIGS.production,
    ...(prodSslEnabled ? { ssl: { rejectUnauthorized: false } } : {}),
  }),
};

export function getPool(environment: Environment = 'development'): Pool {
  return pools[environment];
}

export const pool = pools.production;
