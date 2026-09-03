import React from 'react';
import { Award, ShieldCheck, Printer, CheckCircle2, Clock, AlertTriangle, Sparkles, Building2, FlaskConical } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function CompliancePassportView({ passport, onClose }) {
  if (!passport) return null;

  const handlePrint = () => {
    window.print();
  };

  const isAuth = passport.mode === 'AUTHORITATIVE_MODE';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-8 text-slate-900 shadow-sm print:bg-white print:text-black print:border-none print:p-0">
      {/* Print / Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 print:hidden">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">
            Auditable Regulatory Artifact
          </span>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
            <Award className="w-6 h-6 text-indigo-600" />
            Compliance Assessment Passport
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pre-certification technical gap roadmap & evidence audit passport.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Export PDF
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
            >
              Close Passport
            </button>
          )}
        </div>
      </div>

      {/* Formal Passport Header */}
      <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 space-y-4 print:border print:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              Bureau of Indian Standards &bull; Pre-Certification Assessment
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5 print:text-black">
              {passport.product_name}
            </h1>
          </div>
          <div className="text-right font-mono text-xs space-y-0.5">
            <div>Passport ID: <strong className="text-indigo-600">{passport.passport_id}</strong></div>
            <div className="text-slate-500">Assessment: {passport.assessment_number}</div>
            <div className="text-slate-400 text-[11px]">{new Date(passport.generated_at).toUTCString()}</div>
          </div>
        </div>

        {/* Claim Statement */}
        <div className="p-3 rounded bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs">
            <strong className="text-indigo-900">{passport.claim_statement}</strong>
            <p className="text-indigo-950/80 text-[11px] leading-relaxed">
              This digital passport provides an evidence-backed evaluation roadmap against applicable Indian Standards. It is an engineering audit artifact, not a statutory BIS license or ISI certification.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Basis & Knowledge Governance Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Knowledge Trust Basis & Governance (M1.6 Policy)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Official Metadata</span>
            <div className="font-mono font-bold text-emerald-600">
              {passport.trust_basis.verified_official_metadata ? 'VERIFIED (BIS Catalog)' : 'UNVERIFIED'}
            </div>
          </div>
          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Gazette QCO Regulation</span>
            <div className="font-mono font-bold text-emerald-600">
              {passport.trust_basis.verified_regulatory_sources ? 'VERIFIED (DPIIT 2023)' : 'UNVERIFIED'}
            </div>
          </div>
          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase">Full Standard Document</span>
            <div className="font-mono font-bold text-amber-600">
              {passport.trust_basis.full_standard_text_status}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 italic">
          {passport.trust_basis.trust_level_summary}
        </p>
      </div>

      {/* Product DNA Summary */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Product DNA Specification
        </h3>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-slate-500 text-[10px] block">Category:</span>
              <strong className="text-slate-900">{passport.category}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Materials:</span>
              <strong className="text-slate-900">{passport.product_dna.materials.join(', ') || 'Declared SS 304'}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Thermal Insulation:</span>
              <strong className="text-slate-900">{passport.product_dna.insulated ? 'Vacuum Double Wall' : 'Single Wall'}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Intended Use:</span>
              <strong className="text-slate-900">{passport.product_dna.intended_use || 'Domestic Drinking'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Applicable Standards & Regulatory Status */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Applicable Indian Standards & Regulatory Mandate
        </h3>
        <div className="space-y-2">
          {passport.applicable_standards.map((app, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono font-bold text-indigo-600">{app.standard_number}</span>
                <h4 className="font-bold text-slate-900 mt-0.5">{app.standard_title}</h4>
                <p className="text-slate-600 text-[11px] mt-1">{app.explanation}</p>
              </div>
              <div className="flex sm:flex-col items-end gap-1.5 shrink-0">
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-[11px]">
                  {app.technical_relevance}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[11px] font-bold">
                  {app.regulatory_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Requirements Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Standard Clause Requirements, Evidence Citations & Evaluation Verdicts
        </h3>
        <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-2xs">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="p-3 font-semibold">Standard & Clause</th>
                <th className="p-3 font-semibold">Requirement</th>
                <th className="p-3 font-semibold">Verdict</th>
                <th className="p-3 font-semibold">Evidence Status & Citation</th>
                <th className="p-3 font-semibold">Verification</th>
                <th className="p-3 font-semibold">Deterministic Reason</th>
                <th className="p-3 font-semibold">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-800">
              {passport.compliance_evaluations.map((ev, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold whitespace-nowrap">
                    <div className="text-indigo-600 font-mono">{ev.applicable_standard || 'IS 17526:2021'}</div>
                    <div className="text-slate-700 font-mono text-[11px]">Clause {ev.clause_number}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{ev.requirement_code}</div>
                  </td>
                  <td className="p-3 font-sans max-w-xs">
                    <div className="font-bold text-slate-900 text-xs">{ev.clause_title}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">{ev.description || ev.explanation}</div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <StatusBadge status={ev.status} />
                  </td>
                  <td className="p-3 whitespace-nowrap text-[11px]">
                    {ev.status === 'SATISFIED' && ev.audit_chain ? (
                      <div>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] block w-max">
                          {ev.evidence_status || 'VERIFIED_LINKED'}
                        </span>
                        <strong className="text-emerald-700 block font-mono mt-1">[{ev.audit_chain.evidence_id}]</strong>
                        <span className="text-slate-500 text-[10px]">{ev.audit_chain.source_authority} (p. {ev.audit_chain.page_number})</span>
                      </div>
                    ) : ev.evidence_ids && ev.evidence_ids.length > 0 ? (
                      <div>
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px] block w-max">
                          {ev.evidence_status || 'PENDING'}
                        </span>
                        <span className="text-amber-700 font-mono text-[10px] mt-1 block">{ev.evidence_ids.join(', ')}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 text-[10px] block w-max">
                          MISSING_EVIDENCE
                        </span>
                        <span className="text-slate-400 italic text-[10px] mt-0.5 block">No evidence linked</span>
                      </div>
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap text-[11px]">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      ev.verification_status === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : ev.verification_status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {ev.verification_status || (ev.status === 'SATISFIED' ? 'VERIFIED' : 'UNVERIFIED')}
                    </span>
                  </td>
                  <td className="p-3 text-[11px] font-sans text-slate-600 max-w-sm leading-snug">
                    {ev.deterministic_reason || ev.explanation}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {ev.recommended_action ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                        {ev.recommended_action}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-mono text-[11px]">VERIFIED_PASS</span>
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
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-purple-600" />
            Testing Schedule & Apparatus Roadmap
          </h3>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <p className="text-[11px] text-slate-500 italic">
              Mandatory test schedule derived from IS 17526:2021 and BIS Product Manual PM/IS 17526/1. Platform provides specifications; physical testing must be conducted at accredited facilities.
            </p>
            <div className="space-y-2">
              {passport.testing_roadmap.map((t, idx) => (
                <div key={idx} className="p-2.5 rounded bg-white border border-slate-200 shadow-2xs">
                  <div className="font-bold text-amber-800">Clause {t.clause_number}: {t.test_name}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{t.pass_criteria}</div>
                  <div className="text-[10px] text-indigo-600 font-mono mt-1">Apparatus: {t.required_apparatus}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Labs */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            Recognized BIS & NABL Laboratories
          </h3>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <p className="text-[11px] text-slate-500 italic">
              Verified laboratories possessing accredited test capability for Domestic Vacuum Flasks.
            </p>
            <div className="space-y-2">
              {passport.recognized_laboratories.map((l, idx) => (
                <div key={idx} className="p-2.5 rounded bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">{l.name}</div>
                    <div className="text-[11px] text-slate-500">{l.location}, {l.state}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
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
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Structured Provenance Source Index
        </h3>
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
          {passport.source_index.map((s, idx) => (
            <div key={idx} className="p-2 rounded bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-indigo-600">{s.source_index_id}:</span>{' '}
                <span className="text-slate-900 font-sans font-semibold">{s.title}</span>
                <div className="text-[11px] text-slate-500">
                  Ref: {s.standard_or_gazette_number} &bull; Section: {s.clause_or_section} (Page {s.page || 1})
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] border border-slate-200">
                  {s.authority}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  {s.verification_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations & Disclaimers */}
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-[11px] text-slate-600">
        <strong className="text-slate-800 uppercase tracking-wider block">
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
