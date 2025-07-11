import { getAiResponse } from "./chatbot";

const chatForm = document.getElementById('chatForm') as HTMLFormElement;
const userInput = document.getElementById('userInput') as HTMLInputElement;
const chatMessages = document.getElementById('chatMessages') as HTMLDivElement;

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = userInput.value.trim();
  if (!input) return;

  appendMessage('user', input);
  userInput.value = '';

  const aiResponse = await getAiResponse(input);
  appendMessage('ai', aiResponse);
});

function appendMessage(sender: 'user' | 'ai', text: string) {
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  
  const formattedText = text
    .replace(/(?:\r\n|\r|\n)/g, '<br>')                     

  msg.innerHTML = formattedText;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}