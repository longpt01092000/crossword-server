import {
  ErrorResponse,
  SuccessResponse,
} from '../interfaces/response.interface';

export class ResponseUtil {
  static success<T>(
    data: T,
    message?: string,
    statusCode: number = 200,
  ): SuccessResponse<T> {
    return {
      success: true,
      data,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    message: string,
    error: string = 'Error',
    statusCode: number = 500,
  ): ErrorResponse {
    return {
      success: false,
      message,
      error,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  static formatErrorResponse(
    error: Error & { status?: number },
  ): ErrorResponse {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    const errorName = error.name || 'Error';

    return this.error(message, errorName, status);
  }
}
