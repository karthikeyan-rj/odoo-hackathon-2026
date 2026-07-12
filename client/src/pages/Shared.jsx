import React from "react";

// Simple card to display key metrics
export function KPI(props) {
  const { label, value, sub } = props;
  
  return (
    <div className="bg-white border border-zinc-200 rounded p-4">
      <div className="text-2xl font-bold text-zinc-900">{value}</div>
      <div className="text-[10px] text-zinc-400 uppercase mt-1">{label}</div>
      {sub && <div className="text-[10px] text-red-500 mt-0.5">{sub}</div>}
    </div>
  );
}

// Flat table for showing dashboard list views
export function Table(props) {
  const { cols, rows } = props;

  return (
    <div className="bg-white border border-zinc-200 rounded overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-zinc-50 border-b border-zinc-200">
          <tr>
            {cols.map(function(col) {
              return (
                <th key={col} className="text-left px-4 py-2.5 font-semibold text-zinc-500 uppercase text-[10px]">
                  {col}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {rows.map(function(row, rowIndex) {
            return (
              <tr key={rowIndex} className="hover:bg-zinc-50">
                {row.map(function(cell, cellIndex) {
                  return (
                    <td key={cellIndex} className="px-4 py-2.5 text-zinc-700">
                      {cell}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
