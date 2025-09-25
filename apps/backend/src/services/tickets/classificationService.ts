import { ticketRepository } from "../../repositories/ticketRepository";
import { openai } from "../../utils/openai";
import logger from "../../utils/logger";

export class ClassificationService {
  /**
   * Classify a ticket and update its category
   */
  async classifyTicket(ticketId: number): Promise<string> {
    try {
      logger.info("Starting ticket classification", { ticketId });

      // Get the ticket
      const ticket = await ticketRepository.findById(ticketId);
      if (!ticket) {
        throw new Error(`Ticket with ID ${ticketId} not found`);
      }

      // Generate embedding for the ticket content
      const ticketContent = `${ticket.subject}\n\n${ticket.body}`;
      const embedding = await openai.generateEmbedding(ticketContent);

      // Classify the ticket using OpenAI
      const category = await openai.classifyTicket(ticket.subject, ticket.body);

      // Update the ticket with the new category and embedding
      await ticketRepository.update(ticketId, {
        category,
        embedding,
      });

      logger.info("Ticket classification completed", {
        ticketId,
        category,
        embeddingGenerated: !!embedding,
      });

      return category;
    } catch (error) {
      logger.error("Failed to classify ticket", { error, ticketId });
      throw error;
    }
  }

  /**
   * Classify multiple tickets in batch
   */
  async classifyTicketsBatch(
    ticketIds: number[]
  ): Promise<Array<{ ticketId: number; category: string }>> {
    try {
      logger.info("Starting batch ticket classification", {
        ticketCount: ticketIds.length,
      });

      const results = [];

      for (const ticketId of ticketIds) {
        try {
          const category = await this.classifyTicket(ticketId);
          results.push({ ticketId, category });
        } catch (error) {
          logger.error("Failed to classify ticket in batch", {
            error,
            ticketId,
          });
          results.push({ ticketId, category: "General" }); // Default fallback
        }
      }

      logger.info("Batch classification completed", {
        totalProcessed: ticketIds.length,
        successful: results.length,
      });

      return results;
    } catch (error) {
      logger.error("Failed to classify tickets in batch", { error, ticketIds });
      throw error;
    }
  }
}

export const classificationService = new ClassificationService();
export default classificationService;
