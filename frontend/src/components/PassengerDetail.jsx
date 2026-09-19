import React, { useState } from 'react';
import { X, CheckCircle, ShieldAlert, FileText, Send, Copy, Sparkles, Plane, Clock, Award, HelpCircle, HeartHandshake } from 'lucide-react';

export default function PassengerDetail({ passenger, onClose }) {
  const [copied, setCopied] = useState(false);
  const [actionStatus, setActionStatus] = useState(null);

  if (!passenger) return null;

  const chain = passenger.reasoning_chain || {};
  const step1 = chain.step_1_connection_check || {};
  const step2 = chain.step_2_rebooking || {};
  const step3 = chain.step_3_urgency || {};
  const step4 = chain.step_4_rag_and_message || {};

  const copyMessage = () => {
    navigator.clipboard.writeText(passenger.drafted_message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = () => {
    setActionStatus('Approved & Notification Queued');
    setTimeout(() => setActionStatus(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0e172e] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-700/70 bg-slate-900/80 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-lg font-mono">
              {passenger.seat}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-extrabold text-white">{passenger.name}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {passenger.passenger_id}
                </span>
                {passenger.urgency_flag ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/40 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Urgent Intervention Required
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/30">
                    Automated Processing Safe
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Cabin: <span className="text-slate-200">{passenger.cabin_class}</span> | Loyalty:{' '}
                <span className="text-amber-400 font-semibold">{passenger.loyalty_tier}</span> | Original Flight:{' '}
                <span className="text-cyan-400 font-mono">{passenger.current_flight}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Action notification banner */}
          {actionStatus && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-lg text-xs font-semibold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{actionStatus}</span>
            </div>
          )}

          {/* 4-Step Reasoning Chain Pipeline */}
          <div>
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Multi-Step AI Agentic Reasoning Trace
            </h3>

            <div className="space-y-4">
              {/* STEP 1 */}
              <div className="glass-panel p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">
                      1
                    </span>
                    Step 1: Connection & Layover Risk Assessment
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      passenger.connection_risk.includes('MISSED') || passenger.connection_risk.includes('CRITICAL')
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {passenger.connection_risk}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {step1.analysis || `Analyzed layover buffer time for passenger.`}
                </p>
              </div>

              {/* STEP 2 */}
              <div className="glass-panel p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">
                      2
                    </span>
                    Step 2: Candidate Flight Scoring & Rebooking Decision
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/30">
                    Selected: {passenger.recommended_flight}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {step2.scoring_notes || `Evaluated available seats across primary and interline carriers.`}
                </p>
              </div>

              {/* STEP 3 */}
              <div className="glass-panel p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">
                      3
                    </span>
                    Step 3: Urgency & Human Escalation Classifier
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      passenger.urgency_flag ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {passenger.urgency_flag ? 'Human Escalation Required' : 'Automated Approval Authorized'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-slate-200">Evaluation Triggers:</strong> {passenger.urgency_reason}
                </p>
              </div>

              {/* STEP 4 */}
              <div className="glass-panel p-4 rounded-xl border border-slate-700/60 bg-slate-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">
                      4
                    </span>
                    Step 4: RAG Policy Retrieval & Grounded Entitlements
                  </span>
                </div>

                {/* Retrieved Policy Snippets */}
                <div className="mb-3 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Retrieved Policy Context (RAG Vector Match):
                  </p>
                  {(step4.retrieved_policies || []).map((policy, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg text-xs text-slate-300 font-mono"
                    >
                      <div className="text-cyan-400 font-bold mb-1">📄 {policy.title}</div>
                      <div className="text-[11px] text-slate-400 leading-normal line-clamp-3">{policy.content}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Calculated Entitlements:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {passenger.entitlements && passenger.entitlements.length > 0 ? (
                      passenger.entitlements.map((ent, i) => (
                        <span
                          key={i}
                          className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-md font-medium"
                        >
                          ✓ {ent}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Standard rebooking update.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Drafted Communication Preview */}
          <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 bg-slate-900/70">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                Drafted Passenger Communication (SMS / Email / Push Alert)
              </span>

              <button
                onClick={copyMessage}
                className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-md flex items-center space-x-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-lg text-xs text-slate-200 font-sans whitespace-pre-wrap leading-relaxed border border-slate-800">
              {passenger.drafted_message}
            </pre>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-700/70 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 sticky bottom-0">
          <div className="text-xs text-slate-400 font-mono">
            Status: {passenger.urgency_flag ? 'Escalated to Operator' : 'Ready for Dispatch'}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Close Window
            </button>
            <button
              onClick={handleApprove}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-lg shadow-lg shadow-cyan-500/20 transition flex items-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve Rebooking & Send Alert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
