import OpenAI from "openai";
import { config } from "../config/environment";
import logger from "./logger";

export class OpenAIWrapper {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  /**
   * Generate embedding for text using OpenAI
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      logger.debug("Generating embedding for text", {
        textLength: text.length,
      });

      const response = await this.client.embeddings.create({
        model: config.openai.embeddingModel,
        input: text,
      });
      const embedding = response.data[0].embedding;
      logger.debug("Embedding generated successfully", {
        embeddingLength: embedding.length,
      });

      return embedding;
    } catch (error) {
      logger.error("Failed to generate embedding", {
        error,
        text: text.substring(0, 100),
      });
      throw new Error(`Failed to generate embedding: ${error}`);
    }
  }

  /**
   * Classify ticket into categories
   */
  async classifyTicket(subject: string, body: string): Promise<string> {
    try {
      logger.debug("Classifying ticket", { subject });

      const prompt = `
        Classify the following customer support email into one of these categories:
        - Refund: Requests for money back, refunds, returns
        - Payment Failure: Failed payments, declined cards, billing issues
        - Invoice: Invoice requests, billing questions, payment confirmations
        - Technical Issue: Software bugs, login problems, feature requests
        - Account: Account management, password resets, profile changes
        - General: General inquiries, feedback, other

        Email Subject: ${subject}
        Email Body: ${body}

        Respond with only the category name (e.g., "Refund", "Payment Failure", etc.).
      `;

      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: "system",
            content:
              "You are a customer support email classifier. Respond with only the category name.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 50,
        temperature: 0.1,
      });

      const category =
        response.choices[0]?.message?.content?.trim() || "General";
      logger.info("Ticket classified successfully", { subject, category });

      return category;
    } catch (error) {
      logger.error("Failed to classify ticket", { error, subject });
      throw new Error(`Failed to classify ticket: ${error}`);
    }
  }

  /**
   * Generate AI draft response for a ticket
   */
  async generateDraftResponse(
    subject: string,
    body: string,
    category: string,
    similarTickets: Array<{
      subject: string;
      body: string;
      aiResponse?: string;
    }>
  ): Promise<string> {
    try {
      logger.debug("Generating draft response", { subject, category });

      const similarTicketsContext = similarTickets
        .map(
          (ticket) => `
          Similar Ticket:
          Subject: ${ticket.subject}
          Body: ${ticket.body}
          Response: ${ticket.aiResponse || "No response available"}
        `
        )
        .join("\n");

      const prompt = `
        You are a professional customer support agent. Generate a helpful, empathetic response to the following customer email.

        Customer Email:
        Subject: ${subject}
        Body: ${body}
        Category: ${category}

        ${
          similarTickets.length > 0
            ? `Here are some similar past tickets and their responses for reference:\n${similarTicketsContext}`
            : ""
        }

        Guidelines:
        - Be professional, empathetic, and helpful
        - Address the customer's specific concern
        - Keep the response concise but comprehensive
        - Use a friendly but professional tone
        - If you need more information, ask for it politely
        - Don't make promises you can't keep
        - Do NOT include a subject line or "Re:" prefix
        - Start directly with the greeting and response content
        - End with a professional signature

        Generate a response:
      `;

      const response = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: "system",
            content:
              "You are a professional customer support agent. Generate helpful, empathetic responses. Do not include subject lines or 'Re:' prefixes in your responses. Start directly with the greeting and provide a complete, professional response.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const draftResponse =
        response.choices[0]?.message?.content?.trim() ||
        "Unable to generate response at this time.";
      logger.info("Draft response generated successfully", {
        subject,
        responseLength: draftResponse.length,
      });

      return draftResponse;
    } catch (error) {
      logger.error("Failed to generate draft response", { error, subject });
      throw new Error(`Failed to generate draft response: ${error}`);
    }
  }
}

export const openai = new OpenAIWrapper();
export default openai;
