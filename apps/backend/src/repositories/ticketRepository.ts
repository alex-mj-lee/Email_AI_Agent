import { prisma } from "../config/database";
import logger from "../utils/logger";

export interface TicketFilters {
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface CreateTicketData {
  customerName: string;
  email: string;
  subject: string;
  body: string;
  category?: string;
  aiResponse?: string;
  embedding?: number[];
  status?: string;
  priority?: string;
}

export class TicketRepository {
  /**
   * Create a new ticket
   */
  async create(data: CreateTicketData) {
    try {
      logger.debug("Creating new ticket", {
        customerName: data.customerName,
        subject: data.subject,
      });

      // Create ticket without embedding first using Prisma
      const ticketData = {
        customerName: data.customerName,
        email: data.email,
        subject: data.subject,
        body: data.body,
        category: data.category || null,
        aiResponse: data.aiResponse || null,
        status: data.status || "New",
        priority: data.priority || "medium",
      };

      const ticket = await prisma.ticket.create({
        data: ticketData,
      });

      logger.info("Ticket created successfully", { ticketId: ticket.id });

      // If embedding is provided, update the ticket with embedding using raw SQL
      if (data.embedding) {
        try {
          await prisma.$queryRaw`
            UPDATE tickets 
            SET embedding = ${data.embedding}::vector 
            WHERE id = ${ticket.id}
          `;
          logger.info("Ticket embedding updated successfully", {
            ticketId: ticket.id,
          });
        } catch (embeddingError) {
          logger.warn("Failed to update ticket embedding", {
            error: embeddingError,
            ticketId: ticket.id,
          });
          // Don't throw error here as the ticket was created successfully
        }
      }

      return ticket;
    } catch (error) {
      logger.error("Failed to create ticket", { error, data });
      throw error;
    }
  }

  /**
   * Get ticket by ID
   */
  async findById(id: number) {
    try {
      logger.debug("Finding ticket by ID", { ticketId: id });

      const ticket = await prisma.ticket.findUnique({
        where: { id },
      });

      if (!ticket) {
        logger.warn("Ticket not found", { ticketId: id });
        return null;
      }

      logger.debug("Ticket found", { ticketId: id });
      return ticket;
    } catch (error) {
      logger.error("Failed to find ticket by ID", { error, ticketId: id });
      throw error;
    }
  }

  /**
   * Get ticket by ID with embedding data
   */
  async findByIdWithEmbedding(id: number) {
    try {
      logger.debug("Finding ticket by ID with embedding", { ticketId: id });

      // First try to get the basic ticket data
      const ticket = await prisma.ticket.findUnique({
        where: { id },
      });

      if (!ticket) {
        logger.warn("Ticket not found", { ticketId: id });
        return null;
      }

      // Try to get embedding separately if needed
      let ticketWithEmbedding = {
        id: ticket.id,
        customerName: ticket.customerName,
        email: ticket.email,
        subject: ticket.subject,
        body: ticket.body,
        category: ticket.category,
        aiResponse: ticket.aiResponse,
        status: ticket.status,
        priority: ticket.priority,
        receivedAt: ticket.receivedAt,
        embedding: null as any,
      };

      // Try to get embedding with raw SQL if possible
      try {
        const embeddingResult = await prisma.$queryRaw`
          SELECT id, embedding::text as embedding_text FROM tickets WHERE id = ${id}
        `;
        if (Array.isArray(embeddingResult) && embeddingResult.length > 0) {
          const result = embeddingResult[0] as any;
          if (result.embedding_text && result.embedding_text !== "null") {
            // Parse the vector text format to array
            const embeddingText = result.embedding_text.replace(/[\[\]]/g, "");
            ticketWithEmbedding.embedding = embeddingText
              .split(",")
              .map((val: string) => parseFloat(val.trim()));
          }
        }
      } catch (embeddingError) {
        logger.warn("Could not retrieve embedding data", {
          error: embeddingError,
          ticketId: id,
        });
        // Continue without embedding
      }

      logger.debug("Ticket found with embedding", {
        ticketId: id,
        hasEmbedding: !!ticketWithEmbedding.embedding,
      });
      return ticketWithEmbedding;
    } catch (error) {
      logger.error("Failed to find ticket by ID with embedding", {
        error,
        ticketId: id,
      });
      throw error;
    }
  }

  /**
   * Get all tickets with optional filters
   */
  async findAll(filters: TicketFilters = {}) {
    try {
      const { status, category, page = 1, limit = 10 } = filters;
      const skip = (page - 1) * limit;

      logger.debug("Finding tickets with filters", { filters });

      const where: any = {};
      if (status) where.status = status;
      if (category) where.category = category;

      const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
          where,
          orderBy: { receivedAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.ticket.count({ where }),
      ]);

      logger.info("Tickets retrieved successfully", {
        count: tickets.length,
        total,
        page,
        limit,
      });

      return {
        tickets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Failed to find tickets", { error, filters });
      throw error;
    }
  }

  /**
   * Update ticket
   */
  async update(id: number, data: Partial<CreateTicketData>) {
    try {
      logger.debug("Updating ticket", {
        ticketId: id,
        updateData: Object.keys(data),
      });

      // Handle embedding updates with raw SQL
      if (data.embedding) {
        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        if (data.customerName) {
          updateFields.push(`customer_name = $${paramIndex++}`);
          values.push(data.customerName);
        }
        if (data.email) {
          updateFields.push(`email = $${paramIndex++}`);
          values.push(data.email);
        }
        if (data.subject) {
          updateFields.push(`subject = $${paramIndex++}`);
          values.push(data.subject);
        }
        if (data.body) {
          updateFields.push(`body = $${paramIndex++}`);
          values.push(data.body);
        }
        if (data.category) {
          updateFields.push(`category = $${paramIndex++}`);
          values.push(data.category);
        }
        if (data.aiResponse) {
          updateFields.push(`ai_response = $${paramIndex++}`);
          values.push(data.aiResponse);
        }
        if (data.status) {
          updateFields.push(`status = $${paramIndex++}`);
          values.push(data.status);
        }

        updateFields.push(`embedding = $${paramIndex++}::vector`);
        values.push(data.embedding);

        const query = `
          UPDATE tickets 
          SET ${updateFields.join(", ")}
          WHERE id = $${paramIndex}
          RETURNING *
        `;
        values.push(id);

        const result = await prisma.$queryRawUnsafe(query, ...values);
        const ticket = (result as any[])[0];

        logger.info("Ticket updated successfully", { ticketId: id });
        return ticket;
      } else {
        // Update without embedding
        const ticket = await prisma.ticket.update({
          where: { id },
          data,
        });

        logger.info("Ticket updated successfully", { ticketId: id });
        return ticket;
      }
    } catch (error) {
      logger.error("Failed to update ticket", { error, ticketId: id });
      throw error;
    }
  }

  /**
   * Find similar tickets using vector similarity search
   */
  async findSimilarTickets(embedding: number[], limit: number = 3) {
    try {
      logger.debug("Finding similar tickets using vector search", { limit });

      // Using raw SQL for vector similarity search with pgvector
      const similarTickets = await prisma.$queryRaw`
        SELECT 
          id,
          customer_name as "customerName",
          email,
          subject,
          body,
          category,
          ai_response as "aiResponse",
          status,
          received_at as "receivedAt",
          1 - (embedding <=> ${embedding}::vector) as similarity
        FROM tickets 
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> ${embedding}::vector
        LIMIT ${limit}
      `;

      logger.info("Similar tickets found", {
        count: (similarTickets as any[]).length,
      });

      return similarTickets;
    } catch (error) {
      logger.error("Failed to find similar tickets", { error });
      throw error;
    }
  }

  /**
   * Update ticket status
   */
  async updateStatus(id: number, status: string) {
    try {
      logger.debug("Updating ticket status", { ticketId: id, status });

      const ticket = await prisma.ticket.update({
        where: { id },
        data: { status },
      });

      logger.info("Ticket status updated successfully", {
        ticketId: id,
        status,
      });
      return ticket;
    } catch (error) {
      logger.error("Failed to update ticket status", {
        error,
        ticketId: id,
        status,
      });
      throw error;
    }
  }

  /**
   * Update AI response
   */
  async updateAiResponse(id: number, aiResponse: string) {
    try {
      logger.debug("Updating AI response", {
        ticketId: id,
        responseLength: aiResponse.length,
      });

      const ticket = await prisma.ticket.update({
        where: { id },
        data: { aiResponse },
      });

      logger.info("AI response updated successfully", { ticketId: id });
      return ticket;
    } catch (error) {
      logger.error("Failed to update AI response", { error, ticketId: id });
      throw error;
    }
  }

  /**
   * Update ticket category
   */
  async updateCategory(id: number, category: string) {
    try {
      logger.debug("Updating ticket category", { ticketId: id, category });

      const ticket = await prisma.ticket.update({
        where: { id },
        data: { category },
      });

      logger.info("Ticket category updated successfully", {
        ticketId: id,
        category,
      });
      return ticket;
    } catch (error) {
      logger.error("Failed to update ticket category", {
        error,
        ticketId: id,
        category,
      });
      throw error;
    }
  }
}

export const ticketRepository = new TicketRepository();
export default ticketRepository;
