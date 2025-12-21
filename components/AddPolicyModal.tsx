import React, { useState } from 'react';

interface AddPolicyModalProps {
    onAdd: (policyName: string) => void;
    onClose: () => void;
}

const AddPolicyModal: React.FC<AddPolicyModalProps> = ({ onAdd, onClose }) => {
    const [policyName, setPolicyName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (policyName.trim()) {
            onAdd(policyName.trim());
        }
    };

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md animate-fade-in overflow-hidden border border-white/60 ring-1 ring-white/50"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 border-b border-white/20 relative bg-gradient-to-r from-indigo-50/50 to-transparent">
                    <h2 className="text-2xl font-bold text-slate-900">Add New Policy</h2>
                    <p className="text-sm text-slate-500 mt-1">Create a blank policy document.</p>
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    <div className="mb-6">
                        <label htmlFor="policyName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Policy Name</label>
                        <input
                            type="text"
                            id="policyName"
                            value={policyName}
                            onChange={(e) => setPolicyName(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition bg-white/50 backdrop-blur-sm text-slate-900 placeholder-slate-400 shadow-sm"
                            placeholder="e.g., Cloud Security Policy"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-semibold rounded-xl text-slate-600 bg-white/50 border border-slate-200/60 hover:bg-white hover:text-slate-900 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!policyName.trim()}
                        >
                            Create Policy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPolicyModal;