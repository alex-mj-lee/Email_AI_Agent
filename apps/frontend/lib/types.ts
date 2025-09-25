export type TicketStatus =
  | "New"
  | "AI-Drafted"
  | "Pending Review"
  | "Sent"
  | "Escalated"
  | "Processing Failed";
export type TicketCategory = "Refund" | "Payment" | "Invoice" | "Other";

export interface Ticket {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  category: TicketCategory;
  status: TicketStatus;
  receivedDate: string;
  aiResponse?: string;
}

export interface TicketStats {
  total: number;
  byStatus: Record<TicketStatus, number>;
}

export interface CreateTicketRequest {
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  category: TicketCategory;
}

export interface UpdateTicketRequest {
  aiDraft?: string;
  aiResponse?: string;
  status?: TicketStatus;
}
