import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllNews } from '../sanityClient';
import { NewsItem } from '../types';
import { Calendar, ArrowRight } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import { getPreviewText } from '../utils/newsHelpers';

const BlogListPage: React.FC = () => {
  const [posts, setPosts] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
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

  // Featured post (first one)
  const featuredPost = posts.length > 0 ? posts[0] : null;
  const regularPosts = posts.length > 1 ? posts.slice(1) : [];

  // Helper to check if post is new (within 7 days)
  const isNewPost = (publishedAt: string) => {
    const postDate = new Date(publishedAt);
    const now = new Date();
    const daysDiff = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

  return (
    <section className="pt-24 pb-32 bg-white min-h-screen">
      <div className="container mx-auto px-6">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl md:text-6xl text-olive-dark mb-6 tracking-tight">Novice in Vpogledi v Kmetijo</h1>
            <p className="text-lg text-olive/70 max-w-2xl mx-auto font-light">
              Na enem mestu zbiramo vse, kar morate vedeti: sveže novice, poglobljeni zapisi o biodinamiki, prihajajoči dogodki in vpogledi v naše vsakdanje delovanje.
            </p>
          </div>
        </FadeIn>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-olive"></div>
            <p className="mt-4 text-olive/60">Nalaganje...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-olive/60">Trenutno ni objavljenih novic.</p>
          </div>
        )}

        {/* Posts Display */}
        {!loading && posts.length > 0 && (
          <div className="space-y-16">
            {/* Featured Post */}
            {featuredPost && (
              <FadeIn delay={100}>
                <Link
                  to={`/blog-novice/${featuredPost.slug}`}
                  className="group block bg-white rounded-[3rem] overflow-hidden border border-black/5 hover:shadow-2xl transition-all duration-700"
                >
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Image */}
                    <div className="relative h-80 md:h-auto overflow-hidden bg-gray-100">
                      <img
                        src={featuredPost.image || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      {isNewPost(featuredPost.publishedAt) && (
                        <div className="absolute top-6 left-6 bg-terracotta text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                          Novo
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    </div>

                    {/* Content */}
                    <div className="p-10 md:p-16 flex flex-col justify-center">
                      <div className="inline-flex items-center gap-2 text-xs text-terracotta font-semibold uppercase tracking-[0.2em] mb-6">
                        <Calendar size={14} />
                        {new Date(featuredPost.publishedAt).toLocaleDateString('sl-SI')}
                      </div>
                      <h2 className="font-serif text-3xl md:text-5xl text-olive-dark mb-6 leading-tight tracking-tight group-hover:text-olive transition-colors break-words">
                        {featuredPost.title}
                      </h2>
                      <p className="text-olive/70 text-lg leading-relaxed mb-8 font-light break-words">
                        {getPreviewText(featuredPost.body, 280)}
                      </p>
                      <div className="inline-flex items-center gap-3 text-sm font-semibold text-olive-dark group-hover:gap-4 transition-all">
                        Preberi zgodbo
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
                  <FadeIn key={post.id} delay={idx * 80}>
                    <Link
                      to={`/blog-novice/${post.slug}`}
                      className="group block bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-500"
                    >
                      {/* Image */}
                      <div className="h-56 overflow-hidden bg-gray-100">
                        <img
                          src={post.image || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="text-xs text-terracotta font-semibold uppercase tracking-[0.2em] mb-3">
                          {new Date(post.publishedAt).toLocaleDateString('sl-SI', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <h3 className="font-serif text-xl text-olive-dark mb-3 leading-tight group-hover:text-olive transition-colors line-clamp-2 break-words">
                          {post.title}
                        </h3>
                        <p className="text-olive/70 text-sm leading-relaxed line-clamp-3 mb-4 break-words overflow-hidden">
                          {getPreviewText(post.body, 140)}
                        </p>
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-olive-dark group-hover:gap-3 transition-all">
                          Preberi več
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

