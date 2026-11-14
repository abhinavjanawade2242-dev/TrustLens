import React, { useState, useRef } from 'react';
import { normalizeUrl } from '../utils/riskHelpers';
import { 
  MessageSquare, 
  Globe, 
  Image as ImageIcon, 
  Trash2, 
  ArrowRight, 
  UploadCloud, 
  AlertCircle, 
  Info, 
  Check, 
  ExternalLink,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

export default function InputTabs({ onAnalyze, isLoading, isBackendOnline }) {
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'url' | 'image'
  
  // Text state
  const [textContent, setTextContent] = useState('');
  const [textError, setTextError] = useState('');

  // URL state
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');

  // Image state
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Text Submission
  const handleTextSubmit = (e) => {
    e.preventDefault();
    setTextError('');
    const trimmed = textContent.trim();
    if (!trimmed) {
      setTextError('Please paste or type a suspicious message, email, or SMS to analyze.');
      return;
    }
    if (trimmed.length < 10) {
      setTextError('Input is too brief for pattern analysis. Please provide more message context (at least 10 characters).');
      return;
    }
    onAnalyze({ type: 'text', content: trimmed });
  };

  // URL Submission
  const normalized = normalizeUrl(urlInput);
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    setUrlError('');
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setUrlError('Please enter a URL to inspect.');
      return;
    }
    if (!normalized.isValid || !normalized.hostname) {
      setUrlError('Please provide a valid web URL or domain format (e.g. secure-login.com or https://verify.org).');
      return;
    }
    onAnalyze({ type: 'url', content: trimmed });
  };

  // Image Handling
  const handleFileSelection = (file) => {
    setImageError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Unsupported file type. Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setImageError('File size exceeds 5MB limit. Please provide a smaller image screenshot.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageSubmit = (e) => {
    e.preventDefault();
    setImageError('');
    if (!selectedFile) {
      setImageError('Please select or drag an image file to analyze.');
      return;
    }
    onAnalyze({ type: 'image', file: selectedFile, content: selectedFile.name });
  };

  return (
    <div className="rounded-2xl bg-midnight-900/85 border border-slate-800/90 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-800 bg-midnight-950/60 p-2 gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'text'
              ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Suspicious Text / Email</span>
        </button>

        <button
          onClick={() => setActiveTab('url')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'url'
              ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Malicious URL / Domain</span>
        </button>

        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'image'
              ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Screenshot / Image</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6 sm:p-8">
        {/* TAB 1: TEXT ANALYSIS */}
        {activeTab === 'text' && (
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label htmlFor="text-input-field" className="font-semibold text-slate-300">
                Paste Communication Payload (Email, SMS, WhatsApp, Chat):
              </label>
              <span className="font-mono">{textContent.length} characters</span>
            </div>

            <div className="relative">
              <textarea
                id="text-input-field"
                rows={5}
                value={textContent}
                onChange={(e) => {
                  setTextContent(e.target.value);
                  if (textError) setTextError('');
                }}
                placeholder="Example: 'URGENT: Your account has been locked. Verify your password and 2FA code at http://login-verify... within 24 hours to prevent termination.'"
                className="w-full rounded-xl bg-midnight-950 border border-slate-800 p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition font-sans leading-relaxed resize-y"
              />
            </div>

            {textError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{textError}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setTextContent('');
                  setTextError('');
                }}
                disabled={!textContent}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Input</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-midnight-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
              >
                <span>{isLoading ? 'Scanning...' : 'Analyze Message'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: URL ANALYSIS */}
        {activeTab === 'url' && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label htmlFor="url-input-field" className="font-semibold text-slate-300">
                Submit Destination URL or Domain:
              </label>
              <span className="text-[11px] text-cyan-400">Passive Syntax & Threat Heuristics</span>
            </div>

            <div className="relative">
              <input
                id="url-input-field"
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (urlError) setUrlError('');
                }}
                placeholder="e.g. https://paypal-security-verification-portal.com/login"
                className="w-full rounded-xl bg-midnight-950 border border-slate-800 px-4 py-3 text-sm text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition"
              />
            </div>

            {/* URL Normalized Preview */}
            {urlInput.trim() && normalized.isValid && (
              <div className="p-3 rounded-lg bg-midnight-950/80 border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Normalized Host:</span>
                  <span className="text-cyan-300 font-semibold">{normalized.hostname}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Protocol:</span>
                  <span className={normalized.protocol === 'https:' ? 'text-emerald-400' : 'text-amber-400'}>
                    {normalized.protocol || 'http:'}
                  </span>
                </div>
              </div>
            )}

            {urlError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{urlError}</span>
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Safety Guarantee:</strong> TrustLens will never visit or trigger remote execution of submitted URLs. Do not assume a URL is safe simply because it is well-formed.
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setUrlInput('');
                  setUrlError('');
                }}
                disabled={!urlInput}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear URL</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-midnight-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
              >
                <span>{isLoading ? 'Inspecting...' : 'Analyze Domain'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: IMAGE ANALYSIS */}
        {activeTab === 'image' && (
          <form onSubmit={handleImageSubmit} className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelection(e.target.files[0]);
                }
              }}
            />

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 rounded-2xl border-2 border-dashed cursor-pointer transition text-center flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-slate-800 bg-midnight-950 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="p-4 rounded-full bg-slate-800/80 text-cyan-400 border border-slate-700/60 shadow-lg">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white block">
                    Click to select or drag and drop a screenshot
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports PNG, JPG, or WEBP up to 5MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-midnight-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                {imagePreview && (
                  <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-slate-700 bg-black shrink-0">
                    <img
                      src={imagePreview}
                      alt="Upload preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left overflow-hidden">
                  <span className="text-sm font-semibold text-white block truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs font-mono text-slate-400 block mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB — {selectedFile.type || 'image/png'}
                  </span>
                  <span className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 justify-center sm:justify-start">
                    <FileCheck className="w-3.5 h-3.5" />
                    File validated & ready for security pipeline
                  </span>
                </div>
                <button
                  type="button"
                  onClick={clearImage}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Remove image"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}

            {imageError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{imageError}</span>
              </div>
            )}

            {/* Explicit Notice on Backend Image Requirement */}
            <div className="p-3.5 rounded-lg bg-midnight-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-300 block mb-0.5">
                  Multimodal OCR & Neural Vision Notice:
                </span>
                Full optical character recognition (OCR) and visual logo tampering detection require an active backend intelligence service. When running in local mock/offline mode, TrustLens performs client-side metadata checks without fabricating fake visual OCR results.
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={clearImage}
                disabled={!selectedFile}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>

              <button
                type="submit"
                disabled={isLoading || !selectedFile}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-midnight-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
              >
                <span>{isLoading ? 'Processing Image...' : 'Analyze Screenshot'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
