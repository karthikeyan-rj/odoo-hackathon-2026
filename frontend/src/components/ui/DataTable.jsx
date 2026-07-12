import { useState, useMemo } from 'react';

export default function DataTable({ 
  columns, 
  data, 
  keyField = '_id', 
  loading = false, 
  emptyMessage = 'No data found.',
  onRowClick = null,
  highlightedRowId = null
}) {
  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm animate-pulse">
        <table className="w-full text-left">
          <thead className="bg-bg border-b border-border">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                {columns.map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 bg-border/50 rounded w-2/3"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-12 text-center text-ink-muted shadow-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-x-auto shadow-sm">
      <table className="w-full text-left whitespace-nowrap">
        <thead className="bg-bg border-b border-border">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row) => (
            <tr 
              key={row[keyField]} 
              onClick={() => onRowClick && onRowClick(row)}
              className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-bg/50' : ''} ${highlightedRowId === row[keyField] ? 'row-flash' : ''}`}
            >
              {columns.map((col, j) => (
                <td key={j} className={`px-6 py-4 text-sm ${col.className || 'text-ink'}`}>
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
