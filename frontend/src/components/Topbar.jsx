import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const Topbar = ({ title, searchValue, onSearchChange, searchPlaceholder = "Search...", showSearch = true }) => {
  return (
    <>
      <div className="bg-notion-bg px-6 py-4">
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
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue || ''}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 w-64 text-sm bg-background border-border"
                />
              </div>
            )}

            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell size={18} />
            </Button>
          </div>
        </div>
      </div>
      <Separator />
    </>
  );
};

export default Topbar;
