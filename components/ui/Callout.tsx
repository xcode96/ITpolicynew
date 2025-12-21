import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CalloutProps {
    type?: 'info' | 'warning' | 'success' | 'danger';
    title?: string;
    children: React.ReactNode;
    className?: string;
}

const icons = {
    info: Info,
    warning: AlertCircle,
    success: CheckCircle2,
    danger: XCircle,
};

const styles = {
    info: 'bg-blue-50/50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50/50 border-amber-200 text-amber-900',
    success: 'bg-emerald-50/50 border-emerald-200 text-emerald-900',
    danger: 'bg-red-50/50 border-red-200 text-red-900',
};

const iconStyles = {
    info: 'text-blue-600',
    warning: 'text-amber-600',
    success: 'text-emerald-600',
    danger: 'text-red-600',
};

export const Callout: React.FC<CalloutProps> = ({
    type = 'info',
    title,
    children,
    className
}) => {
    const Icon = icons[type];

    return (
        <div className={cn(
            "flex gap-3 p-4 rounded-lg border my-6 text-sm leading-relaxed",
            styles[type],
            className
        )}>
            <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconStyles[type])} />
            <div className="flex-1">
                {title && <h5 className="font-semibold mb-1">{title}</h5>}
                <div className="opacity-90">{children}</div>
            </div>
        </div>
    );
};
