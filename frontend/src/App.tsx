import React, { useState, useEffect, useRef, JSX } from 'react';
import { Send, Bot, User, Settings, RefreshCw, Download, AlertCircle, CheckCircle, Loader2, Upload, FileText, X } from 'lucide-react';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

interface ChatMessage {
  role: string;
  content: string;
}

interface ModelInfo {
  name: string;
  size?: string;
  digest?: string;
  modified_at?: string;
}

interface ChatResponse {
  model: string;
  message: ChatMessage;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

interface HealthStatus {
  status: string;
  ollama?: string;
  error?: string;
}

interface ContextInfo {
  filename: string;
  size: number;
  uploaded_at: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('unknown');
  const [error, setError] = useState<string>('');
  const [newModelName, setNewModelName] = useState<string>('');
  const [isPullingModel, setIsPullingModel] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [useStreaming, setUseStreaming] = useState<boolean>(true);
  
  // New context-related state
  const [contextFile, setContextFile] = useState<File | null>(null);
  const [isUploadingContext, setIsUploadingContext] = useState<boolean>(false);
  const [contextInfo, setContextInfo] = useState<ContextInfo | null>(null);
  const [hasContext, setHasContext] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkHealth();
    fetchModels();
    checkContextStatus();
  }, []);

  const checkHealth = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data: HealthStatus = await response.json();
      setConnectionStatus(data.status === 'healthy' ? 'connected' : 'disconnected');
      if (data.status !== 'healthy') {
        setError(data.error || 'Connection failed');
      } else {
        setError('');
      }
    } catch (err) {
      setConnectionStatus('disconnected');
      setError('Failed to connect to backend');
    }
  };

  const fetchModels = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/models`);
      if (!response.ok) throw new Error('Failed to fetch models');
      const data: ModelInfo[] = await response.json();
      setModels(data);
      if (data.length > 0 && !selectedModel) {
        setSelectedModel(data[0].name);
      }
    } catch (err) {
      setError('Failed to fetch models');
    }
  };

  const checkContextStatus = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/context/status`);
      if (response.ok) {
        const data = await response.json();
        setHasContext(data.has_context);
        setContextInfo(data.context_info);
      }
    } catch (err) {
      // Context endpoint might not be available yet
      console.log('Context status check failed:', err);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf', 'text/csv'];
      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
        setError('Please select a text file (.txt, .md, .pdf, or .csv)');
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setContextFile(file);
      setError('');
    }
  };

  const uploadContext = async (): Promise<void> => {
    if (!contextFile) return;
    
    setIsUploadingContext(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', contextFile);
      
      const response = await fetch(`${API_BASE_URL}/context/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload context');
      }
      
      const data = await response.json();
      setHasContext(true);
      setContextInfo(data.context_info);
      setContextFile(null);
      
      // Clear chat memory when new context is uploaded
      setMessages([]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (err) {
      setError('Failed to upload context: ' + (err as Error).message);
    } finally {
      setIsUploadingContext(false);
    }
  };

  const removeContext = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/context/remove`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setHasContext(false);
        setContextInfo(null);
        setMessages([]); // Clear chat when context is removed
      }
    } catch (err) {
      setError('Failed to remove context');
    }
  };

  const pullModel = async (): Promise<void> => {
    if (!newModelName.trim()) return;
    
    setIsPullingModel(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pull?model_name=${encodeURIComponent(newModelName)}`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to pull model');
      
      setTimeout(fetchModels, 2000);
      setNewModelName('');
      setError('');
    } catch (err) {
      setError('Failed to pull model: ' + (err as Error).message);
    } finally {
      setIsPullingModel(false);
    }
  };

  const sendMessage = async (): Promise<void> => {
    if (!inputMessage.trim() || !selectedModel || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: inputMessage.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    if (useStreaming) {
      // Streaming mode
      setIsStreaming(true);
      
      // Add empty assistant message for streaming
      const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
      const messagesWithAssistant = [...newMessages, assistantMessage];
      setMessages(messagesWithAssistant);

      try {
        const payload = {
          model: selectedModel,
          messages: newMessages,
          temperature: temperature,
          use_context: hasContext,
          ...(maxTokens && { max_tokens: maxTokens })
        };

        // Use streaming endpoint
        const response = await fetch(`${API_BASE_URL}/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to read response stream');
        }

        const decoder = new TextDecoder();
        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.error) {
                  setError('Streaming error: ' + data.error);
                  break;
                }

                if (data.content) {
                  accumulatedContent += data.content;
                  
                  // Update the last message (assistant) with accumulated content
                  setMessages(prevMessages => {
                    const updated = [...prevMessages];
                    updated[updated.length - 1] = {
                      role: 'assistant',
                      content: accumulatedContent
                    };
                    return updated;
                  });
                }

                if (data.done) {
                  break;
                }
              } catch (e) {
                // Skip invalid JSON
                continue;
              }
            }
          }
        }

      } catch (err) {
        setError('Failed to send message: ' + (err as Error).message);
        // Remove the empty assistant message on error
        setMessages(newMessages);
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    } else {
      // Non-streaming mode
      try {
        const payload = {
          model: selectedModel,
          messages: newMessages,
          temperature: temperature,
          use_context: hasContext,
          ...(maxTokens && { max_tokens: maxTokens })
        };

        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to send message');
        }

        const data: ChatResponse = await response.json();
        setMessages([...newMessages, data.message]);
      } catch (err) {
        setError('Failed to send message: ' + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearChat = (): void => {
    setMessages([]);
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusColor = (): string => {
    switch (connectionStatus) {
      case 'connected': return 'status-connected';
      case 'disconnected': return 'status-disconnected';
      default: return 'status-unknown';
    }
  };

  const getStatusIcon = (): JSX.Element => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="icon-sm" />;
      case 'disconnected': return <AlertCircle className="icon-sm" />;
      default: return <Loader2 className="icon-sm spin" />;
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="title-section">
            <Bot className="icon-lg bot-icon" />
            <div>
              <h1 className="title">Context Aware Chat</h1>
              <div className={`status ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="status-text">{connectionStatus}</span>
              </div>
            </div>
          </div>
          
          <div className="header-buttons">
            <button
              onClick={checkHealth}
              className="icon-button"
              title="Refresh connection"
            >
              <RefreshCw className="icon-sm" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="icon-button"
              title="Settings"
            >
              <Settings className="icon-sm" />
            </button>
          </div>
        </div>
      </div>



      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className="settings-panel">
          {/* Context Management Section */}
          <div className="context-settings-section">
            <div className="context-header">
              <FileText className="icon-sm" />
              <span>Context Management</span>
            </div>
            
            {hasContext && contextInfo ? (
              <div className="context-info">
                <div className="context-details">
                  <span className="context-filename">{contextInfo.filename}</span>
                  <span className="context-meta">
                    {(contextInfo.size / 1024).toFixed(1)}KB • Uploaded {new Date(contextInfo.uploaded_at).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={removeContext}
                  className="context-remove-button"
                  title="Remove context"
                >
                  <X className="icon-sm" />
                </button>
              </div>
            ) : (
              <div className="context-upload">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.pdf,.csv,text/plain,text/markdown,application/pdf,text/csv"
                  onChange={handleFileSelect}
                  className="file-input"
                />
                
                {contextFile && (
                  <div className="selected-file">
                    <span>{contextFile.name}</span>
                    <button
                      onClick={uploadContext}
                      disabled={isUploadingContext}
                      className="upload-button"
                    >
                      {isUploadingContext ? (
                        <Loader2 className="icon-sm spin" />
                      ) : (
                        <Upload className="icon-sm" />
                      )}
                      <span>Upload</span>
                    </button>
                  </div>
                )}
                
                {!contextFile && (
                  <div className="upload-placeholder">
                    <Upload className="icon-md" />
                    <span>Select a file to use as context (.txt, .md, .pdf, .csv)</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="settings-grid">
            <div className="form-group">
              <label className="label">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="select"
              >
                <option value="">Select a model</option>
                {models.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name} {model.size && `(${model.size})`}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="label">Temperature: {temperature}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="slider"
              />
            </div>
            
            <div className="form-group">
              <label className="label">Max Tokens</label>
              <input
                type="number"
                value={maxTokens || ''}
                onChange={(e) => setMaxTokens(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Default"
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="label">
                <input
                  type="checkbox"
                  checked={useStreaming}
                  onChange={(e) => setUseStreaming(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Enable Streaming
              </label>
            </div>
          </div>
          
          <div className="model-pull-section">
            <input
              type="text"
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
              placeholder="Model name (e.g., llama2, mistral)"
              className="model-input"
            />
            <button
              onClick={pullModel}
              disabled={isPullingModel || !newModelName.trim()}
              className="primary-button"
            >
              {isPullingModel ? (
                <Loader2 className="icon-sm spin" />
              ) : (
                <Download className="icon-sm" />
              )}
              <span>Pull Model</span>
            </button>
          </div>
          
          <div className="settings-actions">
            <button
              onClick={clearChat}
              className="danger-button"
            >
              Clear Chat
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <AlertCircle className="icon-sm" />
          <span>{error}</span>
        </div>
      )}

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <Bot className="empty-icon" />
            <p className="empty-title">
              {hasContext ? 
                "Ready to answer questions about your uploaded context" : 
                "Upload a context file and start a conversation"
              }
            </p>
            <p className="empty-subtitle">
              {hasContext ? 
                "Ask me anything about the uploaded document" : 
                "Choose a model, upload context, and type your message below"
              }
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`message-row ${message.role === 'user' ? 'message-row-user' : 'message-row-assistant'}`}
            >
              {message.role === 'assistant' && (
                <div className="avatar avatar-bot">
                  <Bot className="icon-sm" />
                </div>
              )}
              
              <div className={`message ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}>
                <div className="message-content">{message.content}</div>
              </div>
              
              {message.role === 'user' && (
                <div className="avatar avatar-user">
                  <User className="icon-sm" />
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && !isStreaming && (
          <div className="message-row message-row-assistant">
            <div className="avatar avatar-bot">
              <Bot className="icon-sm" />
            </div>
            <div className="message message-assistant">
              <div className="loading-message">
                <Loader2 className="icon-sm spin" />
                <span>{isStreaming ? 'Streaming...' : 'Thinking...'}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="input-container">
        <div className="input-row">
          <div className="textarea-container">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                !selectedModel ? "Please select a model first" :
                !hasContext ? "Please upload a context file first" :
                "Ask me about the uploaded context..."
              }
              disabled={!selectedModel || isLoading || !hasContext}
              className="textarea"
              rows={3}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !selectedModel || isLoading || !hasContext}
            className="send-button"
          >
            {isLoading ? (
              <Loader2 className="icon-md spin" />
            ) : (
              <Send className="icon-md" />
            )}
          </button>
        </div>
        
        <div className="input-hint">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default App;