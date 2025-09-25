import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/environment";

// Import routes
import ticketRoutes from "./routes/tickets";

class App {
  public app: Application;
  public port: number;

  constructor() {
    this.app = express();
    this.port = config.port;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS middleware
    this.app.use(
      cors({
        origin: config.cors.allowedOrigins,
        credentials: true,
      })
    );

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Logging middleware
    if (config.nodeEnv === "development") {
      this.app.use(morgan("dev"));
    } else {
      this.app.use(morgan("combined"));
    }
  }

  private initializeRoutes(): void {
    // Health check route
    this.app.get("/api/v1/health", (req: Request, res: Response) => {
      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        version: "1.0.0",
      });
    });

    // Ticket routes
    this.app.use("/api/v1/tickets", ticketRoutes);

    // Root route
    this.app.get("/api/v1", (req: Request, res: Response) => {
      res.json({
        message: "Welcome to the AI Agent Email Backend API",
        version: "1.0.0",
        status: "running",
      });
    });

    // 404 handler
    this.app.use("*", (req: Request, res: Response) => {
      res.status(404).json({
        error: "Route not found",
        path: req.originalUrl,
      });
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error("Error:", err);

        res.status(500).json({
          error: "Internal server error",
          message:
            config.nodeEnv === "development"
              ? err.message
              : "Something went wrong",
        });
      }
    );
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server is running on port ${this.port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
    });
  }
}

export default App;
