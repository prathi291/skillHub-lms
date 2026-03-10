import { OpenAI } from 'openai';
import config from '../config/env.js';

export class AIController {
    static async chat(req, res) {
        const { message, context } = req.body;
        try {
            const apiKey = process.env.OPENAI_API_KEY;

            // If no valid key is present (dummy test), we just gracefully return mock AI text
            if (!apiKey || apiKey === 'mock' || apiKey === 'your_openai_api_key_here') {
                return res.status(200).json({
                    reply: 'I am EduAI. This is a mock response because no real OpenAI key is provided. You asked: ' + message
                });
            }

            const openai = new OpenAI({ apiKey });

            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are EduAI, an expert Learning Management System assistant. Your role is an engaging instructor.
                        - Explain concepts clearly and simply.
                        - If a user asks for a challenge, generate a relevant quiz or problem.
                        - Optionally end your responses with a follow-up question to keep them engaged.
                        - NEVER give just raw code without explaining it.
                        Context: ${context || 'General LMS support'}`
                    },
                    { role: 'user', content: message }
                ]
            });

            res.status(200).json({ reply: completion.choices[0].message.content });
        } catch (error) {
            console.error('AI Controller Error:', error);

            // Handle Quota/Billing errors with a "Demo Mode" fallback
            if (error.message && (error.message.includes('insufficient_quota') || error.message.includes('quota') || error.message.includes('429'))) {
                return res.status(200).json({
                    reply: "(Demo Mode) Your OpenAI API quota has been reached, but I'm here to help anyway! \n\n" +
                        "Regarding your query: " + message + " — typically, I would provide a detailed AI response. Please check your OpenAI billing dashboard to restore full service."
                });
            }

            res.status(500).json({
                error: 'AI Assistant failed to respond',
                details: error.message || 'Unknown error',
                suggestion: 'Check API key permissions or credit balance.'
            });
        }
    }
}

export default AIController;
