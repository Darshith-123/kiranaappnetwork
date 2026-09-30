import React, { useState } from 'react';
import { ApiLogEntry, BackendType } from '../types';
import { Play, Trash2, ArrowRight, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { backendEngine } from '../services/backendService';

interface ApiConsoleProps {
  logs: ApiLogEntry[];
  activeBackend: BackendType;
  onBackendChange: (b: BackendType) => void;
  onClearLogs: () => void;
}

export const ApiConsole: React.FC<ApiConsoleProps> = ({
  logs,
  activeBackend,
  onBackendChange,
  onClearLogs,
}) => {
  const [selectedLog, setSelectedLog] = useState<ApiLogEntry | null>(logs[0] || null);
  const [testEndpoint, setTestEndpoint] = useState<string>('GET /api/items');
  const [testPayload, setTestPayload] = useState<string>(
    JSON.stringify({ name: "Masoor Dal", price: 110, stock: 25 }, null, 2)
  );
  const [testItemId, setTestItemId] = useState<number>(1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExecuteCustom = async () => {
    setIsExecuting(true);
    try {
      if (testEndpoint === 'GET /api/items') {
        await backendEngine.getItems();
      } else if (testEndpoint === 'GET /api/shopinfo') {
        await backendEngine.getShopInfo();
      } else if (testEndpoint === 'POST /api/items') {
        try {
          const body = JSON.parse(testPayload);
          await backendEngine.addItem(body);
        } catch {
          alert('Invalid JSON in request payload.');
        }
      } else if (testEndpoint === 'POST /api/purchase/<id>') {
        await backendEngine.purchaseItem(testItemId, 1);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyJson = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Backend Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Dual REST API Inspector</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Network Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>Port: {activeBackend === 'python' ? '5000 (Python WSGI)' : '8081 (Java Spark)'}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            API Traffic & Request Inspector
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every interaction on the storefront, inventory table, and POS billing dispatches genuine REST calls to the selected engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => onBackendChange('python')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeBackend === 'python'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Python Flask (:5000)
            </button>
            <button
              onClick={() => onBackendChange('java')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeBackend === 'java'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Java Spark (:8081)
            </button>
          </div>

          <button
            onClick={onClearLogs}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive API Tester / Sandbox */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Interactive Endpoint Sandbox
          </h3>
          <span className="text-xs font-mono text-emerald-700">
            Target: {activeBackend === 'python' ? 'http://localhost:5000' : 'http://localhost:8081'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Select Endpoint
            </label>
            <select
              value={testEndpoint}
              onChange={(e) => setTestEndpoint(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="GET /api/items">GET /api/items (Fetch inventory)</option>
              <option value="GET /api/shopinfo">GET /api/shopinfo (Shop metadata)</option>
              <option value="POST /api/items">POST /api/items (Add grocery item)</option>
              <option value="POST /api/purchase/<id>">POST /api/purchase/:id (Buy 1x)</option>
            </select>
          </div>

          {testEndpoint === 'POST /api/purchase/<id>' && (
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Item ID
              </label>
              <input
                type="number"
                min="1"
                value={testItemId}
                onChange={(e) => setTestItemId(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <button
              onClick={handleExecuteCustom}
              disabled={isExecuting}
              className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isExecuting ? 'Sending...' : 'Send Request'}</span>
            </button>
          </div>
        </div>

        {testEndpoint === 'POST /api/items' && (
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-700">
              Request JSON Body (data)
            </label>
            <textarea
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              rows={3}
              className="w-full p-2.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg border border-slate-800 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Two Column Layout: Request Log List & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Log stream */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col max-h-[580px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Network Log ({logs.length})</span>
            <span className="text-[11px] font-normal text-slate-500">Click entry to inspect</span>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No API calls recorded yet. Interact with the store or trigger a request above.
              </div>
            ) : (
              logs.map((entry) => {
                const isSelected = selectedLog?.id === entry.id;
                const isSuccess = entry.status >= 200 && entry.status < 300;
                return (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedLog(entry)}
                    className={`p-3 text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/70 border-l-3 border-emerald-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            entry.method === 'GET'
                              ? 'bg-blue-100 text-blue-700'
                              : entry.method === 'POST'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {entry.method}
                        </span>
                        <span className="font-semibold text-slate-900 truncate max-w-[170px]">
                          {entry.endpoint}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono tabular-nums text-[11px]">
                        <span className={isSuccess ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                          {entry.status}
                        </span>
                        <span className="text-slate-400">{entry.durationMs}ms</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                      <span>
                        {entry.backend === 'python' ? 'Python Flask :5000' : 'Java Spark :8081'}
                      </span>
                      <span>
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detail Inspector */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col max-h-[580px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Inspector & Headers</span>
            {selectedLog && (
              <button
                onClick={() => handleCopyJson(JSON.stringify(selectedLog.responsePayload, null, 2))}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            )}
          </div>

          <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
            {!selectedLog ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                Select a network request from the left list to view HTTP headers, payload, and response.
              </div>
            ) : (
              <>
                {/* Method & Status Header */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 font-mono">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-slate-500 uppercase">Request Endpoint</div>
                    <div className="font-bold text-slate-900 text-sm">
                      {selectedLog.method} {selectedLog.endpoint}
                    </div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="text-[10px] text-slate-500 uppercase">Response Code</div>
                    <div className={`font-bold text-sm ${selectedLog.status < 300 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {selectedLog.status} {selectedLog.statusText} ({selectedLog.durationMs} ms)
                    </div>
                  </div>
                </div>

                {/* HTTP Response Headers */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Response Headers
                  </h4>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 font-mono text-[11px] space-y-1 text-slate-700">
                    {Object.entries(selectedLog.headers).map(([k, v]) => (
                      <div key={k} className="flex">
                        <span className="text-slate-400 w-44 shrink-0">{k}:</span>
                        <span className="text-slate-800 font-medium truncate">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Request Payload (if any) */}
                {selectedLog.requestPayload && (
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Request Payload (Client &rarr; Server)
                    </h4>
                    <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto">
                      {JSON.stringify(selectedLog.requestPayload, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Response Payload */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Response Payload (Server &rarr; Client)
                  </h4>
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedLog.responsePayload, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
