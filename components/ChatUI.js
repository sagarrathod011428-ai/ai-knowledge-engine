import { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';

// ─── Typing Indicator ────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-amber-400"
          style={{
            animation: 'pulseDot 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message, index }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div
      className={`flex gap-3 animate-fade-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono
          ${isUser
            ? 'bg-amber-400 text-ink-900'
            : isError
            ? 'bg-red-500/20 text-red-400'
            : 'bg-jade-500/20 text-jade-400'
          }`}
        style={{
          backgroundColor: isUser ? '#f5a623' : isError ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
          color: isUser ? '#0a0b0f' : isError ? '#f87171' : '#34d399',
        }}
      >
        {isUser ? 'YOU' : isError ? '!' : 'AI'}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed`}
        style={{
          backgroundColor: isUser
            ? 'rgba(245,166,35,0.1)'
            : isError
            ? 'rgba(239,68,68,0.1)'
            : '#252834',
          border: isUser
            ? '1px solid rgba(245,166,35,0.2)'
            : isError
            ? '1px solid rgba(239,68,68,0.2)'
            : '1px solid #353847',
          borderRadius: isUser
            ? '1rem 0.25rem 1rem 1rem'
            : '0.25rem 1rem 1rem 1rem',
          color: isUser ? '#fef3c7' : isError ? '#fca5a5' : '#e2e8f0',
        }}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        <p
          className="text-xs mt-2 opacity-40"
          style={{ textAlign: isUser ? 'right' : 'left' }}
        >
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}

// ─── Document Badge ────────────────────────────────────────────────────────────
function DocumentBadge({ doc, onRemove }) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-3 py-2 animate-slide-in"
      style={{
        backgroundColor: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.3)',
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'rgba(16,185,129,0.2)' }}
      >
        <svg
          className="w-4 h-4"
          style={{ color: '#34d399' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-semibold font-mono truncate"
          style={{ color: '#34d399' }}
        >
          {doc.name}
        </p>
        <p className="text-xs" style={{ color: '#64748b' }}>
          {doc.pages}p · {(doc.charCount / 1000).toFixed(1)}k chars
        </p>
      </div>
      <button
        onClick={onRemove}
        className="ml-1 transition-colors"
        style={{ color: '#64748b' }}
        onMouseEnter={(e) => (e.target.style.color = '#f87171')}
        onMouseLeave={(e) => (e.target.style.color = '#64748b')}
        title="Remove document"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Upload Zone ───────────────────────────────────────────────────────────────
function UploadZone({ onUpload, isLoading }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) onUpload(acceptedFiles[0]);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className="relative rounded-2xl p-8 text-center cursor-pointer transition-all duration-300"
      style={{
        border: `2px dashed ${isDragActive ? '#f5a623' : '#353847'}`,
        backgroundColor: isDragActive ? 'rgba(245,166,35,0.05)' : 'transparent',
        transform: isDragActive ? 'scale(1.02)' : 'scale(1)',
        opacity: isLoading ? 0.6 : 1,
        cursor: isLoading ? 'not-allowed' : 'pointer',
      }}
    >
      <input {...getInputProps()} />

      <div
        className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          backgroundColor: isDragActive ? 'rgba(245,166,35,0.2)' : '#1a1d26',
        }}
      >
        {isLoading ? (
          <div
            className="w-6 h-6 rounded-full border-2 animate-spin"
            style={{
              borderColor: '#f5a623',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite',
            }}
          />
        ) : (
          <svg
            className="w-7 h-7"
            style={{ color: isDragActive ? '#f5a623' : '#94a3b8' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        )}
      </div>

      <p
        className="text-sm font-semibold mb-1"
        style={{ color: isDragActive ? '#f5a623' : '#cbd5e1' }}
      >
        {isLoading
          ? 'Processing PDF...'
          : isDragActive
          ? 'Drop it here!'
          : 'Upload your PDF document'}
      </p>
      <p className="text-xs" style={{ color: '#475569' }}>
        {isLoading
          ? 'Extracting text from your document'
          : 'Drag & drop or click to browse · Max 10MB'}
      </p>
    </div>
  );
}

// ─── Main ChatUI Component ─────────────────────────────────────────────────────
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

  // ── Handle PDF Upload ────────────────────────────────────────────────────
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
        body: JSON.stringify({
          action: 'parse',
          fileData: base64,
          fileName: file.name,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse PDF');
      }

      setDocumentData({
        name: file.name,
        text: data.text,
        pages: data.pages,
        charCount: data.charCount,
      });
      setShowUpload(false);

      setMessages([
        {
          role: 'assistant',
          content: `✅ **Document loaded successfully!**\n\n📄 **${file.name}** — ${data.pages} pages, ${data.charCount.toLocaleString()} characters extracted.\n\nI'm ready to answer your questions about this document. What would you like to know?`,
          timestamp: getTimestamp(),
        },
      ]);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // ── Handle Send Message ───────────────────────────────────────────────────
  const handleSend = async () => {
    const question = input.trim();
    if (!question || isThinking) return;

    if (!documentData) {
      setUploadError('Please upload a PDF document first.');
      setShowUpload(true);
      return;
    }

    const userMessage = {
      role: 'user',
      content: question,
      timestamp: getTimestamp(),
    };
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

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to get an answer');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          timestamp: getTimestamp(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `**Error:** ${err.message}`,
          isError: true,
          timestamp: getTimestamp(),
        },
      ]);
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ backgroundColor: '#0a0b0f', color: '#e2e8f0', fontFamily: 'DM Sans, system-ui, sans-serif' }}
    >
      {/* ── Header ── */}
      <header
        className="flex-shrink-0 px-4 py-4"
        style={{
          borderBottom: '1px solid #252834',
          backgroundColor: 'rgba(17,19,24,0.8)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="max-w-4xl mx-auto flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #f5a623, #d97706)',
                boxShadow: '0 4px 14px rgba(245,166,35,0.3)',
              }}
            >
              <svg className="w-5 h-5" style={{ color: '#0a0b0f' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h1
                className="text-base font-bold tracking-tight"
                style={{ fontFamily: 'Playfair Display, Georgia, serif', color: '#fff' }}
              >
                Knowledge Engine
              </h1>
              <p className="text-xs" style={{ color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                AI · Document Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {documentData && (
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="hidden sm:flex items-center gap-2 text-xs rounded-xl px-3 py-1.5 transition-colors"
                style={{
                  backgroundColor: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  color: '#34d399',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: '#34d399',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
                {documentData.name.length > 20
                  ? documentData.name.slice(0, 20) + '...'
                  : documentData.name}
              </button>
            )}

            {(messages.length > 0 || documentData) && (
              <button
                onClick={clearChat}
                className="text-xs flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-colors"
                style={{
                  color: '#64748b',
                  border: '1px solid #252834',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Body ── */}
      <div
        className="flex-1 overflow-hidden flex flex-col mx-auto w-full px-4"
        style={{ maxWidth: '56rem' }}
      >
        {/* Upload Panel */}
        {showUpload && (
          <div className="flex-shrink-0 pt-4 pb-2">
            <UploadZone onUpload={handleUpload} isLoading={isUploading} />
            {uploadError && (
              <div
                className="mt-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm animate-slide-in"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171',
                }}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                {uploadError}
              </div>
            )}
          </div>
        )}

        {/* Document Badge */}
        {!showUpload && documentData && (
          <div className="flex-shrink-0 pt-4 pb-2">
            <DocumentBadge doc={documentData} onRemove={clearChat} />
          </div>
        )}

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto py-4 space-y-4"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#252834 #111318' }}
        >
          {messages.length === 0 && !showUpload && (
            <div className="text-center py-16 animate-fade-up">
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#1a1d26', border: '1px solid #353847' }}
              >
                <svg className="w-8 h-8" style={{ color: '#475569' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>
                Ask me anything about your document
              </p>
              <p className="text-xs mt-1" style={{ color: '#334155' }}>
                I'll find the answer from the uploaded PDF
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} index={i} />
          ))}

          {isThinking && (
            <div className="flex gap-3 animate-fade-up">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  backgroundColor: 'rgba(16,185,129,0.2)',
                  color: '#34d399',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                AI
              </div>
              <div
                className="rounded-2xl"
                style={{
                  backgroundColor: '#252834',
                  border: '1px solid #353847',
                  borderTopLeftRadius: '0.25rem',
                }}
              >
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="flex-shrink-0 pb-4 pt-2">
          {!documentData && messages.length === 0 && (
            <p
              className="text-center text-xs mb-2"
              style={{ color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}
            >
              Upload a PDF above to start asking questions
            </p>
          )}
          <div
            className="flex gap-2 items-end rounded-2xl p-2 transition-all duration-200"
            style={{
              backgroundColor: '#1a1d26',
              border: `1px solid ${documentData ? '#353847' : '#1a1d26'}`,
              opacity: documentData ? 1 : 0.5,
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!documentData || isThinking}
              placeholder={
                documentData
                  ? 'Ask a question about your document...'
                  : 'Upload a PDF first...'
              
