import React, { useState } from 'react';
import { AlertTriangle, Play, Clock, Plane, ShieldAlert, Sparkles } from 'lucide-react';

export default function DisruptionForm({ onSimulate, loading }) {
  const [flightNumber, setFlightNumber] = useState('6E-204');
  const [delayMinutes, setDelayMinutes] = useState(180);
  const [reason, setReason] = useState('Technical Inspection & Weather Delay');
  const [disruptionType, setDisruptionType] = useState('delay');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSimulate({
      flight_number: flightNumber,
      delay_minutes: Number(delayMinutes),
      reason,
      type: disruptionType,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-700/60 shadow-xl mb-6">
      <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Disruption Simulation Control Center
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Agentic AI Engine
              </span>
            </h2>
            <p className="text-xs text-slate-400">Set disruption metrics to trigger multi-step passenger reasoning chain</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>RAG Policy Store: Online</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Disrupted Flight</label>
          <div className="relative">
            <select
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="6E-204">6E-204 (DEL ➔ BOM)</option>
              <option value="6E-102">6E-102 (DEL ➔ BLR)</option>
              <option value="6E-551">6E-551 (BOM ➔ MAA)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Delay Duration ({Math.floor(delayMinutes / 60)}h {delayMinutes % 60}m)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="30"
              max="480"
              step="30"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(e.target.value)}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono bg-slate-900 text-cyan-400 px-2 py-1 rounded border border-slate-700">
              {delayMinutes}m
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Disruption Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
          >
            <option value="Technical Inspection & Weather Delay">Technical Inspection & Weather Alert</option>
            <option value="Air Traffic Control Congestion">Air Traffic Control Congestion</option>
            <option value="Incoming Aircraft Late Arrival">Incoming Aircraft Late Arrival</option>
            <option value="Flight Cancellation (Unscheduled)">Flight Cancellation (Unscheduled)</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg text-sm shadow-lg shadow-cyan-500/20 transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Executing Reasoning Chain...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Simulate Agent Reasoning</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
