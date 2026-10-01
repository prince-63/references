import { logger } from './logger';

export interface ApiError {
  message: string;
  userMessage: string;
  status?: number;
  details?: Record<string, unknown>;
}

export function handleApiError(error: unknown, context?: string): ApiError {
  const errorObj = error as Record<string, unknown> & {
    message?: string;
    response?: Record<string, unknown>;
  };
  const errorForLogging = error instanceof Error ? error : undefined;
  logger.error(
    `API Error${context ? ` in ${context}` : ''}`,
    {},
    errorForLogging
  );

  let data: Record<string, unknown> | undefined;

  if (errorObj.response) {
    const status = (errorObj.response as Record<string, unknown>)
      .status as number;
    data = (errorObj.response as Record<string, unknown>).data as
      | Record<string, unknown>
      | undefined;

    switch (status) {
      case 400:
        return {
          message: (data?.error as string | undefined) || 'Bad request',
          userMessage:
            'Please check that all information is correct and try again.',
          status,
          details: data,
        };
      case 401:
        return {
          message: 'Unauthorized',
          userMessage:
            'Your session has ended. Please log in again to continue.',
          status,
        };
      case 403:
        return {
          message: 'Forbidden',
          userMessage:
            'You do not have access to this action. Please contact support if you believe this is an error.',
          status,
        };
      case 404:
        return {
          message: 'Not found',
          userMessage:
            'The requested information could not be found. It may have been deleted or moved.',
          status,
        };
      case 409:
        return {
          message: (data?.error as string | undefined) || 'Conflict',
          userMessage:
            'This action could not be completed because there is a conflict with existing data. Please refresh and try again.',
          status,
          details: data,
        };
      case 422:
        return {
          message: (data?.error as string | undefined) || 'Validation error',
          userMessage:
            'Some information was not filled out correctly. Please review your entries and try again.',
          status,
          details: data,
        };
      case 500:
        return {
          message: 'Internal server error',
          userMessage:
            'Something went wrong on our end. Please try again in a moment.',
          status,
        };
      case 503:
        return {
          message: 'Service unavailable',
          userMessage:
            'The service is temporarily unavailable. Please try again in a few moments.',
          status,
        };
      default:
        return {
          message: (data?.error as string | undefined) || 'Request failed',
          userMessage: 'The request could not be completed. Please try again.',
          status,
          details: data,
        };
    }
  }

  if (
    errorObj.message &&
    typeof errorObj.message === 'string' &&
    errorObj.message.includes('fetch')
  ) {
    return {
      message: 'Network error',
      userMessage:
        'Unable to connect to the server. Please check your internet connection and try again.',
    };
  }

  if (
    errorObj.message &&
    typeof errorObj.message === 'string' &&
    errorObj.message.includes('timeout')
  ) {
    return {
      message: 'Request timeout',
      userMessage: 'The request took too long. Please try again.',
    };
  }

  return {
    message:
      (typeof errorObj.message === 'string' ? errorObj.message : null) ||
      'Unknown error',
    userMessage:
      'Something unexpected happened. Please try again. If the problem continues, please contact support.',
    details: data as Record<string, unknown> | undefined,
  };
}

export function getUserFriendlyMessage(
  context: string,
  action: 'fetch' | 'save' | 'delete' | 'update'
): Record<'success' | 'error', string> {
  const messages = {
    fetch: {
      success: `${context} loaded successfully`,
      error: `Unable to load ${context.toLowerCase()}. Please try again.`,
    },
    save: {
      success: `${context} saved successfully`,
      error: `Unable to save ${context.toLowerCase()}. Please try again.`,
    },
    delete: {
      success: `${context} deleted successfully`,
      error: `Unable to delete ${context.toLowerCase()}. Please try again.`,
    },
    update: {
      success: `${context} updated successfully`,
      error: `Unable to update ${context.toLowerCase()}. Please try again.`,
    },
  };

  return messages[action];
}
