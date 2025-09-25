import { ticketRepository } from "../../repositories/ticketRepository";
import logger from "../../utils/logger";

export class WorkflowService {
  /**
   * Approve a ticket (mark as sent)
   */
  async approveTicket(ticketId: number): Promise<void> {
    try {
      logger.info("Approving ticket", { ticketId });

      const ticket = await ticketRepository.findById(ticketId);
      if (!ticket) {
        throw new Error(`Ticket with ID ${ticketId} not found`);
      }

      if (!ticket.aiResponse) {
        throw new Error("Cannot approve ticket without AI response");
      }

      await ticketRepository.updateStatus(ticketId, "Sent");

      logger.info("Ticket approved successfully", { ticketId });
    } catch (error) {
      logger.error("Failed to approve ticket", { error, ticketId });
      throw error;
    }
  }

  /**
   * Escalate a ticket to human agent
   */
  async escalateTicket(ticketId: number, reason?: string): Promise<void> {
    try {
      logger.info("Escalating ticket", { ticketId, reason });

      const ticket = await ticketRepository.findById(ticketId);
      if (!ticket) {
        throw new Error(`Ticket with ID ${ticketId} not found`);
      }

      await ticketRepository.updateStatus(ticketId, "Escalated");

      logger.info("Ticket escalated successfully", { ticketId, reason });
    } catch (error) {
      logger.error("Failed to escalate ticket", { error, ticketId });
      throw error;
    }
  }

  /**
   * Set ticket to pending review
   */
  async setPendingReview(ticketId: number): Promise<void> {
    try {
      logger.info("Setting ticket to pending review", { ticketId });

      const ticket = await ticketRepository.findById(ticketId);
      if (!ticket) {
        throw new Error(`Ticket with ID ${ticketId} not found`);
      }

      await ticketRepository.updateStatus(ticketId, "Pending Review");

      logger.info("Ticket set to pending review successfully", { ticketId });
    } catch (error) {
      logger.error("Failed to set ticket to pending review", {
        error,
        ticketId,
      });
      throw error;
    }
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId: number, status: string): Promise<void> {
    try {
      logger.info("Updating ticket status", { ticketId, status });

      const validStatuses = [
        "New",
        "Processed",
        "AI-Drafted",
        "Pending Review",
        "Sent",
        "Escalated",
        "Processing Failed",
      ];
      if (!validStatuses.includes(status)) {
        throw new Error(
          `Invalid status: ${status}. Valid statuses are: ${validStatuses.join(
            ", "
          )}`
        );
      }

      const ticket = await ticketRepository.findById(ticketId);
      if (!ticket) {
        throw new Error(`Ticket with ID ${ticketId} not found`);
      }

      await ticketRepository.updateStatus(ticketId, status);

      logger.info("Ticket status updated successfully", { ticketId, status });
    } catch (error) {
      logger.error("Failed to update ticket status", {
        error,
        ticketId,
        status,
      });
      throw error;
    }
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats(): Promise<{
    new: number;
    processed: number;
    aiDrafted: number;
    pendingReview: number;
    sent: number;
    escalated: number;
    processingFailed: number;
    total: number;
  }> {
    try {
      logger.debug("Getting workflow statistics");

      const [
        newTickets,
        processed,
        aiDrafted,
        pendingReview,
        sent,
        escalated,
        processingFailed,
        total,
      ] = await Promise.all([
        ticketRepository.findAll({ status: "New" }),
        ticketRepository.findAll({ status: "Processed" }),
        ticketRepository.findAll({ status: "AI-Drafted" }),
        ticketRepository.findAll({ status: "Pending Review" }),
        ticketRepository.findAll({ status: "Sent" }),
        ticketRepository.findAll({ status: "Escalated" }),
        ticketRepository.findAll({ status: "Processing Failed" }),
        ticketRepository.findAll(),
      ]);

      const stats = {
        new: newTickets.pagination.total,
        processed: processed.pagination.total,
        aiDrafted: aiDrafted.pagination.total,
        pendingReview: pendingReview.pagination.total,
        sent: sent.pagination.total,
        escalated: escalated.pagination.total,
        processingFailed: processingFailed.pagination.total,
        total: total.pagination.total,
      };

      logger.info("Workflow statistics retrieved", stats);
      return stats;
    } catch (error) {
      logger.error("Failed to get workflow statistics", { error });
      throw error;
    }
  }
}

export const workflowService = new WorkflowService();
export default workflowService;
