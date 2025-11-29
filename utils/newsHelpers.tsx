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
          className += " border-l-4 border-terracotta pl-6 py-2 my-8 italic text-lg md:text-xl text-olive/80 bg-cream/30 rounded-r-lg whitespace-pre-wrap";
          break;
        default:
          Component = 'p';
          className += " text-base md:text-lg leading-relaxed mb-6 font-light whitespace-pre-wrap";
      }

      return (
        <Component key={block._key || index} className={className}>
          {block.children?.map((child: any, childIndex: number) => {
            let content: React.ReactNode = child.text;

            // Handle Markdown-style links [text](url)
            if (typeof content === 'string') {
              const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
              const parts = [];
              let lastIndex = 0;
              let match;

              while ((match = linkRegex.exec(content)) !== null) {
                // Add text before the link
                if (match.index > lastIndex) {
                  parts.push(content.slice(lastIndex, match.index));
                }

                // Add the link
                parts.push(
                  <a
                    key={`link-${match.index}`}
                    href={match[2]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-terracotta hover:text-olive-dark transition-colors border-b border-terracotta/30 hover:border-olive-dark font-medium"
                  >
                    {match[1]}
                  </a>
                );

                lastIndex = match.index + match[0].length;
              }

              // Add remaining text
              if (lastIndex < content.length) {
                parts.push(content.slice(lastIndex));
              }

              if (parts.length > 0) {
                content = <>{parts}</>;
              }
            }

            // Apply marks (existing logic)
            if (child.marks && child.marks.length > 0) {
              // ... existing mark logic ...
              // Note: If we already parsed markdown links, marks might wrap the whole thing or parts.
              // Ideally, we should handle marks first or carefully combine.
              // For simplicity, let's assume markdown links are used in plain text blocks mostly.

              // 1. Handle Link (Sanity native)
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

    if (block._type === 'button') {
      return (
        <div key={block._key || index} className="my-8 flex justify-center">
          <a
            href={block.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 bg-terracotta text-white font-serif text-lg rounded-full hover:bg-terracotta-dark transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {block.text}
          </a>
        </div>
      );
    }

    if (block._type === 'image' && block.asset) {
      const imageUrl = urlFor(block.asset).width(1200).url();
      return (
        <div key={block._key || index} className="my-10 rounded-2xl overflow-hidden shadow-lg">
          <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="cursor-zoom-in block">
            <img src={imageUrl} alt="Slika v novici" className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500" />
          </a>
        </div>
      );
    }

    return null;
  });
};














