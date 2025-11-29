import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Palette, Link as LinkIcon, Heading2, Heading3, Video, MousePointerClick } from 'lucide-react';
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
        document.execCommand(command, false);
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
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-terracotta font-serif text-lg"
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
                            onClick={() => thumbnailInputRef.current?.click()}
                        >
                            {thumbnailPreview ? (
                                <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
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
                            <button
                                onClick={() => {
                                    setThumbnailFile(null);
                                    setThumbnailPreview(null);
                                    if (thumbnailInputRef.current) {
                                        thumbnailInputRef.current.value = '';
                                    }
                                }}
                                className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold"
                            >
                                Odstrani sliko
                            </button>
                        )}
                    </div>

                    {/* Content Editor */}
                    <div>
                        <label className="block text-sm font-semibold text-olive-dark mb-2">
                            Vsebina *
                        </label>
                        
                        {/* Toolbar */}
                        <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-100 rounded-lg border border-gray-200">
                            <button onClick={() => formatText('bold')} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Krepko">
                                <Bold size={14} />
                            </button>
                            <button onClick={() => formatText('italic')} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Ležeče">
                                <Italic size={14} />
                            </button>
                            <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                            <button onClick={() => formatText('formatBlock')} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Naslov 2">
                                <Heading2 size={14} />
                            </button>
                            <button onClick={() => formatText('formatBlock')} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Naslov 3">
                                <Heading3 size={14} />
                            </button>
                            <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
                            <button onClick={() => insertImage()} className="p-1.5 hover:bg-white rounded text-olive/70 hover:text-olive transition-colors" title="Vstavi sliko">
                                <ImageIcon size={14} />
                            </button>
                        </div>

                        {/* Editor */}
                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-6 py-4 min-h-[300px] focus:outline-none focus:border-terracotta text-base leading-relaxed overflow-auto"
                            onInput={(e) => setContent((e.target as HTMLElement).innerHTML)}
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
