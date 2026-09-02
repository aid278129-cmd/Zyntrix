import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HealthDiagnosticPanel } from './components/HealthDiagnosticPanel';
import { ModuleCard } from './components/ModuleCard';
import { CitationViewer } from './components/CitationViewer';
import { KnowledgeBaseExplorer } from './components/KnowledgeBaseExplorer';
import { ProductWorkspace } from './components/ProductWorkspace';
import { StatusBadge } from './components/StatusBadge';
import {
  ShieldAlert,
  Dna,
  BookOpen,
  GitFork,
  FileCheck2,
  Server,
  Layers,
  Cpu,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('knowledge');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (err) {
      console.warn('Backend connection error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const res = await fetch('/api/v1/system/info');
      if (res.ok) {
        const data = await res.json();
        setSystemInfo(data);
      }
    } catch (err) {
      console.warn('System info error:', err);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchSystemInfo();
  }, []);

  const tabs = [
    { id: 'knowledge', label: 'Verified BIS Knowledge Base (M1)', icon: BookOpen },
    { id: 'diagnostics', label: 'Architecture & Health', icon: Cpu },
    { id: 'dna', label: 'Product DNA Engine', icon: Dna },
    { id: 'citation', label: 'Citation Guard & Evidence', icon: ShieldAlert },
    { id: 'passport', label: 'Compliance Passport', icon: FileCheck2 },
  ];

  const modules = [
    {
      code: 'MOD-01',
      title: 'FastAPI Gateway & Async Core',
      status: 'READY',
      description:
        'Asynchronous Python 3.14/FastAPI gateway with Request-ID tracing, CORS configuration, and sensitive data sanitization.',
      implementedItems: ['Async request pipeline', 'Structured Request-ID logging', 'Security MIME validators', 'Custom exception handlers'],
      plannedItems: ['Rate limiting policies', 'Authentication JWT middleware'],
    },
    {
      code: 'MOD-02',
      title: 'Database & pgvector Ingestion',
      status: 'READY',
      description:
        'SQLAlchemy 2.0 async ORM with SHA-256 document hashing, hierarchical clause models, and vector similarity search.',
      implementedItems: ['SHA-256 document registry', '12 core domain entities', 'pgvector embeddings storage', 'Metadata filtering query'],
      plannedItems: ['Live synchronization with e-BIS / Manakonline (M2)'],
    },
    {
      code: 'MOD-03',
      title: 'BIS Document Ingestion Pipeline',
      status: 'READY',
      description:
        'Layout-aware PyMuPDF extractor, Tesseract OCR fallback, hierarchical clause segmenter, and typed requirement extractor.',
      implementedItems: ['PyMuPDF page-preserving parser', 'Dotted decimal hierarchy parser', 'Standard metadata extractor', 'Requirement typing (Material/Performance/Safety)'],
      plannedItems: ['Table structure extractor', 'BOM tabular parser (M2)'],
    },
    {
      code: 'MOD-04',
      title: 'Product DNA Schema Layer',
      status: 'READY',
      description:
        'Strictly typed Pydantic models for product technical attributes with full provenance tracking and missing field clarification handlers.',
      implementedItems: ['Core product schema', 'Extensible DNAAttribute model', 'Missing attribute clarification requests'],
      plannedItems: ['Auto-normalization engine (M2)'],
    },
    {
      code: 'MOD-05',
      title: 'Citation Guard Contract',
      status: 'READY',
      description:
        'Trust-enforcing contract ensuring compliance claims are backed by verifiable Indian Standard clause text.',
      implementedItems: ['Provenance citation models', 'ValidationStatus enum contract', 'Multi-state compliance enum'],
      plannedItems: ['LLM claim-to-evidence cross-checker (M2)'],
    },
    {
      code: 'MOD-06',
      title: 'Clause Retrieval & Search Engine',
      status: 'READY',
      description:
        'Vector similarity search combined with SQL metadata filtering for clause-level retrieval with page provenance citations.',
      implementedItems: ['Semantic clause search API', 'EmbeddingProvider abstraction', 'Ground-truth evaluation benchmark'],
      plannedItems: ['Hybrid BM25 + dense re-ranking (M2)', 'React Flow Evidence Graph (M2)'],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header health={health} isRefreshing={isRefreshing} onRefresh={fetchHealth} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Core Architecture Notice */}
        <div className="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-900/50 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <span>Core Architectural Principle</span>
            </div>
            <p className="text-sm font-semibold text-white">
              “LLM generates explanations; retrieved evidence establishes compliance claims.”
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified BIS Knowledge Base active for Demonstration Category: <span className="text-blue-300 font-semibold">Drinkware & Food Contact Containers (IS 17526:2021)</span>.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="px-3 py-1 rounded bg-emerald-950/80 text-emerald-300 text-xs font-mono font-semibold border border-emerald-800/60 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Milestone M1 Ready
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-t border-x ${
                  isActive
                    ? 'bg-slate-900 text-blue-400 border-slate-800 border-b-slate-900 -mb-px'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {activeTab === 'knowledge' && (
          <KnowledgeBaseExplorer />
        )}

        {activeTab === 'diagnostics' && (
          <div className="space-y-8">
            <HealthDiagnosticPanel health={health} onRefresh={fetchHealth} />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  System Architecture Modules
                </h2>
                <span className="text-xs text-slate-400 font-mono">6 Core Subsystems</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {modules.map((m) => (
                  <ModuleCard key={m.code} {...m} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dna' && (
          <ProductWorkspace />
        )}

        {activeTab === 'citation' && (
          <div className="space-y-6">
            <CitationViewer />
          </div>
        )}

        {activeTab === 'passport' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-blue-400" />
                    Compliance Passport Specification (Auditable & Tamper-Evident)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Digital compliance passport certifying readiness with full cryptographic provenance hash.
                  </p>
                </div>
                <StatusBadge status="PLANNED_FOR_M1" customLabel="PLANNED FOR M2" />
              </div>
              <div className="mt-4 p-5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Passport Verification Contract Ready</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Exportable compliance passport including Gap Analysis, Standard Test Methods, and Laboratory Recommendations.
                  </p>
                </div>
                <span className="font-mono text-xs px-3 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  Pydantic Model: CompliancePassportCard
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>BIS Compliance Compiler &bull; Team Zyntrix (SIH 2024 / Problem 26107)</span>
          <span>Verified Knowledge Base &bull; Milestone M1</span>
        </div>
      </footer>
    </div>
  );
}
