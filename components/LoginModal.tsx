import React, { useState } from 'react';

interface LoginModalProps {
    onLogin: (username: string, password: string) => void;
    onClose: () => void;
    error: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose, error }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(username, password);
    };

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
                <div className="p-8 border-b border-white/20 relative bg-gradient-to-r from-purple-50/50 to-transparent">
                    <h2 className="text-2xl font-bold text-slate-900">Administrator Login</h2>
                    <p className="text-sm text-slate-500 mt-1">Please enter your credentials.</p>
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    {error && (
                        <div className="bg-red-50/80 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 backdrop-blur-sm" role="alert">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition bg-white/50 backdrop-blur-sm text-slate-900 placeholder-slate-400 shadow-sm"
                            placeholder="admin"
                            required
                            autoFocus
                            autoComplete="username"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition bg-white/50 backdrop-blur-sm text-slate-900 placeholder-slate-400 shadow-sm"
                            placeholder="password"
                            required
                            autoComplete="current-password"
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
                            disabled={!username.trim() || !password.trim()}
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;