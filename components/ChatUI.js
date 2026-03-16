import { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 16px' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#f5a623',
            display: 'inline-block',
            animation: 'pulseDot 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      flexDirection: isUser ? 'row-reverse' : 'row',
      marginBottom: '16px',
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: 'bold',
        flexShrink: 0,
        backgroundColor: isUser ? '#f5a623' : isError ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
        color: isUser ? '#0a0b0f' : isError ? '#f87171' : '#34d399',
      }}>
        {isUser ? 'YOU' : isError ? '!' : 'AI'}
      </div>

      <div style={{
        maxWidth: '78%',
        padding: '12px 16px',
        borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
        backgroundColor: isUser ? 'rgba(245,166,35,0.1)' : isError ? 'rgba(239,68,68,0.1)' : '#252834',
        border: `1px solid ${isUser ? 'rgba(245,166,35,0.2)' : isError ? 'rgba(239,68,68,0.2)' : '#353847'}`,
        color: isUser ? '#fef3c7' : isError ? '#fca5a5' : '#e2e8f0',
        fontSize: '14px',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {message.content}
        <div style={{ fontSize: '11px', opacity: 0.4, marginTop: '6px', textAlign: isUser ? 'right' : 'left' }}>
          {message.timestamp}
        </div>
      </div>
    </div>
  );
}

function UploadZone({ onUpload, isLoading }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) onUpload(acceptedFiles[0]);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: `2px dashed ${isDragActive ? '#f5a623' : '#353847'}`,
        borderRadius: '16px',
        padding: '40px 20px',
        textAlign: 'center',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        backgroundColor: isDragActive ? 'rgba(245,166,35,0.05)' : 'transparent',
        transition: 'all 0.2s',
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      <input {...getInputProps()} />
      <div style={{
        width: '56px', height: '56px', borderRadius: '16px',
        backgroundColor: '#1a1d26', display: 'flex',
        alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
      }}>
        {isLoading ? (
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            border: '2px solid #f5a623', borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite',
          }} />
        ) : (
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke={isDragActive ? '#f5a623' : '#94a3b8'} strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )}
      </div>
      <p style={{ color: isDragActive ? '#f5a623' : '#cbd5e1', fontWeight: 600, marginBottom: '6px' }}>
        {isLoading ? 'Processing PDF...' : isDragActive ? 'Drop it here!' : 'Upload your PDF document'}
      </p>
      <p style={{ color: '#475569', fontSize: '13px' }}>
        {isLoading ? 'Extracting text...' : 'Drag & drop or click to browse · Max 10MB'}
      </p>
    </div>
  );
}

export default function ChatUI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [showUpload, setShowUpload] = useState(true);
  const [uploadError, setUploadError] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    if (documentData) inputRef.current?.focus();
  }, [documentData]);

  const getTimestamp = () =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const handleUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError('');
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'parse', fileData: base64, fileName: file.name }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to parse PDF');

      setDocumentData({ name: file.name, text: data.text, pages: data.pages, charCount: data.charCount });
      setShowUpload(false);
      setMessages([{
        role: 'assistant',
        content: `Document loaded successfully!\n\n"${file.name}" — ${data.pages} pages, ${data.charCount.toLocaleString()} characters extracted.\n\nI am ready to answer your questions. What would you like to know?`,
        timestamp: getTimestamp(),
      }]);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isThinking || !documentData) return;

    const userMessage = { role: 'user', content: question, timestamp: getTimestamp() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ask',
          question,
          documentText: documentData.text,
          chatHistory: messages.slice(-6),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to get answer');

      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer, timestamp: getTimestamp() }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`,
        isError: true,
        timestamp: getTimestamp(),
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setDocumentData(null);
    setShowUpload(true);
    setUploadError('');
    setInput('');
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      backgroundColor: '#0a0b0f', color: '#e2e8f0',
      fontFamily: 'system-ui, sans-serif', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid #252834',
        backgroundColor: 'rgba(17,19,24,0.9)', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #f5a623, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#0a0b0f" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#fff' }}>Knowledge Engine</div>
            <div style={{ fontSize: '11px', color: '#475569' }}>AI Document Intelligence</div>
          </div>
        </div>
        {(messages.length > 0 || documentData) && (
          <button onClick={clearChat} style={{
            background: 'none', border: '1px solid #252834', color: '#64748b',
            borderRadius: '10px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px',
          }}>
            Clear
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{
        flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        maxWidth: '800px', width: '100%', margin: '0 auto', padding: '0 16px',
      }}>
        {/* Upload zone */}
        {showUpload && (
          <div style={{ flexShrink: 0, paddingTop: '16px', paddingBottom: '8px' }}>
            <UploadZone onUpload={handleUpload} isLoading={isUploading} />
            {uploadError && (
              <div style={{
                marginTop: '12px', padding: '12px 16px', borderRadius: '12px',
                backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171', fontSize: '13px',
              }}>
                {uploadError}
              </div>
            )}
          </div>
        )}

        {/* Document badge */}
        {!showUpload && documentData && (
          <div style={{
            flexShrink: 0, paddingTop: '12px', paddingBottom: '8px',
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', borderRadius: '12px', marginTop: '12px',
            backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          }}>
            <div style={{ color: '#34d399', fontSize: '13px', fontWeight: 600, flex: 1 }}>
              {documentData.name} — {documentData.pages} pages
            </div>
            <button onClick={clearChat} style={{
              background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px',
            }}>×</button>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', paddingTop: '16px', paddingBottom: '8px' }}>
          {messages.length === 0 && !showUpload && (
            <div style={{ textAlign: 'center', paddingTop: '60px', color: '#475569' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Ask me anything about your document
              </div>
              <div style={{ fontSize: '12px' }}>I will find the answer from your PDF</div>
            </div>
          )}
          {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
          {isThinking && (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: 'rgba(16,185,129,0.2)', color: '#34d399',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 'bold', flexShrink: 0,
              }}>AI</div>
              <div style={{
                backgroundColor: '#252834', border: '1px solid #353847',
                borderRadius: '4px 16px 16px 16px',
              }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ flexShrink: 0, paddingBottom: '16px', paddingTop: '8px' }}>
          {!documentData && (
            <p style={{ textAlign: 'center', color: '#334155', fontSize: '12px', marginBottom: '8px' }}>
              Upload a PDF above to start asking questions
            </p>
          )}
          <div style={{
            display: 'flex', gap: '8px', alignItems: 'flex-end',
            backgroundColor: '#1a1d26', border: '1px solid #353847',
            borderRadius: '16px', padding: '8px',
            opacity: documentData ? 1 : 0.5,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!documentData || isThinking}
              placeholder={documentData ? 'Ask a question about your document...' : 'Upload a PDF first...'}
              rows={1}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#e2e8f0', fontSize: '14px', resize: 'none',
                padding: '4px 8px', lineHeight: '1.5', minHeight: '32px', maxHeight: '120px',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !documentData || isThinking}
              style={{
                width: '36px', height: '36px', borderRadius: '10px', border: 'none',
                cursor: !input.trim() || !documentData || isThinking ? 'not-allowed' : 'pointer',
                backgroundColor: !input.trim() || !documentData || isThinking ? '#252834' : '#f5a623',
                color: !input.trim() || !documentData || isThinking ? '#475569' : '#0a0b0f',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              {isThinking ? (
                <div style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  border: '2px solid #475569', borderTopColor: 'transparent',
                  animation: 'spin 1s linear infinite',
                }} />
              ) : (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
          <p style={{ textAlign: 'center', color: '#1e293b', fontSize: '11px', marginTop: '6px' }}>
            Enter to send · Shift+Enter for new line · Powered by Mistral-7B
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulseDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        textarea::placeholder { color: #334155; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111318; }
        ::-webkit-scrollbar-thumb { background: #252834; border-radius: 4px; }
      `}</style>
    </div>
  );
}
