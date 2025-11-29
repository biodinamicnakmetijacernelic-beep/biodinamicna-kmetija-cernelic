import React, { useState } from 'react';
import { Plus, List } from 'lucide-react';

interface AdminFloatingButtonsProps {
    onCreateNew: () => void;
    onViewAll: () => void;
}

const AdminFloatingButtons: React.FC<AdminFloatingButtonsProps> = ({ onCreateNew, onViewAll }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="fixed bottom-11 right-6 z-[9999] flex flex-col items-end gap-3">
            {/* Expanded Buttons */}
            {isExpanded && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <button
                        onClick={() => {
                            onCreateNew();
                            setIsExpanded(false);
                        }}
                        className="flex items-center gap-3 bg-terracotta text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-terracotta-dark transition-all group"
                    >
                        <Plus size={20} />
                        <span className="font-semibold text-sm">Dodaj novo novico</span>
                    </button>

                    <button
                        onClick={() => {
                            onViewAll();
                            setIsExpanded(false);
                        }}
                        className="flex items-center gap-3 bg-olive text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-olive-dark transition-all group"
                    >
                        <List size={20} />
                        <span className="font-semibold text-sm">Vse novice</span>
                    </button>
                </div>
            )}

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all ${isExpanded
                        ? 'bg-gray-600 hover:bg-gray-700 rotate-45'
                        : 'bg-olive hover:bg-olive-dark'
                    }`}
            >
                <Plus size={24} className="text-white" />
            </button>
        </div>
    );
};

export default AdminFloatingButtons;
