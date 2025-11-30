import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Palette, Link as LinkIcon, Heading2, Heading3, Video, MousePointerClick, FileText } from 'lucide-react';
import { createNewsPost } from '../sanityClient';
import { useNavigate } from 'react-router-dom';

interface NewPostPopupProps {
    onClose: () => void;
    onSuccess?: () => void;
}

const NewPostPopup: React.FC<NewPostPopupProps> = ({ onClose, onSuccess }) => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [content, setContent] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [cropMode, setCropMode] = useState(false);
    const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
    const [showColorPicker, setShowColorPicker] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    // Initialize editor
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerHTML = '<p><br></p>';
        }
    }, []);

    // Convert HTML to Portable Text (simplified version from BlogPostPage)
    const convertToPortableText = (htmlContent: string): any[] => {
        if (!htmlContent?.trim()) return [];

        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(`<body>${htmlContent}</body>`, 'text/html');
            const markDefs: any[] = [];

            const nodeToPortableText = (node: Node, markDefs: any[]): any => {
                if (node.nodeType === 3) {
                    if (node.nodeValue && node.nodeValue.trim() === '') {
                        const parent = node.parentNode?.nodeName.toLowerCase();
                        if (parent === 'body' || parent === 'div') return null;
                    }
                    return {
                        _type: 'span',
                        _key: `span-${Math.random()}`,
                        text: node.nodeValue || '',
                        marks: [],
                    };
                }

                if (node.nodeType !== 1) return null;

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

                    case 'p':
                    case 'h2':
                    case 'h3':
                    case 'blockquote':
                        if (!children.length || children.every((c: any) => c._type === 'span' && !c.text?.trim())) {
                            return null;
                        }
                        return {
                            _type: 'block',
                            _key: `block-${Math.random()}`,
                            style: tagName === 'p' ? 'normal' : tagName,
                            children: children.flat(),
                            markDefs: [],
                        };

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

                        if (children.length > 0) {
                            const containsBlock = children.some((c: any) => c._type === 'block');
                            if (containsBlock) {
                                return children;
                            }
                            return {
                                _type: 'block',
                                _key: `block-${Math.random()}`,
                                style: 'normal',
                                children: children.flat(),
                                markDefs: [],
                            };
                        }
                        return null;

                    case 'img':
                        const imgSrc = element.getAttribute('src') || '';
                        const imgAlt = element.getAttribute('alt') || 'Slika';
                        const imgClass = element.getAttribute('class') || 'w-full h-auto object-cover';
                        const imgHtml = `<div class="rounded-2xl overflow-hidden"><img src="${imgSrc}" alt="${imgAlt}" class="${imgClass}" loading="lazy" /></div>`;
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

                    default:
                        return children;
                }
            };

            const bodyNodes = Array.from(doc.body.childNodes);
            const portableTextBlocks = bodyNodes
                .map(node => nodeToPortableText(node, markDefs))
                .flat()
                .filter(Boolean)
                .filter(block => {
                    if (!block || typeof block !== 'object') return false;
                    if (block._type === 'block') {
                        if (!block.children || !Array.isArray(block.children) || block.children.length === 0) {
                            return false;
                        }
                        const validChildren = block.children.filter((child: any) => {
                            return child && child._type === 'span' && child.text !== undefined;
                        });
                        if (validChildren.length === 0) return false;
                        block.children = validChildren;
                    }
                    // Allow PDF embed blocks
                    if (block._type === 'pdfEmbed') {
                        return true;
                    }
                    return true;
                });

            portableTextBlocks.forEach(block => {
                if (block._type === 'block' && block.children) {
                    const blockMarkKeys = new Set(block.children.flatMap((c: any) => c.marks || []));
                    block.markDefs = markDefs.filter(def => blockMarkKeys.has(def._key));
                }
            });

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

    // Formatting functions
    const formatText = (command: string) => {
        const editor = editorRef.current;
        if (!editor) return;
        editor.focus();
        
        if (command === 'h2') {
            document.execCommand('formatBlock', false, '<h2>');
        } else if (command === 'h3') {
            document.execCommand('formatBlock', false, '<h3>');
        } else {
            document.execCommand(command, false);
        }
        setContent(editor.innerHTML);
    };

    const changeTextColor = (color: string) => {
        const editor = editorRef.current;
        if (!editor) return;
        editor.focus();
        document.execCommand('foreColor', false, color);
        setContent(editor.innerHTML);
        setShowColorPicker(false);
    };

    const changeFontSize = (size: string) => {
        const editor = editorRef.current;
        if (!editor) return;

        if (size && size.trim()) {
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
            setContent(editor.innerHTML);
        }
    };

    const changeFontFamily = (family: string) => {
        const editor = editorRef.current;
        if (!editor || !family) return;
        editor.focus();
        document.execCommand('fontName', false, family);
        setContent(editor.innerHTML);
    };

    const insertLink = () => {
        const editor = editorRef.current;
        if (!editor) return;
        
        const url = prompt('Vnesite URL povezave:');
        if (url) {
            editor.focus();
            document.execCommand('createLink', false, url);
            setContent(editor.innerHTML);
        }
    };

    const insertYouTube = () => {
        const editor = editorRef.current;
        if (!editor) return;
        
        const url = prompt('Vnesite YouTube URL ali video ID:');
        if (url) {
            // Extract video ID from URL
            const patterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
                /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
                /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
            ];
            
            let videoId = null;
            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match && match[1]) {
                    videoId = match[1];
                    break;
                }
            }
            
            // If it's already just an ID
            if (!videoId && /^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
                videoId = url.trim();
            }
            
            if (videoId) {
                const embedHtml = `<div class="relative w-full" style="padding-bottom: 56.25%"><iframe src="https://www.youtube.com/embed/${videoId}" class="absolute top-0 left-0 w-full h-full rounded-2xl" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
                document.execCommand('insertHTML', false, embedHtml);
                setContent(editor.innerHTML);
            } else {
                alert('Neveljaven YouTube URL');
            }
        }
    };

    const insertButton = () => {
        const editor = editorRef.current;
        if (!editor) return;
        
        const text = prompt('Vnesite besedilo gumba:', 'Preberi več') || 'Preberi več';
        const url = prompt('Vnesite URL povezave:', 'https://') || 'https://';
        const buttonHtml = `<div class="my-6 text-center"><a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-white rounded-xl font-semibold hover:bg-terracotta-dark transition-colors">${text}</a></div>`;
        document.execCommand('insertHTML', false, buttonHtml);
        setContent(editor.innerHTML);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            alert('Vnesite naslov objave');
            return;
        }

        const token = import.meta.env.VITE_SANITY_TOKEN;
        if (!token) {
            alert('Napaka: Manjka Sanity token');
            return;
        }

        setIsSaving(true);
        try {
            const htmlContent = editorRef.current?.innerHTML || '';
            const portableTextBody = convertToPortableText(htmlContent);

            if (!portableTextBody || portableTextBody.length === 0) {
                alert('Napaka: Vsebina ne more biti prazna');
                setIsSaving(false);
                return;
            }

            await createNewsPost(
                {
                    title: title.trim(),
                    body: portableTextBody,
                    date: date,
                    link: undefined
                },
                thumbnailFile,
                token
            );

            alert('Objava uspešno ustvarjena!');
            onClose();
            if (onSuccess) {
                onSuccess();
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert(`Napaka pri ustvarjanju objave: ${error instanceof Error ? error.message : 'Neznana napaka'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const insertImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                alert('Prosimo izberite slikovno datoteko');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('Slika je prevelika. Največja dovoljena velikost je 5MB.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                const editor = editorRef.current;
                if (!editor) return;
                const imageHtml = `<div class="rounded-2xl overflow-hidden"><img src="${imageUrl}" alt="${file.name}" class="w-full h-auto object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-500" loading="lazy" /></div>\n\n`;
                document.execCommand('insertHTML', false, imageHtml);
                setContent(editor.innerHTML);
            };
            reader.readAsDataURL(file);
        };
        input.click();
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
                const token = import.meta.env.VITE_SANITY_TOKEN;
                if (!token) {
                    alert('Napaka: Manjka Sanity token');
                    return;
                }

                // Upload PDF to Sanity
                const { uploadPDFFileToSanityWithToken } = await import('../utils/sanityImageUpload');
                const pdfUrl = await uploadPDFFileToSanityWithToken(file, token);

                const editor = editorRef.current;
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
                setContent(editor.innerHTML);
            } catch (error) {
                console.error('PDF upload failed:', error);
                alert(`Napaka pri nalaganju PDF: ${error instanceof Error ? error.message : 'Neznana napaka'}`);
            }
        };
        input.click();
    };

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                    <h2 className="font-serif text-2xl text-olive-dark">Nova objava</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-olive-dark mb-2">
                            Naslov objave *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Vnesite naslov..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta font-serif text-xl md:text-2xl"
                            autoFocus
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-semibold text-olive-dark mb-2">
                            Datum objave
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta"
                        />
                    </div>

                    {/* Thumbnail Image */}
                    <div>
                        <label className="block text-sm font-semibold text-olive-dark mb-2">
                            Thumbnail slika (opcijsko)
                        </label>
                        <div
                            className="relative h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => !cropMode && thumbnailInputRef.current?.click()}
                        >
                            {thumbnailPreview ? (
                                <div className="relative w-full h-full">
                                    <img
                                        src={thumbnailPreview}
                                        alt="Thumbnail preview"
                                        className="w-full h-full object-cover"
                                        style={cropMode ? {
                                            objectPosition: `${cropArea.x}% ${cropArea.y}%`
                                        } : {}}
                                    />
                                    {cropMode && (
                                        <div className="absolute inset-0 bg-black/20">
                                            <div
                                                className="absolute border-2 border-white border-dashed cursor-move"
                                                style={{
                                                    left: `${cropArea.x}%`,
                                                    top: `${cropArea.y}%`,
                                                    width: `${cropArea.width}%`,
                                                    height: `${cropArea.height}%`,
                                                }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    const startX = e.clientX;
                                                    const startY = e.clientY;
                                                    const startCropX = cropArea.x;
                                                    const startCropY = cropArea.y;

                                                    // Get container dimensions
                                                    const container = e.currentTarget.parentElement?.parentElement;
                                                    const containerWidth = container?.clientWidth || 400;
                                                    const containerHeight = container?.clientHeight || 192;

                                                    const handleMouseMove = (e: MouseEvent) => {
                                                        const deltaX = e.clientX - startX;
                                                        const deltaY = e.clientY - startY;

                                                        const newX = Math.max(0, Math.min(100 - cropArea.width, startCropX + (deltaX / containerWidth) * 100));
                                                        const newY = Math.max(0, Math.min(100 - cropArea.height, startCropY + (deltaY / containerHeight) * 100));

                                                        setCropArea(prev => ({ ...prev, x: newX, y: newY }));
                                                    };

                                                    const handleMouseUp = () => {
                                                        document.removeEventListener('mousemove', handleMouseMove);
                                                        document.removeEventListener('mouseup', handleMouseUp);
                                                    };

                                                    document.addEventListener('mousemove', handleMouseMove);
                                                    document.addEventListener('mouseup', handleMouseUp);
                                                }}
                                            />
                                        </div>
                                    )}
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
                                        if (file.size > 5 * 1024 * 1024) {
                                            alert('Slika je prevelika. Največja dovoljena velikost je 5MB.');
                                            return;
                                        }
                                        setThumbnailFile(file);
                                        const reader = new FileReader();
                                        reader.onload = (e) => {
                                            setThumbnailPreview(e.target?.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </div>
                        {thumbnailPreview && (
                            <div className="mt-2 flex gap-2">
                                {!cropMode ? (
                                    <>
                                        <button
                                            onClick={() => setCropMode(true)}
                                            className="text-sm text-terracotta hover:text-terracotta-dark font-semibold"
                                        >
                                            Prilagodi crop
                                        </button>
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
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setCropMode(false)}
                                            className="text-sm text-green-600 hover:text-green-700 font-semibold"
                                        >
                                            Potrdi crop
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCropMode(false);
                                                setCropArea({ x: 0, y: 0, width: 100, height: 100 });
                                            }}
                                            className="text-sm text-gray-600 hover:text-gray-700 font-semibold"
                                        >
                                            Prekliči
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Content Editor */}
                    <div>
                        <label className="block text-sm font-semibold text-olive-dark mb-2">
                            Vsebina *
                        </label>
                        
                        {/* Toolbar */}
                        <div className="flex flex-wrap gap-1 mb-2 p-2 bg-white rounded-lg border border-gray-200 shadow-md">
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
                            <button onClick={() => insertPDF()} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Vstavi PDF">
                                <FileText size={14} />
                            </button>
                            <button onClick={() => insertYouTube()} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Vstavi video (YouTube)">
                                <Video size={14} />
                            </button>
                            <button onClick={() => insertButton()} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Vstavi gumb">
                                <MousePointerClick size={14} />
                            </button>
                        </div>

                        {/* Editor */}
                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-6 py-4 min-h-[300px] focus:outline-none focus:border-terracotta text-base leading-relaxed overflow-auto"
                            onInput={(e) => setContent((e.target as HTMLElement).innerHTML)}
                            onPaste={(e) => {
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

                                            if (tagName === 'a') {
                                                const href = element.getAttribute('href') || '';
                                                const text = element.textContent || '';
                                                return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
                                            }

                                            // Handle paragraph-like elements
                                            if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'li'].includes(tagName)) {
                                                const children = Array.from(element.childNodes)
                                                    .map(child => extractContent(child))
                                                    .join('');
                                                const trimmed = children.trim();
                                                if (trimmed) {
                                                    // For list items, don't wrap in additional p tag
                                                    if (tagName === 'li') {
                                                        return `<li>${trimmed}</li>`;
                                                    }
                                                    // For headings, preserve the tag
                                                    if (tagName.startsWith('h')) {
                                                        return `<${tagName}>${trimmed}</${tagName}>`;
                                                    }
                                                    // For blockquotes, preserve the tag
                                                    if (tagName === 'blockquote') {
                                                        return `<blockquote>${trimmed}</blockquote>`;
                                                    }
                                                    // For everything else, use p
                                                    return `<p>${trimmed}</p>`;
                                                }
                                                return '';
                                            }

                                            if (tagName === 'br') {
                                                return '<br>';
                                            }

                                            // Handle line breaks and spacing
                                            if (tagName === 'span' && element.style.display === 'block') {
                                                const children = Array.from(element.childNodes)
                                                    .map(child => extractContent(child))
                                                    .join('');
                                                return children.trim() ? `<p>${children}</p>` : '';
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
                                            // Check if this is a block element
                                            if (extracted.startsWith('<p>') || extracted.startsWith('<h') || extracted.startsWith('<blockquote>') || extracted.startsWith('<li>')) {
                                                if (currentBlock.trim()) {
                                                    extractedBlocks.push(currentBlock.trim());
                                                    currentBlock = '';
                                                }
                                                extractedBlocks.push(extracted);
                                            } else if (extracted.includes('<br>') || extracted.trim()) {
                                                currentBlock += extracted;
                                            }
                                        }
                                    }

                                    if (currentBlock.trim()) {
                                        extractedBlocks.push(currentBlock.trim());
                                    }

                                    // Filter out empty blocks and join
                                    contentToInsert = extractedBlocks
                                        .filter(block => block.trim())
                                        .map(block => {
                                            // If block doesn't start with a tag, wrap it in p
                                            if (!block.startsWith('<')) {
                                                return `<p>${block}</p>`;
                                            }
                                            return block;
                                        })
                                        .join('');
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
                                    const editor = editorRef.current;
                                    if (editor) {
                                        document.execCommand('insertHTML', false, contentToInsert);
                                        setContent(editor.innerHTML);
                                    }
                                }
                            }}
                            style={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        Prekliči
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 px-4 py-3 bg-terracotta text-white rounded-xl font-semibold hover:bg-terracotta-dark transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Shranjevanje...' : 'Shrani objavo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewPostPopup;
