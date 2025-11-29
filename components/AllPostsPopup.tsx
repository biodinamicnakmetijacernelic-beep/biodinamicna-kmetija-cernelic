import React, { useState, useEffect } from 'react';
import { X, Pencil, Trash2, Search } from 'lucide-react';
import { fetchAllNews, deleteNewsPost } from '../sanityClient';
import { NewsItem } from '../types';
import { useNavigate } from 'react-router-dom';

interface AllPostsPopupProps {
    onClose: () => void;
}

const AllPostsPopup: React.FC<AllPostsPopupProps> = ({ onClose }) => {
    const [posts, setPosts] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setLoading(true);
        const data = await fetchAllNews();
        setPosts(data);
        setLoading(false);
    };

    const handleDelete = async (id: string, title: string) => {
        if (confirm(`Ali ste prepričani, da želite izbrisati "${title}"?`)) {
            try {
                const token = import.meta.env.VITE_SANITY_TOKEN;
                await deleteNewsPost(id, token);
                setPosts(posts.filter(p => p.id !== id));
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Napaka pri brisanju objave');
            }
        }
    };

    const handleEdit = (slug: string) => {
        navigate(`/blog-novice/${slug}?edit=true`);
        onClose();
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="font-serif text-2xl text-olive-dark">Vse novice</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-6 border-b border-gray-200">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Išči novice..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta"
                        />
                    </div>
                </div>

                {/* Posts List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Nalaganje...</div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            {searchQuery ? 'Ni rezultatov' : 'Ni objav'}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    {/* Image */}
                                    {post.image && (
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                        />
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-serif text-lg text-olive-dark truncate">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(post.publishedAt).toLocaleDateString('sl-SI')}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleEdit(post.slug)}
                                            className="p-2 bg-olive/10 text-olive rounded-lg hover:bg-olive/20 transition-colors"
                                            title="Uredi"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post.id, post.title)}
                                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                            title="Izbriši"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllPostsPopup;
