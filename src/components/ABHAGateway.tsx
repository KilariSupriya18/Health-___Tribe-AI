import React, { useState, useEffect } from "react";
import { 
  Activity, 
  ShieldCheck, 
  RefreshCw, 
  User, 
  Check, 
  Trash2, 
  FileText, 
  X, 
  Lock, 
  Server, 
  AlertCircle, 
  Building, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  ExternalLink, 
  ShieldAlert,
  Calendar
} from "lucide-react";
import { FamilyMember, ABHAIdentity, ConsentRecord, ImportSession, TimelineRecord } from "../types";

interface Props {
  activeMember: FamilyMember;
  familyMembers: FamilyMember[];
  onMemberChange: (member: FamilyMember) => void;
  triggerToast: (msg: string) => void;
  isDarkMode: boolean;
  onRefreshTimeline: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const ABHAGateway = ({ 
  activeMember, 
  familyMembers, 
  onMemberChange, 
  triggerToast, 
  isDarkMode,
  onRefreshTimeline,
  onNavigateToTab
}: Props) => {
  // State variables
  const [abhaNumber, setAbhaNumber] = useState("");
  const [abhaAddress, setAbhaAddress] = useState("");
  const [linkingSession, setLinkingSession] = useState<{ transactionId: string; otpHint: string } | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [isLinkingLoading, setIsLinkingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [activeIdentity, setActiveIdentity] = useState<ABHAIdentity | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
  const [isLoadingConsents, setIsLoadingConsents] = useState(false);

  // Import flow state
  const [activeImportSession, setActiveImportSession] = useState<ImportSession | null>(null);
  const [importStatusMessage, setImportStatusMessage] = useState("");

  // Load patient specific ABHA identity and consents on member change
  useEffect(() => {
    fetchAbhaIdentity();
    fetchHospitals();
    fetchConsents();
    setAbhaNumber("");
    setAbhaAddress("");
    setLinkingSession(null);
    setOtpInput("");
    setErrorMessage("");
    setActiveImportSession(null);
  }, [activeMember]);

  const fetchAbhaIdentity = async () => {
    try {
      const res = await fetch(`/api/v1/abha/identity/${activeMember.id}`);
      const data = await res.json();
      if (data.linked) {
        setActiveIdentity(data.identity);
      } else {
        setActiveIdentity(null);
      }
    } catch (err) {
      console.error("Failed to fetch ABHA Identity:", err);
    }
  };

  const fetchHospitals = async () => {
    setIsLoadingHospitals(true);
    try {
      const res = await fetch(`/api/v1/abha/hospitals`);
      const data = await res.json();
      if (data.success) {
        setHospitals(data.hospitals || []);
      } else {
        setHospitals([]);
      }
    } catch (err) {
      console.error("Failed to fetch hospitals:", err);
      setHospitals([]);
    } finally {
      setIsLoadingHospitals(false);
    }
  };

  const fetchConsents = async () => {
    setIsLoadingConsents(true);
    try {
      const res = await fetch(`/api/v1/consent/list/${activeMember.id}`);
      const data = await res.json();
      if (data.success) {
        setConsents(data.consents || []);
      } else {
        setConsents([]);
      }
    } catch (err) {
      console.error("Failed to fetch consents:", err);
      setConsents([]);
    } finally {
      setIsLoadingConsents(false);
    }
  };

  // 1. Generate OTP for Account Linking
  const handleGenerateOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!abhaNumber && !abhaAddress) {
      setErrorMessage("Please enter either an ABHA Number or ABHA Address.");
      return;
    }

    setErrorMessage("");
    setIsLinkingLoading(true);

    try {
      const res = await fetch("/api/v1/abha/generate-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          abhaNumber,
          abhaAddress,
          patientId: activeMember.id
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLinkingSession({
          transactionId: data.transactionId,
          otpHint: data.otpHint
        });
        triggerToast("Mock OTP generated successfully! Check hint in the dialog.");
      } else {
        setErrorMessage(data.error || "Failed to generate OTP.");
      }
    } catch (err) {
      setErrorMessage("Network error occurred during OTP request.");
    } finally {
      setIsLinkingLoading(false);
    }
  };

  // 2. Verify OTP and Link Account
  const handleVerifyOTP = async () => {
    if (!linkingSession) return;
    if (!otpInput) {
      setErrorMessage("Please enter the 6-digit verification code.");
      return;
    }

    setErrorMessage("");
    setIsLinkingLoading(true);

    try {
      const res = await fetch("/api/v1/abha/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: linkingSession.transactionId,
          otp: otpInput,
          patientId: activeMember.id
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActiveIdentity(data.identity);
        setLinkingSession(null);
        setOtpInput("");
        triggerToast("ABHA account successfully verified and linked!");
        fetchAbhaIdentity();
        onRefreshTimeline(); // Refresh timeline to reflect synced profile info
      } else {
        setErrorMessage(data.error || "Verification failed. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Verification request failed due to a network error.");
    } finally {
      setIsLinkingLoading(false);
    }
  };

  // 3. Unlink ABHA account
  const handleUnlink = async () => {
    if (!window.confirm("Are you sure you want to unlink your ABHA Identity? Imported records will remain in your timeline, but future sync operations will be blocked.")) {
      return;
    }

    try {
      const res = await fetch("/api/v1/abha/unlink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: activeMember.id })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActiveIdentity(null);
        triggerToast("ABHA account unlinked successfully.");
        fetchAbhaIdentity();
      } else {
        triggerToast(data.error || "Failed to unlink account.");
      }
    } catch (err) {
      triggerToast("Failed to connect to server.");
    }
  };

  // 4. Request Consent for a hospital (HIP)
  const handleRequestConsent = async (hospital: any) => {
    if (!activeIdentity) return;

    try {
      const res = await fetch("/api/v1/consent/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: activeMember.id,
          abhaAddress: activeIdentity.abhaAddress,
          hipId: hospital.id,
          hipName: hospital.name,
          purpose: "Diagnostic Consolidation & AI Analysis",
          dataTypes: ["Prescription", "DiagnosticReport", "DischargeSummary"]
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`Consent granted for ${hospital.name}!`);
        fetchConsents();
      } else {
        triggerToast(data.error || "Failed to create consent.");
      }
    } catch (err) {
      triggerToast("Error requesting consent.");
    }
  };

  // 5. Consent operations (Revoke / Re-grant)
  const handleConsentAction = async (consentId: string, action: "GRANTED" | "REVOKED") => {
    try {
      const res = await fetch("/api/v1/consent/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consentId,
          action,
          patientId: activeMember.id
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`Consent status marked as ${action}.`);
        fetchConsents();
      } else {
        triggerToast(data.error || "Action failed.");
      }
    } catch (err) {
      triggerToast("Error updating consent status.");
    }
  };

  // 6. Record Import Pipeline Trigger
  const handleImportRecords = async (consent: ConsentRecord) => {
    setActiveImportSession({
      id: "pending",
      patientId: activeMember.id,
      consentId: consent.id,
      hipId: consent.hipId,
      hipName: consent.hipName,
      status: "PENDING",
      progress: 0,
      createdAt: new Date().toISOString()
    });
    setImportStatusMessage("Initializing secure connection with ABHA Gateway...");

    try {
      const res = await fetch(`/api/v1/abha/import/${activeMember.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consentId: consent.id,
          hipId: consent.hipId,
          hipName: consent.hipName
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        pollImportSession(data.sessionId);
      } else {
        triggerToast(data.error || "Failed to start records import.");
        setActiveImportSession(null);
      }
    } catch (err) {
      triggerToast("Error starting import pipeline.");
      setActiveImportSession(null);
    }
  };

  // 7. Poller for Dynamic Import Stages
  const pollImportSession = (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/abha/import/session/${sessionId}`);
        const data = await res.json();

        if (res.ok && data.success) {
          const session = data.session;
          setActiveImportSession(session);

          // Update status explanations dynamically for UI polish
          switch (session.status) {
            case "AUTHENTICATING":
              setImportStatusMessage("Establishing encrypted handshake using public key infrastructure...");
              break;
            case "FETCHING_METADATA":
              setImportStatusMessage("Verifying active consent certificate and fetching FHIR index...");
              break;
            case "DECRYPTING":
              setImportStatusMessage("Retrieving records packages & decrypting using your device keys...");
              break;
            case "PARSING":
              setImportStatusMessage("Parsing FHIR bundles & mapping values to Timeline schema...");
              break;
            case "COMPLETED":
              setImportStatusMessage("Import complete! Running Gemini clinical AI compiler to digest records...");
              clearInterval(interval);
              setTimeout(() => {
                triggerToast("Health records imported and digested successfully!");
                onRefreshTimeline(); // Refresh main medical timeline!
              }, 1200);
              break;
            case "FAILED":
              setImportStatusMessage(`Import failed: ${session.error || "Gateway timeout"}`);
              clearInterval(interval);
              break;
          }
        } else {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
        clearInterval(interval);
      }
    }, 800);
  };

  // Format ABHA Number format automatically (12-3456-7890-1234)
  const formatAbhaNumber = (val: string) => {
    const clean = val.replace(/\D/g, "");
    const parts = [];
    if (clean.length > 0) parts.push(clean.substring(0, 2));
    if (clean.length > 2) parts.push(clean.substring(2, 6));
    if (clean.length > 6) parts.push(clean.substring(6, 10));
    if (clean.length > 10) parts.push(clean.substring(10, 14));
    return parts.join("-");
  };

  const onAbhaNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAbhaNumber(e.target.value);
    setAbhaNumber(formatted);
  };

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      {/* HEADER BAR: PROFILE SELECTOR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
              ABHA SANDBOX GATEWAY
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Ayushman Bharat Digital Health Ecosystem
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
            Securely link, verify, and consolidate your official electronic health records (EHR) straight from certified diagnostic laboratories and trauma centers across India.
          </p>
        </div>

        {/* Member selection dropdown */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-800 shrink-0">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Managing Profile:</span>
          <select
            value={activeMember.id}
            onChange={(e) => {
              const selected = familyMembers.find(m => m.id === e.target.value);
              if (selected) onMemberChange(selected);
            }}
            className="bg-transparent text-xs font-black text-slate-900 dark:text-white border-none focus:outline-none focus:ring-0 cursor-pointer"
          >
            {familyMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.relation})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 p-4 rounded-2xl flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">ABHA Gateway Warning</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* MAIN TWO COLUMN SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: ACCOUNT LINKING CARD */}
        <div className="lg:col-span-5 space-y-6">
          {!activeIdentity ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Link Your ABHA Identity</h3>
                  <p className="text-[10px] text-slate-400">Enter your credentials to receive an encrypted OTP</p>
                </div>
              </div>

              {!linkingSession ? (
                <form onSubmit={handleGenerateOTP} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      ABHA ID Number (14 Digits)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 91-8402-1234-5678"
                      value={abhaNumber}
                      onChange={onAbhaNumberChange}
                      maxLength={17}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="text-center text-xs text-slate-400 font-bold uppercase my-1">— OR —</div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      ABHA Address (virtual alias)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. supriya@abha"
                      value={abhaAddress}
                      onChange={(e) => setAbhaAddress(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLinkingLoading}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLinkingLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Generating Mock Handshake...
                      </>
                    ) : (
                      <>
                        Generate Secure OTP <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl space-y-1 text-xs">
                    <p className="font-bold text-emerald-900 dark:text-emerald-300">🔓 Sandbox Secure OTP Handshake</p>
                    <p className="text-slate-600 dark:text-slate-400">
                      We have simulated a nationwide health registry handshake. Enter the generated test OTP to link this clinical profile.
                    </p>
                    <div className="mt-2.5 p-2 bg-white dark:bg-slate-800 rounded-lg border border-emerald-100 dark:border-emerald-850 font-mono text-center flex items-center justify-center gap-1">
                      <span className="text-slate-400 text-[10px]">VERIFICATION HINT:</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 text-xs tracking-wider">{linkingSession.otpHint}</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 123456"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").substring(0, 6))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center text-lg font-mono font-bold tracking-widest text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Sandbox error testing controls */}
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Sandbox Edge-Case Failure Injection</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { setOtpInput("000000"); triggerToast("Input pre-filled with expired OTP code."); }}
                        className="flex-1 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-[9px] font-bold rounded hover:bg-amber-200 transition-colors"
                      >
                        Simulate Expired OTP
                      </button>
                      <button
                        onClick={() => { setOtpInput("999999"); triggerToast("Input pre-filled with gateway-fail OTP code."); }}
                        className="flex-1 py-1 bg-rose-100 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 text-[9px] font-bold rounded hover:bg-rose-200 transition-colors"
                      >
                        Simulate Gate Error
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => { setLinkingSession(null); setOtpInput(""); setErrorMessage(""); }}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVerifyOTP}
                      disabled={isLinkingLoading}
                      className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1"
                    >
                      {isLinkingLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Verify & Link
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* LINKED ID CARD VIEW */
            <div className="space-y-6">
              {/* Digital Card Body */}
              <div className="relative bg-gradient-to-br from-emerald-850 via-emerald-800 to-teal-950 text-white rounded-3xl p-6 shadow-xl overflow-hidden border border-emerald-700/30">
                {/* Visual patterns */}
                <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-600/20 rounded-full blur-2xl"></div>
                <div className="absolute left-0 bottom-0 w-48 h-12 bg-teal-600/15 transform rotate-12 origin-bottom-left"></div>

                <div className="relative z-10 flex flex-col justify-between h-48">
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-white/10 rounded-lg dark:bg-slate-900">
                        <Activity className="w-5 h-5 text-emerald-300" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-black tracking-widest text-emerald-300 uppercase block leading-tight">MINISTRY OF HEALTH</span>
                        <span className="text-[8px] text-slate-300 font-bold tracking-tight block">GOVERNMENT OF INDIA</span>
                      </div>
                    </div>
                    <span className="bg-emerald-600/50 text-emerald-200 text-[8px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide border border-emerald-500/30">
                      LIVE ACCOUNT
                    </span>
                  </div>

                  {/* Card Details */}
                  <div className="text-left">
                    <p className="text-xs text-emerald-300 font-mono tracking-wider">HEALTH ACCOUNT CARD</p>
                    <h4 className="text-lg font-black tracking-tight mt-0.5">{activeMember.name}</h4>
                    <p className="text-[11px] text-slate-200 mt-1 flex items-center gap-4">
                      <span>Gender: <strong>{activeMember.gender}</strong></span>
                      <span>Age: <strong>{activeMember.age}</strong></span>
                    </p>
                  </div>

                  {/* Card Footer: ABHA Numbers */}
                  <div className="pt-3 border-t border-white/15 flex justify-between items-end text-left">
                    <div>
                      <span className="text-[8px] text-emerald-300 font-bold block uppercase tracking-wider">ABHA Number</span>
                      <span className="text-sm font-black font-mono tracking-widest text-white">{activeIdentity.abhaNumber}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-emerald-300 font-bold block uppercase tracking-wider">ABHA Address</span>
                      <span className="text-xs font-bold font-mono text-emerald-100">{activeIdentity.abhaAddress}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Identity Status Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm text-left space-y-3">
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Connection Diagnostics</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400">Registry Status:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">● VERIFIED ACTIVE</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400">Mobile Anchor:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{activeIdentity.mobile}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400">Linked Timestamp:</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">{new Date(activeIdentity.linkedAt).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleUnlink}
                  className="w-full mt-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Unlink ABHA Identity
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: HOSPITAL DISCOVERY & CONSENT */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {/* HOSPITAL DISCOVERY SECTION */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Hospital Discovery (HIP Node Directory)</h3>
                  <p className="text-[10px] text-slate-400">Browse and connect participating medical facilities in your area</p>
                </div>
              </div>
              <button 
                onClick={fetchHospitals} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                title="Refresh Hospitals"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {!activeIdentity ? (
              <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2">
                <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">ABHA Account Required for Discovery</h4>
                <p className="text-[10px] text-slate-400 max-w-sm mx-auto">
                  You must link an ABHA Account to access the nationwide Health Information Provider (HIP) network and establish secure records gateways.
                </p>
              </div>
            ) : isLoadingHospitals ? (
              <div className="text-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                <span className="text-xs text-slate-400 mt-2 block">Loading network nodes...</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {hospitals.map((hosp) => {
                  // Find if there is an active consent for this hospital
                  const activeConsent = consents.find(c => c.hipId === hosp.id && c.status === "GRANTED");
                  
                  return (
                    <div 
                      key={hosp.id} 
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${
                        activeConsent 
                          ? "bg-emerald-50/30 border-emerald-200/50 dark:bg-emerald-950/5 dark:border-emerald-900/30" 
                          : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800/50"
                      }`}
                    >
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{hosp.name}</h4>
                          <span className="text-[8px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold px-1.5 py-0.5 rounded">
                            {hosp.distance}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{hosp.address}</p>
                        <span className="text-[9px] text-emerald-800 dark:text-emerald-400 font-bold flex items-center gap-0.5 mt-1">
                          ✓ ABHA Records Gateway Connected
                        </span>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {activeConsent ? (
                          <button
                            onClick={() => handleImportRecords(activeConsent)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-xl cursor-pointer flex items-center gap-1 shadow-sm transition-all"
                          >
                            <Sparkles className="w-3 h-3" /> Sync Health Records
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRequestConsent(hosp)}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-[10px] rounded-xl cursor-pointer transition-all"
                          >
                            Request Consent
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CONSENT MANAGEMENT BOARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Consent Records (HIU-HIP Agreements)</h3>
                  <p className="text-[10px] text-slate-400">View and audit third-party medical data sharing certificates</p>
                </div>
              </div>
              <button 
                onClick={fetchConsents} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                title="Refresh Consents"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {!activeIdentity ? (
              <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-1">
                <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">No Linked Identity to Display Consents</h4>
              </div>
            ) : isLoadingConsents ? (
              <div className="text-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
              </div>
            ) : consents.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active or requested consents found for this member.</p>
            ) : (
              <div className="space-y-3">
                {consents.map((consent) => (
                  <div key={consent.id} className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl text-left space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">Provider: {consent.hipName}</h4>
                        <span className="text-[9px] text-slate-400 font-mono">Consent ID: {consent.id}</span>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        consent.status === "GRANTED" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {consent.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-2">
                      <div>
                        <span>Purpose:</span> <strong className="text-slate-700 dark:text-slate-300">{consent.purpose}</strong>
                      </div>
                      <div>
                        <span>Expiry Date:</span> <strong className="text-slate-700 dark:text-slate-300">{consent.consentExpiry}</strong>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="flex gap-1.5 flex-wrap">
                        {consent.dataTypes.map(dt => (
                          <span key={dt} className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[8px] font-bold px-1.5 py-0.5 rounded">
                            {dt}
                          </span>
                        ))}
                      </div>

                      {consent.status === "GRANTED" ? (
                        <button
                          onClick={() => handleConsentAction(consent.id, "REVOKED")}
                          className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Revoke Sharing Permission
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConsentAction(consent.id, "GRANTED")}
                          className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                        >
                          Re-Grant Sharing Permission
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* IMPORT PIPELINE PROGRESS VIEW (OVERLAY OR SCREEN OVERLAY CARD) */}
      {activeImportSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl text-center space-y-6 animate-scale-up">
            
            <div className="relative w-16 h-16 mx-auto">
              {activeImportSession.status !== "COMPLETED" && activeImportSession.status !== "FAILED" ? (
                <>
                  <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-emerald-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  <Server className="w-6 h-6 text-emerald-600 absolute inset-0 m-auto" />
                </>
              ) : activeImportSession.status === "COMPLETED" ? (
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600">
                  <ShieldAlert className="w-8 h-8" />
                </div>
              )}
            </div>

            <div>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                SESSION ID: {activeImportSession.id}
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-2 leading-tight">
                Importing EHR Diagnostic Records
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Retrieving clinical bundles from <strong>{activeImportSession.hipName}</strong>
              </p>
            </div>

            {/* PROGRESS PERCENTAGE SLIDER */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-500 dark:text-slate-400">
                <span>PIPELINE STAGE: {activeImportSession.status}</span>
                <span>{activeImportSession.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-700 h-full transition-all duration-500"
                  style={{ width: `${activeImportSession.progress}%` }}
                ></div>
              </div>
            </div>

            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[50px] flex items-center justify-center">
              {importStatusMessage}
            </p>

            {/* STAGES CHECKLIST VIEW */}
            <div className="space-y-2 text-left text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-black">
                  {activeImportSession.progress >= 15 ? "✓" : "1"}
                </div>
                <span className={activeImportSession.progress >= 15 ? "text-emerald-700 font-bold" : ""}>
                  Establishing secure gateway authorization
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-black">
                  {activeImportSession.progress >= 40 ? "✓" : "2"}
                </div>
                <span className={activeImportSession.progress >= 40 ? "text-emerald-700 font-bold" : ""}>
                  Retrieving diagnostic and prescription indexes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-black">
                  {activeImportSession.progress >= 65 ? "✓" : "3"}
                </div>
                <span className={activeImportSession.progress >= 65 ? "text-emerald-700 font-bold" : ""}>
                  Decrypting bundles using patient cryptographic keys
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-black">
                  {activeImportSession.progress >= 85 ? "✓" : "4"}
                </div>
                <span className={activeImportSession.progress >= 85 ? "text-emerald-700 font-bold" : ""}>
                  Normalizing record formats to standard Timeline
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-black">
                  {activeImportSession.progress >= 100 ? "✓" : "5"}
                </div>
                <span className={activeImportSession.progress >= 100 ? "text-emerald-700 font-bold" : ""}>
                  Generating consolidated scientific AI summary
                </span>
              </div>
            </div>

            {/* ACTION BUTTON ON SUCCESS */}
            {activeImportSession.status === "COMPLETED" && (
              <div className="pt-2 animate-bounce">
                <button
                  onClick={() => {
                    setActiveImportSession(null);
                    onNavigateToTab("timeline");
                  }}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
                >
                  View Consolidated Records in Timeline →
                </button>
              </div>
            )}

            {activeImportSession.status === "FAILED" && (
              <div className="pt-2">
                <button
                  onClick={() => setActiveImportSession(null)}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Close Pipeline
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
