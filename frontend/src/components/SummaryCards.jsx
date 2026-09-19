import React from 'react';
import { Users, AlertTriangle, GitBranch, HeartHandshake, CheckCircle2 } from 'lucide-react';

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Passengers */}
      <div className="glass-panel p-4 rounded-xl border border-slate-700/60 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Affected Passengers</p>
          <h3 className="text-2xl font-extrabold text-white mt-1 font-mono">{summary.total_passengers}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Flight {summary.disruption_event?.flight_number}</p>
        </div>
        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Urgent Flag Count */}
      <div className="glass-panel p-4 rounded-xl border border-red-500/30 bg-red-500/5 flex items-center justify-between">
        <div>
          <p className="text-xs text-red-300 font-semibold uppercase tracking-wider">Urgent Human Handover</p>
          <h3 className="text-2xl font-extrabold text-red-400 mt-1 font-mono">{summary.urgent_count}</h3>
          <p className="text-xs text-red-400/70 mt-0.5">Requires Operator Intervention</p>
        </div>
        <div className="p-3 bg-red-500/10 rounded-xl text-red-400 border border-red-500/30 animate-pulse">
          <AlertTriangle className="w-6 h-6" />
        </div>
      </div>

      {/* Connections at Risk */}
      <div className="glass-panel p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
        <div>
          <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider">Connections at Risk</p>
          <h3 className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">{summary.connecting_count}</h3>
          <p className="text-xs text-amber-400/70 mt-0.5">Layover Buffer Analyzed</p>
        </div>
        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/30">
          <GitBranch className="w-6 h-6" />
        </div>
      </div>

      {/* Special Assistance */}
      <div className="glass-panel p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 flex items-center justify-between">
        <div>
          <p className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Special Assistance (SSR)</p>
          <h3 className="text-2xl font-extrabold text-purple-300 mt-1 font-mono">{summary.special_needs_count}</h3>
          <p className="text-xs text-purple-400/70 mt-0.5">UMNR / Wheelchair / Medical</p>
        </div>
        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-300 border border-purple-500/30">
          <HeartHandshake className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
