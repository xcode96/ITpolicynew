import React, { useRef, useState } from 'react';
import { type Policy, type SyncStatus } from '../types';

interface PolicyListProps {
  policies: Policy[];
  selectedPolicyId: number | undefined;
  onSelectPolicy: (policy: Policy) => void;
  isAdmin: boolean;
  onAddPolicyClick: () => void;
  onImportJsonFile: (file: File) => void;
  isImporting: boolean;
  onExportAllJson: () => void;
  isExportingJson: boolean;
  onLiveSyncClick: () => void;
  syncStatus: SyncStatus;
}

const PolicyList: React.FC<PolicyListProps> = ({ policies, selectedPolicyId, onSelectPolicy, isAdmin, onAddPolicyClick, onImportJsonFile, isImporting, onExportAllJson, isExportingJson, onLiveSyncClick, syncStatus }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isActionInProgress = isImporting || isExportingJson;

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportJsonFile(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const filteredPolicies = policies.filter(policy =>
    policy.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSyncStatusIndicator = () => {
    const baseClasses = "absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white";
    switch (syncStatus) {
      case 'connected':
        return <span className={`${baseClasses} bg-emerald-500`} title="Sync Connected"></span>;
      case 'connecting':
        return <span className={`${baseClasses} bg-amber-400 animate-pulse`} title="Sync Connecting..."></span>;
      case 'failed':
        return <span className={`${baseClasses} bg-red-500`} title="Sync Failed"></span>;
      case 'not-connected':
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Colorful Header */}
      <div className="flex-shrink-0 p-6 bg-gradient-to-br from-primary to-secondary text-white relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white opacity-10 blur-lg"></div>

        <div className="relative z-10">
          <div
            className="flex items-center gap-3 mb-4 cursor-pointer transition-opacity hover:opacity-90 group/header"
            onClick={() => setSearchTerm('')}
            title="Click to show all documents"
          >
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/20 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Policy<span className="font-light opacity-90">Portal</span></h2>
              <p className="text-xs text-indigo-100 font-medium opacity-90 group-hover/header:text-white transition-colors">
                {searchTerm
                  ? `Showing ${filteredPolicies.length} of ${policies.length}`
                  : `${policies.length} documents stored`
                }
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-200 group-focus-within:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all duration-200 shadow-sm backdrop-blur-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-indigo-200 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredPolicies.length > 0 ? (
          filteredPolicies.map((policy) => (
            <button
              key={policy.id}
              onClick={() => onSelectPolicy(policy)}
              className={`w-full group text-left px-4 py-3 cursor-pointer transition-all duration-200 border-l-2 relative overflow-hidden ${selectedPolicyId === policy.id
                ? 'border-primary bg-primary/5 text-primary-dark shadow-[inset_4px_0_0_0_rgba(79,70,229,1)]'
                : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className={`flex-shrink-0 transition-colors duration-200 ${selectedPolicyId === policy.id ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {/* Simpler, thinner icons */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={selectedPolicyId === policy.id ? 2 : 1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`block text-sm truncate transition-colors ${selectedPolicyId === policy.id ? 'font-bold' : 'font-medium'}`}>
                    {policy.name}
                  </span>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-textMuted/80">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 opacity-40">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">No policies found</p>
            <button onClick={() => setSearchTerm('')} className="mt-2 text-xs font-bold text-primary hover:underline">
              Clear Search
            </button>
          </div>
        )}
      </nav>

      {/* Admin Actions Footer */}
      {isAdmin && (
        <div className="p-4 mt-auto border-t border-indigo-100/50 bg-white/30 backdrop-blur-md">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/json"
            className="hidden"
          />

          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={onAddPolicyClick}
                disabled={isActionInProgress}
                className="col-span-4 flex items-center justify-center gap-2 p-3 text-sm rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all duration-200 bg-primary/90 backdrop-blur-sm hover:bg-primary text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group border border-transparent"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 group-hover:rotate-90 transition-transform">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                <span>New Policy</span>
              </button>

              <button
                onClick={onLiveSyncClick}
                disabled={isActionInProgress}
                className="col-span-1 relative flex flex-col items-center justify-center gap-1 p-2 text-xs rounded-xl transition-all duration-200 bg-white/40 border border-white/50 backdrop-blur-sm text-slate-500 hover:bg-white/70 hover:text-primary active:scale-95 shadow-sm"
                title="Live Sync"
              >
                {getSyncStatusIndicator()}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
              <button
                onClick={handleImportClick}
                disabled={isActionInProgress}
                className="col-span-1 flex flex-col items-center justify-center gap-1 p-2 text-xs rounded-xl transition-all duration-200 bg-white/40 border border-white/50 backdrop-blur-sm text-slate-500 hover:bg-white/70 hover:text-primary active:scale-95 shadow-sm"
                title="Import JSON"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </button>
              <button
                onClick={onExportAllJson}
                disabled={isActionInProgress}
                className="col-span-2 flex flex-row items-center justify-center gap-2 p-2 text-xs rounded-xl transition-all duration-200 bg-white/40 border border-white/50 backdrop-blur-sm text-slate-500 hover:bg-white/70 hover:text-primary active:scale-95 shadow-sm font-medium"
                title="Export All"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span>Export All</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyList;