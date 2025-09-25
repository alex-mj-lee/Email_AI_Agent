import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../utils/response";

export class ErrorHandler {
  static handle(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    let error = { ...err };
    error.message = err.message;

    // Log error
    console.error("Error:", {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
      const message = "Resource not found";
      error = new AppError(message, 404);
    }

    // Mongoose duplicate key
    if (err.name === "MongoError" && (err as any).code === 11000) {
      const message = "Duplicate field value entered";
      error = new AppError(message, 400);
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
      const message = Object.values((err as any).errors)
        .map((val: any) => val.message)
        .join(", ");
      error = new AppError(message, 400);
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
      const message = "Invalid token";
      error = new AppError(message, 401);
    }

    if (err.name === "TokenExpiredError") {
      const message = "Token expired";
      error = new AppError(message, 401);
    }

    // Default error
    const statusCode = (error as AppError).statusCode || 500;
    const message = error.message || "Internal server error";

    ResponseHandler.error(res, message, statusCode);
  }

  static notFound(req: Request, res: Response, next: NextFunction): void {
    const error = new AppError(`Route not found - ${req.originalUrl}`, 404);
    next(error);
  }
}

// Custom AppError class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
