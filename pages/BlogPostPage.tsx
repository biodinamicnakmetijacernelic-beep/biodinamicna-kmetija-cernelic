import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { fetchAllNews } from '../sanityClient';
import { NewsItem } from '../types';
import { renderPortableText } from '../utils/newsHelpers';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import Lightbox from '../components/Lightbox';
import LinkPopup from '../components/LinkPopup';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [linkPopupUrl, setLinkPopupUrl] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const location = useLocation();

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

    // Check if admin is logged in
    const adminSession = localStorage.getItem('admin_session');
    setIsAdmin(!!adminSession);

    // Check if edit mode is requested via URL
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('edit') === 'true' && adminSession) {
      setIsEditMode(true);
    }
  }, [location]);

  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleCopyLink = () => {
    if (post) {
      navigator.clipboard.writeText(window.location.href);
      alert('Povezava kopirana!');
      setShowShareMenu(false);
    }
  };

  const handleShareFacebook = () => {
    if (post) {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
      setShowShareMenu(false);
    }
  };

  const handleShareTwitter = () => {
    if (post) {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`, '_blank');
      setShowShareMenu(false);
    }
  };

  const handleShareEmail = () => {
    if (post) {
      window.location.href = `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(window.location.href)}`;
      setShowShareMenu(false);
    }
  };

  const handleShareSMS = () => {
    if (post) {
      window.location.href = `sms:?body=${encodeURIComponent(post.title + ' ' + window.location.href)}`;
      setShowShareMenu(false);
    }
  };

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

              {/* Share Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 text-sm text-olive/60 hover:text-olive transition-colors"
                >
                  <Share2 size={16} />
                  Deli
                </button>

                {showShareMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowShareMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      <button
                        onClick={handleCopyLink}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Kopiraj povezavo
                      </button>
                      <button
                        onClick={handleShareFacebook}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </button>
                      <button
                        onClick={handleShareTwitter}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        Twitter / X
                      </button>
                      <button
                        onClick={handleShareEmail}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email
                      </button>
                      <button
                        onClick={handleShareSMS}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        SMS
                      </button>
                    </div>
                  </>
                )}
              </div>
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
            {renderPortableText(post.body, (src) => setLightboxImage(src), (url) => setLinkPopupUrl(url))}
          </div>

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

      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      <LinkPopup url={linkPopupUrl} onClose={() => setLinkPopupUrl(null)} />
    </article>
  );
};

export default BlogPostPage;

