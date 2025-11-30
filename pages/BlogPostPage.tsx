import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { fetchNewsBySlug, updateNewsPost } from '../sanityClient';
import { NewsItem } from '../types';
import { renderPortableText } from '../utils/newsHelpers';
import getCroppedImg from '../utils/imageHelpers';
import Cropper from 'react-easy-crop';
import { ArrowLeft, Calendar, Share2, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Palette, Link as LinkIcon, Image as ImageIcon, Video, MousePointerClick, Heading2, Heading3, ZoomIn, ZoomOut, Check, X, Pencil, Sprout, Code, LayoutTemplate, Info, FileText } from 'lucide-react';
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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Image Cropping State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (tempImageSrc && croppedAreaPixels) {
      try {
        const croppedImageBlob = await getCroppedImg(tempImageSrc, croppedAreaPixels);
        if (croppedImageBlob) {
          const file = new File([croppedImageBlob], "thumbnail.jpg", { type: "image/jpeg" });
          setThumbnailFile(file);
          setThumbnailPreview(URL.createObjectURL(croppedImageBlob));
          setIsCropping(false);
          setTempImageSrc(null);
        }
      } catch (e) {
        console.error(e);
        alert('Napaka pri obrezovanju slike.');
      }
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setTempImageSrc(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const nodeToPortableText = (node: Node, markDefs: any[]): any => {
    if (node.nodeType === 3) { // Text node
      // Preserve whitespace, but maybe collapse multiple spaces if needed?
      // For now, let's keep it as is but be careful about trimming.
      // If we trim everything, we lose spaces between inline elements.
      const text = node.nodeValue || '';
      // Only ignore if it's purely whitespace AND it's a direct child of a container that handles blocks (like body)
      // But here we are recursive.
      // If the parent is a block element (p, div, etc), we should keep the text.
      // If the parent is body, and it's just whitespace between divs, we might want to ignore it OR treat it as a break?

      // Let's try to keep it, but maybe normalize newlines?
      // If we return null, it's gone.

      if (!text) return null;

      return {
        _type: 'span',
        _key: `span-${Math.random()}`,
        text: text,
        marks: [],
      };
    }

    if (node.nodeType !== 1) return null; // Not an element node

    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();

    let children = Array.from(element.childNodes).map(child => nodeToPortableText(child, markDefs)).filter(Boolean);

    switch (tagName) {
      case 'strong':
      case 'b':
        children.forEach((child: any) => {
          if (child._type === 'span' && !child.marks.includes('strong')) {
            child.marks.push('strong');
          }
        });
        return children;

      case 'em':
      case 'i':
        children.forEach((child: any) => {
          if (child._type === 'span' && !child.marks.includes('em')) {
            child.marks.push('em');
          }
        });
        return children;

      case 'u':
        children.forEach((child: any) => {
          if (child._type === 'span' && !child.marks.includes('underline')) {
            child.marks.push('underline'); // Note: Sanity needs 'underline' decorator in schema
          }
        });
        return children;

      case 'a':
        const linkDef = {
          _type: 'link',
          _key: `link-${Math.random()}`,
          href: element.getAttribute('href'),
        };
        markDefs.push(linkDef);
        children.forEach((child: any) => {
          if (child._type === 'span') {
            child.marks.push(linkDef._key);
          }
        });
        return children;

      case 'br':
        return {
          _type: 'span',
          _key: `span-${Math.random()}`,
          text: '\n',
          marks: []
        };

      case 'p':
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
      case 'blockquote':
      case 'li':
      case 'pre':
        // If children list is empty, we still want to return a block to preserve the vertical space/structure
        // unless it's completely empty and useless?
        // But <p><br></p> is common for empty lines.

        // Flatten children arrays
        const flatChildren = children.flat();

        // If no children, add an empty span to make it a valid block
        if (flatChildren.length === 0) {
          flatChildren.push({
            _type: 'span',
            _key: `span-${Math.random()}`,
            text: '',
            marks: []
          });
        }

        return {
          _type: 'block',
          _key: `block-${Math.random()}`,
          style: tagName === 'p' ? 'normal' : tagName,
          children: flatChildren,
          markDefs: [],
        };

      case 'ul':
      case 'ol':
        // Lists in Portable Text are just blocks with listItem property.
        // But here we are returning an array of blocks (li's).
        // We need to process children (which should be li's) and add listItem property.
        // However, our recursive structure returns blocks for li's already.
        // We just need to flatten them and maybe ensure they have listItem set?
        // Actually, 'li' case above returns a block. We need to add 'listItem' to it.

        // Wait, standard Portable Text has `listItem: 'bullet'` property on the block itself.
        // Our `li` case returns a block. We should modify it here.

        return children.flat().map((child: any) => {
          if (child._type === 'block') {
            return {
              ...child,
              listItem: tagName === 'ul' ? 'bullet' : 'number'
            };
          }
          return child;
        });

      case 'div':
        // Handle custom layout marker
        if (element.getAttribute('data-custom-layout') === 'regenerative-agriculture') {
          return {
            _type: 'customComponent',
            _key: `custom-${Math.random()}`,
            component: 'regenerative-agriculture'
          };
        }

        // Handle custom React marker
        if (element.getAttribute('data-custom-react') === 'true') {
          const content = element.getAttribute('data-content');
          if (content) {
            return {
              _type: 'customReact',
              _key: `react-${Math.random()}`,
              code: decodeURIComponent(content)
            };
          }
        }

        // Handle PDF marker
        if (element.getAttribute('data-pdf') === 'true') {
          const pdfUrl = element.getAttribute('data-pdf-url');
          const pdfName = element.getAttribute('data-pdf-name');
          const pdfSize = element.getAttribute('data-pdf-size');
          if (pdfUrl && pdfName && pdfSize) {
            return {
              _type: 'pdfEmbed',
              _key: `pdf-${Math.random()}`,
              url: pdfUrl,
              name: pdfName,
              size: pdfSize
            };
          }
        }

        // Handle custom HTML marker
        if (element.getAttribute('data-custom-html') === 'true') {
          const content = element.getAttribute('data-content');
          if (content) {
            return {
              _type: 'customHtml',
              _key: `html-${Math.random()}`,
              html: decodeURIComponent(content)
            };
          }
        }

        // Handle divs that act as block containers
        // If a div contains blocks, return them flattened.
        // If it contains inline content, wrap in a block.
        const flatDivChildren = children.flat();

        if (flatDivChildren.length > 0) {
          const containsBlock = flatDivChildren.some((c: any) => c._type === 'block' || c._type === 'image' || c._type === 'customReact' || c._type === 'customHtml' || c._type === 'pdfEmbed');

          if (containsBlock) {
            // If it contains blocks, we just return the children. 
            // Inline elements between blocks might need to be wrapped?
            // For simplicity, let's assume handlePaste normalized this.
            return flatDivChildren;
          }

          // Wrap inline content in a 'normal' paragraph block
          return {
            _type: 'block',
            _key: `block-${Math.random()}`,
            style: 'normal',
            children: flatDivChildren,
            markDefs: [],
          };
        }
        return null;

      case 'img':
        // Store images as HTML string in a block instead of as image asset
        // This allows us to preserve the image URL without needing to upload to Sanity
        const imgSrc = element.getAttribute('src') || '';
        const imgAlt = element.getAttribute('alt') || 'Slika';
        const imgClass = element.getAttribute('class') || 'w-full h-auto object-cover';
        const imgLoading = element.getAttribute('loading') || 'lazy';
        const imgHtml = `<div class="rounded-2xl overflow-hidden"><img src="${imgSrc}" alt="${imgAlt}" class="${imgClass}" loading="${imgLoading}" /></div>`;
        return {
          _type: 'block',
          _key: `block-${Math.random()}`,
          style: 'normal',
          children: [{
            _type: 'span',
            _key: `span-${Math.random()}`,
            text: imgHtml,
            marks: ['html-image']
          }],
          markDefs: []
        };

      case 'iframe':
        // Handle YouTube embeds
        const iframeSrc = element.getAttribute('src') || '';
        // We only save the iframe tag itself. The wrapper for aspect ratio is added by newsHelpers.tsx during rendering.
        // If we save the wrapper here, we get double wrappers (double padding) in the final view.
        const iframeHtml = `<iframe src="${iframeSrc}" class="absolute top-0 left-0 w-full h-full rounded-2xl" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        return {
          _type: 'block',
          _key: `block-${Math.random()}`,
          style: 'normal',
          children: [{
            _type: 'span',
            _key: `span-${Math.random()}`,
            text: iframeHtml,
            marks: ['html-image']
          }],
          markDefs: []
        };

      default:
        return children.flat(); // Flatten unknown tags
    }
  };

  // Helper function to convert HTML content to Portable Text
  const convertToPortableText = (htmlContent: string): any[] => {
    if (!htmlContent?.trim()) return [];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${htmlContent}</body>`, 'text/html');
      const markDefs: any[] = [];

      const bodyNodes = Array.from(doc.body.childNodes);
      const portableTextBlocks = bodyNodes
        .map(node => nodeToPortableText(node, markDefs))
        .flat()
        .filter(Boolean)
        .filter(block => {
          // Filter out invalid blocks
          if (!block || typeof block !== 'object') return false;
          if (block._type === 'block') {
            // Ensure block has required fields
            if (!block.children || !Array.isArray(block.children) || block.children.length === 0) {
              return false;
            }
            // Ensure children are valid spans (including HTML image spans)
            const validChildren = block.children.filter((child: any) => {
              return child && child._type === 'span' && child.text !== undefined;
            });
            if (validChildren.length === 0) return false;
            block.children = validChildren;
          }
          // Also allow image blocks for backwards compatibility
          if (block._type === 'image') {
            return true;
          }
          // Allow custom component blocks
          if (block._type === 'customComponent') {
            return true;
          }
          // Allow custom HTML blocks
          if (block._type === 'customHtml') {
            return true;
          }
          // Allow custom React blocks
          if (block._type === 'customReact') {
            return true;
          }
          // Allow PDF embed blocks
          if (block._type === 'pdfEmbed') {
            return true;
          }
          return true;
        });

      // Associate markDefs with the blocks that use them
      portableTextBlocks.forEach(block => {
        if (block._type === 'block' && block.children) {
          const blockMarkKeys = new Set(block.children.flatMap((c: any) => c.marks || []));
          block.markDefs = markDefs.filter(def => blockMarkKeys.has(def._key));
        }
      });

      // If no valid blocks, return at least one empty block
      if (portableTextBlocks.length === 0) {
        return [{
          _type: 'block',
          _key: `block-${Date.now()}`,
          style: 'normal',
          children: [{
            _type: 'span',
            _key: `span-${Date.now()}`,
            text: '',
            marks: []
          }],
          markDefs: []
        }];
      }

      return portableTextBlocks;
    } catch (error) {
      console.error('Error converting HTML to Portable Text:', error);
      // Return empty block on error
      return [{
        _type: 'block',
        _key: `block-${Date.now()}`,
        style: 'normal',
        children: [{
          _type: 'span',
          _key: `span-${Date.now()}`,
          text: '',
          marks: []
        }],
        markDefs: []
      }];
    }
  };

  // Formatting functions for the toolbar
  const formatText = (command: string) => {
    const editor = document.getElementById('editor') as HTMLElement;
    if (!editor) return;

    editor.focus();

    switch (command) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'h2':
        document.execCommand('formatBlock', false, 'h2');
        break;
      case 'h3':
        document.execCommand('formatBlock', false, 'h3');
        break;
      case 'left':
        document.execCommand('justifyLeft', false);
        break;
      case 'center':
        document.execCommand('justifyCenter', false);
        break;
      case 'right':
        document.execCommand('justifyRight', false);
        break;
    }

    // Update the state with the new content
    setEditedContent(editor.innerHTML);
  };

  const insertLink = () => {
    const editor = document.getElementById('editor') as HTMLElement;
    if (!editor) return;

    const url = prompt('Vnesite URL povezave:');
    if (url) {
      const text = prompt('Vnesite besedilo povezave:', 'povezava') || 'povezava';
      const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      document.execCommand('insertHTML', false, linkHtml);
      setEditedContent(editor.innerHTML);
    }
  };

  const insertImage = () => {
    // Odpri file dialog
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const changeTextColor = (color: string) => {
    const editor = document.getElementById('editor') as HTMLElement;
    if (!editor) return;

    editor.focus();
    document.execCommand('foreColor', false, color);
    setEditedContent(editor.innerHTML);
    setShowColorPicker(false);
  };

  const changeFontSize = (size: string) => {
    const editor = document.getElementById('editor') as HTMLElement;
    if (!editor) return;

    if (size && size.trim()) {
      // Če je velikost v px, pretvori v execCommand velikost (1-7)
      let execSize = size;
      if (size.endsWith('px')) {
        const px = parseInt(size);
        if (px <= 12) execSize = '1';
        else if (px <= 14) execSize = '2';
        else if (px <= 16) execSize = '3';
        else if (px <= 18) execSize = '4';
        else if (px <= 24) execSize = '5';
        else if (px <= 32) execSize = '6';
        else execSize = '7';
      }

      editor.focus();
      document.execCommand('fontSize', false, execSize);
      setEditedContent(editor.innerHTML);
    }
  };

  const changeFontFamily = (family: string) => {
    const editor = document.getElementById('editor') as HTMLElement;
    if (!editor) return;

    const familyMap: { [key: string]: string } = {
      'font-sans': 'Arial, sans-serif',
      'font-serif': 'Times New Roman, serif',
      'font-mono': 'Courier New, monospace'
    };

    const execFamily = familyMap[family];
    if (execFamily) {
      editor.focus();
      document.execCommand('fontName', false, execFamily);
      setEditedContent(editor.innerHTML);
    }
  };

  const insertYouTube = () => {
    const editor = document.getElementById('editor') as HTMLElement;
    if (!editor) return;

    const url = prompt('Vnesite YouTube URL ali video ID:');
    if (url) {
      // Extract video ID from URL
      const videoId = extractYouTubeId(url);
      if (videoId) {
        const embedHtml = `<div class="relative w-full" style="padding-bottom: 56.25%"><iframe src="https://www.youtube.com/embed/${videoId}" class="absolute top-0 left-0 w-full h-full rounded-2xl" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p><br></p>`;
        document.execCommand('insertHTML', false, embedHtml);
        setEditedContent(editor.innerHTML);
      } else {
        alert('Neveljaven YouTube URL');
      }
    }
  };

  const insertPDF = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.type !== 'application/pdf') {
        alert('Prosimo izberite PDF datoteko');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('PDF je prevelik. Največja dovoljena velikost je 10MB.');
        return;
      }

      try {
        const token = (import.meta as any).env.VITE_SANITY_TOKEN;
        if (!token) {
          alert('Napaka: Manjka Sanity token');
          return;
        }

        // Upload PDF to Sanity
        const { uploadPDFFileToSanityWithToken } = await import('../utils/sanityImageUpload');
        const pdfUrl = await uploadPDFFileToSanityWithToken(file, token);

        const editor = document.getElementById('editor') as HTMLElement;
        if (!editor) return;

        const pdfHtml = `<div class="my-4 p-4 bg-gray-50 rounded-xl border border-gray-200" data-pdf="true" data-pdf-url="${pdfUrl}" data-pdf-name="${file.name}" data-pdf-size="${(file.size / 1024 / 1024).toFixed(2)}">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 bg-red-100 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900">${file.name}</h4>
              <p class="text-sm text-gray-600">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <a href="${pdfUrl}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors text-sm font-medium">
              Odpri PDF
            </a>
          </div>
          <div class="mt-3">
            <iframe src="${pdfUrl}" class="w-full h-full min-h-screen border border-gray-300 rounded-lg" title="${file.name}"></iframe>
          </div>
        </div>\n\n`;

        document.execCommand('insertHTML', false, pdfHtml);
        setEditedContent(editor.innerHTML);
      } catch (error) {
        console.error('PDF upload failed:', error);
        alert(`Napaka pri nalaganju PDF: ${error instanceof Error ? error.message : 'Neznana napaka'}`);
      }
    };
    input.click();
  };

  const insertButton = () => {
    const editor = document.getElementById('editor') as HTMLElement;
    if (!editor) return;

    const text = prompt('Vnesite besedilo gumba:', 'Preberi več') || 'Preberi več';
    const url = prompt('Vnesite URL povezave:', 'https://') || 'https://';
    const buttonHtml = `<div class="my-6 text-center"><a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-white rounded-xl font-semibold hover:bg-terracotta-dark transition-colors">${text}</a></div>`;
    document.execCommand('insertHTML', false, buttonHtml);
    setEditedContent(editor.innerHTML);
  };

  const insertCustomLayout = (type: 'react' | 'html', content?: string) => {
    const editor = document.getElementById('editor') as HTMLElement;
    if (!editor) return;

    let layoutNode: HTMLElement | null = null;

    if (type === 'react' && content) {
      const encodedContent = encodeURIComponent(content);
      const div = document.createElement('div');
      div.setAttribute('data-custom-react', 'true');
      div.setAttribute('data-content', encodedContent);
      div.className = "my-8 p-4 bg-blue-50 border border-blue-200 rounded-lg font-mono text-sm text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap";
      div.textContent = `⚛️ React Komponenta: ${content.substring(0, 50)}...`;
      layoutNode = div;
    } else if (type === 'html' && content) {
      const encodedContent = encodeURIComponent(content);
      const div = document.createElement('div');
      div.setAttribute('data-custom-html', 'true');
      div.setAttribute('data-content', encodedContent);
      div.className = "my-8 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap";
      div.textContent = `💻 HTML Koda: ${content.substring(0, 50)}...`;
      layoutNode = div;
    }

    if (layoutNode) {
      editor.focus();
      const selection = window.getSelection();

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Check if range is inside editor
        if (editor.contains(range.commonAncestorContainer)) {
          range.deleteContents();
          range.insertNode(layoutNode);

          // Insert a break after
          const br = document.createElement('p');
          br.innerHTML = '<br>';
          range.setStartAfter(layoutNode);
          range.insertNode(br);

          // Move cursor to new line
          range.setStart(br, 0);
          range.setEnd(br, 0);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          // Fallback: append to end
          editor.appendChild(layoutNode);
          const br = document.createElement('p');
          br.innerHTML = '<br>';
          editor.appendChild(br);
        }
      } else {
        // No selection, append to end
        editor.appendChild(layoutNode);
        const br = document.createElement('p');
        br.innerHTML = '<br>';
        editor.appendChild(br);
      }

      setEditedContent(editor.innerHTML);
    }
    setShowLayoutModal(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preveri če je slika
    if (!file.type.startsWith('image/')) {
      alert('Prosimo izberite slikovno datoteko');
      return;
    }

    // Preveri velikost (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Slika je prevelika. Največja dovoljena velikost je 5MB.');
      return;
    }

    try {
      const token = (import.meta as any).env.VITE_SANITY_TOKEN;
      if (!token) {
        alert('Napaka: Manjka Sanity token');
        return;
      }

      // Upload image to Sanity
      const { uploadImageToSanityWithToken } = await import('../utils/sanityImageUpload');
      const imageUrl = await uploadImageToSanityWithToken(file, token);

      const editor = document.getElementById('editor') as HTMLElement;
      if (!editor) return;

      // Vstavi sliko na trenutno pozicijo cursora
      const imageHtml = `<div class="rounded-2xl overflow-hidden"><img src="${imageUrl}" alt="${file.name}" class="w-full h-auto object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-500" loading="lazy" /></div>\n\n`;
      document.execCommand('insertHTML', false, imageHtml);
      setEditedContent(editor.innerHTML);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert(`Napaka pri nalaganju slike: ${error instanceof Error ? error.message : 'Neznana napaka'}`);
    }

    // Reset file input
    event.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedHtml = e.clipboardData.getData('text/html');
    const pastedText = e.clipboardData.getData('text/plain');

    let contentToInsert = '';

    if (pastedHtml && pastedHtml.length > 0) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(pastedHtml, 'text/html');

      const extractContent = (node: Node): string => {
        if (node.nodeType === 3) {
          return node.textContent || '';
        }

        if (node.nodeType === 1) {
          const element = node as HTMLElement;
          const tagName = element.tagName.toLowerCase();

          // Handle links
          if (tagName === 'a') {
            const href = element.getAttribute('href') || '';
            const text = element.textContent || '';
            return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
          }

          // Handle formatting tags - preserve them
          if (['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'sub', 'sup', 'code'].includes(tagName)) {
            const children = Array.from(element.childNodes)
              .map(child => extractContent(child))
              .join('');
            return `<${tagName}>${children}</${tagName}>`;
          }

          // Handle block elements
          if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'li', 'ul', 'ol', 'pre'].includes(tagName)) {
            const children = Array.from(element.childNodes)
              .map(child => extractContent(child))
              .join('');
            const trimmed = children.trim();

            if (trimmed) {
              if (tagName === 'li') return `<li>${trimmed}</li>`;
              if (tagName === 'ul') return `<ul>${trimmed}</ul>`;
              if (tagName === 'ol') return `<ol>${trimmed}</ol>`;
              if (tagName.startsWith('h')) return `<${tagName}>${trimmed}</${tagName}>`;
              if (tagName === 'blockquote') return `<blockquote>${trimmed}</blockquote>`;
              if (tagName === 'pre') return `<pre>${trimmed}</pre>`;

              // For p, return p
              if (tagName === 'p') return `<p>${trimmed}</p>`;

              // For div, if it contains block elements, don't wrap
              if (tagName === 'div') {
                // Check if it looks like it has block tags
                if (/<(p|div|h[1-6]|ul|ol|li|blockquote|pre)/.test(trimmed)) {
                  return trimmed;
                }
                return `<p>${trimmed}</p>`;
              }

              return `<p>${trimmed}</p>`;
            }
            return '';
          }

          if (tagName === 'br') {
            return '<br>';
          }

          // Handle spans - check for bold/italic styles if needed, otherwise just extract content
          if (tagName === 'span') {
            const style = element.getAttribute('style') || '';
            let content = Array.from(element.childNodes)
              .map(child => extractContent(child))
              .join('');

            // Simple style preservation (optional, can be expanded)
            if (style.includes('font-weight: bold') || style.includes('font-weight: 700')) {
              content = `<strong>${content}</strong>`;
            }
            if (style.includes('font-style: italic')) {
              content = `<em>${content}</em>`;
            }
            if (style.includes('text-decoration: underline')) {
              content = `<u>${content}</u>`;
            }

            if (element.style.display === 'block') {
              return content.trim() ? `<p>${content}</p>` : '';
            }
            return content;
          }

          // For other elements, extract their content
          return Array.from(element.childNodes)
            .map(child => extractContent(child))
            .join('');
        }

        return '';
      };

      const bodyNodes = Array.from(doc.body.childNodes);
      const extractedBlocks: string[] = [];

      // Process nodes and group content into logical blocks
      let currentBlock = '';
      for (const node of bodyNodes) {
        const extracted = extractContent(node);
        if (extracted) {
          // Check if this is a block element (or starts with one)
          const isBlock = /^(<p>|<h[1-6]>|blockquote|<li>|<ul>|<ol>|<div|<pre)/.test(extracted);

          if (isBlock) {
            if (currentBlock.trim()) {
              extractedBlocks.push(`<p>${currentBlock.trim()}</p>`);
              currentBlock = '';
            }
            extractedBlocks.push(extracted);
          } else {
            // It's inline content or just text
            currentBlock += extracted;
          }
        }
      }

      if (currentBlock.trim()) {
        extractedBlocks.push(`<p>${currentBlock.trim()}</p>`);
      }

      // Join blocks
      contentToInsert = extractedBlocks.join('');

    } else {
      // Handle plain text
      const paragraphs = pastedText
        .split(/\n\s*\n/)
        .map(para => para.trim())
        .filter(para => para);

      if (paragraphs.length > 0) {
        contentToInsert = paragraphs
          .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
          .join('');
      } else {
        contentToInsert = `<p>${pastedText.replace(/\n/g, '<br>')}</p>`;
      }
    }

    if (contentToInsert) {
      const editor = document.getElementById('editor') as HTMLElement;
      if (editor) {
        document.execCommand('insertHTML', false, contentToInsert);
        setEditedContent(editor.innerHTML);
      }
    }
  };

  // Helper function to extract YouTube video ID
  const extractYouTubeId = (input: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // If it's already just an ID (11 characters)
    if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) {
      return input.trim();
    }

    return null;
  };

  const renderPortableTextToHTML = (body: any): string => {
    if (!Array.isArray(body)) {
      // Fallback for old string content
      return typeof body === 'string' ? body.replace(/\n/g, '<br/>') : '';
    }

    return body.map((block: any) => {
      // Handle legacy image blocks with _temp_src (for backwards compatibility)
      if (block._type === 'image' && block._temp_src) {
        return `<div class="rounded-2xl overflow-hidden"><img src="${block._temp_src}" alt="Image" class="w-full h-auto object-cover" loading="lazy" /></div>`;
      }

      // Handle PDF embed blocks
      if (block._type === 'pdfEmbed') {
        return `<div class="my-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 bg-red-100 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-gray-900">${block.name}</h4>
              <p class="text-sm text-gray-600">${block.size} MB</p>
            </div>
            <a href="${block.url}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-colors text-sm font-medium">
              Odpri PDF
            </a>
          </div>
          <div class="mt-3">
            <iframe src="${block.url}" class="w-full h-full min-h-screen border border-gray-300 rounded-lg" title="${block.name}"></iframe>
          </div>
        </div>`;
      }

      if (block._type !== 'block') return '';

      const tag = block.style === 'normal' ? 'p' : block.style;
      const childrenHtml = (block.children || []).map((span: any) => {
        let text = span.text || '';

        // If this is an HTML image, return it directly without escaping
        if (span.marks && span.marks.includes('html-image')) {
          return text;
        }

        // Basic HTML entity escaping for regular text
        text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        const marks = span.marks || [];
        return marks.reduce((acc: string, markKey: string) => {
          if (markKey === 'html-image') return acc; // Skip html-image mark
          if (markKey === 'strong') return `<strong>${acc}</strong>`;
          if (markKey === 'em') return `<em>${acc}</em>`;

          const markDef = (block.markDefs || []).find((def: any) => def._key === markKey);
          if (markDef?._type === 'link') {
            return `<a href="${markDef.href}" target="_blank" rel="noopener noreferrer">${acc}</a>`;
          }

          return acc;
        }, text);
      }).join('');

      // Avoid creating empty paragraphs that cause the .</p><p> issue
      if (!childrenHtml.trim() && tag === 'p') return '';

      return `<${tag}>${childrenHtml}</${tag}>`;
    }).join('\n\n');
  };

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      setLoading(true);
      const data = await fetchNewsBySlug(slug);
      setPost(data);
      setLoading(false);
      // Scroll to top after post is loaded
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    loadPost();
  }, [slug]);

  useEffect(() => {
    // Check if admin is logged in
    const adminSession = localStorage.getItem('admin_session');
    setIsAdmin(!!adminSession);

    // Check if edit mode is requested via URL
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('edit') === 'true' && adminSession) {
      setIsEditMode(true);
      // If post is already loaded, set the title immediately
      if (post) {
        setEditedTitle(post.title || '');
      }
    }
  }, [location, post]);

  // Set initial editor content when entering edit mode
  useEffect(() => {
    if (isEditMode && post) {
      // Set edited title
      setEditedTitle(post.title || '');
      // Set editor content
      const htmlContent = renderPortableTextToHTML(post.body);
      setEditedContent(htmlContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent;
      }
      // Reset thumbnail when entering edit mode
      setThumbnailFile(null);
      setThumbnailPreview(null);
    }
  }, [isEditMode, post]);

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

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

  // Detect if post contains custom React component
  const hasCustomReact = post?.body?.some((block: any) => block._type === 'customReact') || false;

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
            {isEditMode ? (
              <div className="mb-8 space-y-4">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full font-serif text-xl md:text-2xl text-olive-dark leading-tight bg-gray-50 border-2 border-terracotta rounded-xl px-4 py-3 focus:outline-none focus:border-terracotta-dark"
                  placeholder="Naslov"
                />

                {/* Thumbnail Image Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-olive-dark">
                    Thumbnail slika (opcijsko)
                  </label>
                  <div
                    className={`relative bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors ${thumbnailPreview ? 'h-auto w-64 aspect-video' : 'h-48'}`}
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    {thumbnailPreview ? (
                      <div className="relative w-full h-full group">
                        <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTempImageSrc(thumbnailPreview);
                              setIsCropping(true);
                              setZoom(1);
                              setCrop({ x: 0, y: 0 });
                            }}
                            className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                            title="Uredi sliko"
                          >
                            <Pencil size={20} className="text-olive-dark" />
                          </button>
                        </div>
                      </div>
                    ) : post.image ? (
                      <div className="relative w-full h-full group">
                        <img src={post.image} alt="Current thumbnail" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTempImageSrc(post.image);
                              setIsCropping(true);
                              setZoom(1);
                              setCrop({ x: 0, y: 0 });
                            }}
                            className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                            title="Uredi sliko"
                          >
                            <Pencil size={20} className="text-olive-dark" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-olive/40">
                        <ImageIcon size={32} />
                        <span className="text-xs font-bold uppercase mt-2">Kliknite za dodajanje thumbnail slike</span>
                      </div>
                    )}
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (!file.type.startsWith('image/')) {
                            alert('Prosimo izberite slikovno datoteko');
                            return;
                          }
                          if (file.size > 10 * 1024 * 1024) {
                            alert('Slika je prevelika. Največja dovoljena velikost je 10MB.');
                            return;
                          }

                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setTempImageSrc(e.target?.result as string);
                            setIsCropping(true);
                            setZoom(1);
                            setCrop({ x: 0, y: 0 });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  {thumbnailPreview && (
                    <button
                      onClick={() => {
                        setThumbnailFile(null);
                        setThumbnailPreview(null);
                        if (thumbnailInputRef.current) {
                          thumbnailInputRef.current.value = '';
                        }
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      Odstrani sliko
                    </button>
                  )}
                </div>
              </div>
            ) : (
              !hasCustomReact && (
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-olive-dark leading-[0.95] tracking-tight mb-6">
                  {post.title}
                </h1>
              )
            )}

            {/* Admin Edit Button */}
            {isAdmin && !isEditMode && (
              <button
                onClick={() => {
                  setIsEditMode(true);
                  setEditedTitle(post.title);
                  // Initial setup is now handled by useEffect
                }}
                className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-olive text-white rounded-xl font-semibold hover:bg-olive-dark transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Uredi
              </button>
            )}

          </FadeIn>
        </div>
      </div>


      {/* Content - Apple Typography */}
      <FadeIn>
        <div className={`container mx-auto px-6 pb-24 ${hasCustomReact ? 'max-w-full' : 'max-w-3xl'}`}>
          <div className="prose max-w-none">
            {isEditMode ? (
              <div>
                {/* Formatting Toolbar - Sticky */}
                <div className="sticky top-16 z-50 flex flex-wrap gap-1 mb-2 p-2 bg-white rounded-lg border border-gray-200 shadow-md">
                  <button onClick={() => formatText('bold')} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Krepko">
                    <Bold size={14} />
                  </button>
                  <button onClick={() => formatText('italic')} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Ležeče">
                    <Italic size={14} />
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                  <button onClick={() => formatText('h2')} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Naslov 2">
                    <Heading2 size={14} />
                  </button>
                  <button onClick={() => formatText('h3')} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Naslov 3">
                    <Heading3 size={14} />
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                  <button onClick={() => formatText('left')} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Poravnava levo">
                    <AlignLeft size={14} />
                  </button>
                  <button onClick={() => formatText('center')} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Sredinsko">
                    <AlignCenter size={14} />
                  </button>
                  <button onClick={() => formatText('right')} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Poravnava desno">
                    <AlignRight size={14} />
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                  <div className="relative">
                    <button onClick={() => setShowColorPicker(!showColorPicker)} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Barva besedila">
                      <Palette size={14} />
                    </button>
                    {showColorPicker && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowColorPicker(false)}
                        />
                        <div className="absolute top-full mt-2 left-0 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-3">
                          <input
                            type="color"
                            onChange={(e) => changeTextColor(e.target.value)}
                            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                            title="Izberi barvo"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <button onClick={() => insertLink()} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Vstavi povezavo">
                    <LinkIcon size={14} />
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                  <input
                    type="text"
                    placeholder="Velikost (px)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        changeFontSize(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="text-xs bg-transparent border-none focus:ring-0 text-olive/70 font-medium cursor-pointer w-16 placeholder:text-olive/50"
                    title="Vnesite velikost v px (npr. 14px) ali številko 1-7"
                  />
                  <select onChange={(e) => changeFontFamily(e.target.value)} className="text-xs bg-transparent border-none focus:ring-0 text-olive/70 font-medium cursor-pointer">
                    <option value="">Pisava</option>
                    <option value="font-sans">Sans-Serif</option>
                    <option value="font-serif">Serif</option>
                    <option value="font-mono">Mono</option>
                  </select>
                  <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                  <button onClick={() => insertImage()} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Vstavi sliko">
                    <ImageIcon size={14} />
                  </button>
                  <button onClick={() => insertYouTube()} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Vstavi video (YouTube)">
                    <Video size={14} />
                  </button>
                  <button onClick={() => insertPDF()} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Vstavi PDF">
                    <FileText size={14} />
                  </button>
                  <button
                    onClick={insertButton}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                    title="Vstavi gumb"
                  >
                    <MousePointerClick size={20} />
                  </button>
                  <div className="w-px h-6 bg-gray-200 mx-1"></div>
                  <button
                    onClick={() => setShowLayoutModal(true)}
                    className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                    title="Vstavi postavitev / kodo"
                  >
                    <LayoutTemplate size={20} />
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                  <button
                    onClick={async () => {
                      if (!post) return;

                      try {
                        const token = (import.meta as any).env.VITE_SANITY_TOKEN;
                        if (!token) {
                          alert('Napaka: Manjka Sanity token');
                          return;
                        }

                        // Convert edited content to Portable Text format
                        const currentContent = editorRef.current?.innerHTML || editedContent;
                        const portableTextBody = convertToPortableText(currentContent);

                        if (!portableTextBody || portableTextBody.length === 0) {
                          alert('Napaka: Vsebina ne more biti prazna');
                          return;
                        }

                        await updateNewsPost(
                          post.id,
                          {
                            title: editedTitle,
                            body: portableTextBody,
                            date: post.publishedAt,
                            link: post.link
                          },
                          thumbnailFile, // Thumbnail image file
                          token
                        );

                        alert('Objava uspešno posodobljena!');
                        setIsEditMode(false);

                        // Refresh the page to show updated content
                        window.location.reload();
                      } catch (error) {
                        console.error('Error updating post:', error);
                        alert(`Napaka pri shranjevanju objave: ${error instanceof Error ? error.message : 'Neznana napaka'}`);
                      }
                    }}
                    className="px-4 py-1.5 bg-terracotta text-white rounded font-semibold hover:bg-terracotta-dark transition-colors text-sm"
                    title="Shrani spremembe"
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Shrani
                  </button>
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setEditedTitle('');
                      setEditedContent('');
                    }}
                    className="px-4 py-1.5 bg-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-400 transition-colors text-sm"
                    title="Prekliči urejanje"
                  >
                    Prekliči
                  </button>
                </div>

                <div
                  ref={editorRef}
                  id="editor"
                  contentEditable
                  suppressContentEditableWarning
                  className="w-full bg-gray-50 border-2 border-terracotta rounded-xl px-6 py-4 min-h-[400px] focus:outline-none focus:border-terracotta-dark text-base leading-relaxed overflow-auto"
                  onPaste={handlePaste}
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                />
              </div>
            ) : (
              renderPortableText(post.body, (src) => setLightboxImage(src), (url) => setLinkPopupUrl(url))
            )}
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

      {/* Layout Selection Modal */}
      {showLayoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-serif font-semibold text-olive-dark">Vstavi Postavitev</h3>
              <button
                onClick={() => setShowLayoutModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <LayoutSelectionModal onSelect={insertCustomLayout} />
            </div>
          </div>
        </div>
      )}

      {/* Cropping Modal - Moved outside FadeIn for correct positioning */}
      {isCropping && tempImageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-serif text-olive-dark font-semibold">Uredi sliko</h3>
              <button onClick={handleCropCancel} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="relative flex-1 bg-black">
              <Cropper
                image={tempImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-4 bg-white border-t border-gray-100 space-y-4">
              <div className="flex items-center gap-4">
                <ZoomOut size={20} className="text-gray-400" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-terracotta"
                />
                <ZoomIn size={20} className="text-gray-400" />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCropCancel}
                  className="px-4 py-2 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Prekliči
                </button>
                <button
                  onClick={handleCropSave}
                  className="px-6 py-2 rounded-xl font-semibold bg-terracotta text-white hover:bg-terracotta-dark transition-colors flex items-center gap-2"
                >
                  <Check size={18} />
                  Potrdi in obreži
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      <LinkPopup url={linkPopupUrl} onClose={() => setLinkPopupUrl(null)} />
    </article>
  );
};

const LayoutSelectionModal = ({ onSelect }: { onSelect: (type: 'react' | 'html', content?: string) => void }) => {
  const [activeTab, setActiveTab] = useState<'react' | 'html'>('react');
  const [content, setContent] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        <button
          onClick={() => setActiveTab('react')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'react'
            ? 'bg-white text-olive-dark shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Code size={16} />
            React / JSX
          </div>
        </button>
        <button
          onClick={() => setActiveTab('html')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'html'
            ? 'bg-white text-olive-dark shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <div className="flex items-center justify-center gap-2">
            <LayoutTemplate size={16} />
            HTML Koda
          </div>
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={activeTab === 'react' ? "Prilepite React kodo tukaj..." : "Prilepite HTML kodo tukaj..."}
            className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-terracotta focus:border-transparent outline-none resize-none"
          />
        </div>

        <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex items-start gap-3">
          <Info size={18} className="mt-0.5 flex-shrink-0" />
          {activeTab === 'react' ? (
            <p>
              <strong>Info:</strong> Koda bo prevedena in izvedena v brskalniku. Dostop imate do <code>React</code>, <code>framer-motion</code> in <code>lucide-react</code>.
            </p>
          ) : (
            <p>
              <strong>Info:</strong> Tukaj lahko uporabite standardni HTML in CSS.
            </p>
          )}
        </div>

        <button
          onClick={() => onSelect(activeTab, content)}
          disabled={!content.trim()}
          className="w-full py-3 bg-terracotta text-white rounded-xl font-semibold hover:bg-terracotta-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Vstavi {activeTab === 'react' ? 'React Komponento' : 'HTML Kodo'}
        </button>
      </div>
    </div>
  );
};

export default BlogPostPage;

