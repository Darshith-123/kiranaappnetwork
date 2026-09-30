import React, { useState } from 'react';
import { PYTHON_CODE, JAVA_CODE, ORIGINAL_HTML_CODE } from '../data/backendCode';
import { backendEngine } from '../services/backendService';
import { Copy, Check, FileCode, CheckCircle2 } from 'lucide-react';

export const CodeViewer: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'java' | 'html' | 'json' | 'arch'>('python');
  const [copied, setCopied] = useState(false);

  const getActiveCode = () => {
    switch (activeCodeTab) {
      case 'python':
        return PYTHON_CODE;
      case 'java':
        return JAVA_CODE;
      case 'html':
        return ORIGINAL_HTML_CODE;
      case 'json':
        return backendEngine.getRawJson();
      default:
        return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Source Code Repository</span>
            <span aria-hidden="true">·</span>
            <span>REST API Specifications</span>
            <span aria-hidden="true">·</span>
            <span>inventory.json Concurrency</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Backend & Frontend Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore the Python Flask microservice, Java Spark server, and shared storage specifications.
          </p>
        </div>

        {activeCodeTab !== 'arch' && (
          <button
            onClick={handleCopy}
            className="self-start md:self-auto px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
          </button>
        )}
      </div>

      {/* Code Tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-slate-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveCodeTab('python')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            activeCodeTab === 'python'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          app.py (Python Flask :5000)
        </button>

        <button
          onClick={() => setActiveCodeTab('java')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            activeCodeTab === 'java'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          KiranaBackend.java (SparkJava :8081)
        </button>

        <button
          onClick={() => setActiveCodeTab('json')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            activeCodeTab === 'json'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          inventory.json (Shared Storage)
        </button>

        <button
          onClick={() => setActiveCodeTab('html')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            activeCodeTab === 'html'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Legacy templates/index.html
        </button>

        <button
          onClick={() => setActiveCodeTab('arch')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            activeCodeTab === 'arch'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Architectural Breakdown
        </button>
      </div>

      {/* Code Display or Architecture View */}
      {activeCodeTab === 'arch' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              1. Dual-Backend Parity & REST Contract
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Both Python Flask (<code className="font-mono text-emerald-700">app.py</code>) and Java Spark (<code className="font-mono text-emerald-700">KiranaBackend.java</code>) implement the identical REST API specification:
            </p>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>
                <strong className="text-slate-800">GET /api/items</strong>: Returns JSON array of all items in <code className="font-mono">inventory.json</code>.
              </li>
              <li>
                <strong className="text-slate-800">POST /api/items</strong>: Accepts <code className="font-mono">&#123;"name", "price", "stock"&#125;</code>, computes <code className="font-mono">max(id) + 1</code>, and appends to the store.
              </li>
              <li>
                <strong className="text-slate-800">POST /api/purchase/:id</strong>: Atomically checks if item exists and <code className="font-mono">stock &gt; 0</code>, decrements stock by 1, and saves to file. Returns <code className="font-mono">400 Bad Request</code> if out of stock, <code className="font-mono">404</code> if missing.
              </li>
              <li>
                <strong className="text-slate-800">GET /api/shopinfo</strong>: Exposes shop metadata (Sharma Kirana Store, Delhi, India).
              </li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              2. Shared inventory.json File Concurrency
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Both backends read and persist to the exact same <code className="font-mono text-emerald-700">inventory.json</code> file on disk. When a customer purchases an item through the Python backend or the shopkeeper restocks via Java, both processes access the same data model.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
              <div className="font-semibold text-slate-800">Production Recommendations:</div>
              <p className="text-slate-600">
                For high concurrency in Delhi wholesale markets, wrapping <code className="font-mono">inventory.json</code> reads/writes with atomic file locking (<code className="font-mono">fcntl.flock</code> in Python, <code className="font-mono">FileChannel.lock()</code> in Java) or migrating to SQLite/PostgreSQL prevents race conditions.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>
              {activeCodeTab === 'python'
                ? 'app.py — Python 3.11 / Flask'
                : activeCodeTab === 'java'
                ? 'KiranaBackend.java — Java 17 / SparkJava'
                : activeCodeTab === 'json'
                ? 'inventory.json — Master JSON Data'
                : 'templates/index.html — Legacy Template'}
            </span>
            <span>UTF-8</span>
          </div>

          <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[600px]">
            <code>{getActiveCode()}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
