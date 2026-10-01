import 'server-only';

import type { Environment } from './config';

const AUTH_BASE_URL_BY_ENV: Record<Environment, string> = {
  development: process.env.AUTH_BASE_URL_DEV || '',
  staging: process.env.AUTH_BASE_URL_STAGING || '',
  production: process.env.AUTH_BASE_URL_PROD || '',
};

const PATIENT_BASE_URL_BY_ENV: Record<Environment, string> = {
  development: process.env.PATIENT_BASE_URL_DEV || '',
  staging: process.env.PATIENT_BASE_URL_STAGING || '',
  production: process.env.PATIENT_BASE_URL_PROD || '',
};

const DOCTOR_BASE_URL_BY_ENV: Record<Environment, string> = {
  development: process.env.DOCTOR_BASE_URL_DEV || '',
  staging: process.env.DOCTOR_BASE_URL_STAGING || '',
  production: process.env.DOCTOR_BASE_URL_PROD || '',
};

export function getAuthBaseUrl(environment: Environment): string {
  return AUTH_BASE_URL_BY_ENV[environment];
}

export function getDoctorBaseUrl(environment: Environment): string {
  return DOCTOR_BASE_URL_BY_ENV[environment];
}

export function getPatientBaseUrl(environment: Environment): string {
  return PATIENT_BASE_URL_BY_ENV[environment];
}

export type SignupOrganization =
  | 'SYNAPSE'
  | 'ROUTETOSMILE'
  | 'CRAFTALIGN'
  | 'SMILEZY'
  | 'DENTALSTACK'
  | 'EVOLVALIGN'
  | 'ALIGNEAZY'
  | 'CLEARCASTLE'
  | 'SMILEXCEL'
  | 'AIIQALIGNER';

interface OrganizationHeaderConfig {
  orgHeaderName: string;
  orgToken: string;
}

type OrganizationByEnvironment = Record<
  SignupOrganization,
  OrganizationHeaderConfig
>;

const developmentOrganizations: OrganizationByEnvironment = {
  SYNAPSE: {
    orgHeaderName: process.env.ORG_DEV_SYNAPSE_HEADER || '',
    orgToken: process.env.ORG_DEV_SYNAPSE_TOKEN || '',
  },
  ROUTETOSMILE: {
    orgHeaderName: process.env.ORG_DEV_ROUTETOSMILE_HEADER || '',
    orgToken: process.env.ORG_DEV_ROUTETOSMILE_TOKEN || '',
  },
  CRAFTALIGN: {
    orgHeaderName: process.env.ORG_DEV_CRAFTALIGN_HEADER || '',
    orgToken: process.env.ORG_DEV_CRAFTALIGN_TOKEN || '',
  },
  SMILEZY: {
    orgHeaderName: process.env.ORG_DEV_SMILEZY_HEADER || '',
    orgToken: process.env.ORG_DEV_SMILEZY_TOKEN || '',
  },
  DENTALSTACK: {
    orgHeaderName: process.env.ORG_DEV_DENTALSTACK_HEADER || '',
    orgToken: process.env.ORG_DEV_DENTALSTACK_TOKEN || '',
  },
  EVOLVALIGN: {
    orgHeaderName: process.env.ORG_DEV_EVOLVALIGN_HEADER || '',
    orgToken: process.env.ORG_DEV_EVOLVALIGN_TOKEN || '',
  },
  ALIGNEAZY: {
    orgHeaderName: process.env.ORG_DEV_ALIGNEAZY_HEADER || '',
    orgToken: process.env.ORG_DEV_ALIGNEAZY_TOKEN || '',
  },
  CLEARCASTLE: {
    orgHeaderName: process.env.ORG_DEV_CLEARCASTLE_HEADER || '',
    orgToken: process.env.ORG_DEV_CLEARCASTLE_TOKEN || '',
  },
  SMILEXCEL: {
    orgHeaderName: process.env.ORG_DEV_SMILEXCEL_HEADER || '',
    orgToken: process.env.ORG_DEV_SMILEXCEL_TOKEN || '',
  },
  AIIQALIGNER: {
    orgHeaderName: process.env.ORG_DEV_AIIQ_HEADER || '',
    orgToken: process.env.ORG_DEV_AIIQ_TOKEN || '',
  },
};

const stagingOrganizations: OrganizationByEnvironment = {
  SYNAPSE: {
    orgHeaderName: process.env.ORG_STAGING_SYNAPSE_HEADER || '',
    orgToken: process.env.ORG_STAGING_SYNAPSE_TOKEN || '',
  },
  ROUTETOSMILE: {
    orgHeaderName: process.env.ORG_STAGING_ROUTETOSMILE_HEADER || '',
    orgToken: process.env.ORG_STAGING_ROUTETOSMILE_TOKEN || '',
  },
  CRAFTALIGN: {
    orgHeaderName: process.env.ORG_STAGING_CRAFTALIGN_HEADER || '',
    orgToken: process.env.ORG_STAGING_CRAFTALIGN_TOKEN || '',
  },
  SMILEZY: {
    orgHeaderName: process.env.ORG_STAGING_SMILEZY_HEADER || '',
    orgToken: process.env.ORG_STAGING_SMILEZY_TOKEN || '',
  },
  DENTALSTACK: {
    orgHeaderName: process.env.ORG_STAGING_DENTALSTACK_HEADER || '',
    orgToken: process.env.ORG_STAGING_DENTALSTACK_TOKEN || '',
  },
  EVOLVALIGN: {
    orgHeaderName: process.env.ORG_STAGING_EVOLVALIGN_HEADER || '',
    orgToken: process.env.ORG_STAGING_EVOLVALIGN_TOKEN || '',
  },
  ALIGNEAZY: {
    orgHeaderName: process.env.ORG_STAGING_ALIGNEAZY_HEADER || '',
    orgToken: process.env.ORG_STAGING_ALIGNEAZY_TOKEN || '',
  },
  CLEARCASTLE: {
    orgHeaderName: process.env.ORG_STAGING_CLEARCASTLE_HEADER || '',
    orgToken: process.env.ORG_STAGING_CLEARCASTLE_TOKEN || '',
  },
  SMILEXCEL: {
    orgHeaderName: process.env.ORG_STAGING_SMILEXCEL_HEADER || '',
    orgToken: process.env.ORG_STAGING_SMILEXCEL_TOKEN || '',
  },
  AIIQALIGNER: {
    orgHeaderName: process.env.ORG_STAGING_AIIQ_HEADER || '',
    orgToken: process.env.ORG_STAGING_AIIQ_TOKEN || '',
  },
};

const productionOrganizations: OrganizationByEnvironment = {
  SYNAPSE: {
    orgHeaderName: process.env.ORG_PROD_SYNAPSE_HEADER || '',
    orgToken: process.env.ORG_PROD_SYNAPSE_TOKEN || '',
  },
  ROUTETOSMILE: {
    orgHeaderName: process.env.ORG_PROD_ROUTETOSMILE_HEADER || '',
    orgToken: process.env.ORG_PROD_ROUTETOSMILE_TOKEN || '',
  },
  CRAFTALIGN: {
    orgHeaderName: process.env.ORG_PROD_CRAFTALIGN_HEADER || '',
    orgToken: process.env.ORG_PROD_CRAFTALIGN_TOKEN || '',
  },
  SMILEZY: {
    orgHeaderName: process.env.ORG_PROD_SMILEZY_HEADER || '',
    orgToken: process.env.ORG_PROD_SMILEZY_TOKEN || '',
  },
  DENTALSTACK: {
    orgHeaderName: process.env.ORG_PROD_DENTALSTACK_HEADER || '',
    orgToken: process.env.ORG_PROD_DENTALSTACK_TOKEN || '',
  },
  EVOLVALIGN: {
    orgHeaderName: process.env.ORG_PROD_EVOLVALIGN_HEADER || '',
    orgToken: process.env.ORG_PROD_EVOLVALIGN_TOKEN || '',
  },
  ALIGNEAZY: {
    orgHeaderName: process.env.ORG_PROD_ALIGNEAZY_HEADER || '',
    orgToken: process.env.ORG_PROD_ALIGNEAZY_TOKEN || '',
  },
  CLEARCASTLE: {
    orgHeaderName: process.env.ORG_PROD_CLEARCASTLE_HEADER || '',
    orgToken: process.env.ORG_PROD_CLEARCASTLE_TOKEN || '',
  },
  SMILEXCEL: {
    orgHeaderName: process.env.ORG_PROD_SMILEXCEL_HEADER || '',
    orgToken: process.env.ORG_PROD_SMILEXCEL_TOKEN || '',
  },
  AIIQALIGNER: {
    orgHeaderName: process.env.ORG_PROD_AIIQ_HEADER || '',
    orgToken: process.env.ORG_PROD_AIIQ_TOKEN || '',
  },
};

const orgConfigByEnvironment: Record<Environment, OrganizationByEnvironment> = {
  development: developmentOrganizations,
  staging: stagingOrganizations,
  production: productionOrganizations,
};

export function getSignupOrganizationHeaderConfig(
  environment: Environment,
  orgName: SignupOrganization
): OrganizationHeaderConfig {
  const config = orgConfigByEnvironment[environment][orgName];
  if (!config?.orgHeaderName || !config?.orgToken) {
    throw new Error(
      `Organization configuration is not available for ${orgName} in ${environment}`
    );
  }
  return config;
}

export const SIGNUP_ORGANIZATION_OPTIONS: SignupOrganization[] = [
  'SYNAPSE',
  'ROUTETOSMILE',
  'CRAFTALIGN',
  'SMILEZY',
  'DENTALSTACK',
  'EVOLVALIGN',
  'ALIGNEAZY',
  'CLEARCASTLE',
  'SMILEXCEL',
  'AIIQALIGNER',
];

export const SIGNUP_ROLE_OPTIONS = [
  'CONSULTING_ORTHODONTIST',
  'CLINIC_OWNER',
  'IN_OFFICE_MANUFACTURER',
  'ALIGNER_COMPANY_OR_LAB',
  'COMMERCIAL_ALIGNER_LAB',
  'LAB_STAFF',
  'CUSTOMER',
  'VENDOR',
  'PRACTICE',
  'ENTERPRISE_COMPANY_LAB',
  'INTERNAL_USER',
] as const;
