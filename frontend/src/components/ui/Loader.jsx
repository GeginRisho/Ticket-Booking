import React from 'react';
import { cn } from '../../utils/cn';

export const Spinner = ({ className, size = 'md' }) => {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "border-4 border-primary border-t-transparent rounded-full animate-spin",
          size === 'sm' && "w-6 h-6 border-2",
          size === 'md' && "w-10 h-10 border-4",
          size === 'lg' && "w-16 h-16 border-4"
        )}
      />
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white border border-border rounded-[24px] p-6 shadow-sm animate-pulse space-y-4">
      <div className="h-48 bg-gray-200 rounded-2xl w-full" />
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );
};

export const TableRowSkeleton = () => {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-2/3" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/2" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-1/3" /></td>
    </tr>
  );
};

export const ChartSkeleton = () => {
  return (
    <div className="bg-white border border-border rounded-[24px] p-6 shadow-sm animate-pulse h-80 flex flex-col justify-end space-y-2">
      <div className="flex items-end justify-between h-full gap-2 px-4">
        <div className="bg-gray-200 rounded-t w-full h-1/3" />
        <div className="bg-gray-200 rounded-t w-full h-2/3" />
        <div className="bg-gray-200 rounded-t w-full h-1/2" />
        <div className="bg-gray-200 rounded-t w-full h-5/6" />
        <div className="bg-gray-200 rounded-t w-full h-3/4" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-full mt-4" />
    </div>
  );
};

const Loader = ({ type = 'spinner', count = 1, gridClassName }) => {
  if (type === 'card') {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6", gridClassName)}>
        {Array.from({ length: count }).map((_, idx) => (
          <CardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="overflow-x-auto rounded-[24px] border border-border bg-white p-4">
        <table className="w-full">
          <tbody>
            {Array.from({ length: count }).map((_, idx) => (
              <TableRowSkeleton key={idx} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === 'chart') {
    return <ChartSkeleton />;
  }

  return <Spinner />;
};

export default Loader;
