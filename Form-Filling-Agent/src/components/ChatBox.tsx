import { useState, useEffect, useRef } from "react";
import { CoreMessage, generateObject, streamText } from "ai";
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import "../styles/ChatBox.css";
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../redux/slices/userSlice';
import { FormSystem, registerSystem } from "./Prompts";
import { RootState } from '../redux/store';

const providers = {
  google: createGoogleGenerativeAI({
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY
  }),
  groq: createGroq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY
  }),
  openai: createOpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    compatibility: 'strict',
  })
};
const initialMessages = [{ user: "", bot: "Hi, I am your Assistant. How can I help you today?" }];
let inputMessages: CoreMessage[] = []; // Reset this as well

export default function ChatBox() {
  const dispatch = useDispatch();
  const { submit } = useSelector((state: RootState) => state.user);

  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botTyping]);

  useEffect(() => {
    handleReset();
  }, [submit]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { user: userMessage, bot: "" }]);
    setBotTyping(true);
    setIsInputDisabled(true);

    try {
      inputMessages.push({ role: 'user', content: userMessage });

      const { textStream } = streamText({
        // model: providers.openai('gpt-4o'),
        // model: providers.google("models/gemini-1.5-flash"),
        model: providers.groq('llama-3.3-70b-versatile'),
        system: FormSystem,
        messages: inputMessages
      });

      let botReply = "";
      for await (const textPart of textStream) {
        botReply += textPart;
        setMessages((prev) => {
          let lastMessage = prev[prev.length - 1];
          return [...prev.slice(0, -1), { user: lastMessage.user, bot: botReply }];
        });
      }

      const objectConverter = await generateObject({
        // model: providers.openai('gpt-4o'),
        // model: providers.google("models/gemini-1.5-flash"),
        model: providers.groq('llama-3.3-70b-versatile'),
        system: registerSystem,
        schema: z.object({
          name: z.string(),
          email: z.string().optional(),
          phone: z.string(),
          address: z.string()
        }),
        messages: inputMessages,
      });

      const { name, email, phone, address } = objectConverter.object;
      console.log(objectConverter.object);

      // Dispatch the name to Redux
      dispatch(setUser({ name: name || null, email: email || null, phone: phone || null, address: address || null }));

      setBotTyping(false);
      setIsInputDisabled(false);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { user: userMessage, bot: "Sorry, I couldn't process that." },
      ]);
      setBotTyping(false);
      setIsInputDisabled(false);
    }
  };

  const handleReset = () => {
    setMessages(initialMessages);
    setInput("");
    setBotTyping(false);
    setIsInputDisabled(false);
    inputMessages = []; // Reset the inputMessages array
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isInputDisabled) {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className="message-group">
            {msg.user && <div className="user-message">{msg.user}</div>}
            {msg.bot && <div className="bot-message">{msg.bot}</div>}
          </div>
        ))}
        {botTyping && <div className="bot-message">...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={handleKeyDown}
          disabled={isInputDisabled}
        />
        <button onClick={handleSendMessage} disabled={isInputDisabled}>Send</button>
        {/* <button onClick={handleReset}>Reset</button>  */}
      </div>
    </div>
  );
}