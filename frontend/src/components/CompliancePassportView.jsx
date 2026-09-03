import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Printer,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Layers,
  FlaskConical,
  Building2,
  Calendar,
  Sparkles,
  Award,
  CheckCircle2,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function CompliancePassportView({ passport, onClose }) {
  if (!passport) return null;

  const handlePrint = () => {
    window.print();
  };

  const isAuth = passport.mode === 'AUTHORITATIVE_MODE';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-8 text-slate-100 print:bg-white print:text-black print:border-none print:p-0">
      {/* Print / Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 print:hidden">
        <div>
          <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
            Auditable Regulatory Artifact
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
            <Award className="w-6 h-6 text-blue-400" />
            Compliance Assessment Passport
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pre-certification technical gap roadmap & evidence audit passport.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg"
          >
            <Printer className="w-4 h-4" />
            Print / Export PDF
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Close Passport
            </button>
          )}
        </div>
      </div>

      {/* Formal Passport Header */}
      <div className="p-6 rounded-lg bg-slate-950 border border-slate-800 space-y-4 print:border print:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Bureau of Indian Standards &bull; Pre-Certification Assessment
            </div>
            <h1 className="text-lg font-bold text-white mt-0.5 print:text-black">
              {passport.product_name}
            </h1>
          </div>
          <div className="text-right font-mono text-xs space-y-0.5">
            <div>Passport ID: <strong className="text-blue-400">{passport.passport_id}</strong></div>
            <div className="text-slate-400">Assessment: {passport.assessment_number}</div>
            <div className="text-slate-500 text-[11px]">{new Date(passport.generated_at).toUTCString()}</div>
          </div>
        </div>

        {/* Claim Statement */}
        <div className="p-3 rounded bg-blue-950/40 border border-blue-900/60 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <strong className="text-blue-300">{passport.claim_statement}</strong>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              This digital passport provides an evidence-backed evaluation roadmap against applicable Indian Standards. It is an engineering audit artifact, not a statutory BIS license or ISI certification.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Basis & Knowledge Governance Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Knowledge Trust Basis & Governance (M1.6 Policy)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Official Metadata</span>
            <div className="font-mono font-bold text-emerald-400">
              {passport.trust_basis.verified_official_metadata ? 'VERIFIED (BIS Catalog)' : 'UNVERIFIED'}
            </div>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Gazette QCO Regulation</span>
            <div className="font-mono font-bold text-emerald-400">
              {passport.trust_basis.verified_regulatory_sources ? 'VERIFIED (DPIIT 2023)' : 'UNVERIFIED'}
            </div>
          </div>
          <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Full Standard Document</span>
            <div className="font-mono font-bold text-amber-400">
              {passport.trust_basis.full_standard_text_status}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 italic">
          {passport.trust_basis.trust_level_summary}
        </p>
      </div>

      {/* Product DNA Summary */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Product DNA Specification
        </h3>
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-slate-500 text-[10px] block">Category:</span>
              <strong className="text-white">{passport.category}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Materials:</span>
              <strong className="text-white">{passport.product_dna.materials.join(', ') || 'Declared SS 304'}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Thermal Insulation:</span>
              <strong className="text-white">{passport.product_dna.insulated ? 'Vacuum Double Wall' : 'Single Wall'}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Intended Use:</span>
              <strong className="text-white">{passport.product_dna.intended_use || 'Domestic Drinking'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Applicable Standards & Regulatory Status */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Applicable Indian Standards & Regulatory Mandate
        </h3>
        <div className="space-y-2">
          {passport.applicable_standards.map((app, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono font-bold text-blue-400">{app.standard_number}</span>
                <h4 className="font-bold text-white mt-0.5">{app.standard_title}</h4>
                <p className="text-slate-400 text-[11px] mt-1">{app.explanation}</p>
              </div>
              <div className="flex sm:flex-col items-end gap-1.5 shrink-0">
                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono text-[11px]">
                  {app.technical_relevance}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[11px] font-bold">
                  {app.regulatory_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Requirements Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Standard Clause Requirements, Evidence Citations & Evaluation Verdicts
        </h3>
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Clause</th>
                <th className="p-3">Requirement</th>
                <th className="p-3">Verdict</th>
                <th className="p-3">Evidence Citation & Source</th>
                <th className="p-3">Evaluation Basis</th>
                <th className="p-3">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/60 text-slate-200">
              {passport.compliance_evaluations.map((ev, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-blue-400 whitespace-nowrap">
                    {ev.clause_number}
                  </td>
                  <td className="p-3 font-sans">
                    <div className="font-bold text-white">{ev.clause_title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{ev.explanation}</div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <StatusBadge status={ev.status} />
                  </td>
                  <td className="p-3 whitespace-nowrap text-[11px]">
                    {ev.status === 'SATISFIED' && ev.audit_chain ? (
                      <div>
                        <strong className="text-emerald-400 block font-mono">[{ev.audit_chain.evidence_id}]</strong>
                        <span className="text-slate-400">{ev.audit_chain.source_authority} (p. {ev.audit_chain.page_number})</span>
                      </div>
                    ) : ev.evidence_ids && ev.evidence_ids.length > 0 ? (
                      <span className="text-emerald-400 font-mono">{ev.evidence_ids.join(', ')}</span>
                    ) : (
                      <span className="text-slate-500 italic">No evidence linked</span>
                    )}
                  </td>
                  <td className="p-3 text-[11px] font-sans text-slate-300">
                    {ev.evaluation_basis || ev.measurable_condition || 'Standard Conformity Rule'}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {ev.recommended_action ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        {ev.recommended_action}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Testing Roadmap & Laboratory Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Roadmap */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-purple-400" />
            Testing Schedule & Apparatus Roadmap
          </h3>
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <p className="text-[11px] text-slate-400 italic">
              Mandatory test schedule derived from IS 17526:2021 and BIS Product Manual PM/IS 17526/1. Platform provides specifications; physical testing must be conducted at accredited facilities.
            </p>
            <div className="space-y-2">
              {passport.testing_roadmap.map((t, idx) => (
                <div key={idx} className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="font-bold text-amber-300">Clause {t.clause_number}: {t.test_name}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{t.pass_criteria}</div>
                  <div className="text-[10px] text-blue-400 font-mono mt-1">Apparatus: {t.required_apparatus}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Labs */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            Recognized BIS & NABL Laboratories
          </h3>
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <p className="text-[11px] text-slate-400 italic">
              Verified laboratories possessing accredited test capability for Domestic Vacuum Flasks.
            </p>
            <div className="space-y-2">
              {passport.recognized_laboratories.map((l, idx) => (
                <div key={idx} className="p-2.5 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-white">{l.name}</div>
                    <div className="text-[11px] text-slate-400">{l.location}, {l.state}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                    NABL ACCREDITED
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Structured Source Index */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Structured Provenance Source Index
        </h3>
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
          {passport.source_index.map((s, idx) => (
            <div key={idx} className="p-2 rounded bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-blue-400">{s.source_index_id}:</span>{' '}
                <span className="text-white font-sans font-semibold">{s.title}</span>
                <div className="text-[11px] text-slate-400">
                  Ref: {s.standard_or_gazette_number} &bull; Section: {s.clause_or_section} (Page {s.page || 1})
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                  {s.authority}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                  {s.verification_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations & Disclaimers */}
      <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2 text-[11px] text-slate-400">
        <strong className="text-slate-300 uppercase tracking-wider block">
          Platform Limitations & Legal Boundaries:
        </strong>
        <ul className="list-disc list-inside space-y-1">
          {passport.limitations.map((lim, idx) => (
            <li key={idx}>{lim}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
