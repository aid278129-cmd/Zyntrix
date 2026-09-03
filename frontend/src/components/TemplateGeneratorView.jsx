import React, { useState, useMemo } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const STANDARDS_DATA = {
  'IS 302-2-201:2008': {
    name: 'Electric Immersion Water Heaters',
    category: 'Kitchen & Domestic Appliances',
    description: 'Mandatory Safety Requirements for Household Electrical Immersion Water Heaters (IS 302-2-201:2008 + IS 302-1:2008). Covered under mandatory QCO.',
    qcoMandate: 'Mandatory Quality Control Order (QCO)',
    fields: [
      { id: 'product_trade_name', name: 'Product Trade Name / Model', level: 'REQUIRED', category: 'Identification', unit: '', sample: 'Electric Immersion Water Heater (EWH-1500)', clause: 'IS 302-1 Cl 7.1' },
      { id: 'rated_voltage', name: 'Rated Voltage', level: 'REQUIRED', category: 'Electrical', unit: 'V AC', sample: '230', clause: 'IS 302-2-201 Cl 6.1' },
      { id: 'rated_power_input', name: 'Rated Power Input / Wattage', level: 'REQUIRED', category: 'Electrical', unit: 'W', sample: '1500', clause: 'IS 302-2-201 Cl 10.1' },
      { id: 'rated_frequency', name: 'Rated Frequency', level: 'REQUIRED', category: 'Electrical', unit: 'Hz', sample: '50', clause: 'IS 302-1 Cl 6.1' },
      { id: 'heating_element_material', name: 'Heating Element Sheath Material', level: 'REQUIRED', category: 'Physical', unit: '', sample: 'Stainless Steel 304', clause: 'IS 302-2-201 Cl 22.101' },
      { id: 'handle_material', name: 'Handle & Enclosure Material', level: 'REQUIRED', category: 'Physical', unit: '', sample: 'Polypropylene (Flame Retardant UL94 V-0)', clause: 'IS 302-1 Cl 30.1' },
      { id: 'cord_conformance', name: 'Flexible Power Cord & Plug Conformance', level: 'REQUIRED', category: 'Electrical', unit: '', sample: '3-core PVC cord (IS 694) & 3-pin plug (IS 1293)', clause: 'IS 302-1 Cl 25.1' },
      { id: 'earthing_resistance', name: 'Earthing Resistance', level: 'REQUIRED', category: 'Safety Test', unit: 'Ω', sample: '0.08', clause: 'IS 302-1 Cl 27.5' },
      { id: 'leakage_current', name: 'Leakage Current at Operating Temp', level: 'REQUIRED', category: 'Safety Test', unit: 'mA', sample: '0.32', clause: 'IS 302-1 Cl 13.2' },
      { id: 'electric_strength', name: 'Electric Strength Test (Hipot)', level: 'REQUIRED', category: 'Safety Test', unit: '', sample: 'Passed (1500 V AC / 1 min with no breakdown)', clause: 'IS 302-1 Cl 13.3' },
      { id: 'lab_report_ref', name: 'NABL Laboratory Report Reference', level: 'OPTIONAL', category: 'Evidence', unit: '', sample: 'ABC/EWH/2026/0902/001', clause: 'STI Clause 3.2' },
    ],
  },
  'IS 17526:2021': {
    name: 'Domestic Stainless Steel Vacuum Flasks',
    category: 'Thermal Containers & Cookware',
    description: 'Statutory requirements for double-walled stainless steel vacuum insulated flasks and containers under mandatory BIS QCO.',
    qcoMandate: 'Mandatory Quality Control Order (QCO)',
    fields: [
      { id: 'product_name', name: 'Product Name / Commercial Model', level: 'REQUIRED', category: 'Identification', unit: '', sample: 'Thermoshield Stainless Vacuum Flask 1000', clause: 'IS 17526 Cl 7.1' },
      { id: 'nominal_capacity', name: 'Nominal Capacity', level: 'REQUIRED', category: 'Dimensional', unit: 'mL', sample: '1000', clause: 'IS 17526 Cl 5.1' },
      { id: 'inner_body_material', name: 'Inner Body Material Grade', level: 'REQUIRED', category: 'Chemical', unit: '', sample: 'Stainless Steel Grade 304 (AISI 304 / SUS 304)', clause: 'IS 17526 Cl 4.2.1' },
      { id: 'outer_body_material', name: 'Outer Body Material Grade', level: 'REQUIRED', category: 'Chemical', unit: '', sample: 'Stainless Steel Grade 201 / 304', clause: 'IS 17526 Cl 4.2.2' },
      { id: 'thermal_retention_6h', name: 'Thermal Retention (Water Temp after 6h)', level: 'REQUIRED', category: 'Performance', unit: '°C', sample: '78.5', clause: 'IS 17526 Cl 5.4' },
      { id: 'thermal_retention_24h', name: 'Thermal Retention (Water Temp after 24h)', level: 'REQUIRED', category: 'Performance', unit: '°C', sample: '46.2', clause: 'IS 17526 Cl 5.4' },
      { id: 'leakage_test', name: 'Hydrostatic Inversion Leakage Test', level: 'REQUIRED', category: 'Performance', unit: '', sample: 'No leakage observed under inverted hydrostatic test', clause: 'IS 17526 Cl 5.2' },
      { id: 'drop_impact_test', name: 'Drop Impact Resistance Test', level: 'REQUIRED', category: 'Mechanical', unit: '', sample: 'No cracking, vacuum loss, or rupture after 1.2m drop', clause: 'IS 17526 Cl 5.3' },
      { id: 'stopper_material', name: 'Stopper & Seal Polymer Grade', level: 'REQUIRED', category: 'Food Contact', unit: '', sample: 'Food-Grade Polypropylene & Silicone (IS 9845)', clause: 'IS 17526 Cl 4.3' },
      { id: 'lab_report_ref', name: 'NABL Accredited Test Certificate Ref', level: 'OPTIONAL', category: 'Evidence', unit: '', sample: 'NABL/FLASK/2026/044', clause: 'STI Clause 4' },
    ],
  },
  'IS 4151:2015': {
    name: 'Protective Helmets for Two-Wheeler Riders',
    category: 'Personal Protective Equipment',
    description: 'Statutory standard for protective motorcycle helmets with impact attenuation and retention test requirements under Central Motor Vehicles Rules (CMVR).',
    qcoMandate: 'Statutory Mandate (CMVR / QCO)',
    fields: [
      { id: 'helmet_model', name: 'Helmet Trade Name & Size Code', level: 'REQUIRED', category: 'Identification', unit: '', sample: 'AeroShield Pro (Size L - 580mm to 600mm)', clause: 'IS 4151 Cl 6.1' },
      { id: 'outer_shell_material', name: 'Outer Shell Material Grade', level: 'REQUIRED', category: 'Material', unit: '', sample: 'Injection Molded Virgin ABS / Polycarbonate', clause: 'IS 4151 Cl 4.1' },
      { id: 'protective_padding', name: 'Protective Impact Padding Material', level: 'REQUIRED', category: 'Material', unit: '', sample: 'High-Density Expanded Polystyrene (EPS 45 g/L)', clause: 'IS 4151 Cl 4.2' },
      { id: 'impact_attenuation_peak', name: 'Peak Impact Acceleration (Ambient / Cold)', level: 'REQUIRED', category: 'Impact Test', unit: 'g', sample: '185', clause: 'IS 4151 Cl 9.1' },
      { id: 'retention_dynamic_extension', name: 'Retention System Dynamic Extension', level: 'REQUIRED', category: 'Mechanical', unit: 'mm', sample: '18.4', clause: 'IS 4151 Cl 9.2' },
      { id: 'penetration_resistance', name: 'Conical Striker Penetration Test', level: 'REQUIRED', category: 'Safety Test', unit: '', sample: 'Striker did not touch headform during 3m drop', clause: 'IS 4151 Cl 9.3' },
      { id: 'peripheral_vision_clearance', name: 'Peripheral Vision Horizontal Angle', level: 'REQUIRED', category: 'Optical', unit: 'degrees', sample: '108', clause: 'IS 4151 Cl 7.2' },
      { id: 'chin_strap_width', name: 'Chin Strap Width', level: 'REQUIRED', category: 'Dimensional', unit: 'mm', sample: '22', clause: 'IS 4151 Cl 5.3' },
      { id: 'lab_report_ref', name: 'Accredited Crash Test Report Ref', level: 'OPTIONAL', category: 'Evidence', unit: '', sample: 'ARAI/HELMET/2026/99', clause: 'STI Cl 5' },
    ],
  },
  'IS 9873 (Part 1):2019': {
    name: 'Safety of Toys: Mechanical & Physical Properties',
    category: "Toys & Children's Products",
    description: 'Mandatory statutory toy safety standard establishing mechanical, choke hazard, drop test, and migration limits under the Toys (Quality Control) Order.',
    qcoMandate: 'Mandatory Toys Quality Control Order',
    fields: [
      { id: 'toy_name', name: 'Toy Model / Commercial SKU', level: 'REQUIRED', category: 'Identification', unit: '', sample: 'Building Blocks Exploration Kit (SKU-TOY-22)', clause: 'IS 9873 (Part 1) Cl 7' },
      { id: 'intended_age_group', name: 'Intended Age Classification', level: 'REQUIRED', category: 'Scope', unit: '', sample: 'Children aged 36 months to 72 months', clause: 'IS 9873 (Part 1) Cl 1' },
      { id: 'small_parts_choke_test', name: 'Small Parts Ingestion Test (Truncated Cylinder)', level: 'REQUIRED', category: 'Mechanical', unit: '', sample: 'No detachable parts enter cylinder under 90N force', clause: 'IS 9873 (Part 1) Cl 4.4' },
      { id: 'sharp_edges_points', name: 'Accessible Sharp Edges & Points Test', level: 'REQUIRED', category: 'Physical', unit: '', sample: 'No sharp glass or metal edges detected under tester', clause: 'IS 9873 (Part 1) Cl 4.7' },
      { id: 'drop_impact_test', name: 'Drop Impact Durability Test (5x from 850mm)', level: 'REQUIRED', category: 'Mechanical', unit: '', sample: 'No fracture, sharp corners, or small parts produced', clause: 'IS 9873 (Part 1) Cl 5.24' },
      { id: 'heavy_metals_migration', name: 'Heavy Metals Migration (Lead / Cadmium / Antimony)', level: 'REQUIRED', category: 'Chemical', unit: 'mg/kg', sample: 'Lead < 5 mg/kg, Cadmium < 0.5 mg/kg (Pass)', clause: 'IS 9873 (Part 3) Cl 4' },
      { id: 'warnings_labeling', name: 'Statutory Safety Warnings & Age Symbol', level: 'REQUIRED', category: 'Marking', unit: '', sample: 'Conforms to 0-3 warning symbol and ISI license label', clause: 'IS 9873 (Part 1) Cl 7.2' },
      { id: 'lab_report_ref', name: 'NABL Toy Safety Test Certificate Ref', level: 'OPTIONAL', category: 'Evidence', unit: '', sample: 'NABL/TOY/2026/012', clause: 'STI Clause 2' },
    ],
  },
};

export function TemplateGeneratorView({ onNavigate }) {
  const [selectedStandard, setSelectedStandard] = useState('IS 302-2-201:2008');
  const [activeTab, setActiveTab] = useState('preview'); // preview | raw_csv | raw_json
  const [downloadNotice, setDownloadNotice] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentStandardData = STANDARDS_DATA[selectedStandard] || STANDARDS_DATA['IS 302-2-201:2008'];

  // Filtered fields based on search
  const filteredFields = useMemo(() => {
    if (!searchQuery.trim()) return currentStandardData.fields;
    const q = searchQuery.toLowerCase();
    return currentStandardData.fields.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.clause.toLowerCase().includes(q) ||
        f.sample.toLowerCase().includes(q)
    );
  }, [currentStandardData, searchQuery]);

  // Generate CSV String Client-side
  const generatedCsv = useMemo(() => {
    const headers = ['Field ID', 'Requirement Name', 'Level', 'Category', 'Unit', 'Clause Reference', 'Sample Value / Specification'];
    const rows = currentStandardData.fields.map((f) => [
      `"${f.id}"`,
      `"${f.name}"`,
      `"${f.level}"`,
      `"${f.category}"`,
      `"${f.unit}"`,
      `"${f.clause}"`,
      `"${f.sample}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }, [currentStandardData]);

  // Generate BOM CSV Client-side
  const generatedBomCsv = useMemo(() => {
    return [
      'Item No,Component Name,Sub-Assembly,Material Grade / Specification,Supplier / Manufacturer,Standard Reference,Quantity,Compliance Certificate Ref',
      `1,Main Enclosure / Body,Structural Shell,"${currentStandardData.fields.find(f => f.category === 'Physical' || f.category === 'Material')?.sample || 'High-grade polymer/alloy'}",Precision Molds Ltd,IS 694 / IS 302,1,CERT-2026-001`,
      '2,Internal Functional Element,Core Engine,"Verified Compliance Specification Grade",Standard Components Ltd,BIS Certified,1,CERT-2026-002',
      '3,Insulation & Barrier Layer,Safety Barrier,"Heat-Resistant / Dielectric Grade",Thermal Guard Ltd,UL94 / IS 1293,1,CERT-2026-003',
      '4,Fasteners & Terminals,Assembly Hardware,"Stainless Steel 304 (Corrosion Proof)",Hardware India Pvt Ltd,IS 1367,4,CERT-2026-004',
      '5,ISI Marking Label & Nameplate,Marking & Packaging,"Tamper-evident metalized film",Prime Labeling,IS 302 / IS 17526,1,VERIFIED-ISI-01',
    ].join('\n');
  }, [currentStandardData]);

  // Generate JSON Template
  const generatedJson = useMemo(() => {
    const attributes = {};
    currentStandardData.fields.forEach((f) => {
      attributes[f.id] = {
        name: f.name,
        level: f.level,
        unit: f.unit,
        value: f.sample,
        standard_clause: f.clause,
        category: f.category,
      };
    });

    return JSON.stringify(
      {
        zyntrix_schema_version: '1.0.0',
        target_standard: selectedStandard,
        standard_title: currentStandardData.name,
        regulatory_category: currentStandardData.category,
        qco_status: currentStandardData.qcoMandate,
        generated_at: new Date().toISOString(),
        product_specifications: attributes,
      },
      null,
      2
    );
  }, [currentStandardData, selectedStandard]);

  // Download Trigger Helper
  const triggerFileDownload = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (type) => {
    setIsDownloading(true);
    setDownloadNotice(null);

    const filenameMap = {
      spec_csv: `zyntrix_${selectedStandard.replace(/[^a-zA-Z0-9]/g, '_')}_spec_template.csv`,
      bom_csv: `zyntrix_${selectedStandard.replace(/[^a-zA-Z0-9]/g, '_')}_bom_template.csv`,
      spec_json: `zyntrix_${selectedStandard.replace(/[^a-zA-Z0-9]/g, '_')}_schema_template.json`,
    };

    try {
      // Try backend endpoint first
      const endpoint = `${API_BASE}/api/v1/ingest/template?template_type=${type}&target_standard=${encodeURIComponent(selectedStandard)}`;
      const res = await fetch(endpoint);

      if (res.ok) {
        if (type === 'spec_json') {
          const jsonData = await res.json();
          triggerFileDownload(JSON.stringify(jsonData, null, 2), filenameMap[type], 'application/json');
        } else {
          const text = await res.text();
          triggerFileDownload(text, filenameMap[type], 'text/csv;charset=utf-8;');
        }
      } else {
        // Fallback to client generation
        if (type === 'spec_csv') {
          triggerFileDownload(generatedCsv, filenameMap[type], 'text/csv;charset=utf-8;');
        } else if (type === 'bom_csv') {
          triggerFileDownload(generatedBomCsv, filenameMap[type], 'text/csv;charset=utf-8;');
        } else {
          triggerFileDownload(generatedJson, filenameMap[type], 'application/json');
        }
      }

      setDownloadNotice({
        type: 'success',
        message: `Successfully downloaded ${filenameMap[type]}. You can now fill in your product parameters and upload it in Product Input.`,
      });
    } catch (err) {
      // Offline fallback
      if (type === 'spec_csv') {
        triggerFileDownload(generatedCsv, filenameMap[type], 'text/csv;charset=utf-8;');
      } else if (type === 'bom_csv') {
        triggerFileDownload(generatedBomCsv, filenameMap[type], 'text/csv;charset=utf-8;');
      } else {
        triggerFileDownload(generatedJson, filenameMap[type], 'application/json');
      }
      setDownloadNotice({
        type: 'success',
        message: `Downloaded ${filenameMap[type]} (Instant client compilation). Ready for completion!`,
      });
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadNotice(null), 8000);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setDownloadNotice({
      type: 'info',
      message: `Copied ${label} to clipboard!`,
    });
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 bg-[#F3F4F6] overflow-y-auto font-sans">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded font-mono">
                Compliance Preparation Engine
              </span>
              <span className="text-xs text-slate-500">Official Fillable Schedules & Schemas</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 text-[26px]">description</span>
              Generate Document & Specification Templates
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5 max-w-3xl">
              Don't have a structured NABL laboratory test report yet? Generate fillable technical specification spreadsheets, Bill of Materials (BOM) workbooks, or JSON schemas aligned with statutory BIS Indian Standards.
            </p>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('analyze')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer self-start md:self-auto active:scale-[0.99]"
          >
            <span>Proceed to Product Input</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Notice Banner */}
        {downloadNotice && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 border shadow-2xs transition-all animate-in fade-in duration-200 ${
              downloadNotice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] shrink-0 text-emerald-600">
              {downloadNotice.type === 'success' ? 'check_circle' : 'info'}
            </span>
            <span className="font-medium">{downloadNotice.message}</span>
          </div>
        )}

        {/* Standard Selector Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Target Indian Standard (IS Code)
              </label>
              <p className="text-[11px] text-slate-500">
                Template columns and required limits adapt dynamically to the selected Indian Standard.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold self-start sm:self-auto">
              {currentStandardData.qcoMandate}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(STANDARDS_DATA).map(([stdCode, data]) => {
              const isSelected = selectedStandard === stdCode;
              return (
                <button
                  key={stdCode}
                  type="button"
                  onClick={() => setSelectedStandard(stdCode)}
                  className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-700">{stdCode}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-indigo-600 text-[16px]">check_circle</span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1 leading-snug">{data.name}</div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{data.category}</span>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-[16px] shrink-0 mt-0.5">info</span>
            <div>
              <strong className="text-slate-800">{currentStandardData.name}:</strong> {currentStandardData.description}
            </div>
          </div>
        </div>

        {/* 3 Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Technical Specs CSV */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  Most Popular
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">.CSV</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">table_chart</span>
                Technical Specifications Template
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Clean spreadsheet populated with required ratings, physical parameters, test tolerances, and specific {selectedStandard} clause links.
              </p>
              <div className="text-[11px] text-slate-400 font-mono pt-1">
                {currentStandardData.fields.length} predefined parameters &bull; Excel / Sheets compatible
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDownload('spec_csv')}
                disabled={isDownloading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download Specification .CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('raw_csv')}
                className="w-full text-center text-xs font-semibold text-slate-600 hover:text-indigo-600 py-1 transition cursor-pointer"
              >
                Inspect Raw CSV
              </button>
            </div>
          </div>

          {/* Card 2: Bill of Materials (BOM) CSV */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  Sub-Assemblies
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">.CSV</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">receipt_long</span>
                Bill of Materials (BOM) Template
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Spreadsheet tracking raw material alloy grades, polymer flammability ratings, safety insulation, and sub-component vendor certificates.
              </p>
              <div className="text-[11px] text-slate-400 font-mono pt-1">
                Multi-column BOM &bull; Vendor audit tracking
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDownload('bom_csv')}
                disabled={isDownloading}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download BOM .CSV</span>
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(generatedBomCsv, 'BOM CSV')}
                className="w-full text-center text-xs font-semibold text-slate-600 hover:text-indigo-600 py-1 transition cursor-pointer"
              >
                Copy BOM to Clipboard
              </button>
            </div>
          </div>

          {/* Card 3: JSON Schema */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  API & CAD Pipelines
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">.JSON</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">code</span>
                Enterprise JSON Schema
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Structured machine-readable specification schema formatted for automated ERP, PLM, or programmatic testing ingestion pipelines.
              </p>
              <div className="text-[11px] text-slate-400 font-mono pt-1">
                Schema validated &bull; Strict unit typings
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDownload('spec_json')}
                disabled={isDownloading}
                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download .JSON Schema</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('raw_json')}
                className="w-full text-center text-xs font-semibold text-slate-600 hover:text-indigo-600 py-1 transition cursor-pointer"
              >
                Inspect Raw JSON
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Live Preview Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'preview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Table Preview ({filteredFields.length})
                </button>
                <button
                  onClick={() => setActiveTab('raw_csv')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'raw_csv' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Raw CSV
                </button>
                <button
                  onClick={() => setActiveTab('raw_json')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'raw_json' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  JSON Schema
                </button>
              </div>
            </div>

            {activeTab === 'preview' && (
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[18px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter parameters..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'preview' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider bg-slate-50/50">
                    <th className="py-2.5 px-3">Field Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Requirement</th>
                    <th className="py-2.5 px-3">Sample Value</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3">Standard Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFields.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{f.name}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">{f.category}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            f.level === 'REQUIRED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {f.level}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{f.sample}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{f.unit || '—'}</td>
                      <td className="py-2.5 px-3 text-indigo-700 font-mono text-[11px]">{f.clause}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'raw_csv' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono">zyntrix_specification_template.csv</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedCsv, 'Specification CSV')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  <span>Copy CSV</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed">
                {generatedCsv}
              </pre>
            </div>
          )}

          {activeTab === 'raw_json' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono">zyntrix_specification_schema.json</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedJson, 'JSON Schema')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  <span>Copy JSON</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed">
                {generatedJson}
              </pre>
            </div>
          )}
        </div>

        {/* Workflow Guidance Card */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-5 text-xs text-indigo-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1">
            <h4 className="font-bold text-indigo-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-indigo-600 text-[18px]">lightbulb</span>
              How to use these templates for fast compliance verification
            </h4>
            <p className="text-indigo-800 text-[11px] leading-relaxed max-w-2xl">
              1. Download the template for your product's standard &bull; 2. Fill in your genuine manufacturer specifications & ratings &bull; 3. Head to <strong>Product Input</strong> and select <strong>BOM Tables</strong> or <strong>PDF Report</strong> to evaluate clause-level BIS applicability instantly.
            </p>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('analyze')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shrink-0 cursor-pointer shadow-xs"
          >
            Start Assessment Now
          </button>
        </div>
      </div>
    </div>
  );
}
