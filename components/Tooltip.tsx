import React from 'react';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
}

export const Tooltip = ({ text, children }: TooltipProps) => {
    return (
        <div className="relative group flex items-center">
            {children}
            <div className="absolute left-14 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-white/10 shadow-xl">
                {text}
            </div>
        </div>
    );
};
