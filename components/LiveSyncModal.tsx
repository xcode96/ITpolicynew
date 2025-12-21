import React, { useState, useEffect } from 'react';
import { type SyncStatus } from '../types';

interface LiveSyncModalProps {
    onClose: () => void;
    onSync: (url: string) => Promise<void>;
    onDisconnect: () => void;
    syncStatus: SyncStatus;
    syncUrl: string;
}

const LiveSyncModal: React.FC<LiveSyncModalProps> = ({ onClose, onSync, onDisconnect, syncStatus, syncUrl }) => {
    const [url, setUrl] = useState(syncUrl);
    const [error, setError] = useState('');
    const [currentStatus, setCurrentStatus] = useState(syncStatus);

    useEffect(() => {
        setCurrentStatus(syncStatus);
    }, [syncStatus]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await onSync(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during sync.');
        }
    };

    const handleDisconnect = () => {
        onDisconnect();
        setUrl('');
        setError('');
    }

    const renderStatus = () => {
        if (currentStatus === 'connected') {
            return <p className="text-sm text-emerald-600 font-medium truncate bg-emerald-50 px-3 py-1 rounded-lg inline-block mt-2">Connected to: {syncUrl}</p>;
        }
        if (currentStatus === 'failed' && error) {
            return <p className="text-sm text-red-500 mt-2 font-medium">{error}</p>;
        }
        return <p className="text-sm text-slate-500 mt-1">Sync policies from a remote JSON file.</p>;
    }

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in overflow-hidden border border-white/60 ring-1 ring-white/50"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 border-b border-white/20 relative bg-gradient-to-r from-emerald-50/50 to-transparent">
                    <h2 className="text-2xl font-bold text-slate-900">Live Policy Sync</h2>
                    {renderStatus()}
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">&times;</button>
                </div>

                <div className="p-8">
                    <div className="text-sm text-slate-600 bg-slate-50/50 backdrop-blur-sm p-5 rounded-xl border border-slate-200/60 mb-6">
                        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Instructions
                        </h3>
                        <ol className="list-decimal list-inside space-y-1 ml-1">
                            <li>Export your policies using <strong>"Export All JSON"</strong>.</li>
                            <li>Upload the file to a server (e.g., GitHub Gist).</li>
                            <li>Get the <strong>"Raw" URL</strong>.</li>
                            <li>Paste the URL below to sync.</li>
                        </ol>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="syncUrl" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Server "Raw" URL</label>
                            <input
                                type="url"
                                id="syncUrl"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition bg-white/50 backdrop-blur-sm text-slate-900 disabled:bg-slate-100 disabled:text-slate-500 shadow-sm"
                                placeholder="https://raw.githubusercontent.com/..."
                                required
                                disabled={currentStatus === 'connecting' || currentStatus === 'connected'}
                            />
                        </div>

                        <div className="flex justify-between items-center gap-3 mt-8">
                            <div>
                                {currentStatus === 'connected' && (
                                    <button
                                        type="button"
                                        onClick={handleDisconnect}
                                        className="px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50/80 backdrop-blur-sm rounded-xl hover:bg-red-100 transition-colors duration-200"
                                    >
                                        Disconnect
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 text-sm font-semibold rounded-xl text-slate-600 bg-white/50 border border-slate-200/60 hover:bg-white hover:text-slate-900 transition-colors duration-200"
                                >
                                    Close
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 w-40 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
                                    disabled={!url.trim() || currentStatus === 'connecting' || currentStatus === 'connected'}
                                >
                                    {currentStatus === 'connecting' ? (
                                        <svg className="animate-spin mx-auto h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        'Connect & Sync'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LiveSyncModal;