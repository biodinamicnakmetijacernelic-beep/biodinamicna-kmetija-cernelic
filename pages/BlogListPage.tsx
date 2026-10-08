import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllNews } from '../sanityClient';
import { NewsItem } from '../types';
import { Calendar, ArrowRight, Sparkles } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import { getPreviewText } from '../utils/newsHelpers';
import AdminInventory from '../components/AdminInventory';
import { useNavigate } from 'react-router-dom';
import { isEventPost } from '../data/newsData';

const BlogListPage: React.FC = () => {
  const [posts, setPosts] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'events' | 'news'>('all');
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);

    // Check if admin is logged in
    const adminSession = localStorage.getItem('admin_session');
    setIsAdmin(!!adminSession);
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      const data = await fetchAllNews();
      // Filter out posts without slugs to prevent broken links
      const validPosts = data.filter(post => post.slug);
      setPosts(validPosts);
      setLoading(false);
    };
    loadPosts();
  }, []);

  // Filter posts based on selected tab
  const filteredPosts = posts.filter(post => {
    if (filter === 'events') return isEventPost(post);
    if (filter === 'news') return !isEventPost(post);
    return true;
  });

  // Featured post (first one of current filter)
  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const regularPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  // Helper to check if post is new (within 7 days)
  const isNewPost = (publishedAt: string) => {
    const postDate = new Date(publishedAt);
    const now = new Date();
    const daysDiff = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

  const eventCount = posts.filter(isEventPost).length;
  const newsCount = posts.filter(p => !isEventPost(p)).length;

  return (
    <section className="pt-28 md:pt-32 pb-32 bg-white min-h-screen">
      <div className="container mx-auto px-6">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-12">
            <span className="text-terracotta font-bold uppercase tracking-widest text-xs mb-3 block">Aktualno & Blog</span>
            <h1 className="font-serif text-4xl md:text-5xl text-olive-dark mb-6 tracking-tight">Novice in Dogodki</h1>
            <p className="text-lg text-olive/70 max-w-2xl mx-auto font-light">
              Na enem mestu zbiramo vse, kar morate vedeti: prihajajoča usposabljanja in delavnice, sveže novice ter poglobljene vpoglede v biodinamično kmetovanje.
            </p>
          </div>
        </FadeIn>

        {/* Filter Pills */}
        {!loading && posts.length > 0 && (
          <FadeIn>
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-14">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                  filter === 'all'
                    ? 'bg-olive-dark text-white shadow-md'
                    : 'bg-cream text-olive/70 hover:bg-cream-dark hover:text-olive-dark'
                }`}
              >
                Vse objave ({posts.length})
              </button>
              <button
                onClick={() => setFilter('events')}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 ${
                  filter === 'events'
                    ? 'bg-terracotta text-white shadow-md'
                    : 'bg-cream text-olive/70 hover:bg-cream-dark hover:text-olive-dark'
                }`}
              >
                <span>📅</span> Dogodki & Usposabljanja ({eventCount})
              </button>
              <button
                onClick={() => setFilter('news')}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                  filter === 'news'
                    ? 'bg-olive-dark text-white shadow-md'
                    : 'bg-cream text-olive/70 hover:bg-cream-dark hover:text-olive-dark'
                }`}
              >
                Novice & Zgodbe ({newsCount})
              </button>
            </div>
          </FadeIn>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-olive"></div>
            <p className="mt-4 text-olive/60">Nalaganje...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-olive/60">V tej kategoriji trenutno ni objav.</p>
          </div>
        )}

        {/* Posts Display */}
        {!loading && filteredPosts.length > 0 && (
          <div className="space-y-16">
            {/* Featured Post */}
            {featuredPost && (
              <FadeIn>
                <Link
                  to={`/blog-novice/${featuredPost.slug}`}
                  className="group block bg-white rounded-[3rem] overflow-hidden border border-black/5 hover:shadow-2xl transition-all duration-700"
                >
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Image */}
                    <div className="relative h-64 sm:h-80 md:h-auto overflow-hidden bg-gray-100">
                      <img
                        src={featuredPost.image || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      {isEventPost(featuredPost) ? (
                        <div className="absolute top-6 left-6 bg-terracotta text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          {featuredPost.eventDate ? `Dogodek: ${featuredPost.eventDate.split('(')[0].trim()}` : 'Dogodek'}
                        </div>
                      ) : isNewPost(featuredPost.publishedAt) ? (
                        <div className="absolute top-6 left-6 bg-olive-dark text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                          Novo
                        </div>
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    </div>

                    {/* Content */}
                    <div className="p-10 md:p-16 flex flex-col justify-center">
                      <div className="inline-flex items-center gap-2 text-xs text-terracotta font-semibold uppercase tracking-[0.2em] mb-6">
                        <Calendar size={14} />
                        {featuredPost.eventDate || new Date(featuredPost.publishedAt).toLocaleDateString('sl-SI')}
                      </div>
                      <h2 className="font-serif text-3xl md:text-4xl text-olive-dark mb-6 leading-tight tracking-tight group-hover:text-olive transition-colors break-words">
                        {featuredPost.title}
                      </h2>
                      <p className="text-olive/70 text-lg leading-relaxed mb-8 font-light break-words">
                        {getPreviewText(featuredPost.body, 280)}
                      </p>
                      <div className="inline-flex items-center gap-3 text-sm font-semibold text-olive-dark group-hover:gap-4 transition-all">
                        {isEventPost(featuredPost) ? 'Podrobnosti o dogodku & vabilo' : 'Preberi zgodbo'}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            )}

            {/* Regular Posts Grid - Clean Apple Style */}
            {regularPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post, idx) => (
                  <FadeIn key={post.id}>
                    <Link
                      to={`/blog-novice/${post.slug}`}
                      className="group block bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-500 border border-black/5 h-full flex flex-col"
                    >
                      {/* Image */}
                      <div className="h-48 sm:h-56 overflow-hidden bg-gray-100 relative">
                        <img
                          src={post.image || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {isEventPost(post) && (
                          <div className="absolute top-4 left-4 bg-terracotta text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Dogodek
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="text-xs text-terracotta font-semibold uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
                          <Calendar size={12} />
                          {post.eventDate || new Date(post.publishedAt).toLocaleDateString('sl-SI', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <h3 className="font-serif text-lg sm:text-xl text-olive-dark mb-3 leading-tight group-hover:text-olive transition-colors line-clamp-2 break-words">
                          {post.title}
                        </h3>
                        <p className="text-olive/70 text-sm leading-relaxed line-clamp-3 mb-4 break-words overflow-hidden flex-grow">
                          {getPreviewText(post.body, 140)}
                        </p>
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-olive-dark group-hover:gap-3 transition-all mt-auto">
                          {isEventPost(post) ? 'Več o dogodku' : 'Preberi več'}
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </section>
  );
};

export default BlogListPage;

