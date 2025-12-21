import React, { useState } from 'react';
import {
    Search,
    Menu,
    Bell,
    Settings,
    ChevronRight,
    ShieldCheck,
    FileText,
    BookOpen,
    Lock,
    Users,
    LogOut,
    X,
    Plus,
    Folder,
    Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { type Policy, type Category } from '../../types';

interface DashboardLayoutProps {
    children: React.ReactNode;
    policies: Policy[];
    categories: Category[];
    selectedPolicyId?: number;
    onSelectPolicy: (policy: Policy) => void;
    isAdmin: boolean;
    onLogout: () => void;
    onLoginClick: () => void;
    onSearch?: (query: string) => void;
    onAddCategory?: (name: string) => void;
    onAddPolicy?: (categoryId?: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
    'BookOpen': BookOpen,
    'Lock': Lock,
    'ShieldCheck': ShieldCheck,
    'Users': Users,
    'FileText': FileText,
    'Folder': Folder
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    policies,
    categories,
    selectedPolicyId,
    onSelectPolicy,
    isAdmin,
    onLogout,
    onLoginClick,
    onAddCategory,
    onAddPolicy,
    onDeleteCategory,
    onDeletePolicyClick
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['general', 'security', 'compliance', 'hr', 'policy']);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const toggleCategory = (id: string) => {
        setExpandedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const getCategoryPolicies = (catId: string) => {
        return policies.filter(p => p.categoryId === catId);
    };

    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim() && onAddCategory) {
            onAddCategory(newCategoryName.trim());
            setNewCategoryName('');
            setIsAddingCategory(false);
        }
    };

    const mainContentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (mainContentRef.current) {
            mainContentRef.current.scrollTop = 0;
        }
    }, [selectedPolicyId]);

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed lg:static top-0 left-0 z-50 h-full w-72 bg-slate-50/50 backdrop-blur-xl border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100 bg-white/50 flex-shrink-0">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-lg tracking-tight">
                        <div className="p-1.5 bg-purple-600 rounded-lg text-white">
                            <ShieldCheck size={20} strokeWidth={2.5} />
                        </div>
                        PolicyPortal
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="ml-auto lg:hidden text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {categories.map(category => {
                        const categoryPolicies = getCategoryPolicies(category.id);
                        // If admin, show empty categories so they can populate them? Or only show if policies exist?
                        // User wants to create folders, presumably to put things in them later. So show empty ones if admin?
                        // For now, consistent behavior: show all categories.

                        const Icon = ICON_MAP[category.icon || 'Folder'] || Folder;
                        const isExpanded = expandedCategories.includes(category.id);

                        return (
                            <div key={category.id}>
                                <div className="flex items-center gap-1 mb-1 group">
                                    <button
                                        onClick={() => toggleCategory(category.id)}
                                        className="flex-1 flex items-center gap-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1 hover:text-slate-800 transition-colors"
                                    >
                                        <Icon size={14} className="text-slate-400" />
                                        {category.name}
                                        <ChevronRight size={14} className={cn("ml-auto transition-transform", isExpanded && "rotate-90")} />
                                    </button>

                                    {isAdmin && (
                                        <>
                                            {onAddPolicy && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAddPolicy(category.id);
                                                        if (!isExpanded) toggleCategory(category.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-purple-600 hover:bg-slate-100 rounded transition-all"
                                                    title={`Add policy to ${category.name}`}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            )}
                                            {onDeleteCategory && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteCategory(category.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                                    title={`Delete ${category.name}`}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>

                                {isExpanded && (
                                    <ul className="space-y-0.5 border-l border-slate-200 ml-5 pl-2 transition-all">
                                        {categoryPolicies.map(policy => (
                                            <li key={policy.id} className="group flex items-center">
                                                <button
                                                    onClick={() => {
                                                        onSelectPolicy(policy);
                                                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                                                    }}
                                                    className={cn(
                                                        "flex-1 text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 truncate",
                                                        selectedPolicyId === policy.id
                                                            ? "bg-purple-50 text-purple-700 font-medium"
                                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                                    )}
                                                >
                                                    {policy.name}
                                                </button>
                                                {isAdmin && onDeletePolicyClick && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeletePolicyClick(policy);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all absolute right-2 bg-white shadow-sm border border-slate-100"
                                                        title="Delete Policy"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                        {categoryPolicies.length === 0 && (
                                            <li className="px-3 py-2 text-xs text-slate-400 italic">No policies</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        );
                    })}

                    {/* Add Actions Section */}
                    {isAdmin && (
                        <div className="pt-4 border-t border-slate-100 space-y-2">
                            {!isAddingCategory ? (
                                <div className="flex gap-1 px-2">
                                    <button
                                        onClick={() => setIsAddingCategory(true)}
                                        className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 py-2 rounded-md transition-colors"
                                    >
                                        <Folder size={14} />
                                        New Folder
                                    </button>
                                    {onAddPolicy && (
                                        <button
                                            onClick={onAddPolicy}
                                            className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 py-2 rounded-md transition-colors"
                                        >
                                            <FileText size={14} />
                                            New Policy
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleCreateCategory} className="px-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        className="w-full text-xs border border-purple-200 rounded px-2 py-1 focus:outline-none focus:border-purple-500 mb-2"
                                        placeholder="Folder Name..."
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        onBlur={() => !newCategoryName && setIsAddingCategory(false)}
                                    />
                                    <div className="flex gap-2">
                                        <button type="submit" className="text-xs bg-purple-600 text-white px-2 py-1 rounded">Add</button>
                                        <button type="button" onClick={() => setIsAddingCategory(false)} className="text-xs text-slate-500 px-2 py-1">Cancel</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-slate-200 bg-white/50 flex-shrink-0">
                    {isAdmin ? (
                        <div className="flex items-center gap-3 px-2">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs ring-2 ring-white">
                                AD
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">Administrator</p>
                                <p className="text-xs text-slate-500 truncate">admin@portal.com</p>
                            </div>
                            <button
                                onClick={onLogout}
                                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                                title="Logout"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onLoginClick}
                            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 h-full">

                {/* Sticky Header */}
                <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center px-4 lg:px-8 justify-between flex-shrink-0">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md"
                        >
                            <Menu size={20} />
                        </button>

                        {/* Search Bar */}
                        <div className="relative hidden sm:block group transition-all duration-300 ease-in-out w-64 focus-within:w-96 lg:focus-within:w-[32rem]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search policies..."
                                className="w-full pl-10 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-100 group-focus-within:opacity-0 transition-opacity duration-200">
                                <kbd className="hidden md:inline-flex items-center h-5 border border-slate-200 rounded px-1.5 font-sans text-[10px] font-medium text-slate-400 bg-white shadow-sm">Ctrl K</kbd>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4">
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2.5 h-1.5 w-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <Settings size={20} />
                        </button>
                        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-purple-600 transition-colors">
                            Docs
                        </a>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <main ref={mainContentRef} className="flex-1 overflow-y-auto scroll-smooth">
                    {children}
                </main>

            </div>
        </div>
    );
};
