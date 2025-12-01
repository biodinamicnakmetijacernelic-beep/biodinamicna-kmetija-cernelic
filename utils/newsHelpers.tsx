import React from 'react';
import { urlFor } from '../sanityClient';
import DynamicReactRenderer from '../components/blog/DynamicReactRenderer';

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

export const renderPortableText = (body: any[], onImageClick?: (src: string) => void, onLinkClick?: (url: string) => void) => {
  if (!Array.isArray(body)) {
    return <p className="text-base md:text-lg leading-relaxed mb-6 font-light text-olive-dark break-words whitespace-pre-wrap">{String(body || '')}</p>;
  }

  return body.map((block, index) => {
    // Handle PDF embed blocks
    if (block._type === 'pdfEmbed') {
      return (
        <div key={block._key || index} className="my-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{block.name}</h4>
              <p className="text-sm text-gray-600">{block.size} MB</p>
            </div>
            <a href={block.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors text-sm font-medium">
              Odpri PDF
            </a>
          </div>
          <div className="mt-3">
            <iframe src={block.url} className="w-full h-full min-h-screen border border-gray-300 rounded-lg" title={block.name}></iframe>
          </div>
        </div>
      );
    }

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

            // Handle Markdown-style links [text](url) and HTML tags
            if (typeof content === 'string') {
              // Regex to match:
              // 1. Markdown links: [text](url)
              // 2. HTML tags: <tag attributes>...</tag> (simple nesting supported via recursion or iterative parsing)
              // For simplicity and robustness with the specific tags we use, let's use a splitter.

              // We will split by tags and links.
              // Supported tags: <b>, <i>, <strong>, <em>, <span>, <div> (with classes/styles)
              // Note: The toolbar inserts: **, *, <div class="...">, <span class="...">, <span style="...">

              const parts: React.ReactNode[] = [];

              // Helper to parse string content
              const parseContent = (text: string): React.ReactNode[] => {
                const result: React.ReactNode[] = [];
                // Regex for our specific tokens
                // Matches:
                // 1. Markdown link: \[([^\]]+)\]\(([^)]+)\)
                // 2. HTML open tag: <([a-z]+)([^>]*)>
                // 3. HTML close tag: <\/([a-z]+)>
                // 4. Bold: \*\*([^*]+)\*\*
                // 5. Italic: \*([^*]+)\*
                // 6. Newline: \n

                let cursor = 0;
                let currentChildren = result; // This is the array we're building
                while (cursor < text.length) {
                  // Find next start token - updated to include img, iframe, button, and newline
                  const nextToken = text.slice(cursor).match(/(\[([^\]]+)\]\(([^)]+)\))|(\*\*)|(\*)|(<(div|span|img|iframe|button)([^>]*)>)|(<\/(div|span|iframe|button)>)|(\n)/);
                  if (!nextToken) {
                    currentChildren.push(text.slice(cursor));
                    break;
                  }

                  const matchIndex = cursor + nextToken.index!;

                  // Push text before token
                  if (matchIndex > cursor) {
                    currentChildren.push(text.slice(cursor, matchIndex));
                  }

                  const fullMatch = nextToken[0];

                  // Handle Newline
                  if (fullMatch === '\n') {
                    currentChildren.push(<br key={`br-${cursor}`} />);
                    cursor = matchIndex + 1;
                    continue;
                  }

                  // Handle Link (Self-contained)
                  if (fullMatch.startsWith('[')) {
                    const linkMatch = fullMatch.match(/\[([^\]]+)\]\(([^)]+)\)/);
                    if (linkMatch) {
                      const linkText = linkMatch[1];
                      const linkUrl = linkMatch[2];

                      // Always open links in new tab
                      currentChildren.push(
                        <a
                          key={`link-${cursor}`}
                          href={linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-terracotta hover:text-olive-dark transition-colors border-b border-terracotta/30 hover:border-olive-dark font-medium"
                        >
                          {linkText}
                        </a>
                      );
                    }
                    cursor = matchIndex + fullMatch.length;
                    continue;
                  }

                  // Handle Bold (**...**)
                  if (fullMatch === '**') {
                    const endBold = text.indexOf('**', matchIndex + 2);
                    if (endBold !== -1) {
                      const boldContent = text.slice(matchIndex + 2, endBold);
                      currentChildren.push(<strong key={`b-${cursor}`} className="font-bold">{parseContent(boldContent)}</strong>);
                      cursor = endBold + 2;
                      continue;
                    }
                  }

                  // Handle Italic (*...*)
                  if (fullMatch === '*') {
                    const endItalic = text.indexOf('*', matchIndex + 1);
                    if (endItalic !== -1) {
                      const italicContent = text.slice(matchIndex + 1, endItalic);
                      currentChildren.push(<em key={`i-${cursor}`} className="italic">{parseContent(italicContent)}</em>);
                      cursor = endItalic + 1;
                      continue;
                    }
                  }

                  // Handle HTML Tags
                  if (fullMatch.startsWith('<')) {
                    if (fullMatch.startsWith('</')) {
                      // Closing tag - should be handled by recursion if we were strict, 
                      // but here it means we found a stray closing tag or we are inside a recursive call?
                      // Actually, for this simple parser, let's assume balanced tags for the "wrapping" logic.
                      // If we find an opening tag, we look for the matching closing tag.

                      // This simple linear scan might fail with nested same-tags.
                      // But let's try to find the matching closing tag counting depth.
                    } else {
                      // Opening tag
                      const tagName = nextToken[7]; // div, span, img, iframe, or button
                      const attributes = nextToken[8];

                      // Handle self-closing img tag
                      if (tagName === 'img') {
                        const srcMatch = attributes.match(/src="([^"]+)"/);
                        const altMatch = attributes.match(/alt="([^"]+)"/);
                        if (srcMatch) {
                          currentChildren.push(
                            <div key={`img-${cursor}`} className="rounded-2xl overflow-hidden">
                              <img
                                src={srcMatch[1]}
                                alt={altMatch ? altMatch[1] : "Slika"}
                                className="w-full h-auto object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-500"
                                onClick={() => onImageClick && onImageClick(srcMatch[1])}
                                loading="eager"
                              />
                            </div>
                          );
                        }
                        cursor = matchIndex + fullMatch.length;
                        continue;
                      }

                      // Handle iframe (YouTube)
                      if (tagName === 'iframe') {
                        const srcMatch = attributes.match(/src="([^"]+)"/);
                        if (srcMatch) {
                          currentChildren.push(
                            <div key={`iframe-${cursor}`} className="my-10 relative w-full" style={{ paddingBottom: '56.25%' }}>
                              <iframe
                                src={srcMatch[1]}
                                className="absolute top-0 left-0 w-full h-full rounded-2xl shadow-lg"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          );
                        }
                        // Find closing tag
                        const closeIframe = text.indexOf('</iframe>', matchIndex);
                        cursor = closeIframe !== -1 ? closeIframe + '</iframe>'.length : matchIndex + fullMatch.length;
                        continue;
                      }

                      // Handle button
                      if (tagName === 'button') {
                        const urlMatch = attributes.match(/data-url="([^"]+)"/);
                        const closeButton = text.indexOf('</button>', matchIndex);
                        if (closeButton !== -1 && urlMatch) {
                          const buttonText = text.slice(matchIndex + fullMatch.length, closeButton);
                          currentChildren.push(
                            <div key={`btn-${cursor}`} className="my-8 flex justify-center">
                              <a
                                href={urlMatch[1]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-8 py-4 bg-terracotta text-white font-serif text-lg rounded-full hover:bg-terracotta-dark transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                              >
                                {buttonText}
                              </a>
                            </div>
                          );
                          cursor = closeButton + '</button>'.length;
                          continue;
                        }
                      }

                      // Parse attributes for div/span
                      let className = "";
                      let style: React.CSSProperties = {};

                      const classMatch = attributes.match(/class="([^"]+)"/);
                      if (classMatch) className = classMatch[1];

                      const styleMatch = attributes.match(/style="([^"]+)"/);
                      if (styleMatch) {
                        const styleStr = styleMatch[1];
                        // Parse simple style string "color:#..."
                        styleStr.split(';').forEach(s => {
                          const [key, val] = s.split(':');
                          if (key && val) {
                            // Convert CSS property name to camelCase for React style object
                            const camelKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                            style[camelKey as keyof React.CSSProperties] = val.trim();
                          }
                        });
                      }

                      // Find matching closing tag </tagName>
                      // We need to handle nesting of same tag.
                      let depth = 1;
                      let searchCursor = matchIndex + fullMatch.length;
                      let closeIndex = -1;

                      while (searchCursor < text.length) {
                        const nextTag = text.slice(searchCursor).match(new RegExp(`(<${tagName}[^>]*>)|(<\/${tagName}>)`));
                        if (!nextTag) break;

                        if (nextTag[0].startsWith('</')) {
                          depth--;
                        } else {
                          depth++;
                        }

                        if (depth === 0) {
                          closeIndex = searchCursor + nextTag.index!;
                          break;
                        }
                        searchCursor += nextTag.index! + nextTag[0].length;
                      }

                      if (closeIndex !== -1) {
                        const innerContent = text.slice(matchIndex + fullMatch.length, closeIndex);
                        const Component = tagName as any;
                        currentChildren.push(
                          <Component key={`tag-${cursor}`} className={className} style={style}>
                            {parseContent(innerContent)}
                          </Component>
                        );
                        cursor = closeIndex + `</${tagName}>`.length;
                        continue;
                      }
                    }
                  }

                  // If we get here, we matched a token but couldn't process it (e.g. unclosed tag), treat as text
                  currentChildren.push(fullMatch);
                  cursor = matchIndex + fullMatch.length;
                }

                return result;
              };

              content = <>{parseContent(content as string)}</>;
            }

            // Apply marks (existing logic) - kept as fallback or for Sanity-native marks
            if (child.marks && child.marks.length > 0) {
              // ... existing mark logic ...
              // Since we now parse content, marks might duplicate or conflict.
              // But since we are using custom text blocks mostly, marks might not be present.
              // If they are, they wrap the whole content.

              // 1. Handle Link (Sanity native)
              const linkMark = child.marks.find((mark: string) =>
                block.markDefs?.some((def: any) => def._key === mark && def._type === 'link')
              );

              if (linkMark) {
                const linkDef = block.markDefs.find((def: any) => def._key === linkMark);
                if (linkDef) {
                  // Always open links in new tab
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
      const imageUrl = urlFor(block.asset).width(1200).url() + "&auto=format&q=80";
      return (
        <div key={block._key || index} className="rounded-2xl overflow-hidden">
          {onImageClick ? (
            <div
              onClick={() => onImageClick(imageUrl)}
              className="cursor-zoom-in block"
            >
              <img src={imageUrl} alt="Slika v novici" className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500" loading="eager" />
            </div>
          ) : (
            <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="cursor-zoom-in block">
              <img src={imageUrl} alt="Slika v novici" className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500" loading="eager" />
            </a>
          )}
        </div>


      );
    }

    if (block._type === 'customReact' && block.code) {
      return (
        <div key={block._key || index} className="w-full my-8">
          <DynamicReactRenderer
            code={block.code}
            imageData={block.images || {}}
          />
        </div>
      );
    }

    // Legacy support for the specific component if needed, or remove it
    if (block._type === 'customComponent' && block.component === 'regenerative-agriculture') {
      // We can either keep rendering the old component or maybe try to render it dynamically if we had the code?
      // For now, let's assume we want to support the old way OR just remove it if the user said "delete presets".
      // But to avoid breaking existing posts, we might want to keep it or map it.
      // Since the user said "delete presets", I will remove the import above and this block.
      return null;
    }

    if (block._type === 'customHtml' && block.html) {
      return (
        <div
          key={block._key || index}
          className="w-full my-8"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      );
    }

    return null;
  });
};















