import React from 'react';

export const Table = ({ columns = [], data = [], keyField = 'id', emptyText = 'No records found.' }) => {
  return (
    <div className="w-full overflow-x-auto rounded-ms-lg border border-dark-border bg-dark-card shadow-ms-card">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-dark-border bg-dark-sidebar/60 text-xs uppercase tracking-wider text-slate-400 font-semibold">
            {columns.map((col, idx) => (
              <th key={idx} className={`px-4 py-3.5 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-border/60">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={row[keyField] || rowIdx} className="hover:bg-dark-cardHover/60 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-4 py-3.5 text-slate-200 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
