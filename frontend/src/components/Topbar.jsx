import React from 'react';
import { Search, Bell } from 'lucide-react';

const Topbar = ({ title, searchValue, onSearchChange, searchPlaceholder = "Search...", showSearch = true }) => {
  return (
    <div className="bg-notion-bg border-b border-notion-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-notion-text">
            {title}
          </h1>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center space-x-4">
          {showSearch && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-notion-text-muted" />
              </div>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue || ''}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="notion-input pl-10 w-64 text-sm"
              />
            </div>
          )}

          {/* Notifications */}
          <button className="notion-button-ghost p-2">
            <Bell size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
