
import React, { useEffect, useState } from 'react';
import { NewsItem } from '../types';
import { fetchNews } from '../sanityClient';
import FadeIn from './FadeIn';
import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPreviewText } from '../utils/newsHelpers';

const NewsSection: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const loadNews = async () => {
      const data = await fetchNews();
      setNews(data);
    };
    loadNews();
  }, []);

  if (news.length === 0) return null;

  return (
    <section id="novice" className="py-20 bg-cream border-t border-black/5 transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-7xl">
        <FadeIn>
          <div className="text-center mb-12 md:mb-16">
            <span className="text-terracotta font-bold uppercase tracking-widest text-xs mb-3 block">Blog & Aktualno</span>
            <h2 className="font-serif text-3xl md:text-4xl text-olive-dark mb-4">Novice s Kmetije</h2>
            <p className="text-olive/70 max-w-2xl mx-auto">Sveže zgodbe iz polj, vinogradov in naše skupnosti.</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item, idx) => (
            <FadeIn key={item.id} delay={idx * 150}>
              <Link 
                to={`/blog-novice/${item.slug}`}
                className="group bg-white rounded-3xl overflow-hidden border border-black/5 hover:shadow-xl transition-all duration-300 h-full flex flex-col"
              >
                <div className="h-40 sm:h-48 overflow-hidden relative">
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs text-terracotta font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Calendar size={12} />
                    {new Date(item.publishedAt).toLocaleDateString('sl-SI')}
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl text-olive-dark mb-3 group-hover:text-olive transition-colors leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-olive/60 text-sm line-clamp-3 mb-4 flex-grow">
                    {getPreviewText(item.body, 140)}
                  </p>
                  <div className="flex items-center gap-2 text-olive-dark font-bold text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
                    Preberi več <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            to="/blog-novice"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-olive/20 text-xs font-bold uppercase tracking-widest text-olive-dark hover:bg-olive-dark hover:text-white transition-all"
          >
            Preberi vse objave
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
