import React, { useState, useEffect, useMemo } from 'react';
import * as Babel from '@babel/standalone';
import * as ReactModule from 'react';
import * as FramerMotion from 'framer-motion';
import * as LucideReact from 'lucide-react';

interface DynamicReactRendererProps {
    code: string;
    imageData?: Record<string, string>; // Saved images: { key: url }
    onImageUpload?: (key: string, url: string) => void; // Callback when image is uploaded
    sanityToken?: string; // Optional sanity token for uploads
}

const DynamicReactRenderer: React.FC<DynamicReactRendererProps> = ({ code, imageData = {}, onImageUpload, sanityToken }) => {
    const [Component, setComponent] = useState<React.ComponentType | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!code) return;

        try {
            // 1. Transpile the code using Babel
            const transpiled = Babel.transform(code, {
                presets: ['react', 'env', 'typescript'],
                filename: 'dynamic.tsx',
            }).code;

            if (!transpiled) {
                throw new Error('Transpilation failed');
            }

            // 2. Create a function to execute the code
            // We need to provide dependencies (React, framer-motion, lucide-react) to the scope
            const scope = {
                react: ReactModule,
                'framer-motion': FramerMotion,
                'lucide-react': LucideReact,
            };

            // Wrap code to return the component
            // We assume the user code does "export default function App..." or similar.
            // Since we can't easily handle "export default", we'll use a trick:
            // We'll append "return App;" or similar if we can detect the component name,
            // OR we instruct the user to assign the component to a variable and return it?
            // BETTER APPROACH: CommonJS style mock.

            const exports: { default?: React.ComponentType } = {};
            const module = { exports };

            // Create a function that takes 'require', 'exports', 'module', 'React'
            // and executes the transpiled code.
            // Note: Babel 'env' preset might convert imports to 'require'.

            const require = (moduleName: string) => {
                if (moduleName === 'react') return ReactModule;
                if (moduleName === 'framer-motion') return FramerMotion;
                if (moduleName === 'lucide-react') return LucideReact;
                throw new Error(`Module '${moduleName}' not found in dynamic scope.`);
            };

            // Create uploadImage function to provide to component
            const uploadImage = async (key: string, file: File): Promise<string> => {
                try {
                    const { uploadImageToSanityWithToken, uploadImageToSanity } = await import('../../utils/sanityImageUpload');

                    let url: string;

                    // If we have a token passed from parent (even if empty string), use the withToken function
                    if (sanityToken !== undefined) {
                        console.log('[DynamicReactRenderer] Using token from parent component');
                        url = await uploadImageToSanityWithToken(file, sanityToken);
                    } else {
                        // Fallback to original function that checks localStorage
                        console.log('[DynamicReactRenderer] No token from parent, checking localStorage');
                        url = await uploadImageToSanity(file);
                    }

                    if (onImageUpload) {
                        onImageUpload(key, url);
                    }
                    return url;
                } catch (error) {
                    console.error('Image upload failed:', error);
                    throw error;
                }
            };

            const executeCode = new Function(
                'require',
                'exports',
                'module',
                'React',
                'uploadImage',
                'savedImages',
                transpiled
            );

            executeCode(require, exports, module, ReactModule, uploadImage, imageData);

            const ResultComponent = module.exports.default || exports.default;

            if (ResultComponent) {
                setComponent(() => ResultComponent);
                setError(null);
            } else {
                throw new Error('No default export found. Please ensure your code has "export default function..."');
            }

        } catch (err: any) {
            console.error("Dynamic Rendering Error:", err);
            setError(err.message || 'Unknown error');
        }
    }, [code]);

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <h4 className="font-bold mb-2">Napaka pri rendiranju:</h4>
                <pre className="text-xs overflow-auto whitespace-pre-wrap">{error}</pre>
            </div>
        );
    }

    if (!Component) {
        return <div className="p-4 text-center text-gray-400">Nalaganje komponente...</div>;
    }

    return (
        <div className="dynamic-react-root">
            <Component />
        </div>
    );
};

export default DynamicReactRenderer;
