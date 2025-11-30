
export interface GrammarCheckResult {
    correctedText: string;
    explanation?: string;
}

export async function checkGrammarWithAI(
    text: string,
    apiKey: string
): Promise<GrammarCheckResult> {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that corrects grammar and improves style for Slovenian text. You must preserve HTML tags if they are present in the input. Return only the corrected text without any conversational filler. If the text is already correct, return it as is."
                    },
                    {
                        role: "user",
                        content: `Please correct the grammar and improve the style of the following Slovenian text:\n\n${text}`
                    }
                ],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Napaka pri komunikaciji z AI servisom');
        }

        const data = await response.json();
        const correctedText = data.choices[0]?.message?.content || text;

        return {
            correctedText
        };

    } catch (error) {
        console.error('AI Grammar Check Error:', error);
        throw error;
    }
}
