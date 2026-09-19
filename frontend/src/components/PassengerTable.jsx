import React, { useState } from 'react';
import { Search, Filter, ShieldAlert, ArrowRight, Eye, User, Award, CheckCircle, ChevronRight } from 'lucide-react';

export default function PassengerTable({ results, onSelectPassenger, activePassengerId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL', 'URGENT', 'CONNECTING', 'SPECIAL'

  if (!results || results.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-12 text-center text-slate-400">
        <User className="w-12 h-12 mx-auto text-slate-600 mb-3 animate-bounce" />
        <p className="text-base font-semibold text-slate-300">No Disruption Simulation Executed Yet</p>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Click "Simulate Agent Reasoning" above to trigger the 4-step AI evaluation engine across all flight manifest passengers.
        </p>
      </div>
    );
  }

  const filteredPassengers = results.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.passenger_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.seat.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'URGENT') return p.urgency_flag;
    if (filterMode === 'CONNECTING') return p.has_connection;
    if (filterMode === 'SPECIAL') return p.special_needs !== null;

    return true;
  });

  return (
    <div className="glass-panel rounded-xl border border-slate-700/60 overflow-hidden shadow-2xl">
      {/* Header controls & Filters */}
      <div className="p-4 border-b border-slate-700/60 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search passenger, seat, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredPassengers.length} of {results.length}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterMode === 'ALL'
                ? 'bg-cyan-500 text-white shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            All Manifest ({results.length})
          </button>
          <button
            onClick={() => setFilterMode('URGENT')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
              filterMode === 'URGENT'
                ? 'bg-red-500 text-white shadow'
                : 'bg-slate-800/80 text-red-400 hover:bg-red-500/20'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Urgent Handover ({results.filter((p) => p.urgency_flag).length})
          </button>
          <button
            onClick={() => setFilterMode('CONNECTING')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterMode === 'CONNECTING'
                ? 'bg-amber-500 text-white shadow'
                : 'bg-slate-800/80 text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            Connecting ({results.filter((p) => p.has_connection).length})
          </button>
          <button
            onClick={() => setFilterMode('SPECIAL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterMode === 'SPECIAL'
                ? 'bg-purple-600 text-white shadow'
                : 'bg-slate-800/80 text-purple-400 hover:bg-purple-500/20'
            }`}
          >
            Special Needs ({results.filter((p) => p.special_needs).length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/60 font-mono">
            <tr>
              <th className="py-3.5 px-4">Passenger Details</th>
              <th className="py-3.5 px-4">Loyalty / Class</th>
              <th className="py-3.5 px-4">Connection Risk</th>
              <th className="py-3.5 px-4">AI Recommended Rebooking</th>
              <th className="py-3.5 px-4">Urgency Status</th>
              <th className="py-3.5 px-4 text-right">Reasoning Chain</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredPassengers.map((passenger) => {
              const isSelected = activePassengerId === passenger.passenger_id;

              return (
                <tr
                  key={passenger.passenger_id}
                  onClick={() => onSelectPassenger(passenger)}
                  className={`cursor-pointer transition duration-150 ${
                    isSelected
                      ? 'bg-cyan-500/10 border-l-4 border-cyan-400'
                      : passenger.urgency_flag
                      ? 'bg-red-500/5 hover:bg-red-500/10'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  {/* Passenger Name & Seat */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-cyan-400 border border-slate-700 flex items-center justify-center font-bold text-xs">
                        {passenger.seat}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          {passenger.name}
                          {passenger.special_needs && (
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                              SSR
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 text-[11px] font-mono">
                          ID: {passenger.passenger_id} | Flight {passenger.current_flight}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Loyalty & Cabin */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-slate-200">{passenger.cabin_class}</span>
                      <span
                        className={`text-[10px] w-max px-2 py-0.5 rounded font-mono font-semibold ${
                          passenger.loyalty_tier === 'Platinum'
                            ? 'bg-slate-200 text-slate-900'
                            : passenger.loyalty_tier === 'Gold'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {passenger.loyalty_tier}
                      </span>
                    </div>
                  </td>

                  {/* Connection Risk */}
                  <td className="py-3.5 px-4">
                    {passenger.has_connection ? (
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center gap-1">
                          ➔ {passenger.connection_flight}
                        </div>
                        <span
                          className={`text-[11px] font-medium ${
                            passenger.connection_risk.includes('MISSED') || passenger.connection_risk.includes('CRITICAL')
                              ? 'text-red-400 font-bold'
                              : 'text-amber-400'
                          }`}
                        >
                          {passenger.connection_risk}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">Point-to-Point (No Connection)</span>
                    )}
                  </td>

                  {/* Recommended Flight */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-cyan-400 font-mono text-sm">
                      {passenger.recommended_flight}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {passenger.recommended_flight_details?.airline || 'Partner Carrier'}
                    </div>
                  </td>

                  {/* Urgency Status */}
                  <td className="py-3.5 px-4">
                    {passenger.urgency_flag ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                        <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                        Human Intervention
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Auto Rebooked
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPassenger(passenger);
                      }}
                      className="inline-flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-500/30 transition"
                    >
                      <span>View Reasoning</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
