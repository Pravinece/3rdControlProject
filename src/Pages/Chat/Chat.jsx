import React, { useState, useRef, useEffect } from 'react';
import styles from './Chat.module.css';
import flow from '../../datas/chat.json';
import { useLipSync } from 'use-lipsync';
import useAvatarStore from '../../store/avatarStore';

const initialMessages = [
  {
    id: 1,
    sender: 'bot',
    text: "Hello! Welcome to the experience.\nI'm a 3D character bot built with React Three Fiber and Three.js. How can I help you today?"
  }
];

export default function Chat({ audioRef, isPlaying, setIsPlaying, spokenText, setSpokenText, setMorphValues }) {
  const [messages, setMessages] = useState(initialMessages);
  const [suggestions, setSuggestions] = useState(flow.start.suggestions);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const setIsSpeaking = useAvatarStore((state) => state.setIsSpeaking);

  // useLipSync drives setMorphValues in sync with audio — exactly like refer.jsx
  useLipSync(audioRef, isPlaying, setMorphValues, spokenText);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
      setMorphValues({ jawOpen: 0, mouthFunnel: 0, mouthSmileLeft: 0, mouthSmileRight: 0 });
    };
  }, []);

  const speakWithWebSpeech = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;

    let t = 0;
    let interval;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsSpeaking(true);
      interval = setInterval(() => {
        t += 0.15;
        setMorphValues({
          jawOpen:        Math.abs(Math.sin(t * 8)) * 0.6,
          mouthFunnel:    Math.abs(Math.sin(t * 5)) * 0.3,
          mouthSmileLeft: 0.1,
          mouthSmileRight: 0.1,
        });
      }, 80);
    };

    const cleanup = () => {
      clearInterval(interval);
      setIsPlaying(false);
      setIsSpeaking(false);
      setMorphValues({ jawOpen: 0, mouthFunnel: 0, mouthSmileLeft: 0, mouthSmileRight: 0 });
    };

    utterance.onend = cleanup;
    utterance.onerror = cleanup;

    setSpokenText(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleSuggestion = (label) => {
    if (isTyping || isPlaying) return;

    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: label }]);
    setSuggestions([]);
    setIsTyping(true);

    setTimeout(() => {
      const node = flow[label];
      const replyText = node?.reply ?? "Hmm, I'm not sure about that. Let's try something else.";

      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: replyText }]);
      setSuggestions(node?.suggestions ?? flow.start.suggestions);
      setIsTyping(false);

      speakWithWebSpeech(replyText.replace(/\n/g, ' '));
    }, 800 + Math.random() * 600);
  };

  return (
    <div className={styles.chatWrapper}>
      <div className={styles.chatContainer}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h3></h3>
            <p></p>
          </div>
        </div>

        <div className={styles.messages}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${msg.sender === 'user' ? styles.user : styles.bot}`}
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
                <span></span><span></span><span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputArea}>
          <input type="text" placeholder="Type a message..." className={styles.input} disabled />
          <div className={styles.suggestions}>
            {suggestions.map((s) => (
              <button
                key={s}
                className={styles.suggestionBtn}
                onClick={() => handleSuggestion(s)}
                disabled={isTyping || isPlaying}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
