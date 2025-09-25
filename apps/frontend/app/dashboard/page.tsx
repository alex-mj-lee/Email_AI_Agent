"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import TicketTable from "@/components/TicketTable";
import TicketModal from "@/components/TicketModal";
import { Ticket } from "@/lib/types";
import { useEmail } from "@/hooks/useEmail";

export default function Dashboard() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use the email hook for all ticket operations
  const {
    tickets,
    stats,
    ticketsLoading,
    ticketsError,
    approveTicket,
    escalateTicket,
    updateTicket,
    generateDraft,
  } = useEmail();
  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleApproveTicket = async (id: string) => {
    try {
      await approveTicket(id);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to approve ticket:", error);
    }
  };

  const handleEscalateTicket = async (id: string) => {
    try {
      await escalateTicket(id);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to escalate ticket:", error);
    }
  };

  const handleSaveDraft = async (id: string, draft: string) => {
    try {
      await updateTicket(id, { aiResponse: draft });
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  };

  const handleGenerateDraft = async (id: string): Promise<string> => {
    try {
      const newDraft = await generateDraft(id);
      // Update the selected ticket with the new draft
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket({
          ...selectedTicket,
          aiResponse: newDraft,
        });
      }
      return newDraft;
    } catch (error) {
      console.error("Failed to regenerate draft:", error);
      throw error;
    }
  };

  if (ticketsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">
              Loading tickets...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we fetch your tickets.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (ticketsError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">
              Error loading tickets
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <Sidebar stats={stats} />
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Ticket Management
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and respond to customer support tickets with AI assistance.
            </p>
          </div>

          <TicketTable
            tickets={tickets}
            onViewTicket={handleViewTicket}
            onApproveTicket={handleApproveTicket}
            onEscalateTicket={handleEscalateTicket}
          />
        </div>
      </div>

      {/* Ticket Modal */}
      <TicketModal
        ticket={selectedTicket}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApproveTicket}
        onEscalate={handleEscalateTicket}
        onSaveDraft={handleSaveDraft}
        onGenerateDraft={handleGenerateDraft}
      />
    </div>
  );
}
