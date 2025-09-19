export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
}

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  statusCode: number;
  timestamp: string;
}
