import React, { useState, useRef, useEffect } from 'react';
import styles from './Chat.module.css';
import botReplies from '../../datas/chat.json'; // ← easy to edit this file

const initialMessages = [
  {
    id: 1,
    sender: 'bot',
    text: "Hello! Welcome to the experience.\nI'm a 3D character bot built with React Three Fiber and Three.js. How can I help you today?"
  },
  {
    id: 2,
    sender: 'user',
    text: "Hi! Tell me a bit about yourself."
  },
  {
    id: 3,
    sender: 'bot',
    text: "Sure! I exist as an interactive 3D avatar.\nEverything you see — my form, lighting, and smooth animations — comes from React Three Fiber sitting on top of Three.js. Pretty cool, right?"
  }
];

export default function Chat() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getRandomReply = () => {
    return botReplies[Math.floor(Math.random() * botReplies.length)];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input.trim()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate thinking + random multi-line reply
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: getRandomReply()
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 900);
  };

  return (
    <div className={styles.chatWrapper}>
      <div className={styles.chatContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h3></h3>
            <p></p>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${
                msg.sender === 'user' ? styles.user : styles.bot
              }`}
            >
              <div className={styles.bubble}>
                {msg.text.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className={`${styles.message} ${styles.bot}`}>
              <div className={`${styles.bubble} ${styles.typing}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input + Enter only */}
        <form className={styles.inputArea} onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className={styles.input}
            disabled={isTyping}
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={isTyping || !input.trim()}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}