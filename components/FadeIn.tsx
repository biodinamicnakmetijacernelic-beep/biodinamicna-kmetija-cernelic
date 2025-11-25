import React, { useEffect, useRef, useState } from 'react';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'left' | 'right' | 'none';
  blur?: boolean;
  scale?: boolean;
}

const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  className = "",
  direction = 'up',
  blur = true,
  scale = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (domRef.current) observer.unobserve(domRef.current);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  const getTransform = () => {
    if (!isVisible) {
      let transform = '';
      switch (direction) {
        case 'up': transform += 'translate-y-12 '; break;
        case 'left': transform += '-translate-x-12 '; break;
        case 'right': transform += 'translate-x-12 '; break;
        case 'none': transform += ''; break;
      }
      if (scale) transform += 'scale-95 ';
      else transform += 'scale-100 ';
      
      return transform;
    }
    return 'translate-y-0 translate-x-0 scale-100';
  };

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 cubic-bezier(0.2, 0.8, 0.2, 1) 
        ${getTransform()} 
        ${isVisible ? 'opacity-100 blur-0' : 'opacity-0'} 
        ${!isVisible && blur ? 'blur-md' : ''} 
        ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default FadeIn;
