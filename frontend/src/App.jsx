import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plane, Cpu, ShieldAlert, RefreshCw, Radio, FileText, CheckCircle2 } from 'lucide-react';
import DisruptionForm from './components/DisruptionForm';
import SummaryCards from './components/SummaryCards';
import PassengerTable from './components/PassengerTable';
import PassengerDetail from './components/PassengerDetail';

const API_BASE = import.meta.env.VITE_API_URL || '/api';


export default function App() {
  const [simulationData, setSimulationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [policyDoc, setPolicyDoc] = useState('');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [utcTime, setUtcTime] = useState('');

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Run initial simulation on load
  useEffect(() => {
    runSimulation({
      flight_number: '6E-204',
      delay_minutes: 180,
      reason: 'Technical Inspection & Weather Alert',
      type: 'delay'
    });
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const res = await axios.get(`${API_BASE}/policy`);
      setPolicyDoc(res.data.policy_content);
    } catch (err) {
      console.error('Failed to fetch policy:', err);
    }
  };

  const runSimulation = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/simulate-disruption`, payload);
      setSimulationData(res.data);
    } catch (err) {
      console.error('Simulation error:', err);
      setError(err.response?.data?.detail || 'Failed to communicate with agent backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans">
      {/* Header Navigation Bar */}
      <header className="glass-panel border-b border-slate-700/80 sticky top-0 z-30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-white font-extrabold text-xl font-mono tracking-tighter">
              AI
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-extrabold text-white tracking-tight">
                  AIONOS <span className="text-cyan-400">IntelliMate</span>
                </h1>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                  Aviation Ops Agent v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous Flight Disruption & Passenger Care Copilot</p>
            </div>
          </div>

          {/* Right Status Indicator */}
          <div className="hidden md:flex items-center space-x-6 text-xs">
            <button
              onClick={() => setShowPolicyModal(true)}
              className="flex items-center space-x-1.5 text-slate-300 hover:text-cyan-400 bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>View Airline Policy (RAG Base)</span>
            </button>

            <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-slate-300">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{utcTime || 'UTC Operations Clock'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/40 rounded-xl text-red-300 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => runSimulation({ flight_number: '6E-204', delay_minutes: 180 })}
              className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-200 px-3 py-1 rounded-lg border border-red-500/40"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Disruption Control Panel */}
        <DisruptionForm onSimulate={runSimulation} loading={loading} />

        {/* KPI Metrics */}
        {simulationData && <SummaryCards summary={simulationData.summary} />}

        {/* Passenger Matrix Table */}
        <PassengerTable
          results={simulationData?.results || []}
          onSelectPassenger={setSelectedPassenger}
          activePassengerId={selectedPassenger?.passenger_id}
        />
      </main>

      {/* Modal: Detailed Passenger Reasoning Trace */}
      {selectedPassenger && (
        <PassengerDetail passenger={selectedPassenger} onClose={() => setSelectedPassenger(null)} />
      )}

      {/* Modal: Policy Document View */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e172e] border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Synthetic Airline Disruption Policy (RAG Indexed)
              </h3>
              <button
                onClick={() => setShowPolicyModal(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2.5 py-1 rounded-md"
              >
                Close
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed border border-slate-800">
              {policyDoc}
            </pre>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 text-center text-xs text-slate-500 font-mono">
        <p>AIONOS IntelliMate Agentic Prototype — Built for InterGlobe & Assago Ventures Aviation Portfolio</p>
        <p className="mt-1 text-[11px] text-slate-600">
          Disclaimer: All passenger records, flight numbers, and disruption policy documents are 100% synthetic/fabricated.
        </p>
      </footer>
    </div>
  );
}
