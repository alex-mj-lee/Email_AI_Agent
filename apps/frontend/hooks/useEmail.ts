import useSWR, { mutate } from 'swr';
import {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  TicketStatus,
} from '@/lib/types';
import { config } from '@/lib/config';

// Configuration
const API_BASE = config.API_BASE;

// Transform API response to match frontend expected structure
const transformTicket = (ticket: any): Ticket => ({
  id: ticket.id?.toString() || '',
  customerName: ticket.customerName || '',
  customerEmail: ticket.email || ticket.customerEmail || '',
  subject: ticket.subject || '',
  message: ticket.body || ticket.message || '',
  category: ticket.category || 'Other',
  status: ticket.status || 'New',
  receivedDate:
    ticket.receivedDate || ticket.createdAt || new Date().toISOString(),
  aiResponse: ticket.aiResponse || '',
});

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  const data = await response.json();

  // Handle tickets list endpoint
  if (url.includes('/tickets') && !url.includes('/tickets/')) {
    const ticketsArray = data.data?.tickets || data || [];
    return Array.isArray(ticketsArray) ? ticketsArray.map(transformTicket) : [];
  }

  // Handle single ticket endpoint
  if (url.includes('/tickets/') && !url.includes('/enhanced')) {
    return data.data?.ticket ? transformTicket(data.data.ticket) : null;
  }

  // Handle enhanced ticket endpoint
  if (url.includes('/enhanced')) {
    if (data.data) {
      const enhancedTicket = data.data;
      return {
        ticket: transformTicket(enhancedTicket),
        similarTickets: (enhancedTicket.similarTickets || []).map(
          transformTicket
        ),
        hasSimilarTickets: enhancedTicket.hasSimilarTickets || false,
        canGenerateDraft: enhancedTicket.canGenerateDraft || false,
        suggestedActions: enhancedTicket.suggestedActions || [],
        priority: enhancedTicket.priority || 'medium',
      };
    }
  }

  return data;
};

// API utility functions
const api = {
  getTickets: () => fetcher(`${API_BASE}/tickets`),
  getTicket: (id: string) => fetcher(`${API_BASE}/tickets/${id}`),
  getEnhancedTicket: (id: string) =>
    fetcher(`${API_BASE}/tickets/${id}/enhanced`),

  createTicket: async (data: CreateTicketRequest): Promise<Ticket> => {
    const response = await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create ticket');
    return response.json();
  },

  approveTicket: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/tickets/${id}/approve`, {
      method: 'PUT',
    });
    if (!response.ok) throw new Error('Failed to approve ticket');
  },

  escalateTicket: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/tickets/${id}/escalate`, {
      method: 'PUT',
    });
    if (!response.ok) throw new Error('Failed to escalate ticket');
  },

  updateTicket: async (
    id: string,
    data: UpdateTicketRequest
  ): Promise<void> => {
    const response = await fetch(`${API_BASE}/tickets/${id}/edit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update ticket');
  },

  generateDraft: async (id: string): Promise<string> => {
    const response = await fetch(`${API_BASE}/tickets/${id}/generateDraft`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to generate draft');

    const data = await response.json();
    return data.aiResponse || data.data?.aiResponse || data.message || '';
  },
};

// Main hook
export function useEmail() {
  const {
    data: tickets = [],
    error: ticketsError,
    isLoading: ticketsLoading,
    mutate: mutateTickets,
  } = useSWR<Ticket[]>(
    `${API_BASE}/tickets`,
    api.getTickets,
    config.SWR_CONFIG
  );

  // Calculate statistics
  const allStatuses: TicketStatus[] = [
    'New',
    'AI-Drafted',
    'Pending Review',
    'Sent',
    'Escalated',
  ];

  const stats = {
    total: Array.isArray(tickets) ? tickets.length : 0,
    byStatus: allStatuses.reduce(
      (acc, status) => {
        acc[status] = Array.isArray(tickets)
          ? tickets.filter(t => t.status === status).length
          : 0;
        return acc;
      },
      {} as Record<TicketStatus, number>
    ),
  };

  // Create new ticket
  const createTicket = async (data: CreateTicketRequest) => {
    const newTicket = await api.createTicket(data);
    const currentTickets = Array.isArray(tickets) ? tickets : [];
    mutateTickets([...currentTickets, newTicket], false);
    return newTicket;
  };

  // Approve and send ticket
  const approveTicket = async (id: string) => {
    await api.approveTicket(id);
    const currentTickets = Array.isArray(tickets) ? tickets : [];
    mutateTickets(
      currentTickets.map(t =>
        t.id === id ? { ...t, status: 'Sent' as TicketStatus } : t
      ),
      false
    );
  };

  // Escalate ticket
  const escalateTicket = async (id: string) => {
    await api.escalateTicket(id);
    const currentTickets = Array.isArray(tickets) ? tickets : [];
    mutateTickets(
      currentTickets.map(t =>
        t.id === id ? { ...t, status: 'Escalated' as TicketStatus } : t
      ),
      false
    );
  };

  // Update ticket
  const updateTicket = async (id: string, data: UpdateTicketRequest) => {
    await api.updateTicket(id, data);
    const currentTickets = Array.isArray(tickets) ? tickets : [];
    mutateTickets(
      currentTickets.map(t => (t.id === id ? { ...t, ...data } : t)),
      false
    );
  };

  // Generate AI draft
  const generateDraft = async (id: string): Promise<string> => {
    const aiResponse = await api.generateDraft(id);
    const currentTickets = Array.isArray(tickets) ? tickets : [];
    mutateTickets(
      currentTickets.map(t => (t.id === id ? { ...t, aiResponse } : t)),
      false
    );
    return aiResponse;
  };

  // Filter and search utilities
  const getFilteredTickets = (
    statusFilter?: TicketStatus,
    categoryFilter?: string
  ) => {
    const currentTickets = Array.isArray(tickets) ? tickets : [];
    return currentTickets.filter(ticket => {
      const statusMatch = !statusFilter || ticket.status === statusFilter;
      const categoryMatch =
        !categoryFilter || ticket.category === categoryFilter;
      return statusMatch && categoryMatch;
    });
  };

  const searchTickets = (query: string) => {
    const currentTickets = Array.isArray(tickets) ? tickets : [];
    const lowercaseQuery = query.toLowerCase();
    return currentTickets.filter(
      ticket =>
        ticket.customerName.toLowerCase().includes(lowercaseQuery) ||
        ticket.customerEmail.toLowerCase().includes(lowercaseQuery) ||
        ticket.subject.toLowerCase().includes(lowercaseQuery) ||
        ticket.message.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    // Data
    tickets,
    stats,

    // Loading states
    ticketsLoading,
    ticketsError,

    // Mutations
    createTicket,
    approveTicket,
    escalateTicket,
    updateTicket,
    generateDraft,

    // Utilities
    getFilteredTickets,
    searchTickets,
    refreshTickets: () => mutateTickets(),
  };
}

// Individual hooks for specific use cases
export function useTicket(id: string) {
  return useSWR<Ticket>(
    id ? `${API_BASE}/tickets/${id}` : null,
    () => api.getTicket(id),
    { revalidateOnFocus: false }
  );
}

export function useEnhancedTicket(id: string) {
  return useSWR<any>(
    id ? `${API_BASE}/tickets/${id}/enhanced` : null,
    () => api.getEnhancedTicket(id),
    { revalidateOnFocus: false }
  );
}
