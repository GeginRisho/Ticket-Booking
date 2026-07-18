import React from 'react';
import { cn } from '../../utils/cn';

const Table = ({
  headers = [],
  data = [],
  renderRow,
  renderMobileCard, // If provided, customized mobile card view
  emptyMessage = "No records found.",
  className
}) => {
  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className={cn("hidden md:block overflow-x-auto rounded-[24px] border border-border bg-white shadow-sm", className)}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-hover-bg/30">
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-secondary"
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
                <td colSpan={headers.length} className="px-6 py-12 text-center text-text-secondary">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Grid/Card Stack View */}
      <div className="block md:hidden space-y-4">
        {data.length > 0 ? (
          data.map((item, idx) => {
            if (renderMobileCard) {
              return renderMobileCard(item, idx);
            }
            // Default Fallback Mobile Card View if no custom renderer is provided
            return (
              <div key={idx} className="bg-white border border-border rounded-3xl p-5 shadow-sm space-y-3">
                {headers.map((header, hIdx) => (
                  <div key={hIdx} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                    <span className="font-semibold text-text-secondary">{header}</span>
                    <span className="text-text-primary text-right font-medium">
                      {/* Assuming cells are aligned to header indexes in row rendering */}
                      {Object.values(item)[hIdx] || '-'}
                    </span>
                  </div>
                ))}
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-border rounded-3xl p-8 text-center text-text-secondary">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
