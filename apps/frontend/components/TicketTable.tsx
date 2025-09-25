'use client';

import { useState } from 'react';
import { Ticket, TicketStatus, TicketCategory } from '@/lib/types';
import {
  EyeIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface TicketTableProps {
  tickets: Ticket[];
  onViewTicket: (ticket: Ticket) => void;
  onApproveTicket: (id: string) => void;
  onEscalateTicket: (id: string) => void;
}

const statusColors = {
  New: 'bg-gray-100 text-gray-800',
  'AI-Drafted': 'bg-yellow-100 text-yellow-800',
  'Pending Review': 'bg-blue-100 text-blue-800',
  Sent: 'bg-green-100 text-green-800',
  Escalated: 'bg-red-100 text-red-800',
  'Processing Failed': 'bg-red-100 text-red-800',
} as const;

const categoryColors = {
  Refund: 'bg-red-100 text-red-800',
  Payment: 'bg-blue-100 text-blue-800',
  Invoice: 'bg-purple-100 text-purple-800',
  Other: 'bg-gray-100 text-gray-800',
};

export default function TicketTable({
  tickets,
  onViewTicket,
  onApproveTicket,
  onEscalateTicket,
}: TicketTableProps) {
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | 'All'>(
    'All'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;

  // Filter tickets
  const filteredTickets = Array.isArray(tickets)
    ? tickets.filter(ticket => {
        const statusMatch =
          statusFilter === 'All' || ticket.status === statusFilter;
        const categoryMatch =
          categoryFilter === 'All' || ticket.category === categoryFilter;
        return statusMatch && categoryMatch;
      })
    : [];

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
  const startIndex = (currentPage - 1) * ticketsPerPage;
  const paginatedTickets = filteredTickets.slice(
    startIndex,
    startIndex + ticketsPerPage
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  return (
    <div className='bg-white shadow-sm rounded-lg'>
      {/* Filters */}
      <div className='p-4 border-b border-gray-200'>
        <div className='flex flex-wrap gap-4'>
          <div>
            <label
              htmlFor='status-filter'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Status
            </label>
            <select
              id='status-filter'
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value as TicketStatus | 'All');
                setCurrentPage(1);
              }}
              className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
            >
              <option value='All'>All Statuses</option>
              <option value='New'>New</option>
              <option value='AI-Drafted'>AI-Drafted</option>
              <option value='Pending Review'>Pending Review</option>
              <option value='Sent'>Sent</option>
              <option value='Escalated'>Escalated</option>
              <option value='Processing Failed'>Processing Failed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor='category-filter'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Category
            </label>
            <select
              id='category-filter'
              value={categoryFilter}
              onChange={e => {
                setCategoryFilter(e.target.value as TicketCategory | 'All');
                setCurrentPage(1);
              }}
              className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
            >
              <option value='All'>All Categories</option>
              <option value='Refund'>Refund</option>
              <option value='Payment'>Payment</option>
              <option value='Invoice'>Invoice</option>
              <option value='Other'>Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Ticket ID
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Customer
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Subject
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Category
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Received
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {paginatedTickets.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className='px-6 py-12 text-center text-gray-500'
                >
                  <div className='text-sm'>
                    {Array.isArray(tickets) && tickets.length === 0
                      ? 'No tickets found'
                      : 'Loading tickets...'}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTickets.map(ticket => (
                <tr key={ticket.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    #{ticket.id}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {ticket.customerName}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {ticket.customerEmail}
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='text-sm text-gray-900'>
                      {truncateText(ticket.subject, 50)}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        categoryColors[ticket.category]
                      }`}
                    >
                      {ticket.category}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[ticket.status]
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {formatDate(ticket.receivedDate)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => onViewTicket(ticket)}
                        className='text-blue-600 hover:text-blue-900'
                        title='View Details'
                      >
                        <EyeIcon className='h-4 w-4' />
                      </button>
                      {ticket.status === 'Pending Review' && (
                        <>
                          <button
                            onClick={() => onApproveTicket(ticket.id)}
                            className='text-green-600 hover:text-green-900'
                            title='Approve & Send'
                          >
                            <CheckIcon className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() => onEscalateTicket(ticket.id)}
                            className='text-red-600 hover:text-red-900'
                            title='Escalate'
                          >
                            <ExclamationTriangleIcon className='h-4 w-4' />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='px-6 py-3 border-t border-gray-200'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-700'>
              Showing {startIndex + 1} to{' '}
              {Math.min(startIndex + ticketsPerPage, filteredTickets.length)} of{' '}
              {filteredTickets.length} results
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className='px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
              >
                Previous
              </button>
              <span className='px-3 py-1 text-sm text-gray-700'>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className='px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50'
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
