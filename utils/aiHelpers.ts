
export interface GrammarCheckResult {
    correctedText: string;
    explanation?: string;
}

export async function checkGrammarWithAI(
    text: string,
    apiKey: string
): Promise<GrammarCheckResult> {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a helpful assistant that corrects grammar and improves style for Slovenian text. You must preserve HTML tags if they are present in the input. Return only the corrected text without any conversational filler. If the text is already correct, return it as is.\n\nPlease correct the grammar and improve the style of the following Slovenian text:\n\n${text}`
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Napaka pri komunikaciji z AI servisom');
        }

        const data = await response.json();
        const correctedText = data.candidates?.[0]?.content?.parts?.[0]?.text || text;

        return {
            correctedText
        };

    } catch (error) {
        console.error('AI Grammar Check Error:', error);
        throw error;
    }
}
