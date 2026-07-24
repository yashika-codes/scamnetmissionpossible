import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Share2, 
  MapPin, 
  RefreshCw, 
  Zap, 
  ShieldAlert, 
  TrendingUp
} from 'lucide-react';

export default function GraphDashboard() {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/graph');
      const data = await res.json();
      setGraphData(data);
    } catch (err) {
      console.error("Failed to fetch graph data, using mock intelligence:", err);
      setGraphData({
        summary: {
          total_complaints: 7,
          active_syndicates: 3,
          total_financial_loss: 1845000,
          impacted_states: 4
        },
        clusters: [
          {
            cluster_id: "RING-#101",
            title: "Digital Arrest Ring (3 States)",
            risk_label: "CRITICAL ALERT - MULTI-STATE RING",
            states: ["Delhi", "West Bengal", "Kerala"],
            complaints_count: 3,
            total_amount_lost: 1330000,
            shared_phones: ["+91-9876543210", "+91-9988112233"],
            shared_upis: ["cbi.verify@okicici", "gov.rbi.clearance@ybl"]
          },
          {
            cluster_id: "RING-#102",
            title: "YONO KYC Suspensions",
            risk_label: "HIGH RISK CLUSTER",
            states: ["Maharashtra", "Delhi"],
            complaints_count: 2,
            total_amount_lost: 215000,
            shared_phones: ["+91-9123456789"],
            shared_upis: ["sbisecure.kyc@okaxis"]
          }
        ],
        nodes: [
          { id: "CMP-2026-8801", label: "CMP-8801", type: "complaint", state: "Delhi", risk_level: "CRITICAL" },
          { id: "CMP-2026-8802", label: "CMP-8802", type: "complaint", state: "West Bengal", risk_level: "CRITICAL" },
          { id: "CMP-2026-8803", label: "CMP-8803", type: "complaint", state: "Kerala", risk_level: "CRITICAL" },
          { id: "+91-9876543210", label: "+91-9876543210", type: "phone", degree: 4 },
          { id: "+91-9988112233", label: "+91-9988112233", type: "phone", degree: 3 },
          { id: "cbi.verify@okicici", label: "cbi.verify@okicici", type: "upi", degree: 5 },
          { id: "gov.rbi.clearance@ybl", label: "gov.rbi.clearance@ybl", type: "upi", degree: 3 },
          { id: "Delhi", label: "Delhi", type: "state" },
          { id: "West Bengal", label: "West Bengal", type: "state" },
          { id: "Kerala", label: "Kerala", type: "state" }
        ],
        links: [
          { source: "CMP-2026-8801", target: "+91-9876543210" },
          { source: "CMP-2026-8802", target: "+91-9876543210" },
          { source: "CMP-2026-8801", target: "cbi.verify@okicici" },
          { source: "CMP-2026-8802", target: "cbi.verify@okicici" },
          { source: "CMP-2026-8803", target: "+91-9988112233" },
          { source: "CMP-2026-8803", target: "gov.rbi.clearance@ybl" }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const handleResetSeed = async () => {
    try {
      await fetch('/api/seed-reset', { method: 'POST' });
      fetchGraph();
    } catch (e) {
      console.error(e);
    }
  };

  const getNodeColor = (type) => {
    switch (type) {
      case 'complaint': return '#EF4444'; // Red for Fraud
      case 'phone': return '#0EA5E9'; // Cyan
      case 'upi': return '#F59E0B'; // Amber
      case 'bank': return '#8B5CF6'; // Purple
      case 'url': return '#EC4899'; // Pink
      case 'state': return '#10B981'; // Green for State/Safe
      default: return '#64748B';
    }
  };

  const filteredNodes = graphData?.nodes?.filter(node => {
    const matchesFilter = activeFilter === 'ALL' || node.type === activeFilter.toLowerCase();
    const matchesSearch = !searchTerm || node.id.toLowerCase().includes(searchTerm.toLowerCase()) || node.label.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Top Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{graphData?.summary?.total_complaints || 0}</div>
            <div className="text-xs text-slate-500 font-bold uppercase">Total Complaints</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-black text-red-600">{graphData?.summary?.active_syndicates || 0}</div>
            <div className="text-xs text-slate-500 font-bold uppercase">Cross-State Syndicates</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">{graphData?.summary?.impacted_states || 0}</div>
            <div className="text-xs text-slate-500 font-bold uppercase">States Impacted</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-600">₹{(graphData?.summary?.total_financial_loss || 0).toLocaleString('en-IN')}</div>
            <div className="text-xs text-slate-500 font-bold uppercase">Tracked Extortion</div>
          </div>
        </div>
      </div>

      {/* Main Intelligence Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Graph Canvas / SVG Renderer */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-200 space-y-4 relative flex flex-col justify-between min-h-[550px]">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-2">
              <Share2 className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-black text-slate-900">Live Criminal Entity Graph</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'COMPLAINT', 'PHONE', 'UPI', 'BANK'].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === f
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}

              <button
                onClick={handleResetSeed}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer"
                title="Reset Graph to Seed Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SVG Node Graph Canvas */}
          <div className="relative w-full h-[420px] bg-white rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner">
            {loading ? (
              <div className="flex items-center space-x-2 text-emerald-600 font-bold">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span>Rendering NetworkX Graph Topology...</span>
              </div>
            ) : (
              <svg className="w-full h-full">
                {/* SVG Legend */}
                <g transform="translate(15, 20)">
                  <circle cx="0" cy="0" r="5" fill="#EF4444" />
                  <text x="12" y="4" fill="#334155" fontSize="10" fontWeight="bold">Complaint (Fraud)</text>

                  <circle cx="120" cy="0" r="5" fill="#0EA5E9" />
                  <text x="132" y="4" fill="#334155" fontSize="10" fontWeight="bold">Phone</text>

                  <circle cx="190" cy="0" r="5" fill="#F59E0B" />
                  <text x="202" y="4" fill="#334155" fontSize="10" fontWeight="bold">UPI Handle</text>

                  <circle cx="280" cy="0" r="5" fill="#10B981" />
                  <text x="292" y="4" fill="#334155" fontSize="10" fontWeight="bold">State</text>
                </g>

                {/* Drawn Links */}
                {graphData?.links?.map((link, i) => {
                  const sIdx = filteredNodes.findIndex(n => n.id === link.source);
                  const tIdx = filteredNodes.findIndex(n => n.id === link.target);
                  if (sIdx === -1 || tIdx === -1) return null;

                  const total = filteredNodes.length;
                  const x1 = 200 + Math.cos((sIdx / total) * 2 * Math.PI) * 150;
                  const y1 = 210 + Math.sin((sIdx / total) * 2 * Math.PI) * 140;
                  const x2 = 200 + Math.cos((tIdx / total) * 2 * Math.PI) * 150;
                  const y2 = 210 + Math.sin((tIdx / total) * 2 * Math.PI) * 140;

                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="rgba(203, 213, 225, 0.8)"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Drawn Nodes */}
                {filteredNodes.map((node, idx) => {
                  const total = filteredNodes.length;
                  const angle = (idx / total) * 2 * Math.PI;
                  const cx = 200 + Math.cos(angle) * 150;
                  const cy = 210 + Math.sin(angle) * 140;
                  const isSelected = selectedNode?.id === node.id;
                  const radius = node.type === 'complaint' ? 14 : node.type === 'upi' ? 12 : 10;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${cx}, ${cy})`}
                      onClick={() => setSelectedNode(node)}
                      className="cursor-pointer hover:scale-125 transition-transform"
                    >
                      <circle
                        r={radius}
                        fill={getNodeColor(node.type)}
                        stroke={isSelected ? '#0F172A' : '#FFFFFF'}
                        strokeWidth={isSelected ? 3 : 1.5}
                        className={node.type === 'complaint' ? 'animate-pulse' : ''}
                      />
                      <text
                        y={radius + 14}
                        textAnchor="middle"
                        fill="#1e293b"
                        fontSize="9"
                        fontWeight="700"
                        className="pointer-events-none select-none"
                      >
                        {node.label.length > 12 ? node.label.slice(0, 10) + '..' : node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Node Detail Popup */}
          {selectedNode && (
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-300 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-slate-500">Selected Node Details</span>
                <div className="text-base font-bold font-mono text-slate-900">{selectedNode.id}</div>
                <div className="text-xs text-slate-600 font-medium">Type: {selectedNode.type} {selectedNode.state ? `• State: ${selectedNode.state}` : ''}</div>
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Right Col: Live Cluster Alerts */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-600" />
              <span>Cross-State Cluster Alerts</span>
            </h2>
            <span className="bg-red-100 text-red-700 border border-red-200 text-xs font-black px-2.5 py-0.5 rounded-full">
              LIVE
            </span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {graphData?.clusters?.map((cluster, idx) => (
              <div
                key={idx}
                className="bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-red-400 transition-all shadow-sm space-y-2 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {cluster.cluster_id}
                  </span>
                  <span className="text-xs font-bold text-amber-700">
                    {cluster.states?.join(' ↔ ')}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm">{cluster.title}</h3>
                <p className="text-xs font-bold text-red-600">{cluster.risk_label}</p>

                <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-mono">
                  {cluster.shared_phones?.map((phone, i) => (
                    <span key={i} className="bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded border border-cyan-200 font-bold">
                      📞 {phone}
                    </span>
                  ))}
                  {cluster.shared_upis?.map((upi, i) => (
                    <span key={i} className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-bold">
                      💳 {upi}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
