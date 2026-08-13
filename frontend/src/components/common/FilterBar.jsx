import React from 'react';

export const FilterBar = ({ filters = [], activeFilter, onSelectFilter }) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value || activeFilter === filter;
        const value = filter.value !== undefined ? filter.value : filter;
        const label = filter.label || filter;

        return (
          <button
            key={value}
            onClick={() => onSelectFilter(value)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-200 ${
              isActive
                ? 'bg-brand-cyan text-dark-bg font-bold shadow-ms-glow'
                : 'bg-dark-card hover:bg-dark-cardHover text-slate-300 border border-dark-border'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
