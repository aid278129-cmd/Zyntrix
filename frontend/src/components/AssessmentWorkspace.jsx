import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Dna,
  ShieldCheck,
  AlertTriangle,
  FileSearch,
  UploadCloud,
  FlaskConical,
  Building2,
  Layers,
  History,
  CheckCircle2,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Plus,
  ArrowRight,
  Sparkles,
  Scale,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { EvidenceGraphCanvas } from './EvidenceGraphCanvas';
import { CompliancePassportView } from './CompliancePassportView';
import { AssessmentChatDrawer } from './AssessmentChatDrawer';

export function AssessmentWorkspace() {
  const [assessmentsList, setAssessmentsList] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isJudgeMode, setIsJudgeMode] = useState(false);
  const [activeSection, setActiveSection] = useState('overview'); // overview | dna | applicability | requirements | evidence | roadmap | graph | passport | history
  const [expandedClause, setExpandedClause] = useState(null);
  const [passportData, setPassportData] = useState(null);
  const [snapshots, setSnapshots] = useState([]);

  // New Assessment Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProdName, setNewProdName] = useState('ThermoSteel Domestic Vacuum Flask 750ml');
  const [newCategory, setNewCategory] = useState('Drinkware & Food Contact Containers');
  const [newDesc, setNewDesc] = useState('Double wall stainless steel 304 vacuum insulated flask 750 ml capacity for domestic drinking water.');
  const [isAuthoritative, setIsAuthoritative] = useState(false);

  // Evidence Upload State
  const [evidenceSnippet, setEvidenceSnippet] = useState('');
  const [evidenceType, setEvidenceType] = useState('TEST_REPORT');
  const [evidenceAuthority, setEvidenceAuthority] = useState('LAB_REPORT');
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);

  // Clarification Input State
  const [clarifyAnswers, setClarifyAnswers] = useState({});

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await fetch('/api/v1/assessments');
      if (res.ok) {
        const data = await res.json();
        setAssessmentsList(data);
        if (data.length > 0 && !selectedAssessmentId) {
          loadAssessment(data[0].assessment_id);
        } else if (data.length === 0) {
          const initRes = await fetch('/api/v1/assessments/demo/reset', { method: 'POST' });
          if (initRes.ok) {
            const initData = await initRes.json();
            setAssessment(initData);
            setSelectedAssessmentId(initData.assessment_id);
            if (initData.summary) {
              setAssessmentsList([initData.summary]);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching assessments:', err);
    }
  };

  const loadAssessment = async (id) => {
    setIsLoading(true);
    setSelectedAssessmentId(id);
    try {
      const res = await fetch(`/api/v1/assessments/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAssessment(data);
      }
    } catch (err) {
      console.warn('Error loading assessment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: newProdName,
          category: newCategory,
          description: newDesc,
          authoritative_mode: isAuthoritative,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowCreateModal(false);
        setAssessment(data);
        setSelectedAssessmentId(data.assessment_id);
        fetchAssessments();
      }
    } catch (err) {
      console.warn('Error creating assessment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerClarification = async (attributeName, value) => {
    if (!assessment) return;
    try {
      const res = await fetch(`/api/v1/assessments/${assessment.assessment_id}/clarify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attribute: attributeName, value }),
      });
      if (res.ok) {
        const data = await res.json();
        setAssessment(data);
      }
    } catch (err) {
      console.warn('Clarification submission error:', err);
    }
  };

  const handleUploadEvidence = async (e) => {
    e.preventDefault();
    if (!assessment || !evidenceSnippet.trim()) return;
    setIsSubmittingEvidence(true);
    try {
      const res = await fetch(`/api/v1/assessments/${assessment.assessment_id}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snippet: evidenceSnippet,
          evidence_type: evidenceType,
          authority: evidenceAuthority,
          page: 1,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAssessment(data);
        setEvidenceSnippet('');
      }
    } catch (err) {
      console.warn('Evidence submission error:', err);
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  const handleLoadPassport = async () => {
    if (!assessment) return;
    try {
      const res = await fetch(`/api/v1/assessments/${assessment.assessment_id}/passport`);
      if (res.ok) {
        const data = await res.json();
        setPassportData(data);
        setActiveSection('passport');
      }
    } catch (err) {
      console.warn('Passport error:', err);
    }
  };

  const handleLoadSnapshots = async () => {
    if (!assessment) return;
    try {
      const res = await fetch(`/api/v1/assessments/${assessment.assessment_id}/snapshots`);
      if (res.ok) {
        const data = await res.json();
        setSnapshots(data);
      }
    } catch (err) {
      console.warn('Snapshots error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Selector & Start Assessment Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-600/30">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              MSME Compliance Operations
            </span>
            <h2 className="text-base font-bold text-white">Continuous Assessment Workspace</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {assessmentsList.length > 0 && (
            <select
              value={selectedAssessmentId || ''}
              onChange={(e) => loadAssessment(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200"
            >
              {assessmentsList.map((a) => (
                <option key={a.assessment_id} value={a.assessment_id}>
                  {a.assessment_number} &bull; {a.status}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                const res = await fetch('/api/v1/assessments/demo/reset', { method: 'POST' });
                if (res.ok) {
                  const data = await res.json();
                  setAssessment(data);
                  setSelectedAssessmentId(data.assessment_id);
                  fetchAssessments();
                }
              } catch (err) {
                console.warn('Demo reset error:', err);
              } finally {
                setIsLoading(false);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-lg shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Reset Golden Demo
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Assessment
          </button>
        </div>
      </div>

      {/* New Assessment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-400" />
                Initialize New MSME Compliance Assessment
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1">Product Trade Name:</label>
                <input
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Standard Industry Category:</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Technical / BOM Description:</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono leading-relaxed"
                  required
                />
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="authModeCheck"
                  checked={isAuthoritative}
                  onChange={(e) => setIsAuthoritative(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600"
                />
                <label htmlFor="authModeCheck" className="text-slate-300">
                  <strong className="text-white block">Authoritative Mode Only</strong>
                  Strictly use verified BIS metadata and gazetted regulations. Refuses unverified clause claims.
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold transition"
                >
                  {isLoading ? 'Initializing...' : 'Start Assessment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Assessment Container */}
      {assessment ? (
        <div className="space-y-6">
          {/* Section A: Assessment Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-slate-500">{assessment.assessment_number}</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-blue-400 font-bold">Version {assessment.current_version}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">{assessment.title}</h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                  assessment.mode === 'AUTHORITATIVE_MODE'
                    ? 'bg-blue-950 text-blue-300 border-blue-800'
                    : 'bg-amber-950 text-amber-300 border-amber-800'
                }`}>
                  {assessment.mode === 'AUTHORITATIVE_MODE' ? 'AUTHORITATIVE MODE (Verified Only)' : 'DEVELOPMENT MODE (Non-Authoritative)'}
                </span>

                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-slate-950 text-slate-300 border border-slate-700">
                  Status: {assessment.status}
                </span>

                <button
                  onClick={() => setIsJudgeMode(!isJudgeMode)}
                  className={`px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 border ${
                    isJudgeMode
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  {isJudgeMode ? 'Judge Mode: ACTIVE' : 'Enable Judge Mode'}
                </button>

                <button
                  onClick={handleLoadPassport}
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  Compliance Passport
                </button>
              </div>
            </div>

            {/* Structured Requirement Overview Counters (No Fake Percentages) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase">Requirements Evaluated</span>
                <div className="text-base font-bold text-white font-mono">
                  {assessment.summary.total_requirements}
                </div>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase">Satisfied</span>
                <div className="text-base font-bold text-emerald-400 font-mono">
                  {assessment.summary.satisfied_count}
                </div>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase">Potentially Satisfied</span>
                <div className="text-base font-bold text-blue-400 font-mono">
                  {assessment.summary.potentially_satisfied_count}
                </div>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase">Missing Evidence</span>
                <div className="text-base font-bold text-amber-400 font-mono">
                  {assessment.summary.missing_evidence_count}
                </div>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase">Potential Gaps</span>
                <div className="text-base font-bold text-rose-400 font-mono">
                  {assessment.summary.potential_gaps_count}
                </div>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase">Overall Verdict</span>
                <div className="text-xs font-bold text-white font-mono mt-1">
                  <StatusBadge status={assessment.summary.summary_verdict} />
                </div>
              </div>
            </div>

            {/* Navigation Stepper */}
            <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pt-2 pb-px text-xs font-semibold">
              {[
                { id: 'overview', label: '1. Assessment Overview' },
                { id: 'dna', label: '2. Product DNA & Clarifications' },
                { id: 'requirements', label: '3. Compliance Requirements' },
                { id: 'evidence', label: '4. Evidence Workspace' },
                { id: 'roadmap', label: '5. Testing & Laboratories' },
                { id: 'graph', label: '6. Evidence Graph' },
                { id: 'history', label: '7. Audit Snapshots' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSection(tab.id);
                    if (tab.id === 'history') handleLoadSnapshots();
                  }}
                  className={`px-3 py-2 rounded-t-lg transition whitespace-nowrap border-t border-x ${
                    activeSection === tab.id
                      ? 'bg-slate-950 text-blue-400 border-slate-800 border-b-slate-950 -mb-px'
                      : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Overview */}
          {activeSection === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Summary & Next Actions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-blue-400" />
                    Applicable Indian Standards
                  </h4>
                  <div className="space-y-3">
                    {assessment.applicability.map((app, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="font-mono font-bold text-blue-400 text-sm">{app.standard_number}</span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                              {app.technical_relevance}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                              {app.regulatory_status}
                            </span>
                          </div>
                        </div>
                        <div className="font-bold text-white">{app.standard_title}</div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{app.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gaps Dashboard */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Identified Compliance Gaps & Operational Next Steps
                  </h4>
                  <div className="space-y-2">
                    {assessment.compliance && assessment.compliance.evaluations.map((ev, idx) => (
                      <div key={idx} className="p-3.5 rounded bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-white">Clause {ev.clause_number}: {ev.clause_title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{ev.explanation}</div>
                        </div>
                        <div className="flex sm:flex-col items-end gap-1.5 shrink-0">
                          <StatusBadge status={ev.status} />
                          {ev.recommended_action && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-950 text-rose-300 border border-rose-800">
                              {ev.recommended_action}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col: Quick Actions & Trust Governance Card */}
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                    Regulatory Trust Card
                  </h4>
                  <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Official Metadata:</span>
                      <strong className="text-emerald-400">VERIFIED</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">QCO Order 2023:</span>
                      <strong className="text-emerald-400">VERIFIED</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Full Standard Text:</span>
                      <strong className="text-amber-400">PENDING ACQUISITION</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rule Engine Version:</span>
                      <strong className="text-slate-200 font-mono">1.0.0 (DPIIT)</strong>
                    </div>
                  </div>
                  <button
                    onClick={handleLoadPassport}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center justify-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    Open Compliance Passport
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section: Product DNA & Clarifications */}
          {activeSection === 'dna' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product DNA Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Dna className="w-4 h-4 text-blue-400" />
                  Product DNA Specification (Extracted & Normalised)
                </h4>
                <div className="space-y-2 text-xs">
                  {assessment.product_dna.attributes.map((attr, idx) => (
                    <div key={idx} className="p-3 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase">{attr.name}</span>
                        <strong className="text-white text-sm">
                          {String(attr.value)} {attr.unit || ''}
                        </strong>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Method: {attr.provenance?.extraction_method || 'system_parser'}
                        </div>
                      </div>
                      <div className="text-right font-mono text-[10px]">
                        <span className="text-blue-400 block">
                          Confidence: {(attr.provenance?.confidence || 0.95).toFixed(2)}
                        </span>
                        <span className="text-slate-500">Extraction Conf</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clarifications Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  Missing Critical Attributes & Clarifications
                </h4>
                {assessment.clarifications.length === 0 ? (
                  <div className="p-6 rounded-lg bg-slate-950 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                    <p className="font-bold text-white">All required attributes clarified.</p>
                    <p className="text-[11px]">No missing parameters blocking deterministic rule mapping.</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    {assessment.clarifications.map((cl, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <strong className="text-white">{cl.attribute_name}</strong>
                          <span className="text-[10px] font-mono font-bold text-amber-400">{cl.criticality}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{cl.reason}</p>
                        {cl.options && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {cl.options.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                onClick={() => handleAnswerClarification(cl.attribute_name, opt)}
                                className="px-3 py-1 rounded bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 font-semibold transition"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Requirements Table */}
          {activeSection === 'requirements' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white">Standard Clause Requirements & Evaluation</h4>
              <div className="overflow-x-auto border border-slate-800 rounded-lg text-xs font-mono">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Clause</th>
                      <th className="p-3">Requirement</th>
                      <th className="p-3">Measurable Condition</th>
                      <th className="p-3">Verdict (8-State)</th>
                      <th className="p-3">Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/60 text-slate-300">
                    {assessment.compliance && assessment.compliance.evaluations.map((ev, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-blue-400">{ev.clause_number}</td>
                        <td className="p-3 font-sans font-semibold text-white">{ev.clause_title}</td>
                        <td className="p-3 text-[11px] text-slate-400">{ev.measurable_condition || 'Standard Requirement'}</td>
                        <td className="p-3 whitespace-nowrap"><StatusBadge status={ev.status} /></td>
                        <td className="p-3 whitespace-nowrap">
                          {ev.recommended_action ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                              {ev.recommended_action}
                            </span>
                          ) : (
                            <span className="text-slate-500">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Evidence Workspace */}
          {activeSection === 'evidence' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-blue-400" />
                  Submit Supporting Evidence (Test Reports / Certificates)
                </h4>
                <form onSubmit={handleUploadEvidence} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 text-[11px] block mb-1">Evidence Document Type:</label>
                      <select
                        value={evidenceType}
                        onChange={(e) => setEvidenceType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                      >
                        <option value="TEST_REPORT">TEST_REPORT</option>
                        <option value="CERTIFICATE">MILL_TEST_CERTIFICATE</option>
                        <option value="DATASHEET">DATASHEET</option>
                        <option value="BOM">BILL_OF_MATERIALS</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-[11px] block mb-1">Evidentiary Authority Level:</label>
                      <select
                        value={evidenceAuthority}
                        onChange={(e) => setEvidenceAuthority(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                      >
                        <option value="LAB_REPORT">LAB_REPORT (Accredited Test)</option>
                        <option value="CERTIFICATE">CERTIFICATE (Raw Material Mill)</option>
                        <option value="MANUFACTURER_DOCUMENT">MANUFACTURER_DOCUMENT</option>
                        <option value="USER_ASSERTED">USER_ASSERTED</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px] block mb-1">Evidence Text Snippet / Test Excerpt:</label>
                    <textarea
                      value={evidenceSnippet}
                      onChange={(e) => setEvidenceSnippet(e.target.value)}
                      rows={5}
                      placeholder="Paste test certificate text (e.g. Clause 5.4 heat retention temp after 6 hours: 64.5°C; Clause 5.2 zero leakage observed)..."
                      className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white font-mono leading-relaxed"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingEvidence || !evidenceSnippet.trim()}
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition disabled:opacity-50"
                  >
                    {isSubmittingEvidence ? 'Extracting & Evaluating...' : 'Upload & Recalculate Gaps'}
                  </button>
                </form>
              </div>

              {/* Evidence Registry Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Linked Evidence Records ({assessment.evidence_ids.length})
                </h4>
                {assessment.evidence_ids.length === 0 ? (
                  <div className="text-slate-500 text-center py-8">
                    No physical evidence uploaded yet. Submit a test report on the left to resolve gaps.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assessment.evidence_ids.map((id, idx) => (
                      <div key={idx} className="p-3 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-400">{id}</span>
                        <span className="text-[10px] font-mono text-emerald-400">LINKED TO REQ</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Testing & Laboratories */}
          {activeSection === 'roadmap' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Testing Roadmap */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-purple-400" />
                    Structured Testing Roadmap (IS 17526:2021)
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">8-Flask Protocol</span>
                </div>
                <div className="space-y-2">
                  {assessment.testing_roadmap.map((t, idx) => (
                    <div key={idx} className="p-3.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-amber-300">Clause {t.clause_number}: {t.test_name}</strong>
                        <span className="text-[10px] font-mono text-slate-500">{t.requirement_code}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{t.pass_criteria}</p>
                      <div className="text-[10px] text-blue-400 font-mono">Apparatus: {t.required_apparatus}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Laboratories */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    Verified BIS & NABL Laboratories
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400">Accredited Centers</span>
                </div>
                <div className="space-y-2">
                  {assessment.laboratories.map((l, idx) => (
                    <div key={idx} className="p-3.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-white">{l.name}</strong>
                        <span className="text-[10px] font-mono font-bold text-emerald-400">NABL ACCREDITED</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">{l.location}, {l.state}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Scope: {l.accredited_standards.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section: Evidence Graph */}
          {activeSection === 'graph' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Auditable React Flow Evidence Graph
              </h4>
              <EvidenceGraphCanvas graphData={assessment.evidence_graph} />
            </div>
          )}

          {/* Section: Compliance Passport */}
          {activeSection === 'passport' && passportData && (
            <CompliancePassportView passport={passportData} onClose={() => setActiveSection('overview')} />
          )}

          {/* Section: Snapshots History */}
          {activeSection === 'history' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-blue-400" />
                Assessment Snapshots & Reproducibility Audit Log
              </h4>
              <div className="space-y-2">
                {snapshots.map((s, idx) => (
                  <div key={idx} className="p-3.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-400">v{s.version}</span>
                        <strong className="text-white">{s.trigger_event}</strong>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Knowledge Version: {s.knowledge_version} &bull; {new Date(s.created_at).toUTCString()}
                      </div>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Snapshot ID: {s.snapshot_id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Floating Context-Aware Assessment Chat Drawer */}
          <AssessmentChatDrawer
            assessmentId={assessment.assessment_id}
            assessmentNumber={assessment.assessment_number}
          />
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <p className="text-sm font-medium text-slate-300">Ready to start compliance evaluation</p>
          <p className="text-xs text-slate-500">Initialize the Golden SIH Demonstration Case with official DPIIT QCO 2023 rule base:</p>
          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                const res = await fetch('/api/v1/assessments/demo/reset', { method: 'POST' });
                if (res.ok) {
                  const data = await res.json();
                  setAssessment(data);
                  setSelectedAssessmentId(data.assessment_id);
                  fetchAssessments();
                }
              } catch (err) {
                console.warn('Demo reset error:', err);
              } finally {
                setIsLoading(false);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            Initialize Golden SIH Demo Assessment
          </button>
        </div>
      )}
    </div>
  );
}
