"use client";

import { TicketStatus } from "@/lib/types";

interface SidebarProps {
  stats: {
    total: number;
    byStatus: Record<TicketStatus, number>;
  };
}

const statusColors = {
  New: "bg-gray-100 text-gray-800",
  "AI-Drafted": "bg-yellow-100 text-yellow-800",
  "Pending Review": "bg-blue-100 text-blue-800",
  Sent: "bg-green-100 text-green-800",
  Escalated: "bg-red-100 text-red-800",
};

export default function Sidebar({ stats }: SidebarProps) {
  return (
    <div className="w-64 bg-white shadow-sm border-r p-6">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ticket Statistics
        </h2>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          <div className="text-sm text-blue-700">Total Tickets</div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">By Status</h3>
        <div className="space-y-2">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} className="flex justify-between items-center">
              <div className="flex items-center">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    statusColors[status as TicketStatus]
                  }`}
                >
                  {status}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
