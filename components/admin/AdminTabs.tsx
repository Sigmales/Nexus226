'use client';

import React from 'react';

interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface AdminTabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

export default function AdminTabs({ tabs, activeTab, onTabChange }: AdminTabsProps) {
    return (
        <div className="border-b border-border-subtle">
            <div className="flex gap-1 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
                            px-6 py-3 font-semibold text-sm whitespace-nowrap
                            transition-all duration-200
                            border-b-2 flex items-center gap-2
                            ${activeTab === tab.id
                                ? 'border-neon-gold text-neon-gold'
                                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-subtle'
                            }
                        `}
                    >
                        {tab.icon && <span>{tab.icon}</span>}
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
