import { Response } from "express";
import { ApiResponse, PaginatedResponse } from "../types";

export class ResponseHandler {
  static success<T>(
    res: Response,
    data?: T,
    message: string = "Success",
    statusCode: number = 200
  ): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    error: string = "Internal server error",
    statusCode: number = 500
  ): Response<ApiResponse> {
    const response: ApiResponse = {
      success: false,
      error,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = "Success"
  ): Response<PaginatedResponse<T>> {
    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    return res.status(200).json(response);
  }

  static created<T>(
    res: Response,
    data?: T,
    message: string = "Resource created successfully"
  ): Response<ApiResponse<T>> {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static badRequest(
    res: Response,
    error: string = "Bad request"
  ): Response<ApiResponse> {
    return this.error(res, error, 400);
  }

  static unauthorized(
    res: Response,
    error: string = "Unauthorized"
  ): Response<ApiResponse> {
    return this.error(res, error, 401);
  }

  static forbidden(
    res: Response,
    error: string = "Forbidden"
  ): Response<ApiResponse> {
    return this.error(res, error, 403);
  }

  static notFound(
    res: Response,
    error: string = "Resource not found"
  ): Response<ApiResponse> {
    return this.error(res, error, 404);
  }

  static conflict(
    res: Response,
    error: string = "Conflict"
  ): Response<ApiResponse> {
    return this.error(res, error, 409);
  }

  static validationError(
    res: Response,
    error: string = "Validation error"
  ): Response<ApiResponse> {
    return this.error(res, error, 422);
  }
}
