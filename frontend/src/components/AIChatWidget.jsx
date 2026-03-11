import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hi! I am EduAI, your personal learning assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

        try {
            const res = await fetch(`${API_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.text, context: 'Dashboard' }),
                credentials: 'include'
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                const detailedError = errorData.details ? ` (${errorData.details})` : '';
                const suggestion = errorData.suggestion ? `\n\nTip: ${errorData.suggestion}` : '';
                throw new Error(`${errorData.error || 'Server Error'}${detailedError}${suggestion}`);
            }

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'ai', text: data.reply || 'Sorry, I am offline.' }]);
        } catch (error) {
            console.error('AI Chat Error:', error);
            setMessages(prev => [...prev, { role: 'ai', text: `Issue: ${error.message}` }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        style={{
                            position: 'absolute',
                            bottom: '80px',
                            right: 0,
                            width: '350px',
                            height: '500px',
                            background: '#fff',
                            borderRadius: '16px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            border: '1px solid var(--border)'
                        }}
                    >
                        <div style={{ padding: '16px', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MessageSquare size={20} />
                                <span style={{ fontWeight: 600 }}>EduAI Assistant</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8f9fa' }}>
                            {messages.map((msg, i) => (
                                <div key={i} style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    background: msg.role === 'user' ? 'var(--primary)' : 'white',
                                    color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    maxWidth: '85%',
                                    boxShadow: 'var(--shadow-sm)',
                                    border: msg.role === 'ai' ? '1px solid var(--border)' : 'none',
                                    fontSize: '0.9rem',
                                    lineHeight: 1.5
                                }}>
                                    {msg.text}
                                </div>
                            ))}
                            {isTyping && (
                                <div style={{ alignSelf: 'flex-start', background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <Loader size={16} className="animate-spin" color="var(--primary)" />
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSend} style={{ display: 'flex', padding: '16px', borderTop: '1px solid var(--border)', background: 'white' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask EduAI a question..."
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                            />
                            <button type="submit" disabled={!input.trim() || isTyping} style={{ marginLeft: '8px', padding: '10px 14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Send size={16} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(164, 53, 240, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </motion.button>
        </div>
    );
};

export default AIChatWidget;
