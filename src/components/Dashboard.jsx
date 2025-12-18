import React, { useState } from 'react';
import { 
  FileText, Upload, MessageSquare, History, LogOut, Home, 
  X, File, Send, Plus, Trash2, Menu 
} from 'lucide-react';

const Dashboard = ({ onLogout, onHome }) => {
  const [files, setFiles] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [summaryLength, setSummaryLength] = useState('medium');
  const [summaryStyle, setSummaryStyle] = useState('paragraph');
  const [chatHistory, setChatHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setFiles([]);
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      alert('Please upload at least one file');
      return;
    }
    
    const newChat = {
      id: Date.now(),
      prompt: prompt || 'Summarize documents',
      files: files.map(f => f.name),
      timestamp: new Date().toLocaleString(),
      settings: { length: summaryLength, style: summaryStyle }
    };
    
    setChatHistory([newChat, ...chatHistory]);
    
    console.log('Summarizing with settings:', {
      files: files,
      prompt: prompt,
      length: summaryLength,
      style: summaryStyle
    });
    
    setPrompt('');
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">DocuMind AI</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <History className="w-4 h-4" />
            <span className="text-sm font-semibold">Chat History</span>
          </div>
          
          <div className="space-y-2">
            {chatHistory.map((chat) => (
              <div key={chat.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer border border-gray-200">
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
        </div>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <button 
            onClick={onHome} 
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-2 text-gray-700"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">Return Home</span>
          </button>
          <button 
            onClick={onLogout} 
            className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center gap-2 text-red-600"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">Document Summarizer</h1>
              <p className="text-sm text-gray-500">Upload files and customize your summary</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-green-100 px-3 py-1 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Offline Mode</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* File Upload */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-orange-500" />
                Upload Documents
              </h2>
              
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx,.jpg,.jpeg,.png"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-orange-100 p-4 rounded-full">
                    <Plus className="w-8 h-8 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500 mt-1">PDF, Word, Excel, PowerPoint, Images, Text files</p>
                    <p className="text-xs text-gray-400 mt-1">No limit on number of files</p>
                  </div>
                </div>
              </label>

              {files.length > 0 && (
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Uploaded Files ({files.length})
                    </h3>
                    <button
                      onClick={clearAllFiles}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-2 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customization */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Customize Summary</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Summary Length</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['short', 'medium', 'long'].map((len) => (
                      <button
                        key={len}
                        onClick={() => setSummaryLength(len)}
                        className={`py-2 px-4 rounded-lg border-2 transition ${
                          summaryLength === len
                            ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <span className="text-sm font-medium capitalize">{len}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Summary Style</label>
                  <select
                    value={summaryStyle}
                    onChange={(e) => setSummaryStyle(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
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

            {/* Prompt */}
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="E.g., 'Focus on financial data' or 'Explain like I'm 10 years old'..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none"
                />
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-lg hover:shadow-lg transition flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Summarize
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
  );
};

export default Dashboard;