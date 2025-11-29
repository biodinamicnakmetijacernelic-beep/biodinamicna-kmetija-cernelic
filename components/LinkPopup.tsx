import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface LinkPopupProps {
    url: string | null;
    onClose: () => void;
}

const LinkPopup: React.FC<LinkPopupProps> = ({ url, onClose }) => {
    if (!url) return null;

    const handleOpenInNewTab = () => {
        window.open(url, '_blank', 'noopener,noreferrer');
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-xl text-olive-dark">Povezava</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* URL Display */}
                <div className="mb-6">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-sm text-olive/70 mb-1 font-medium">URL:</p>
                        <a
                            href={url}
                            className="text-terracotta hover:text-terracotta-dark break-all font-mono text-sm"
                            onClick={(e) => {
                                e.preventDefault();
                                handleOpenInNewTab();
                            }}
                        >
                            {url}
                        </a>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleOpenInNewTab}
                        className="flex-1 flex items-center justify-center gap-2 bg-terracotta text-white py-3 rounded-xl font-semibold hover:bg-terracotta-dark transition-colors"
                    >
                        <ExternalLink size={18} />
                        Odpri v novem zavihku
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-olive/70 hover:bg-gray-50 transition-colors"
                    >
                        Zapri
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LinkPopup;
