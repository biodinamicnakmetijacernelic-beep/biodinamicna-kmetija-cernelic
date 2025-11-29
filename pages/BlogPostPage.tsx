import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchNewsBySlug } from '../sanityClient';
import { NewsItem } from '../types';
import { renderPortableText } from '../utils/newsHelpers';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import Lightbox from '../components/Lightbox';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      setLoading(true);
      const data = await fetchNewsBySlug(slug);
      setPost(data);
      setLoading(false);
    };
    loadPost();
  }, [slug]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  if (loading) {
    return (
      <section className="pt-32 pb-24 bg-white min-h-screen">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="inline-block w-8 h-8 border-2 border-olive/20 border-t-olive rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="pt-32 pb-24 bg-white min-h-screen">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <p className="text-olive/60 mb-8 text-lg">Zapis ni bil najden ali je bil odstranjen.</p>
          <Link
            to="/blog-novice"
            className="inline-flex items-center gap-2 text-olive-dark font-semibold hover:text-olive transition-colors"
          >
            <ArrowLeft size={18} />
            Nazaj na blog
          </Link>
        </div>
      </section>
    );
  }

  return (
    <article className="bg-white min-h-screen">
      {/* Hero Section - Apple Style */}
      <div className="pt-32 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <FadeIn>
            {/* Back Button */}
            <Link
              to="/blog-novice"
              className="inline-flex items-center gap-2 text-olive/60 text-sm font-medium mb-8 hover:text-olive transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Vse objave
            </Link>

            {/* Date & Share */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-sm text-olive/60">
                <Calendar size={16} />
                {new Date(post.publishedAt).toLocaleDateString('sl-SI', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              {navigator.share && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-sm text-olive/60 hover:text-olive transition-colors"
                >
                  <Share2 size={16} />
                  Deli
                </button>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-olive-dark leading-[0.95] tracking-tight mb-6">
              {post.title}
            </h1>
          </FadeIn>
        </div>
      </div>

      {/* Featured Image */}
      {/* Featured Image - HIDDEN per user request */}
      {/* {post.image && (
        <FadeIn delay={200}>
          <div className="container mx-auto px-6 max-w-4xl mb-16">
            <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-[1.75rem] overflow-hidden bg-gray-100 shadow-xl">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </FadeIn>
      )} */}

      {/* Content - Apple Typography */}
      <FadeIn>
        <div className="container mx-auto px-6 max-w-3xl pb-24">
          <div className="prose max-w-none">
            {renderPortableText(post.body, (src) => setLightboxImage(src))}
          </div>

          <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />

          {/* Back to Blog CTA */}
          <div className="mt-16 pt-12 border-t border-black/5">
            <Link
              to="/blog-novice"
              className="inline-flex items-center gap-3 text-olive-dark font-semibold hover:text-olive transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Nazaj na vse objave</span>
            </Link>
          </div>
        </div>
      </FadeIn>
    </article>
  );
};

export default BlogPostPage;

