import React from 'react';
import { cn } from '../../utils/cn';

const Table = ({
  headers = [],
  data = [],
  renderRow,
  renderMobileCard, // Optional custom mobile card view
  emptyMessage = "No records found.",
  className
}) => {
  return (
    <div className="w-full space-y-4">
      {/* Scrollable Table View (Horizontal scroll for small viewports) */}
      <div className={cn("overflow-x-auto rounded-3xl border border-border bg-white shadow-sm hide-scrollbar", className)}>
        <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-full">
          <thead>
            <tr className="border-b border-border bg-gray-50/70 sticky top-0 z-10">
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-4 sm:px-6 py-3.5 text-xs font-black uppercase tracking-wider text-text-secondary whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length > 0 ? (
              data.map((item, idx) => renderRow(item, idx))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-6 py-12 text-center text-text-secondary text-sm font-semibold">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Custom Card View if renderMobileCard is explicitly provided */}
      {renderMobileCard && (
        <div className="block md:hidden space-y-3">
          {data.length > 0 && data.map((item, idx) => renderMobileCard(item, idx))}
        </div>
      )}
    </div>
  );
};

export default Table;
