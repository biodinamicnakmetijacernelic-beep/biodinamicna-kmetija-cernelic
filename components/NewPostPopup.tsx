import React, { useState } from 'react';
import { X } from 'lucide-react';

interface NewPostPopupProps {
    onClose: () => void;
    onOpenAdmin: () => void;
}

const NewPostPopup: React.FC<NewPostPopupProps> = ({ onClose, onOpenAdmin }) => {
    const [title, setTitle] = useState('');

    const handleCreate = () => {
        if (!title.trim()) {
            alert('Vnesite naslov objave');
            return;
        }
        // Open admin modal - the title will be passed via localStorage or we can trigger admin to open
        localStorage.setItem('pendingNewPostTitle', title);
        onOpenAdmin();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="font-serif text-2xl text-olive-dark">Nova objava</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-olive-dark mb-2">
                            Naslov objave
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Vnesite naslov..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleCreate();
                                }
                            }}
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Prekliči
                        </button>
                        <button
                            onClick={handleCreate}
                            className="flex-1 px-4 py-3 bg-terracotta text-white rounded-xl font-semibold hover:bg-terracotta-dark transition-colors"
                        >
                            Ustvari
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewPostPopup;

