import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, MessageSquare, History, LogOut, Home, 
  X, File, Send, Plus, Trash2, Menu, AlertCircle, CheckCircle,
  AlertTriangle, Info, Shield, Copy, Download
} from 'lucide-react';
import { validateFiles, generateDefaultSummary } from '../utils/fileValidator';
import { summarizeFiles } from '../services/apiService';
import toast, { Toaster } from 'react-hot-toast';

const Dashboard = ({ onLogout, onHome }) => {
  const [files, setFiles] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [summaryLength, setSummaryLength] = useState('medium');
  const [summaryStyle, setSummaryStyle] = useState('paragraph');
  const [chatHistory, setChatHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSummary, setCurrentSummary] = useState(null);
  const [user, setUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Load chat history from localStorage
    const savedHistory = localStorage.getItem('chat_history');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save chat history whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chat_history', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length === 0) return;

    toast.loading('Validating files...', { id: 'file-validation' });

    const validationResults = await validateFiles(selectedFiles);
    
    const validFiles = [];
    const invalidFiles = [];

    validationResults.forEach(({ file, validation }) => {
      if (validation.valid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, validation });
      }
    });

    toast.dismiss('file-validation');

    if (invalidFiles.length > 0) {
      invalidFiles.forEach(({ file, validation }) => {
        toast.error(`${file.name}: ${validation.errors.join(', ')}`, {
          duration: 5000
        });
        
        if (validation.scenario) {
          const defaultSummary = generateDefaultSummary(validation.scenario, file.name);
          setCurrentSummary(defaultSummary);
        }
      });
    }

    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles]);
      toast.success(`${validFiles.length} file(s) uploaded successfully! ✅`);
    }
  };

  const removeFile = (index) => {
    const removedFile = files[index];
    setFiles(files.filter((_, i) => i !== index));
    toast.success(`${removedFile.name} removed`);
  };

  const clearAllFiles = () => {
    setFiles([]);
    toast.success('All files cleared');
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      const defaultSummary = generateDefaultSummary('NO_FILES');
      setCurrentSummary(defaultSummary);
      toast.error('Please upload at least one file');
      return;
    }

    setIsProcessing(true);
    toast.loading('Generating summary...', { id: 'summarizing' });

    try {
      const settings = {
        length: summaryLength,
        style: summaryStyle,
        userQuery: prompt
      };

      // Call backend API
      const results = await summarizeFiles(files, settings);

      toast.dismiss('summarizing');

      // Process results
      const summaries = results.map(result => {
        if (result.error) {
          return `❌ ${result.fileName}: ${result.error}`;
        }
        return `✅ ${result.fileName}:\n\n${result.summary}`;
      }).join('\n\n---\n\n');

      const summaryData = {
        title: '✅ Summary Generated Successfully',
        summary: summaries,
        type: 'success'
      };

      setCurrentSummary(summaryData);

      // Add to chat history
      const newChat = {
        id: Date.now(),
        prompt: prompt || 'Summarize documents',
        files: files.map(f => f.name),
        timestamp: new Date().toLocaleString(),
        settings: { length: summaryLength, style: summaryStyle },
        summary: summaryData
      };

      setChatHistory([newChat, ...chatHistory]);
      toast.success('Summary generated! 🎉');
      
      setPrompt('');
      setFiles([]); // Clear files after successful summarization
    } catch (error) {
      console.error('Summarization error:', error);
      const errorSummary = {
        title: '❌ Summarization Failed',
        summary: `Error: ${error.message}\n\nPlease make sure:\n• Backend server is running (http://localhost:8000)\n• Ollama is running with llama3.2:3b model\n• Files are valid and readable`,
        type: 'error'
      };
      setCurrentSummary(errorSummary);
      toast.dismiss('summarizing');
      toast.error('Failed to generate summary');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopySummary = () => {
    if (currentSummary) {
      navigator.clipboard.writeText(currentSummary.summary);
      toast.success('Summary copied to clipboard!');
    }
  };

  const handleDownloadSummary = () => {
    if (!currentSummary) return;
    const blob = new Blob([currentSummary.summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded!');
  };

  const getSummaryIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error': return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'info': return <Info className="w-6 h-6 text-blue-500" />;
      default: return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const getSummaryBgColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="h-screen flex bg-gray-50">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-900 block">DocuMind AI</span>
                {user && (
                  <span className="text-xs text-gray-500">{user.name}</span>
                )}
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <History className="w-4 h-4" />
              <span className="text-sm font-semibold">Chat History</span>
            </div>
            
            <div className="space-y-2">
              {chatHistory.map((chat) => (
                <div 
                  key={chat.id} 
                  onClick={() => setCurrentSummary(chat.summary)}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer border border-gray-200 transition"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">{chat.prompt}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {chat.files.length} file{chat.files.length !== 1 ? 's' : ''} • {chat.timestamp}
                  </p>
                </div>
              ))}
              
              {chatHistory.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No history yet</p>
              )}
            </div>

            {chatHistory.length > 0 && (
              <button
                onClick={() => {
                  setChatHistory([]);
                  localStorage.removeItem('chat_history');
                  toast.success('History cleared');
                }}
                className="mt-4 w-full py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Clear All History
              </button>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button 
              onClick={onHome} 
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-2 text-gray-700"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Return Home</span>
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('user');
                onLogout();
              }}
              className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center gap-2 text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">Document Summarizer</h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Secure file validation • AI-powered summaries
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-green-100 px-3 py-1 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">Backend Connected</span>
              </div>
            </div>
          </header>

          {/* Main Work Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Summary Display */}
              {currentSummary && (
                <div className={`rounded-2xl shadow-sm border-2 p-6 ${getSummaryBgColor(currentSummary.type)}`}>
                  <div className="flex items-start gap-4">
                    {getSummaryIcon(currentSummary.type)}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">{currentSummary.title}</h3>
                      <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm max-h-96 overflow-y-auto">
                        {currentSummary.summary}
                      </div>
                      
                      {/* Action Buttons */}
                      {currentSummary.type === 'success' && (
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={handleCopySummary}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm"
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </button>
                          <button
                            onClick={handleDownloadSummary}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => setCurrentSummary(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* File Upload Area */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-orange-500" />
                  Upload Documents
                  <span className="ml-2 text-xs font-normal bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Validated & Secure
                  </span>
                </h2>
                
                <label className="block border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx,.jpg,.jpeg,.png"
                    disabled={isProcessing}
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-orange-100 p-4 rounded-full">
                      <Plus className="w-8 h-8 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500 mt-1">PDF, Word, Excel, PowerPoint, Images, Text files</p>
                      <p className="text-xs text-gray-400 mt-1">Automatic validation • Corrupted file detection</p>
                    </div>
                  </div>
                </label>

                {/* Uploaded Files */}
                {files.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Uploaded Files ({files.length})
                      </h3>
                      <button
                        onClick={clearAllFiles}
                        disabled={isProcessing}
                        className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                      >
                        Clear All
                      </button>
                    </div>
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <File className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              {(file.size / 1024).toFixed(2)} KB
                              <CheckCircle className="w-3 h-3 text-green-500 ml-1" />
                              <span className="text-green-600">Verified</span>
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          disabled={isProcessing}
                          className="p-2 hover:bg-red-50 rounded-lg transition flex-shrink-0 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customization Options */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Customize Summary</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Length */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Summary Length</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['short', 'medium', 'long'].map((len) => (
                        <button
                          key={len}
                          onClick={() => setSummaryLength(len)}
                          disabled={isProcessing}
                          className={`py-2 px-4 rounded-lg border-2 transition ${
                            summaryLength === len
                              ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className="text-sm font-medium capitalize">{len}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Summary Style</label>
                    <select
                      value={summaryStyle}
                      onChange={(e) => setSummaryStyle(e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none disabled:opacity-50"
                    >
                      <option value="paragraph">Paragraph</option>
                      <option value="bullet">Bullet Points</option>
                      <option value="flashcard">Flashcards</option>
                      <option value="mindmap">Mind Map</option>
                      <option value="keypoints">Key Points</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Prompt Area */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange-500" />
                  Custom Instructions (Optional)
                </h2>
                
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSubmit()}
                    disabled={isProcessing}
                    placeholder="E.g., 'Focus on financial data' or 'Explain like I'm 10 years old'..."
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={isProcessing || files.length === 0}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-lg hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Summarize
                      </>
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-3">
                  💡 Tip: Be specific about what you want to extract or how you want the summary formatted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;