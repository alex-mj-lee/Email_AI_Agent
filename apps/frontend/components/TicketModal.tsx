"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { Ticket } from "@/lib/types";
import { useEmail, useEnhancedTicket } from "@/hooks/useEmail";

interface TicketModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onEscalate: (id: string) => void;
  onSaveDraft: (id: string, draft: string) => void;
  onGenerateDraft: (id: string) => Promise<string>;
}

const statusColors = {
  New: "bg-gray-100 text-gray-800",
  "AI-Drafted": "bg-yellow-100 text-yellow-800",
  "Pending Review": "bg-blue-100 text-blue-800",
  Sent: "bg-green-100 text-green-800",
  Escalated: "bg-red-100 text-red-800",
  "Processing Failed": "bg-red-100 text-red-800",
} as const;

const categoryColors = {
  Refund: "bg-red-100 text-red-800",
  Payment: "bg-blue-100 text-blue-800",
  Invoice: "bg-purple-100 text-purple-800",
  Other: "bg-gray-100 text-gray-800",
};

export default function TicketModal({
  ticket,
  isOpen,
  onClose,
  onApprove,
  onEscalate,
  onSaveDraft,
  onGenerateDraft,
}: TicketModalProps) {
  const [draftText, setDraftText] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isManuallyGenerated, setIsManuallyGenerated] = useState(false);
  const [showSimilarCases, setShowSimilarCases] = useState(true);

  // Get enhanced ticket data with similar cases
  const { data: enhancedTicket, isLoading: enhancedTicketLoading } =
    useEnhancedTicket(ticket?.id || "");

  // Reset manual generation flag when ticket changes
  useEffect(() => {
    setIsManuallyGenerated(false);
  }, [ticket?.id]);

  // Update draft text when ticket changes
  useEffect(() => {
    if (ticket && !isManuallyGenerated) {
      setDraftText(ticket.aiResponse || "");
    }
  }, [ticket, isManuallyGenerated]);

  const handleGenerateDraft = async () => {
    if (!ticket) return;

    setIsRegenerating(true);
    setIsManuallyGenerated(true);
    try {
      const newDraft = await onGenerateDraft(ticket.id);
      setDraftText(newDraft);
    } catch (error) {
      console.error("Failed to generate draft:", error);
      setIsManuallyGenerated(false);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!ticket) return;

    setIsSaving(true);
    try {
      await onSaveDraft(ticket.id, draftText);
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleString();
  };

  if (!ticket) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900 mb-4"
                    >
                      Ticket #{ticket.id} - {ticket.subject}
                    </Dialog.Title>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Ticket Details */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Customer Information
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-900 font-medium">
                              {ticket.customerName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {ticket.customerEmail}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Ticket Details
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Category:
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  categoryColors[ticket.category]
                                }`}
                              >
                                {ticket.category}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Status:
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  statusColors[ticket.status]
                                }`}
                              >
                                {ticket.status}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Received:
                              </span>
                              <span className="text-sm text-gray-900">
                                {formatDate(ticket.receivedDate)}
                              </span>
                            </div>
                            {enhancedTicket?.priority && (
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">
                                  Priority:
                                </span>
                                <span className="text-sm text-gray-900 capitalize">
                                  {enhancedTicket.priority}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {enhancedTicket?.suggestedActions?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Suggested Actions
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="flex flex-wrap gap-2">
                                {enhancedTicket.suggestedActions.map(
                                  (action: string, index: number) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {action}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Original Message
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">
                              {ticket.message}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* AI Draft */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            AI Draft Response
                          </h4>
                          <button
                            onClick={handleGenerateDraft}
                            disabled={isRegenerating}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isRegenerating ? "Generating..." : "Generate"}
                          </button>
                        </div>

                        <textarea
                          value={draftText}
                          onChange={(e) => {
                            setDraftText(e.target.value);
                            setIsManuallyGenerated(true);
                          }}
                          rows={12}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="AI-generated response will appear here..."
                        />

                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveDraft}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSaving ? "Saving..." : "Save Draft"}
                          </button>

                          {ticket.status === "Pending Review" && (
                            <>
                              <button
                                onClick={() => onApprove(ticket.id)}
                                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                              >
                                Approve & Send
                              </button>
                              <button
                                onClick={() => onEscalate(ticket.id)}
                                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                              >
                                Escalate
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Similar Cases */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            Similar Tickets
                          </h4>
                          <button
                            onClick={() =>
                              setShowSimilarCases(!showSimilarCases)
                            }
                            className="flex items-center text-xs text-blue-600 hover:text-blue-700"
                          >
                            {showSimilarCases ? (
                              <>
                                <ChevronUpIcon className="h-4 w-4 mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <ChevronDownIcon className="h-4 w-4 mr-1" />
                                Show
                              </>
                            )}
                          </button>
                        </div>

                        {showSimilarCases && (
                          <div className="space-y-3">
                            {enhancedTicketLoading ? (
                              <div className="text-center py-4">
                                <div className="text-sm text-gray-500">
                                  Loading similar tickets...
                                </div>
                              </div>
                            ) : enhancedTicket?.similarTickets?.length > 0 ? (
                              enhancedTicket.similarTickets.map(
                                (similarTicket: any, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="text-xs font-medium text-gray-900">
                                        Case #{similarTicket.id}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {formatDate(similarTicket.receivedDate)}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                                      {similarTicket.subject || "No subject"}
                                    </p>
                                    <div className="flex justify-between items-center">
                                      <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                          categoryColors[
                                            similarTicket.category as keyof typeof categoryColors
                                          ] || categoryColors.Other
                                        }`}
                                      >
                                        {similarTicket.category || "Other"}
                                      </span>
                                      <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                          statusColors[
                                            similarTicket.status as keyof typeof statusColors
                                          ] || statusColors.New
                                        }`}
                                      >
                                        {similarTicket.status || "New"}
                                      </span>
                                    </div>
                                    {similarTicket.aiResponse && (
                                      <div className="mt-2 p-2 bg-white rounded border text-xs text-gray-600 max-h-20 overflow-y-auto">
                                        {similarTicket.aiResponse}
                                      </div>
                                    )}
                                  </div>
                                )
                              )
                            ) : (
                              <div className="text-center py-4">
                                <div className="text-sm text-gray-500">
                                  No similar tickets found
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
