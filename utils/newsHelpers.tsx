import React from 'react';
import { urlFor } from '../sanityClient';

export const getPreviewText = (body: any[], maxLength = 160) => {
  if (!Array.isArray(body)) {
    const text = typeof body === 'string' ? body : '';
    return maxLength ? `${text.slice(0, maxLength)}${text.length > maxLength ? '…' : ''}` : text;
  }

  const combined = body
    .filter((block) => block?._type === 'block')
    .map((block) => block.children?.map((child: any) => child.text).join(''))
    .join(' ');

  if (!maxLength) {
    return combined;
  }

  return combined.length > maxLength ? `${combined.slice(0, maxLength)}…` : combined;
};

export const renderPortableText = (body: any[]) => {
  if (!Array.isArray(body)) {
    return <p className="text-base md:text-lg leading-relaxed mb-6 font-light text-olive-dark break-words whitespace-pre-wrap">{String(body || '')}</p>;
  }

  return body.map((block, index) => {
    if (block._type === 'block') {
      const style = block.style || 'normal';

      // Define styles based on block type
      let className = "break-words text-olive-dark";
      let Component: any = 'p';

      switch (style) {
        case 'h2':
          Component = 'h2';
          className += " font-serif text-3xl md:text-4xl font-semibold mt-12 mb-6 leading-tight";
          break;
        case 'h3':
          Component = 'h3';
          className += " font-serif text-2xl md:text-3xl font-semibold mt-10 mb-4 leading-tight";
          break;
        case 'h4':
          Component = 'h4';
          className += " font-serif text-xl md:text-2xl font-semibold mt-8 mb-3 leading-tight";
          break;
        case 'blockquote':
          Component = 'blockquote';
          className += " border-l-4 border-terracotta pl-6 py-2 my-8 italic text-lg md:text-xl text-olive/80 bg-cream/30 rounded-r-lg";
          break;
        default:
          Component = 'p';
          className += " text-base md:text-lg leading-relaxed mb-6 font-light";
      }

      return (
        <Component key={block._key || index} className={className}>
          {block.children?.map((child: any, childIndex: number) => {
            let content: React.ReactNode = child.text;

            // Apply marks
            if (child.marks && child.marks.length > 0) {
              // 1. Handle Link
              const linkMark = child.marks.find((mark: string) =>
                block.markDefs?.some((def: any) => def._key === mark && def._type === 'link')
              );

              if (linkMark) {
                const linkDef = block.markDefs.find((def: any) => def._key === linkMark);
                if (linkDef) {
                  content = (
                    <a
                      href={linkDef.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-terracotta hover:text-olive-dark transition-colors border-b border-terracotta/30 hover:border-olive-dark"
                    >
                      {content}
                    </a>
                  );
                }
              }

              // 2. Handle Strong
              if (child.marks.includes('strong')) {
                content = <strong className="font-semibold text-olive-dark">{content}</strong>;
              }

              // 3. Handle Em/Italic
              if (child.marks.includes('em')) {
                content = <em className="italic">{content}</em>;
              }
            }

            return <React.Fragment key={childIndex}>{content}</React.Fragment>;
          })}
        </Component>
      );
    }

    if (block._type === 'image' && block.asset) {
      const imageUrl = urlFor(block.asset).width(1200).url();
      return (
        <div key={block._key || index} className="my-10 rounded-2xl overflow-hidden shadow-lg">
          <img src={imageUrl} alt="Slika v novici" className="w-full h-auto object-cover" />
        </div>
      );
    }

    return null;
  });
};












