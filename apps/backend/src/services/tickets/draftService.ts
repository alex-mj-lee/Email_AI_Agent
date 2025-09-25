import { ticketRepository } from "../../repositories/ticketRepository";
import { openai } from "../../utils/openai";
import logger from "../../utils/logger";
import { prisma } from "../../config/database";

export class DraftService {
  /**
   * Generate AI draft response for a ticket
   */
  async generateDraft(ticketId: number): Promise<string> {
    try {
      logger.info("Starting AI draft generation", { ticketId });

      // Get the ticket
      const ticket = await ticketRepository.findById(ticketId);
      if (!ticket) {
        throw new Error(`Ticket with ID ${ticketId} not found`);
      }

      // Generate embedding if it doesn't exist
      let ticketEmbedding: number[] | null = null;
      try {
        const ticketContent = `${ticket.subject}\n\n${ticket.body}`;
        ticketEmbedding = await openai.generateEmbedding(ticketContent);

        // Update the ticket with the embedding
        await ticketRepository.update(ticketId, {
          embedding: ticketEmbedding,
        });

        logger.info("Generated and saved embedding for ticket", { ticketId });
      } catch (embeddingError) {
        logger.warn("Failed to generate embedding", {
          error: embeddingError,
          ticketId,
        });
      }

      // Find similar tickets for context
      let similarTickets: any[] = [];
      if (ticketEmbedding) {
        try {
          const similarTicketsResult =
            await ticketRepository.findSimilarTickets(ticketEmbedding, 3);
          similarTickets = similarTicketsResult as any[];
          logger.info("Found similar tickets for context", {
            ticketId,
            similarCount: similarTickets.length,
          });
        } catch (error) {
          logger.warn(
            "Failed to find similar tickets, proceeding without context",
            { error, ticketId }
          );
        }
      }

      // Generate the draft response
      const draftResponse = await openai.generateDraftResponse(
        ticket.subject,
        ticket.body,
        ticket.category || "General",
        similarTickets.map((t) => ({
          subject: t.subject,
          body: t.body,
          aiResponse: t.aiResponse,
        }))
      );

      // Update the ticket with the AI response and set status to AI-Drafted
      await ticketRepository.update(ticketId, {
        aiResponse: draftResponse,
        status: "AI-Drafted",
      });

      logger.info("AI draft generated successfully", {
        ticketId,
        responseLength: draftResponse.length,
        similarTicketsUsed: similarTickets.length,
      });

      return draftResponse;
    } catch (error) {
      logger.error("Failed to generate AI draft", { error, ticketId });
      throw error;
    }
  }

  /**
   * Regenerate AI draft response (useful when category changes)
   */
  async regenerateDraft(ticketId: number): Promise<string> {
    try {
      logger.info("Regenerating AI draft", { ticketId });

      // First, reclassify the ticket to ensure we have the latest category
      const { classificationService } = await import("./classificationService");
      await classificationService.classifyTicket(ticketId);

      // Then generate a new draft
      return await this.generateDraft(ticketId);
    } catch (error) {
      logger.error("Failed to regenerate AI draft", { error, ticketId });
      throw error;
    }
  }

  /**
   * Update the AI draft response manually
   */
  async updateDraft(ticketId: number, newResponse: string): Promise<void> {
    try {
      logger.info("Updating AI draft manually", {
        ticketId,
        responseLength: newResponse.length,
      });

      await ticketRepository.updateAiResponse(ticketId, newResponse);

      logger.info("AI draft updated successfully", { ticketId });
    } catch (error) {
      logger.error("Failed to update AI draft", { error, ticketId });
      throw error;
    }
  }
}

export const draftService = new DraftService();
export default draftService;
