import React, { useState, useEffect } from "react";
import { 
  Clock, 
  Stethoscope, 
  Activity, 
  FileText, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  User, 
  Heart, 
  Brain, 
  Info,
  Apple,
  Pill,
  ShieldAlert,
  X,
  MapPin,
  FileSpreadsheet
} from "lucide-react";
import { TimelineRecord } from "../types";

interface Props {
  records: TimelineRecord[];
  onViewAnalysis?: (record: TimelineRecord) => void;
}

export const HealthHistoryTimeline = ({ records, onViewAnalysis }: Props) => {
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});
  const [expandedAnalysis, setExpandedAnalysis] = useState<Record<string, boolean>>({});
  const [selectedRecord, setSelectedRecord] = useState<TimelineRecord | null>(null);

  // Group records by year
  const groupedRecords = records.reduce((acc, record) => {
    const year = new Date(record.date).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(record);
    return acc;
  }, {} as Record<string, TimelineRecord[]>);

  const years = Object.keys(groupedRecords).sort((a, b) => parseInt(b) - parseInt(a));

  // Expand all years by default on mount or records load
  useEffect(() => {
    const defaultExpanded: Record<string, boolean> = {};
    years.forEach(year => {
      defaultExpanded[year] = true;
    });
    setExpandedYears(defaultExpanded);
  }, [records]);

  const toggleYear = (year: string) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const toggleAnalysis = (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedAnalysis(prev => ({ ...prev, [recordId]: !prev[recordId] }));
  };

  const getIcon = (categoryOrType: string | undefined) => {
    const term = (categoryOrType || "").toLowerCase();
    if (term.includes("consult") || term.includes("doctor")) {
      return <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    } else if (term.includes("report") || term.includes("lab") || term.includes("test")) {
      return <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
    } else if (term.includes("prescription") || term.includes("medicine")) {
      return <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    } else if (term.includes("surgery") || term.includes("operation")) {
      return <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
    }
    return <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
  };

  return (
    <div className="space-y-5">
      {years.map(year => (
        <div key={year} className="space-y-4">
          <button 
            onClick={() => toggleYear(year)}
            className="flex justify-between items-center w-full bg-slate-50/40 dark:bg-slate-900/20 py-2 px-3.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 transition-all hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
          >
            <h4 className="font-bold text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Calendar Year {year}
              <span className="ml-1.5 px-2 py-0.5 bg-slate-200/40 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-bold">
                {groupedRecords[year].length} Record{groupedRecords[year].length !== 1 ? "s" : ""}
              </span>
            </h4>
            {expandedYears[year] ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
          </button>
          
          {expandedYears[year] && (
            <div className="relative border-l border-slate-200/40 dark:border-slate-800/40 ml-3.5 pl-5 space-y-4">
              {groupedRecords[year].map((record) => {
                const isAbha = record.source === "ABHA";
                const isAiSummary = record.title.includes("ABHA AI Summary") || record.title.includes("AI Summary");
                const hasAnalysis = !!record.reportAnalysis;
                const analysisData = record.reportAnalysis;
                const isExpanded = !!expandedAnalysis[record.id];

                // Determine risk/urgency badge styles
                const risk = (record.riskLevel || "Low").toLowerCase();
                let riskBadgeClass = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/30 dark:border-emerald-900/30";
                if (risk === "high" || risk === "red" || risk === "critical") {
                  riskBadgeClass = "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100/30 dark:border-rose-900/30";
                } else if (risk === "moderate" || risk === "yellow" || risk === "warning") {
                  riskBadgeClass = "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100/30 dark:border-amber-900/30";
                }

                return (
                  <div key={record.id} className="relative group text-left">
                    {/* Tiny styled indicator bullet */}
                    <div className={`absolute -left-[23px] top-[14px] w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-950 shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-200 group-hover:scale-110 ${
                      isAiSummary ? "bg-purple-500 animate-pulse" : isAbha ? "bg-emerald-500" : "bg-sky-500"
                    }`}></div>
                    
                    {/* Premium Card: Reduced vertical padding and margins */}
                    <div 
                      onClick={() => setSelectedRecord(record)}
                      className={`p-4 md:p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm cursor-pointer ${
                        isAiSummary 
                          ? "bg-purple-50/20 dark:bg-purple-950/5 border-purple-200/40 dark:border-purple-900/30 hover:bg-purple-100/30 dark:hover:bg-purple-950/10" 
                          : isAbha 
                          ? "bg-white dark:bg-slate-950/50 border-emerald-100/50 dark:border-emerald-950/30 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 hover:border-emerald-200/60" 
                          : "bg-white dark:bg-slate-950/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 hover:border-slate-300/60 dark:hover:border-slate-700/60"
                      }`}
                    >
                      
                      {/* Top Row: Clean, Muted Metadata (13px, not competing with Title) */}
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                        <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-400 dark:text-slate-500">
                          <span className="p-1 bg-slate-100 dark:bg-slate-900 rounded-lg inline-flex items-center">
                            {getIcon(record.category || record.type)}
                          </span>
                          <span className="font-semibold text-slate-600 dark:text-slate-400">
                            {record.category || record.type || "Medical Event"}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {record.date}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {record.riskLevel && (
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wider ${riskBadgeClass}`}>
                              {record.riskLevel} Risk
                            </span>
                          )}
                          {isAbha && (
                            <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/40 px-2 py-0.5 rounded-md font-semibold text-[11px] tracking-wider flex items-center gap-1 shrink-0">
                              <ShieldCheck size={12} className="text-emerald-600" />
                              ABHA
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title: 22px bold & Summary: 15px with line clamp */}
                      <div className="space-y-1.5">
                        <h3 className="text-lg md:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                          {record.title}
                        </h3>
                        
                        <p className="text-slate-600 dark:text-slate-300 text-[15px] leading-relaxed line-clamp-3">
                          {record.details}
                        </p>
                        
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline block mt-1">
                          View details &amp; analysis &rarr;
                        </span>
                      </div>

                      {/* Information Grid: Organized rows for dense scannability */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2.5 border-y border-slate-100 dark:border-slate-800/80 my-3 text-[13px]">
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium uppercase tracking-wider">Classification</span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold">{record.category || record.type || "Consultation"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium uppercase tracking-wider">Clinician</span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold truncate block">{record.doctorName || "Not Assigned"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium uppercase tracking-wider">Facility</span>
                          <span className="text-slate-700 dark:text-slate-300 font-semibold truncate block">{record.hospital || "HealthTribe Care"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block text-[11px] font-medium uppercase tracking-wider">Current Status</span>
                          <span className={`font-semibold capitalize flex items-center gap-1 ${
                            risk === "high" || risk === "red" || risk === "critical" ? "text-rose-600 dark:text-rose-400" :
                            risk === "moderate" || risk === "yellow" || risk === "warning" ? "text-amber-600 dark:text-amber-400" :
                            "text-emerald-600 dark:text-emerald-400"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              risk === "high" || risk === "red" || risk === "critical" ? "bg-rose-500" :
                              risk === "moderate" || risk === "yellow" || risk === "warning" ? "bg-amber-500" :
                              "bg-emerald-500"
                            }`}></span>
                            {record.riskLevel || "Stable"}
                          </span>
                        </div>
                      </div>

                      {/* Small inline biomarker pill list */}
                      {record.highlights && record.highlights.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {record.highlights.slice(0, 3).map((h: string, i: number) => {
                            const isGood = h.includes("✓") || h.toLowerCase().includes("normal") || h.toLowerCase().includes("stable");
                            return (
                              <div 
                                key={i} 
                                className={`px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 border transition-all ${
                                  isGood 
                                    ? "bg-emerald-50/40 text-emerald-700 border-emerald-100/20 dark:bg-emerald-950/10 dark:text-emerald-400 dark:border-emerald-900/30" 
                                    : "bg-rose-50/40 text-rose-700 border-rose-100/20 dark:bg-rose-950/10 dark:text-rose-400 dark:border-rose-900/30"
                                }`}
                              >
                                {isGood ? (
                                  <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                                ) : (
                                  <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                )}
                                <span className="max-w-[150px] truncate">{h}</span>
                              </div>
                            );
                          })}
                          {record.highlights.length > 3 && (
                            <span className="text-[10px] font-semibold text-slate-400">
                              +{record.highlights.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action items inside card (for inline full diagnostic details toggle) */}
                      {hasAnalysis && (
                        <div className="mt-3 flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-900">
                          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            Clinical extraction complete
                          </span>
                          <button 
                            onClick={(e) => toggleAnalysis(record.id, e)} 
                            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            {isExpanded ? "Collapse Lab Analysis" : "Expand Lab Analysis"}
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </div>
                      )}

                      {/* Inline analysis collapse drawer */}
                      {hasAnalysis && isExpanded && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-4 text-left transition-all duration-250"
                        >
                          {analysisData.overview && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                              <div>
                                <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-semibold block">Report Type</span>
                                <span className="font-bold text-xs text-slate-700 dark:text-slate-300 mt-0.5 block truncate">{analysisData.overview.reportType}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-semibold block">Captured Date</span>
                                <span className="font-bold text-xs text-slate-700 dark:text-slate-300 mt-0.5 block">{analysisData.overview.date}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-semibold block">Status</span>
                                <span className={`font-bold text-xs mt-0.5 block ${analysisData.overview.overallStatus.toLowerCase().includes("attention") ? "text-rose-600" : "text-emerald-600"}`}>
                                  {analysisData.overview.overallStatus}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-semibold block">Accuracy</span>
                                <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  {analysisData.overview.confidence}
                                </span>
                              </div>
                            </div>
                          )}

                          {analysisData.clinicalInterpretation && (
                            <div className="p-3 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/20 dark:border-emerald-900/20 rounded-xl">
                              <h4 className="font-bold text-[11px] text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                <Brain className="w-3.5 h-3.5 text-emerald-600" />
                                Interpretation Summary
                              </h4>
                              <p className="text-slate-600 dark:text-slate-300 text-xs mt-1 leading-relaxed">
                                {analysisData.clinicalInterpretation}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Slide-over details and analysis drawer (Apple Health & Epic style) */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop with elegant blur */}
            <div 
              onClick={() => setSelectedRecord(null)}
              className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
            ></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              {/* Drawer Container */}
              <div className="pointer-events-auto w-screen max-w-lg transform bg-white dark:bg-slate-950 shadow-2xl transition-all duration-350 flex flex-col h-full border-l border-slate-200 dark:border-slate-800">
                {/* Header block with close control */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-900 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg inline-flex items-center">
                      {getIcon(selectedRecord.category || selectedRecord.type)}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        {selectedRecord.category || selectedRecord.type || "Medical File"}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                        {selectedRecord.date}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedRecord(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Content body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-left">
                  {/* Title and Badge layout */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRecord.riskLevel && (
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wider ${
                          selectedRecord.riskLevel.toLowerCase() === "high" 
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100/30 dark:border-rose-900/30"
                            : selectedRecord.riskLevel.toLowerCase() === "moderate"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100/30 dark:border-amber-900/30"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/30 dark:border-emerald-900/30"
                        }`}>
                          {selectedRecord.riskLevel} Risk
                        </span>
                      )}
                      {selectedRecord.source === "ABHA" && (
                        <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/40 px-2 py-0.5 rounded-md font-semibold text-[11px] tracking-wider flex items-center gap-1 shrink-0">
                          <ShieldCheck size={12} className="text-emerald-600" />
                          ABHA Verified Record
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                      {selectedRecord.title}
                    </h2>
                  </div>

                  {/* Medical Personnel Details */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Practitioner</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {selectedRecord.doctorName || "Not Assigned"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Clinical Facility</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {selectedRecord.hospital || "HealthTribe Care"}
                      </span>
                    </div>
                  </div>

                  {/* Clinical narrative summary */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Clinical Consultation Details
                    </h3>
                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl shadow-xs">
                      <p className="text-slate-700 dark:text-slate-300 text-[14px] leading-relaxed whitespace-pre-wrap">
                        {selectedRecord.details}
                      </p>
                    </div>
                  </div>

                  {/* Highlights section (Biomarkers status list) */}
                  {selectedRecord.highlights && selectedRecord.highlights.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Primary Biomarkers Tracked
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedRecord.highlights.map((h: string, i: number) => {
                          const isGood = h.includes("✓") || h.toLowerCase().includes("normal") || h.toLowerCase().includes("stable");
                          return (
                            <div 
                              key={i} 
                              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                                isGood 
                                  ? "bg-emerald-50/20 text-emerald-800 border-emerald-100/20 dark:bg-emerald-950/10 dark:text-emerald-400 dark:border-emerald-900/30" 
                                  : "bg-rose-50/20 text-rose-800 border-rose-100/20 dark:bg-rose-950/10 dark:text-rose-400 dark:border-rose-900/30"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isGood ? (
                                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                )}
                                <span>{h}</span>
                              </div>
                              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                                {isGood ? "Optimal" : "Requires Care"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* High-fidelity clinical analysis parser fields */}
                  {selectedRecord.reportAnalysis && (
                    <div className="space-y-5 pt-3 border-t border-slate-100 dark:border-slate-900">
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                        <Sparkles size={16} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">AI Clinical Report Breakdown</h3>
                      </div>

                      {/* Overview Grid */}
                      {selectedRecord.reportAnalysis.overview && (
                        <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">Extraction Confidence</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">{selectedRecord.reportAnalysis.overview.confidence}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">Diagnostics Focus</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">{selectedRecord.reportAnalysis.overview.reportType}</span>
                          </div>
                        </div>
                      )}

                      {/* Diagnostic biomarkers detail */}
                      {selectedRecord.reportAnalysis.findings && selectedRecord.reportAnalysis.findings.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Detailed Biomarkers Lab Ranges</h4>
                          
                          <div className="space-y-2.5">
                            {selectedRecord.reportAnalysis.findings.map((finding: any, idx: number) => {
                              const isNormal = (finding.status || "").toLowerCase().includes("normal");
                              return (
                                <div 
                                  key={idx} 
                                  className={`p-3 rounded-xl border space-y-2 text-xs transition-all ${
                                    isNormal 
                                      ? "bg-emerald-50/10 border-emerald-100/20 dark:bg-emerald-950/5 dark:border-emerald-900/20"
                                      : "bg-rose-50/15 border-rose-100/25 dark:bg-rose-950/5 dark:border-rose-900/25"
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">{finding.marker}</span>
                                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md mt-1.5 inline-block ${
                                        isNormal ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                                      }`}>
                                        {finding.severity || finding.status}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className={`font-mono font-bold text-base block ${isNormal ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                                        {finding.value}
                                      </span>
                                      {finding.referenceRange && <span className="text-[10px] text-slate-400 block font-mono">Range: {finding.referenceRange}</span>}
                                    </div>
                                  </div>

                                  {finding.whyItMatters && (
                                    <p className="text-[12px] text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-900/60 pt-2 leading-relaxed">
                                      <strong>Why It Matters:</strong> {finding.whyItMatters}
                                    </p>
                                  )}
                                  {finding.possibleCauses && (
                                    <p className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                      <strong>Possible Causes:</strong> {finding.possibleCauses}
                                    </p>
                                  )}
                                  {finding.suggestedFollowUp && (
                                    <p className="text-[12px] text-indigo-600 dark:text-indigo-400 font-semibold leading-relaxed">
                                      <strong>Suggested Monitoring:</strong> {finding.suggestedFollowUp}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action Plan section */}
                      {selectedRecord.reportAnalysis.recommendations && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl space-y-4">
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1">
                            <Info className="w-4 h-4 text-indigo-500" />
                            Clinical Action Guidance
                          </h4>

                          <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-200/40 dark:border-slate-800/40 pb-3">
                            {selectedRecord.reportAnalysis.recommendations.physicianReview && (
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Consult Recommendation</span>
                                <p className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">{selectedRecord.reportAnalysis.recommendations.physicianReview}</p>
                              </div>
                            )}
                            {selectedRecord.reportAnalysis.recommendations.repeatTesting && (
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Re-Test Interval</span>
                                <p className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">{selectedRecord.reportAnalysis.recommendations.repeatTesting}</p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            {selectedRecord.reportAnalysis.recommendations.lifestyleChanges && selectedRecord.reportAnalysis.recommendations.lifestyleChanges.length > 0 && (
                              <div className="space-y-1 text-xs">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <Apple className="w-3 h-3" />
                                  Lifestyle Adjustments
                                </span>
                                <ul className="list-disc pl-4 text-slate-600 dark:text-slate-400 space-y-0.5">
                                  {selectedRecord.reportAnalysis.recommendations.lifestyleChanges.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                                </ul>
                              </div>
                            )}

                            {selectedRecord.reportAnalysis.recommendations.dietaryAdvice && selectedRecord.reportAnalysis.recommendations.dietaryAdvice.length > 0 && (
                              <div className="space-y-1 text-xs">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  Dietary Intake Advice
                                </span>
                                <ul className="list-disc pl-4 text-slate-600 dark:text-slate-400 space-y-0.5">
                                  {selectedRecord.reportAnalysis.recommendations.dietaryAdvice.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                                </ul>
                              </div>
                            )}

                            {selectedRecord.reportAnalysis.recommendations.medicationsToDiscuss && selectedRecord.reportAnalysis.recommendations.medicationsToDiscuss.length > 0 && (
                              <div className="space-y-1 text-xs">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                  <Pill className="w-3 h-3" />
                                  Pharmacology Discussions
                                </span>
                                <ul className="list-disc pl-4 text-slate-600 dark:text-slate-400 space-y-0.5">
                                  {selectedRecord.reportAnalysis.recommendations.medicationsToDiscuss.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                                </ul>
                              </div>
                            )}

                            {selectedRecord.reportAnalysis.recommendations.emergencyWarningSigns && selectedRecord.reportAnalysis.recommendations.emergencyWarningSigns.length > 0 && (
                              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                  Emergency Warnings (Act Fast)
                                </span>
                                <ul className="list-disc pl-4 text-xs text-rose-800 dark:text-rose-300 font-bold space-y-0.5">
                                  {selectedRecord.reportAnalysis.recommendations.emergencyWarningSigns.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer with a close action */}
                <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20 text-right">
                  <button 
                    onClick={() => setSelectedRecord(null)}
                    className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
