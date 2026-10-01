import { NextRequest, NextResponse } from 'next/server';
import { resolveEnvironment, type Environment } from '@/lib/config';
import type {
  AddUserSignupRequest,
  SignupApiResponse,
  DoctorProfileResponse,
  BillingSetupResponse,
} from '@/lib/types';
import {
  getAuthBaseUrl,
  getDoctorBaseUrl,
  getPatientBaseUrl,
  getSignupOrganizationHeaderConfig,
  type SignupOrganization,
} from '@/lib/signupConfig.server';

type SignupStep =
  | 'STEP1_START'
  | 'STEP2_UPDATE_DETAILS'
  | 'STEP3_COMPLETE_SIGNUP'
  | 'STEP4_DOCTOR_PROFILE'
  | 'STEP5_BILLING_SETUP';

class SignupStepError extends Error {
  status: number;
  step: SignupStep;

  constructor(message: string, status: number, step: SignupStep) {
    super(message);
    this.status = status;
    this.step = step;
  }
}

function getRequestHeaders(
  orgHeaderName: string,
  orgToken: string
): HeadersInit {
  return {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'User-Type': 'DOCTOR',
    'X-Organization-Name': orgHeaderName,
    'X-Organization-Token': orgToken,
  };
}

async function fetchFromApi<T>(
  baseUrl: string,
  step: SignupStep,
  endpoint: string,
  options: {
    method: 'GET' | 'POST';
    headers: HeadersInit;
    body?: unknown;
  }
): Promise<T> {
  const url = `${baseUrl}${endpoint}`;

  const fetchOptions: RequestInit = {
    method: options.method,
    headers: options.headers,
    cache: 'no-store',
  };

  if (options.body && options.method === 'POST') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      json?.message ||
      json?.error ||
      `Request failed with status ${response.status}`;
    throw new SignupStepError(message, response.status, step);
  }

  return json as T;
}

async function postMultipartToApi<T>(
  baseUrl: string,
  step: SignupStep,
  endpoint: string,
  options: {
    headers: HeadersInit;
    formData: Record<string, unknown>;
  }
): Promise<T> {
  const url = `${baseUrl}${endpoint}`;

  const formData = new FormData();
  formData.append('details', JSON.stringify(options.formData));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { 'Content-Type': _contentType, ...headersWithoutContentType } =
    options.headers as Record<string, string>;

  const response = await fetch(url, {
    method: 'POST',
    headers: headersWithoutContentType,
    body: formData,
    cache: 'no-store',
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      json?.message ||
      json?.error ||
      `Request failed with status ${response.status}`;
    throw new SignupStepError(message, response.status, step);
  }

  return json as T;
}

async function runSignupFlow(
  payload: AddUserSignupRequest,
  environment: Environment
): Promise<SignupApiResponse> {
  const orgName = payload.org_name as SignupOrganization;
  const authBaseUrl = getAuthBaseUrl(environment);
  const doctorBaseUrl = getDoctorBaseUrl(environment);
  void getPatientBaseUrl(environment);
  const { orgHeaderName, orgToken } = getSignupOrganizationHeaderConfig(
    environment,
    orgName
  );
  const baseHeaders = getRequestHeaders(orgHeaderName, orgToken);

  await fetchFromApi<SignupApiResponse>(
    authBaseUrl,
    'STEP1_START',
    '/auth/v1/signup/password/start',
    {
      method: 'POST',
      headers: baseHeaders,
      body: {
        email: payload.email,
        password: payload.password,
        user_type: payload.user_type ?? 'DOCTOR',
        user_consent: payload.user_consent ?? true,
        org_name: payload.org_name,
        organization_id: payload.organization_id ?? null,
        profile_id: payload.profile_id ?? null,
        doctor_id: payload.doctor_id ?? null,
      },
    }
  );

  await fetchFromApi<SignupApiResponse>(
    authBaseUrl,
    'STEP2_UPDATE_DETAILS',
    '/auth/doctor/v2/update/details',
    {
      method: 'POST',
      headers: baseHeaders,
      body: {
        email: payload.email,
        country_code: payload.country_code,
        mobile_no: payload.mobile_no ?? null,
        first_name: payload.first_name,
        last_name: payload.last_name,
        salutation: payload.salutation,
        org_name: payload.org_name,
        organization_id: payload.organization_id ?? null,
        profile_id: payload.profile_id ?? null,
        doctor_id: payload.doctor_id ?? null,
      },
    }
  );

  const step3Response = await fetchFromApi<SignupApiResponse>(
    authBaseUrl,
    'STEP3_COMPLETE_SIGNUP',
    '/auth/doctor/v1/signup/password',
    {
      method: 'POST',
      headers: baseHeaders,
      body: {
        email: payload.email,
        country_code: payload.country_code,
        mobile_no: payload.mobile_no ?? null,
        first_name: payload.first_name,
        last_name: payload.last_name,
        device_info_details: payload.device_info_details,
        salutation: payload.salutation,
        org_name: payload.org_name,
        roles: [payload.role],
        brand: payload.org_name,
        organization_id: payload.organization_id ?? null,
        profile_id: payload.profile_id ?? null,
        doctor_id: payload.doctor_id ?? null,
        skip_email_or_mobile_verification: true,
      },
    }
  );

  const authToken = step3Response.token;
  const userId = step3Response.user_id;

  if (!authToken || !userId) {
    throw new SignupStepError(
      'Step 3 did not return required token or user_id',
      500,
      'STEP3_COMPLETE_SIGNUP'
    );
  }

  const authHeaders: HeadersInit = {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
    'User-Type': 'DOCTOR',
    'X-Organization-Name': orgHeaderName,
    'X-Organization-Token': orgToken,
  };

  const doctorProfileResponse = await fetchFromApi<DoctorProfileResponse>(
    doctorBaseUrl,
    'STEP4_DOCTOR_PROFILE',
    `/doctor/v1/?doctor_id=${userId}`,
    {
      method: 'GET',
      headers: authHeaders,
    }
  );

  const doctorId = doctorProfileResponse.doctor_id;
  const profileId = doctorProfileResponse.default_profile.profile_id;
  const organizationId = doctorProfileResponse.default_profile.organization_id;

  try {
    const companyName =
      `${payload.salutation} ${payload.first_name} ${payload.last_name}`.trim();
    await postMultipartToApi<BillingSetupResponse>(
      doctorBaseUrl,
      'STEP5_BILLING_SETUP',
      '/doctor/billing/v2/',
      {
        headers: authHeaders,
        formData: {
          doctor_id: doctorId,
          billing_id: null,
          profile_id: profileId,
          organization_id: organizationId,
          company_legal_name: companyName,
          address_line1: null,
          address_line2: null,
          country: null,
          state: null,
          city: null,
          pincode: null,
          company_tax_id: null,
          currency: null,
          file_action: 'NOT_UPDATE',
          file_brand_action: 'NOT_UPDATE',
          company_display_name: companyName,
          company_brand_name: companyName,
        },
      }
    );
  } catch {
    // Billing setup is optional
  }

  return step3Response;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as AddUserSignupRequest;

    if (
      !payload?.email ||
      !payload?.password ||
      !payload?.first_name ||
      !payload?.org_name
    ) {
      return NextResponse.json(
        {
          error: 'Organization, email, password, and first name are required.',
        },
        { status: 400 }
      );
    }

    if (!payload?.role) {
      return NextResponse.json({ error: 'Role is required.' }, { status: 400 });
    }

    const environment = resolveEnvironment(payload.environment);

    let finalResponse: SignupApiResponse;
    try {
      finalResponse = await runSignupFlow(payload, environment);
    } catch (signupError) {
      const isStageIncompleteError =
        signupError instanceof SignupStepError &&
        signupError.step === 'STEP3_COMPLETE_SIGNUP' &&
        signupError.status === 400 &&
        signupError.message.toLowerCase().includes('auth stages') &&
        environment === 'development';

      if (!isStageIncompleteError) {
        throw signupError;
      }

      finalResponse = await runSignupFlow(payload, 'staging');
    }

    return NextResponse.json(finalResponse);
  } catch (error) {
    if (error instanceof SignupStepError) {
      return NextResponse.json(
        {
          error: error.message,
          step: error.step,
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to create user at the moment. Please try again.',
      },
      { status: 500 }
    );
  }
}
