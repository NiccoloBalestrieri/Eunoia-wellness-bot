import React, { useState, useEffect, useRef } from 'react';

// Icone locali
const Icon = ({ children, className }) => (
  <span className={className}>{children}</span>
);

const Send = (props) => <Icon {...props}>➤</Icon>;
const Plus = (props) => <Icon {...props}>＋</Icon>;
const Settings = (props) => <Icon {...props}>⚙️</Icon>;
const LogOut = (props) => <Icon {...props}>⇦</Icon>;
const Loader2 = ({ className }) => <span className={className}>⟳</span>;
const X = (props) => <Icon {...props}>✕</Icon>;
const Trash2 = (props) => <Icon {...props}>🗑️</Icon>;
const Menu = (props) => <Icon {...props}>☰</Icon>;

const API_URL = 'https://nicbl.niccolobalestrieri2.workers.dev';

const NaturaLogo = ({ className = "h-8 w-8" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="10" width="8" height="80" rx="4" fill="currentColor"/>
    <rect x="35" y="25" width="8" height="50" rx="4" fill="currentColor"/>
    <rect x="50" y="15" width="8" height="70" rx="4" fill="currentColor"/>
    <rect x="65" y="30" width="8" height="40" rx="4" fill="currentColor"/>
    <rect x="80" y="20" width="8" height="60" rx="4" fill="currentColor"/>
  </svg>
);

export default function ChatbotApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [chats, setChats] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  
  const [showMCP, setShowMCP] = useState(false);
  const [mcpServers, setMcpServers] = useState([]);
  const [mcpName, setMcpName] = useState('');
  const [mcpUrl, setMcpUrl] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const messages = activeChat && chats[activeChat] ? chats[activeChat].messages : [];

  useEffect(() => {
    const svg = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#000000"/>
      <rect x="20" y="10" width="8" height="80" rx="4" fill="#ffffff"/>
      <rect x="35" y="25" width="8" height="50" rx="4" fill="#ffffff"/>
      <rect x="50" y="15" width="8" height="70" rx="4" fill="#ffffff"/>
      <rect x="65" y="30" width="8" height="40" rx="4" fill="#ffffff"/>
      <rect x="80" y="20" width="8" height="60" rx="4" fill="#ffffff"/>
    </svg>`;
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
    document.title = 'Natura AI';
    
    return () => URL.revokeObjectURL(url);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedEmail = localStorage.getItem('email');
    
    if (savedEmail) setEmail(savedEmail);
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
      loadMCPServers(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!email || !isLoggedIn) {
      setChats({});
      setActiveChat(null);
      return;
    }
    
    const savedChats = localStorage.getItem(`chats_${email}`);
    const savedActive = localStorage.getItem(`activeChatId_${email}`);
    
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats);
      if (savedActive && parsedChats[savedActive]) {
        setActiveChat(savedActive);
      } else {
        setActiveChat(null);
      }
    } else {
      setChats({});
      setActiveChat(null);
    }
  }, [email, isLoggedIn]);

  useEffect(() => {
    if (!email || Object.keys(chats).length === 0) return;
    localStorage.setItem(`chats_${email}`, JSON.stringify(chats));
    if (activeChat) localStorage.setItem(`activeChatId_${email}`, activeChat);
  }, [chats, activeChat, email]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const createNewChat = () => {
    const id = Date.now().toString();
    const existingChats = Object.values(chats);
    const nextIndex = existingChats.length > 0 
      ? Math.max(...existingChats.map(c => {
          const match = c.title.match(/Chat (\d+)/);
          return match ? parseInt(match[1]) : 0;
        })) + 1
      : 1;
    
    const newChat = {
      title: `Chat ${nextIndex}`,
      messages: []
    };
    
    setChats(prev => ({ ...prev, [id]: newChat }));
    setActiveChat(id);
    setIsMobileMenuOpen(false); // Chiudi menu mobile dopo selezione
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    
    const updated = { ...chats };
    delete updated[id];
    setChats(updated);

    if (activeChat === id) {
      const remaining = Object.keys(updated);
      setActiveChat(remaining[0] || null);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isSignup ? '/auth/signup' : '/auth/login';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.msg || 'Authentication failed');
      }

      const authToken = data.access_token;
      setToken(authToken);
      localStorage.setItem('token', authToken);
      localStorage.setItem('email', email);
      setIsLoggedIn(true);
      loadMCPServers(authToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (email && Object.keys(chats).length > 0) {
      localStorage.setItem(`chats_${email}`, JSON.stringify(chats));
      if (activeChat) localStorage.setItem(`activeChatId_${email}`, activeChat);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setToken(null);
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setChats({});
    setActiveChat(null);
    setInput('');
    setSending(false);
    setIsMobileMenuOpen(false);
  };

  const loadMCPServers = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/mcp`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMcpServers(data);
      }
    } catch (err) {
      console.error('Failed to load MCP servers:', err);
    }
  };

  const addMCPServer = async () => {
    if (!mcpName || !mcpUrl) return;

    try {
      const response = await fetch(`${API_URL}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: mcpName, url: mcpUrl }),
      });

      if (response.ok) {
        setMcpName('');
        setMcpUrl('');
        loadMCPServers(token);
      }
    } catch (err) {
      console.error('Failed to add MCP server:', err);
    }
  };

  const deleteMCPServer = async (serverId) => {
    try {
      const response = await fetch(`${API_URL}/mcp/${serverId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadMCPServers(token);
      }
    } catch (err) {
      console.error('Failed to delete MCP server:', err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    let chatId = activeChat;
    
    if (!chatId) {
      chatId = Date.now().toString();
      const newChat = {
        title: 'Chat 1',
        messages: []
      };
      setChats(prev => ({ ...prev, [chatId]: newChat }));
      setActiveChat(chatId);
    }

    const userMessage = { role: 'user', content: input };
    const messageToSend = input;
    setInput('');
    setSending(true);

    setChats(prev => ({
      ...prev,
      [chatId]: {
        ...prev[chatId],
        messages: [...(prev[chatId]?.messages || []), userMessage]
      }
    }));

    try {
      const history = chats[chatId]?.messages || [];
      
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: messageToSend, history }),
      });

      const data = await response.json();
      
      const assistantMessage = {
        role: 'assistant',
        content: response.ok ? data.response : `Error: ${data.error}`
      };

      setChats(prev => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          messages: [...(prev[chatId]?.messages || []), assistantMessage]
        }
      }));
    } catch (err) {
      const errorMessage = {
        role: 'assistant',
        content: `Error: ${err.message}`
      };
      
      setChats(prev => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          messages: [...(prev[chatId]?.messages || []), errorMessage]
        }
      }));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <NaturaLogo className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-white mb-2">Welcome to Natura AI</h1>
            <p className="text-gray-400">Log in or create your account to continue</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleAuth}
                disabled={loading}
                className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isSignup ? 'Create Account' : 'Continue'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError('');
                }}
                className="text-gray-400 hover:text-white text-sm transition"
              >
                {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-black text-white md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <NaturaLogo className="h-6 w-6 text-white" />
          <span className="text-lg font-semibold">Natura AI</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-zinc-800 rounded transition"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar - Desktop sempre visibile, Mobile solo se aperto */}
      <div className={`${
        isMobileMenuOpen ? 'flex' : 'hidden'
      } md:flex w-full md:w-64 bg-black border-r border-zinc-800 flex-col absolute md:relative z-50 h-full md:h-auto`}>
        <div className="p-4 border-b border-zinc-800">
          <div className="hidden md:flex items-center gap-3 mb-4">
            <NaturaLogo className="h-7 w-7 text-white" />
            <span className="text-lg font-semibold">Natura AI</span>
          </div>
          <button
            onClick={createNewChat}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition flex items-center justify-center gap-2 border border-zinc-700"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-xs font-semibold text-gray-500 px-3 py-2">Recent</div>
          {Object.keys(chats).length === 0 && (
            <div className="text-gray-500 text-sm px-3 py-2">No chats yet</div>
          )}
          {Object.entries(chats).map(([id, chat]) => (
            <div
              key={id}
              onClick={() => {
                setActiveChat(id);
                setIsMobileMenuOpen(false); // Chiudi menu su mobile
              }}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition ${
                id === activeChat
                  ? 'bg-zinc-800 text-white'
                  : 'hover:bg-zinc-900 text-gray-300'
              }`}
            >
              <div className="flex-1 truncate">
                {chat.title}
              </div>
              <button
                onClick={(e) => deleteChat(id, e)}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition ml-2 p-1"
                title="Delete chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-zinc-800 space-y-2">
          <button
            onClick={() => {
              setShowMCP(!showMCP);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900 transition text-sm text-gray-300"
          >
            <Settings className="w-4 h-4" />
            MCP Servers
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900 transition text-sm text-gray-300"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
          <div className="px-3 py-2 text-xs text-gray-500 truncate">
            {email}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* MCP Panel */}
        {showMCP && (
          <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur flex-shrink-0">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">MCP Servers</h3>
                <button onClick={() => setShowMCP(false)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Server name"
                  value={mcpName}
                  onChange={(e) => setMcpName(e.target.value)}
                  className="flex-1 bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                />
                <input
                  type="url"
                  placeholder="Server URL"
                  value={mcpUrl}
                  onChange={(e) => setMcpUrl(e.target.value)}
                  className="flex-1 bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                />
                <button
                  onClick={addMCPServer}
                  className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {mcpServers.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {mcpServers.map((server) => (
                    <div key={server.id} className="bg-black border border-zinc-800 rounded-lg px-3 py-2.5 flex items-center justify-between group">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{server.name}</div>
                        <div className="text-xs text-gray-500 truncate mt-0.5">{server.url}</div>
                      </div>
                      <button
                        onClick={() => deleteMCPServer(server.id)}
                        className="ml-3 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition p-1"
                        title="Delete server"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 text-center py-4">No MCP servers connected</div>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 pb-32 scroll-smooth">
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-8">
            {messages.length === 0 ? (
              <div className="text-center mt-20">
                <NaturaLogo className="h-12 w-12 text-white mx-auto mb-4 opacity-20" />
                <p className="text-xl text-gray-400 mb-2">How can I help you today?</p>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {messages.map((msg, idx) => (
                  <div key={idx} className="group">
                    <div className="flex gap-3 md:gap-4">
                      <div className="flex-shrink-0">
                        {msg.role === 'user' ? (
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black text-sm font-semibold">
                            {email[0]?.toUpperCase() || 'U'}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                            <NaturaLogo className="h-5 w-5 text-black" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 pt-1 min-w-0">
                        <div className="text-sm font-semibold text-white mb-1">
                          {msg.role === 'user' ? 'You' : 'Natura AI'}
                        </div>
                        <div className="text-white whitespace-pre-wrap leading-relaxed break-words text-sm md:text-base">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="group">
                    <div className="flex gap-3 md:gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                          <NaturaLogo className="h-5 w-5 text-black" />
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="text-sm font-semibold text-white mb-1">Natura AI</div>
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-zinc-800 bg-black flex-shrink-0 safe-area-bottom">
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl focus-within:border-zinc-600 transition">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Natura AI..."
                disabled={sending}
                rows={1}
                className="w-full bg-transparent border-0 px-4 py-3 md:py-4 pr-12 text-white placeholder-gray-500 focus:outline-none resize-none max-h-32 md:max-h-48 disabled:opacity-50 text-sm md:text-base"
                style={{ minHeight: '24px' }}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                className="absolute right-2 md:right-3 bottom-2 md:bottom-3 bg-white text-black p-2 rounded-lg hover:bg-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2 md:mt-3">
              Natura AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
        
      </div>

      {/* Overlay per chiudere sidebar su mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
