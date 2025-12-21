import React from 'react';
import { type Policy } from '../types';

interface DeletePolicyModalProps {
    policy: Policy;
    onConfirm: () => void;
    onClose: () => void;
}

const DeletePolicyModal: React.FC<DeletePolicyModalProps> = ({ policy, onConfirm, onClose }) => {
    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md animate-fade-in overflow-hidden border border-white/60 ring-1 ring-white/50"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 border-b border-white/20 relative bg-gradient-to-r from-red-50/80 to-transparent">
                    <h2 className="text-2xl font-bold text-red-600">Delete Policy</h2>
                    <p className="text-sm text-slate-500 mt-1">This action cannot be undone.</p>
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">&times;</button>
                </div>

                <div className="p-8">
                    <p className="text-slate-700 mb-8 leading-relaxed">
                        Are you sure you want to permanently delete the policy: <br />
                        <strong className="font-bold text-slate-900 text-lg block mt-2 p-3 bg-red-50/50 backdrop-blur-sm rounded-lg border border-red-100 text-center">{policy.name}</strong>
                    </p>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-semibold rounded-xl text-slate-600 bg-white/50 border border-slate-200/60 hover:bg-white hover:text-slate-900 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all duration-200"
                        >
                            Delete Policy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeletePolicyModal;