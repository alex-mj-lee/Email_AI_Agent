import { Request, Response } from "express";
import { ticketRepository } from "../repositories/ticketRepository";
import { classificationService } from "../services/tickets/classificationService";
import { draftService } from "../services/tickets/draftService";
import { workflowService } from "../services/tickets/workflowService";
import { ticketProcessingService } from "../services/tickets/ticketProcessingService";
import { ResponseHandler } from "../utils/response";
import logger from "../utils/logger";

export class TicketController {
  /**
   * Get all tickets with optional filters
   */
  static async getTickets(req: Request, res: Response): Promise<void> {
    try {
      const { status, category, page, limit } = req.query;

      const filters = {
        status: status as string,
        category: category as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      };

      const result = await ticketRepository.findAll(filters);

      ResponseHandler.success(res, result, "Tickets retrieved successfully");
    } catch (error) {
      logger.error("Failed to get tickets", { error });
      ResponseHandler.error(res, "Failed to retrieve tickets");
    }
  }

  /**
   * Submit a new ticket with automated processing
   */
  static async submitTicket(req: Request, res: Response): Promise<void> {
    try {
      const { customerName, customerEmail, subject, message, category } =
        req.body;
      logger.info("New ticket submitted", {
        customerName,
        customerEmail,
        subject,
        category,
      });

      // Map frontend fields to backend fields
      const email = customerEmail;
      const body = message;

      // Validate required fields
      if (!customerName || !email || !subject || !body) {
        ResponseHandler.badRequest(
          res,
          "Missing required fields: customerName, customerEmail, subject, message"
        );
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        ResponseHandler.badRequest(res, "Invalid email format");
        return;
      }

      // Step 1: Create the ticket first
      const ticket = await ticketRepository.create({
        customerName,
        email,
        subject,
        body,
        status: "New",
        category: category || null,
      });

      // Step 2: Auto-classify and auto-prioritize (async - don't block response)

      ticketProcessingService
        .processTicketAsync(ticket.id, subject, body)
        .catch((error) => {
          logger.error("Failed to process ticket asynchronously", {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            ticketId: ticket.id,
          });
        });

      ResponseHandler.success(
        res,
        {
          ticket,
          message:
            "Ticket submitted successfully. Auto-classification and prioritization in progress.",
        },
        "Ticket submitted successfully",
        201
      );
    } catch (error) {
      logger.error("Failed to submit ticket", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        body: req.body,
      });
      ResponseHandler.error(res, "Failed to submit ticket");
    }
  }

  /**
   * Get a single ticket by ID
   */
  static async getTicket(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.id);

      if (isNaN(ticketId)) {
        ResponseHandler.badRequest(res, "Invalid ticket ID");
        return;
      }

      const ticket = await ticketRepository.findById(ticketId);

      if (!ticket) {
        ResponseHandler.notFound(res, "Ticket not found");
        return;
      }

      ResponseHandler.success(res, ticket, "Ticket retrieved successfully");
    } catch (error) {
      logger.error("Failed to get ticket", { error, ticketId: req.params.id });
      ResponseHandler.error(res, "Failed to retrieve ticket");
    }
  }

  /**
   * Get enhanced ticket information with similar tickets
   */
  static async getEnhancedTicket(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.id);

      if (isNaN(ticketId)) {
        ResponseHandler.badRequest(res, "Invalid ticket ID");
        return;
      }

      const enhancedTicket = await ticketProcessingService.getEnhancedTicket(
        ticketId
      );

      ResponseHandler.success(
        res,
        enhancedTicket,
        "Enhanced ticket retrieved successfully"
      );
    } catch (error) {
      logger.error("Failed to get enhanced ticket", {
        error,
        ticketId: req.params.id,
      });
      ResponseHandler.error(res, "Failed to retrieve enhanced ticket");
    }
  }

  /**
   * Classify a ticket
   */
  static async classifyTicket(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.id);

      if (isNaN(ticketId)) {
        ResponseHandler.badRequest(res, "Invalid ticket ID");
        return;
      }

      const category = await classificationService.classifyTicket(ticketId);

      ResponseHandler.success(
        res,
        { category },
        "Ticket classified successfully"
      );
    } catch (error) {
      logger.error("Failed to classify ticket", {
        error,
        ticketId: req.params.id,
      });
      ResponseHandler.error(res, "Failed to classify ticket");
    }
  }

  /**
   * Generate AI draft response for a ticket
   */
  static async generateDraft(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.id);

      if (isNaN(ticketId)) {
        ResponseHandler.badRequest(res, "Invalid ticket ID");
        return;
      }

      const draftResponse = await draftService.generateDraft(ticketId);
      logger.info("AI draft generated", {
        ticketId,
        responseLength: draftResponse?.length,
      });
      ResponseHandler.success(
        res,
        { aiResponse: draftResponse },
        "AI draft generated successfully"
      );
    } catch (error) {
      logger.error("Failed to generate draft", {
        error,
        ticketId: req.params.id,
      });
      ResponseHandler.error(res, "Failed to generate AI draft");
    }
  }

  /**
   * Approve a ticket (mark as sent)
   */
  static async approveTicket(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.id);

      if (isNaN(ticketId)) {
        ResponseHandler.badRequest(res, "Invalid ticket ID");
        return;
      }

      await workflowService.approveTicket(ticketId);

      ResponseHandler.success(res, null, "Ticket approved successfully");
    } catch (error) {
      logger.error("Failed to approve ticket", {
        error,
        ticketId: req.params.id,
      });

      if (
        error instanceof Error &&
        error.message.includes("Cannot approve ticket without AI response")
      ) {
        ResponseHandler.badRequest(res, error.message);
      } else {
        ResponseHandler.error(res, "Failed to approve ticket");
      }
    }
  }

  /**
   * Escalate a ticket to human agent
   */
  static async escalateTicket(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.id);
      const { reason } = req.body;

      if (isNaN(ticketId)) {
        ResponseHandler.badRequest(res, "Invalid ticket ID");
        return;
      }

      await workflowService.escalateTicket(ticketId, reason);

      ResponseHandler.success(res, null, "Ticket escalated successfully");
    } catch (error) {
      logger.error("Failed to escalate ticket", {
        error,
        ticketId: req.params.id,
      });
      ResponseHandler.error(res, "Failed to escalate ticket");
    }
  }

  /**
   * Update AI draft response
   */
  static async updateDraft(req: Request, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(req.params.id);
      const { aiResponse } = req.body;

      if (isNaN(ticketId)) {
        ResponseHandler.badRequest(res, "Invalid ticket ID");
        return;
      }

      if (!aiResponse || typeof aiResponse !== "string") {
        ResponseHandler.badRequest(
          res,
          "AI response is required and must be a string"
        );
        return;
      }

      await draftService.updateDraft(ticketId, aiResponse);

      ResponseHandler.success(res, null, "AI draft updated successfully");
    } catch (error) {
      logger.error("Failed to update draft", {
        error,
        ticketId: req.params.id,
      });
      ResponseHandler.error(res, "Failed to update AI draft");
    }
  }

  /**
   * Get workflow statistics
   */
  static async getWorkflowStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await workflowService.getWorkflowStats();

      ResponseHandler.success(
        res,
        stats,
        "Workflow statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Failed to get workflow stats", { error });
      ResponseHandler.error(res, "Failed to retrieve workflow statistics");
    }
  }
}
