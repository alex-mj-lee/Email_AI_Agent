import { ticketRepository } from "../../repositories/ticketRepository";
import { openai } from "../../utils/openai";
import logger from "../../utils/logger";

export interface TicketProcessingResult {
  ticketId: number;
  category: string;
  priority: string;
  similarTickets: any[];
  status: string;
}

export class TicketProcessingService {
  /**
   * Process a ticket asynchronously: classify, prioritize, find similar tickets
   */
  async processTicketAsync(
    ticketId: number,
    subject: string,
    body: string
  ): Promise<TicketProcessingResult> {
    try {
      logger.info("Starting automated ticket processing", { ticketId });

      // Generate embedding for the ticket content
      const ticketContent = `${subject}\n\n${body}`;
      const embedding = await openai.generateEmbedding(ticketContent);

      // Auto-classify the ticket
      const category = await openai.classifyTicket(subject, body);

      // Auto-prioritize based on content analysis
      const priority = await this.analyzePriority(subject, body, category);

      // Find similar tickets for reference
      const similarTickets = (await ticketRepository.findSimilarTickets(
        embedding,
        3
      )) as any[];

      // Update ticket with all the processed information
      await ticketRepository.update(ticketId, {
        category,
        embedding,
        priority,
        status: "Processed", // New status indicating auto-processing is complete
      });

      logger.info("Automated ticket processing completed", {
        ticketId,
        category,
        priority,
        similarTicketsFound: similarTickets.length,
      });

      return {
        ticketId,
        category,
        priority,
        similarTickets,
        status: "Processed",
      };
    } catch (error) {
      logger.error("Failed to process ticket", { error, ticketId });
      // Update ticket status to indicate processing failed
      await ticketRepository.update(ticketId, {
        status: "Processing Failed",
      });
      throw error;
    }
  }

  /**
   * Analyze ticket priority based on content and category
   */
  async analyzePriority(
    subject: string,
    body: string,
    category: string
  ): Promise<string> {
    try {
      const urgencyKeywords = [
        "urgent",
        "emergency",
        "not working",
        "critical",
        "immediate",
        "asap",
      ];
      const content = `${subject} ${body}`.toLowerCase();

      // Check for urgency keywords
      const hasUrgencyKeywords = urgencyKeywords.some((keyword) =>
        content.includes(keyword)
      );

      // Category-based priority
      const categoryPriority: Record<string, string> = {
        "Payment Failure": "high",
        "Technical Issue": "medium",
        Refund: "medium",
        Account: "medium",
        Invoice: "low",
        General: "low",
      };

      // Determine priority
      if (hasUrgencyKeywords) {
        return "high";
      }

      return categoryPriority[category] || "medium";
    } catch (error) {
      logger.error("Failed to analyze priority", { error });
      return "medium"; // Default fallback
    }
  }

  /**
   * Get enhanced ticket information with similar tickets and suggested actions
   */
  async getEnhancedTicket(ticketId: number): Promise<any> {
    try {
      logger.info("Getting enhanced ticket", { ticketId });

      // Get the ticket with embedding
      const ticket = await ticketRepository.findByIdWithEmbedding(ticketId);

      if (!ticket) {
        logger.warn("Ticket not found for enhanced view", { ticketId });
        throw new Error(`Ticket with ID ${ticketId} not found`);
      }

      logger.info("Ticket found, processing enhancement", {
        ticketId,
        hasEmbedding: !!ticket.embedding,
        status: ticket.status,
      });

      // Find similar tickets if embedding exists
      let similarTickets: any[] = [];
      if (ticket.embedding) {
        try {
          logger.debug("Finding similar tickets using embedding", { ticketId });
          const similarTicketsResult =
            (await ticketRepository.findSimilarTickets(
              ticket.embedding,
              3
            )) as any[];
          similarTickets = similarTicketsResult;
          logger.info("Similar tickets found", {
            ticketId,
            similarTicketsCount: similarTickets.length,
          });
        } catch (error) {
          logger.warn("Failed to find similar tickets", { error, ticketId });
          // Continue without similar tickets
        }
      } else {
        logger.info("No embedding available for similar ticket search", {
          ticketId,
        });
      }

      const enhancedTicket = {
        ...ticket,
        similarTickets,
        hasSimilarTickets: similarTickets.length > 0,
        canGenerateDraft:
          ticket.status === "Processed" ||
          ticket.status === "New" ||
          ticket.status === "AI-Drafted",
        suggestedActions: this.getSuggestedActions(
          ticket.status,
          ticket.priority || "medium"
        ),
      };

      logger.info("Enhanced ticket prepared successfully", { ticketId });
      return enhancedTicket;
    } catch (error) {
      logger.error("Failed to get enhanced ticket", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        ticketId,
      });
      throw error;
    }
  }

  /**
   * Get suggested actions based on ticket status and priority
   */
  private getSuggestedActions(status: string, priority: string): string[] {
    const actions: string[] = [];

    switch (status) {
      case "New":
        actions.push("Wait for auto-processing");
        break;
      case "Processed":
        actions.push("Generate AI Draft");
        actions.push("View Similar Tickets");
        if (priority === "high") {
          actions.push("Prioritize Response");
        }
        break;
      case "AI-Drafted":
        actions.push("Review AI Response");
        actions.push("Edit Response");
        actions.push("Approve and Send");
        actions.push("Escalate to Human");
        break;
      case "Processing Failed":
        actions.push("Retry Processing");
        actions.push("Manual Classification");
        break;
    }

    return actions;
  }
}

export const ticketProcessingService = new TicketProcessingService();
export default ticketProcessingService;
