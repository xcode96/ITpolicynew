import React from 'react';
import { cn } from '../../lib/utils';

export type StatusType = 'active' | 'draft' | 'archived' | 'deprecated';

interface StatusBadgeProps {
    status: StatusType;
    className?: string;
}

const styles = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    draft: 'bg-amber-50 text-amber-700 border-amber-200',
    archived: 'bg-slate-100 text-slate-600 border-slate-200',
    deprecated: 'bg-red-50 text-red-700 border-red-200',
};

const labels = {
    active: 'Active',
    draft: 'Draft',
    archived: 'Archived',
    deprecated: 'Deprecated',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
            styles[status],
            className
        )}>
            <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5",
                status === 'active' ? 'bg-emerald-500' :
                    status === 'draft' ? 'bg-amber-500' :
                        status === 'deprecated' ? 'bg-red-500' : 'bg-slate-500'
            )}></span>
            {labels[status]}
        </span>
    );
};
