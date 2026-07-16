import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Mail, Phone, Calendar, MapPin, Shield, RefreshCw, Key, 
  Smartphone, Monitor, Laptop, Trash2, Camera, Upload, ZoomIn, 
  Check, Sparkles, X, Heart, Award, Star, DollarSign, Clock, 
  FileText, ShieldCheck, Activity, ShieldAlert, CheckCircle2, 
  AlertCircle, ChevronRight, Lock, Bell, Eye, LogOut, Info, ArrowLeft
} from "lucide-react";

interface ProfilePageProps {
  sessionMode: "patient" | "doctor";
  activeMember: {
    id: string;
    name: string;
    relation: string;
    age: number;
    gender: string;
    bloodGroup: string;
    allergies: string;
    chronicConditions: string;
    medications: string;
    avatar?: string;
    height?: string;
    weight?: string;
    phone?: string;
    email?: string;
    onboardingComplete?: boolean;
  } | null;
  onSavePatientProfile: (updatedData: any) => void;
  onGoBack: () => void;
  triggerToast: (msg: string, isError?: boolean) => void;
}

export default function ProfilePage({ 
  sessionMode, 
  activeMember, 
  onSavePatientProfile, 
  onGoBack, 
  triggerToast 
}: ProfilePageProps) {
  const isPatient = sessionMode === "patient";

  // --- Patient Editable States ---
  const [patName, setPatName] = useState(activeMember?.name || "Supriya Kilari");
  const [patDob, setPatDob] = useState("1996-03-25");
  const [patGender, setPatGender] = useState(activeMember?.gender || "Female");
  const [patBloodGroup, setPatBloodGroup] = useState(activeMember?.bloodGroup || "O+");
  const [patHeight, setPatHeight] = useState(activeMember?.height || "165 cm");
  const [patWeight, setPatWeight] = useState(activeMember?.weight || "58 kg");

  const [patEmail, setPatEmail] = useState(activeMember?.email || "kilarisupriya25@gmail.com");
  const [patPhone, setPatPhone] = useState(activeMember?.phone || "+91 94021 58210");
  const [patEmergency, setPatEmergency] = useState("+91 98402 12211 (Father)");
  const [patAlternate, setPatAlternate] = useState("+91 99110 38402");

  const [patCountry, setPatCountry] = useState("India");
  const [patState, setPatState] = useState("Karnataka");
  const [patCity, setPatCity] = useState("Bangalore");
  const [patPinCode, setPatPinCode] = useState("560001");
  const [patAddress, setPatAddress] = useState("Flat 302, Green Glen Layout, Bellandur, Bangalore");

  const [patAllergies, setPatAllergies] = useState(activeMember?.allergies || "Penicillin, Peanuts");
  const [patChronic, setPatChronic] = useState(activeMember?.chronicConditions || "None");
  const [patMedications, setPatMedications] = useState(activeMember?.medications || "Multivitamins, Vitamin D");
  const [patPrimaryDoctor, setPatPrimaryDoctor] = useState("Dr. Supriya Kilari");
  const [patInsurance, setPatInsurance] = useState("Star Health Premium Clinical Plan");
  const [patOrganDonor, setPatOrganDonor] = useState("Registered Organ Donor");

  // --- Doctor Editable States ---
  const [docName, setDocName] = useState("Dr. Supriya Kilari");
  const [docDob, setDocDob] = useState("1988-11-20");
  const [docGender, setDocGender] = useState("Female");
  const [docBloodGroup, setDocBloodGroup] = useState("A+");
  const [docHeight, setDocHeight] = useState("168 cm");
  const [docWeight, setDocWeight] = useState("61 kg");

  const [docEmail, setDocEmail] = useState("dr.supriya@aimshospital.com");
  const [docPhone, setDocPhone] = useState("+91 91102 38411");
  const [docEmergency, setDocEmergency] = useState("+91 94488 20011");
  const [docAlternate, setDocAlternate] = useState("+91 90088 12244");

  const [docCountry, setDocCountry] = useState("India");
  const [docState, setDocState] = useState("Karnataka");
  const [docCity, setDocCity] = useState("Bangalore");
  const [docPinCode, setDocPinCode] = useState("560029");
  const [docAddress, setDocAddress] = useState("AIMS Cardiology Wing, Bannerghatta Road, Bangalore");

  const [docQualification, setDocQualification] = useState("MD, DM (Cardiology), FACC");
  const [docRegNumber, setDocRegNumber] = useState("KMC-2012-918402");
  const [docHospital, setDocHospital] = useState("AIMS Super Speciality Hospital, Bangalore");
  const [docExperience, setDocExperience] = useState("14 Years");
  const [docFee, setDocFee] = useState("₹800");
  const [docLanguages, setDocLanguages] = useState("English, Kannada, Hindi, Telugu");
  const [docTimings, setDocTimings] = useState("Mon-Sat (10:00 AM - 4:00 PM)");
  const [docBio, setDocBio] = useState("Consultant Interventional Cardiologist specializing in preventive heart health, coronary artery disease management, and advanced cardiac pacing solutions.");

  // Sync state if activeMember changes
  useEffect(() => {
    if (isPatient && activeMember) {
      setPatName(activeMember.name);
      setPatGender(activeMember.gender);
      setPatBloodGroup(activeMember.bloodGroup || "O+");
      setPatAllergies(activeMember.allergies || "None");
      setPatChronic(activeMember.chronicConditions || "None");
      setPatMedications(activeMember.medications || "None");
      if (activeMember.height) setPatHeight(activeMember.height);
      if (activeMember.weight) setPatWeight(activeMember.weight);
      if (activeMember.email) setPatEmail(activeMember.email);
      if (activeMember.phone) setPatPhone(activeMember.phone);
    }
  }, [activeMember, isPatient]);

  // --- Photo Management State ---
  const [avatar, setAvatar] = useState<string>(activeMember?.avatar || "");
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string>("");
  const [photoZoom, setPhotoZoom] = useState<number>(1);
  const [photoOffsetX, setPhotoOffsetX] = useState<number>(0);
  const [photoOffsetY, setPhotoOffsetY] = useState<number>(0);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [isPhotoSuccess, setIsPhotoSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- Account Settings Toggles ---
  const [twoFA, setTwoFA] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [dataSharing, setDataSharing] = useState(true);
  const [abhaSync, setAbhaSync] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [notifWhatsApp, setNotifWhatsApp] = useState(true);
  const [notifPush, setNotifPush] = useState(true);

  // --- Password Management ---
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- Device Management ---
  const [devices, setDevices] = useState([
    { id: "1", name: "Apple iPhone 15 Pro", location: "Bangalore, India", status: "Active Now", icon: Smartphone },
    { id: "2", name: "MacBook Pro 16\"", location: "Bangalore, India", status: "Last active: 2 hours ago", icon: Laptop },
    { id: "3", name: "Chrome on Windows PC", location: "Mumbai, India", status: "Last active: June 28, 2026", icon: Monitor }
  ]);

  // --- Recent Activity ---
  const [activities, setActivities] = useState([
    { id: "act-1", title: "Appointment booked", desc: "Consultation with Dr. Supriya Kilari scheduled for July 12", date: "Today, 10:24 AM", type: "appointment" },
    { id: "act-2", title: "Profile updated", desc: "Updated allergies & weight record in personal health file", date: "Yesterday, 4:15 PM", type: "profile" },
    { id: "act-3", title: "AI Consultation", desc: "Completed cardiac risk screening with HealthTribe AI Copilot", date: "July 02, 2026", type: "ai" },
    { id: "act-4", title: "Prescription uploaded", desc: "Added multivitamin and aspirin dosage files to health vault", date: "June 28, 2026", type: "prescription" },
    { id: "act-5", title: "Password changed", desc: "Security credentials updated successfully", date: "June 15, 2026", type: "security" },
    { id: "act-6", title: "Lab report added", desc: "Lipid Profile & Serum Cholesterol results synced via ABHA", date: "June 10, 2026", type: "report" }
  ]);

  // Scroll target refs for profile completion clicks
  const personalCardRef = useRef<HTMLDivElement>(null);
  const contactCardRef = useRef<HTMLDivElement>(null);
  const addressCardRef = useRef<HTMLDivElement>(null);
  const healthCardRef = useRef<HTMLDivElement>(null);

  // --- Save Handler ---
  const handleSaveInfo = (section: string) => {
    if (isPatient) {
      const updated = {
        name: patName,
        gender: patGender,
        bloodGroup: patBloodGroup,
        allergies: patAllergies,
        chronicConditions: patChronic,
        medications: patMedications,
        age: parseInt(patDob) ? (2026 - parseInt(patDob.split("-")[0])) : (activeMember?.age || 30),
        height: patHeight,
        weight: patWeight,
        phone: patPhone,
        email: patEmail
      };
      onSavePatientProfile(updated);
      triggerToast(`Successfully updated patient ${section} details.`);
    } else {
      triggerToast(`Successfully saved doctor ${section} professional records.`);
    }

    // Add activity record
    const newAct = {
      id: `act-${Date.now()}`,
      title: "Profile updated",
      desc: `Updated ${section} details in professional profile`,
      date: "Just now",
      type: "profile"
    };
    setActivities([newAct, ...activities]);
  };

  // --- Password Update ---
  const handleUpdatePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      triggerToast("Please fill all password fields.", true);
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast("New passwords do not match.", true);
      return;
    }
    triggerToast("Your password has been securely updated.");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setActivities([
      {
        id: `act-${Date.now()}`,
        title: "Password changed",
        desc: "Security credentials updated successfully",
        date: "Just now",
        type: "security"
      },
      ...activities
    ]);
  };

  // --- Revoke Device Session ---
  const handleRevokeDevice = (id: string, name: string) => {
    setDevices(devices.filter(d => d.id !== id));
    triggerToast(`Session terminated for ${name}.`);
  };

  // --- Image Selector & Upload Simulation ---
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      triggerToast("File is larger than 10 MB limit.", true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setTempPhotoUrl(event.target.result as string);
        setPhotoZoom(1);
        setPhotoOffsetX(0);
        setPhotoOffsetY(0);
        triggerToast("Photo loaded into position editor.");
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Trigger Native File Input ---
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // --- Camera Access Trigger ---
  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      triggerToast("Camera hardware access declined or unavailable.", true);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 300;
      canvas.height = video.videoHeight || 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/webp");
        setTempPhotoUrl(dataUrl);
        stopCamera();
        triggerToast("Camera frame captured successfully.");
      }
    }
  };

  // --- Save Edited Photo ---
  const savePhoto = () => {
    if (!tempPhotoUrl) {
      triggerToast("Please select or capture a photo first.", true);
      return;
    }
    setIsPhotoLoading(true);
    setTimeout(() => {
      setIsPhotoLoading(false);
      setIsPhotoSuccess(true);
      setTimeout(() => {
        setAvatar(tempPhotoUrl);
        setIsPhotoModalOpen(false);
        setIsPhotoSuccess(false);
        setTempPhotoUrl("");
        triggerToast("Profile picture updated successfully throughout HealthTribe.");
      }, 1000);
    }, 1500);
  };

  // --- Remove Photo ---
  const removePhoto = () => {
    setAvatar("");
    setTempPhotoUrl("");
    triggerToast("Profile picture removed successfully.");
    setIsPhotoModalOpen(false);
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (cameraActive) {
        stopCamera();
      }
    };
  }, [cameraActive]);

  // Scroll Helper
  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      ref.current.classList.add("ring-2", "ring-blue-500", "ring-offset-2");
      setTimeout(() => {
        ref.current?.classList.remove("ring-2", "ring-blue-500", "ring-offset-2");
      }, 2000);
    }
  };

  // Calculation for progress percentage
  const calculateCompletion = () => {
    let score = 50; // base score
    if (avatar) score += 10;
    if (isPatient) {
      if (patPhone && patPhone.length > 5) score += 10;
      if (patEmergency) score += 10;
      if (patAddress && patAddress.length > 10) score += 10;
      if (patChronic && patChronic !== "None") score += 12;
    } else {
      if (docPhone && docPhone.length > 5) score += 10;
      if (docEmergency) score += 10;
      if (docBio && docBio.length > 15) score += 12;
      if (docTimings) score += 10;
    }
    return Math.min(score, 100);
  };

  const completionPercent = calculateCompletion();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-16 animate-fade-in text-left">
      {/* HEADER CONTROLS */}
      <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto px-1">
        <button 
          onClick={onGoBack}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100/60 font-mono">
          {isPatient ? "Patient Administration Center" : "Doctor Executive Panel"}
        </span>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-1">
        
        {/* LEFT COLUMN: HERO SUMMARY & STATS & PROGRESS */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* HERO PROFILE CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xs p-6 relative overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-3xl -z-10" />
            <div className="flex flex-col items-center text-center">
              
              {/* Profile Avatar Trigger */}
              <div 
                onClick={() => {
                  setTempPhotoUrl(avatar);
                  setIsPhotoModalOpen(true);
                }}
                className="relative group cursor-pointer shrink-0"
              >
                <div className="w-32 h-32 rounded-full border-4 border-emerald-50 overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:scale-105">
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-4xl font-extrabold text-emerald-600 font-mono">
                      {isPatient ? patName.charAt(0) : docName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-8 h-8 text-white animate-bounce" />
                </div>
                <span className="absolute bottom-1 right-1 bg-emerald-600 text-white p-2 rounded-full shadow-md border border-white">
                  <Camera className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Badges & Names */}
              <div className="mt-5 space-y-1">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    {isPatient ? patName : docName}
                  </h2>
                  <span className="bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
                
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {isPatient ? `ABHA-ID: ABHA-33-8402-${activeMember?.id?.substr(0, 4) || "9184"}` : "REG-ID: DOC-91-84021"}
                </p>

                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="bg-emerald-50 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                    ABHA Connected
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium font-mono">
                    Member since 2024
                  </span>
                </div>
              </div>

              {/* Contact Grid */}
              <div className="w-full border-t border-slate-200 dark:border-slate-700 mt-6 pt-4 space-y-2 text-left text-xs">
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span className="truncate">{isPatient ? patEmail : docEmail}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>{isPatient ? patPhone : docPhone}</span>
                </div>
              </div>

              {/* Quick Edit Scroll Trigger */}
              <button 
                onClick={() => scrollToRef(personalCardRef)}
                className="w-full mt-5 py-2.5 bg-white dark:bg-slate-900 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-xs font-bold rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <User className="w-3.5 h-3.5" /> Edit Profile Details
              </button>
            </div>
          </div>

          {/* CIRCULAR PROFILE COMPLETION PROGRESS */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xs p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center justify-between">
              <span>Profile Completion</span>
              <span className="text-emerald-600 font-mono text-base font-extrabold">{completionPercent}%</span>
            </h3>

            <div className="flex items-center gap-5">
              <div className="relative shrink-0 w-20 h-20">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="32" stroke="#F1F5F9" strokeWidth="6" fill="transparent" />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="32" 
                    stroke="#10B981" 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={2 * Math.PI * 32 * (1 - completionPercent / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

              <div className="text-left space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Excellent Progress!</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Completing your profile unlocks faster clinical handovers, smart triage, and secure pharmacy routes.
                </p>
              </div>
            </div>

            {/* Checklist items */}
            <div className="mt-5 space-y-2 border-t border-slate-200 dark:border-slate-700/80 pt-4 text-left">
              <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Pending Actions</p>
              
              {!avatar && (
                <button 
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 py-1 transition-all text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    Upload profile picture
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}

              <button 
                onClick={() => scrollToRef(contactCardRef)}
                className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 py-1 transition-all text-left"
              >
                <span className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Verify phone number
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button 
                onClick={() => scrollToRef(contactCardRef)}
                className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 py-1 transition-all text-left"
              >
                <span className="flex items-center gap-2">
                  {isPatient ? (
                    patEmergency ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  ) : (
                    docEmergency ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                  Add emergency contact
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button 
                onClick={() => scrollToRef(addressCardRef)}
                className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 py-1 transition-all text-left"
              >
                <span className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Complete address fields
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button 
                onClick={() => scrollToRef(healthCardRef)}
                className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 py-1 transition-all text-left"
              >
                <span className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Link ABHA clinical health card
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* BEAUTIFUL STATISTICS CARDS */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 text-left uppercase tracking-wider pl-1">
              {isPatient ? "Patient Health Stats" : "Clinical Practice Analytics"}
            </h3>

            {isPatient ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-[20px] shadow-xs text-left hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Completed Visits</p>
                  <p className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-slate-100">14</p>
                  <span className="text-[10px] text-emerald-500 font-bold font-mono">+2 this month</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-[20px] shadow-xs text-left hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                    <Upload className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Reports Loaded</p>
                  <p className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-slate-100">8</p>
                  <span className="text-[10px] text-emerald-500 font-bold font-mono">100% Synced</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-[20px] shadow-xs text-left hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center mb-3">
                    <Heart className="w-4 h-4 text-pink-500" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Health Score</p>
                  <p className="text-2xl font-extrabold mt-1 text-pink-600">85/100</p>
                  <span className="text-[10px] text-emerald-500 font-bold font-mono">Excellent Range</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-[20px] shadow-xs text-left hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">AI Consults</p>
                  <p className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-slate-100">27</p>
                  <span className="text-[10px] text-emerald-600 font-bold font-mono">Active Insights</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-[20px] shadow-xs text-left hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                    <User className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Patients</p>
                  <p className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-slate-100">421</p>
                  <span className="text-[10px] text-emerald-500 font-bold font-mono">+12% this week</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-[20px] shadow-xs text-left hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                    <Star className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Avg Rating</p>
                  <p className="text-2xl font-extrabold mt-1 text-amber-600">4.9/5.0</p>
                  <span className="text-[10px] text-emerald-500 font-bold font-mono">Top Speciality</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-[20px] shadow-xs text-left hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-1">₹33,600</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Monthly Payouts</p>
                  <span className="text-[10px] text-emerald-500 font-bold font-mono">Verified Account</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-[20px] shadow-xs text-left hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center mb-3">
                    <Smartphone className="w-4 h-4 text-rose-500" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Tele-Consults</p>
                  <p className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-slate-100">156</p>
                  <span className="text-[10px] text-emerald-600 font-bold font-mono">Live Session</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: EDITABLE FORMS & ACCORDION SECTIONS & TIMELINES */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* PROFILE CARD 1: PERSONAL INFORMATION */}
          <div 
            ref={personalCardRef}
            className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xs p-6 text-left transition-all hover:border-emerald-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Personal Information</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Verify your general demographics and blood records</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Full Name</label>
                <input 
                  type="text" 
                  value={isPatient ? patName : docName}
                  onChange={(e) => isPatient ? setPatName(e.target.value) : setDocName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Date of Birth</label>
                <input 
                  type="date" 
                  value={isPatient ? patDob : docDob}
                  onChange={(e) => isPatient ? setPatDob(e.target.value) : setDocDob(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Gender</label>
                <select 
                  value={isPatient ? patGender : docGender}
                  onChange={(e) => isPatient ? setPatGender(e.target.value) : setDocGender(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Blood Group</label>
                <select 
                  value={isPatient ? patBloodGroup : docBloodGroup}
                  onChange={(e) => isPatient ? setPatBloodGroup(e.target.value) : setDocBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Height</label>
                <input 
                  type="text" 
                  value={isPatient ? patHeight : docHeight}
                  onChange={(e) => isPatient ? setPatHeight(e.target.value) : setDocHeight(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Weight</label>
                <input 
                  type="text" 
                  value={isPatient ? patWeight : docWeight}
                  onChange={(e) => isPatient ? setPatWeight(e.target.value) : setDocWeight(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button 
                onClick={() => handleSaveInfo("Personal")}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Personal Data
              </button>
            </div>
          </div>

          {/* PROFILE CARD 2: CONTACT INFORMATION */}
          <div 
            ref={contactCardRef}
            className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xs p-6 text-left transition-all hover:border-emerald-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Contact Information</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage telephone nodes and emergency call routes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Email Address</label>
                <input 
                  type="email" 
                  value={isPatient ? patEmail : docEmail}
                  onChange={(e) => isPatient ? setPatEmail(e.target.value) : setDocEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Phone Number</label>
                <input 
                  type="text" 
                  value={isPatient ? patPhone : docPhone}
                  onChange={(e) => isPatient ? setPatPhone(e.target.value) : setDocPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Emergency Contact</label>
                <input 
                  type="text" 
                  value={isPatient ? patEmergency : docEmergency}
                  onChange={(e) => isPatient ? setPatEmergency(e.target.value) : setDocEmergency(e.target.value)}
                  placeholder="e.g. +91 94000 00000 (Spouse)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Alternate Contact</label>
                <input 
                  type="text" 
                  value={isPatient ? patAlternate : docAlternate}
                  onChange={(e) => isPatient ? setPatAlternate(e.target.value) : setDocAlternate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button 
                onClick={() => handleSaveInfo("Contact")}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Contact Details
              </button>
            </div>
          </div>

          {/* PROFILE CARD 3: ADDRESS */}
          <div 
            ref={addressCardRef}
            className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xs p-6 text-left transition-all hover:border-emerald-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Home & Practice Address</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Provide physical coordinates for drug shipments or practice clinics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5 lg:col-span-1">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Country</label>
                <input 
                  type="text" 
                  value={isPatient ? patCountry : docCountry}
                  onChange={(e) => isPatient ? setPatCountry(e.target.value) : setDocCountry(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5 lg:col-span-1">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">State</label>
                <input 
                  type="text" 
                  value={isPatient ? patState : docState}
                  onChange={(e) => isPatient ? setPatState(e.target.value) : setDocState(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5 lg:col-span-1">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">City</label>
                <input 
                  type="text" 
                  value={isPatient ? patCity : docCity}
                  onChange={(e) => isPatient ? setPatCity(e.target.value) : setDocCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5 lg:col-span-1">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">PIN Code</label>
                <input 
                  type="text" 
                  value={isPatient ? patPinCode : docPinCode}
                  onChange={(e) => isPatient ? setPatPinCode(e.target.value) : setDocPinCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5 lg:col-span-4">
                <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Full Address</label>
                <textarea 
                  rows={2}
                  value={isPatient ? patAddress : docAddress}
                  onChange={(e) => isPatient ? setPatAddress(e.target.value) : setDocAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button 
                onClick={() => handleSaveInfo("Address")}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Address Coordinates
              </button>
            </div>
          </div>

          {/* PROFILE CARD 4: CLINICAL / PROFESSIONAL INFORMATION */}
          {isPatient ? (
            /* Patients Medical Information */
            <div 
              ref={healthCardRef}
              className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xs p-6 text-left transition-all hover:border-emerald-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Clinical Medical Record</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Securely synced details for automatic medication checking</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Known Allergies</label>
                  <input 
                    type="text" 
                    value={patAllergies}
                    onChange={(e) => setPatAllergies(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Chronic Conditions</label>
                  <input 
                    type="text" 
                    value={patChronic}
                    onChange={(e) => setPatChronic(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Current Medications</label>
                  <input 
                    type="text" 
                    value={patMedications}
                    onChange={(e) => setPatMedications(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Primary Consulting Doctor</label>
                  <input 
                    type="text" 
                    value={patPrimaryDoctor}
                    onChange={(e) => setPatPrimaryDoctor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Insurance Provider & Policy</label>
                  <input 
                    type="text" 
                    value={patInsurance}
                    onChange={(e) => setPatInsurance(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Organ Donor Registry Status</label>
                  <select 
                    value={patOrganDonor}
                    onChange={(e) => setPatOrganDonor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                  >
                    <option value="Registered Organ Donor">Registered Organ Donor</option>
                    <option value="Not Registered">Not Registered</option>
                    <option value="In Process">In Process</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => handleSaveInfo("Clinical")}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save Clinical Records
                </button>
              </div>
            </div>
          ) : (
            /* Doctors Professional Information */
            <div 
              ref={healthCardRef}
              className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xs p-6 text-left transition-all hover:border-emerald-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Professional Practice Records</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Verify registrations, consultations fees and clinical rosters</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Professional Qualifications</label>
                  <input 
                    type="text" 
                    value={docQualification}
                    onChange={(e) => setDocQualification(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Medical Council Reg. Number</label>
                  <input 
                    type="text" 
                    value={docRegNumber}
                    onChange={(e) => setDocRegNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Affiliated Hospital</label>
                  <input 
                    type="text" 
                    value={docHospital}
                    onChange={(e) => setDocHospital(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Experience (Years)</label>
                  <input 
                    type="text" 
                    value={docExperience}
                    onChange={(e) => setDocExperience(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Consultation Fee</label>
                  <input 
                    type="text" 
                    value={docFee}
                    onChange={(e) => setDocFee(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Available Hours</label>
                  <input 
                    type="text" 
                    value={docTimings}
                    onChange={(e) => setDocTimings(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Languages Spoken</label>
                  <input 
                    type="text" 
                    value={docLanguages}
                    onChange={(e) => setDocLanguages(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Professional Biography</label>
                  <textarea 
                    rows={3}
                    value={docBio}
                    onChange={(e) => setDocBio(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/40 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => handleSaveInfo("Professional Biography")}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Save Professional Data
                </button>
              </div>
            </div>
          )}

          {/* PROFILE CARD 5: ACCOUNT & SECURITY SETTINGS */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xs p-6 text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Account Security Settings</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage encryption keys, linked social nodes, and logins</p>
              </div>
            </div>

            {/* Accordion List for Account Settings */}
            <div className="space-y-4">
              
              {/* Change Password */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/30">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-emerald-600" /> Change Portal Password
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Old Password</label>
                    <input 
                      type="password" 
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button 
                    onClick={handleUpdatePassword}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Toggles (2FA, Privacy, Notifications) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Security and Privacy */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/30 text-xs space-y-3.5">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-600" /> Security & Consent
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">Two-Factor Authentication</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Secure account via mobile OTP</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={twoFA} onChange={(e) => { setTwoFA(e.target.checked); triggerToast(`Two-Factor Auth ${e.target.checked ? 'activated' : 'deactivated'}.`); }} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">Profile Visibility</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Let verified doctors index your records</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={profileVisibility} onChange={(e) => setProfileVisibility(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">Dynamic Data Sharing</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Send diagnostic logs to hospital grids</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={dataSharing} onChange={(e) => setDataSharing(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">National ABHA Records Sync</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Real-time clinical update sync</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={abhaSync} onChange={(e) => setAbhaSync(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                {/* Notifications Channels */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/30 text-xs space-y-3.5">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-emerald-600" /> Notification Routes
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">Email Notifications</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Prescription and appointment details</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={notifEmail} onChange={(e) => setNotifEmail(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">SMS Alerts</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Immediate clinical security triggers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={notifSMS} onChange={(e) => setNotifSMS(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">WhatsApp Diagnostics</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Lab reports and dosage reminders</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={notifWhatsApp} onChange={(e) => setNotifWhatsApp(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">Push Live Notifications</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Real-time vital and device drift warnings</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={notifPush} onChange={(e) => setNotifPush(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

              </div>

              {/* Connected Accounts */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/30">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" /> Connected Account Vaults
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black">ABHA</span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">National Health Authority Portal</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Connected and verified client gateway</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">Linked</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black">G</span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">Google Workspace Account</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Connected for Calendar Sync</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => triggerToast("Google account credentials updated successfully.")}
                      className="text-[10px] text-emerald-600 font-bold hover:underline cursor-pointer"
                    >
                      Configure
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-black"></span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">Apple Health Cloud ID</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Not linked</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => triggerToast("Initiating Apple Health integration.")}
                      className="text-[10px] text-emerald-600 font-bold hover:underline cursor-pointer"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone: Delete Account */}
              <div className="border border-red-100 rounded-2xl p-4 bg-red-50/30">
                <h4 className="text-xs font-extrabold text-rose-500 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Danger Zone
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Permanently purge your national ABHA connection keys, medical vaults and patient history files.</p>
                <button 
                  onClick={() => {
                    const confirm = window.confirm("Are you absolutely sure you want to request permanent erasure of this health profile record from the cloud registry?");
                    if (confirm) {
                      triggerToast("Profile erasure queued. Security authorization sent to your phone.", true);
                    }
                  }}
                  className="px-4 py-2 bg-red-50 text-rose-500 hover:bg-red-100 border border-red-200 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  Delete Profile Vault
                </button>
              </div>

            </div>
          </div>

          {/* PROFILE CARD 6: DEVICE & SECURITY SESSIONS */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xs p-6 text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Active Devices & Session Logs</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Revoke tokens or analyze access metadata</p>
              </div>
            </div>

            <div className="space-y-3">
              {devices.map((dev) => {
                const IconComp = dev.icon;
                return (
                  <div key={dev.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-100/50 transition-all">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{dev.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{dev.location} • {dev.status}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleRevokeDevice(dev.id, dev.name)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-red-50 border border-slate-200 dark:border-slate-700 hover:border-red-200 text-slate-500 dark:text-slate-400 hover:text-rose-500 text-[10px] font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Revoke Key
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PROFILE CARD 7: RECENT ACTIVITY TIMELINE */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-xs p-6 text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Recent Profile Audits</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Timeline logs of recent actions and integrations</p>
              </div>
            </div>

            <div className="relative border-l-2 border-emerald-100 pl-6 ml-3 space-y-6">
              {activities.map((act) => (
                <div key={act.id} className="relative text-xs">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white bg-emerald-600 shadow-xs flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">{act.date}</span>
                    <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{act.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{act.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* --- PHOTO MANAGEMENT MODAL --- */}
      <AnimatePresence>
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-2xl max-w-lg w-full overflow-hidden text-left"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-600" /> Manage Profile Picture
                </h3>
                <button 
                  onClick={() => {
                    stopCamera();
                    setIsPhotoModalOpen(false);
                  }}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 dark:text-slate-400 rounded-full transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
              />

              <div className="p-6 space-y-6">
                
                {/* Image Editor Stage */}
                <div className="relative w-full aspect-square max-h-[280px] bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-300">
                  {cameraActive ? (
                    <video 
                      ref={videoRef} 
                      className="w-full h-full object-cover transform scale-x-[-1]"
                      playsInline
                      muted
                    />
                  ) : tempPhotoUrl ? (
                    <div className="w-full h-full relative flex items-center justify-center">
                      <img 
                        src={tempPhotoUrl} 
                        alt="Preview" 
                        style={{
                          transform: `scale(${photoZoom}) translate(${photoOffsetX}px, ${photoOffsetY}px)`,
                          transition: "transform 100ms ease-out"
                        }}
                        className="max-w-full max-h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      {/* Crop Square Frame */}
                      <div className="absolute inset-0 border-4 border-slate-900/60 pointer-events-none flex items-center justify-center">
                        <div className="w-[180px] h-[180px] border-2 border-dashed border-emerald-600 shadow-[0_0_0_9999px_rgba(15,23,42,0.4)] rounded-full" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6 text-slate-400">
                      <Camera className="w-12 h-12 mx-auto text-slate-500 dark:text-slate-400 mb-2" />
                      <p className="text-xs font-bold text-slate-300">No profile photo active</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Maximum upload size is 10 MB. Supported: JPG, PNG, WEBP</p>
                    </div>
                  )}

                  {/* Camera overlays */}
                  {cameraActive && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                      <button 
                        onClick={capturePhoto}
                        className="px-4 py-2 bg-emerald-500 text-white text-[11px] font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Capture Frame
                      </button>
                      <button 
                        onClick={stopCamera}
                        className="px-4 py-2 bg-red-600 text-white text-[11px] font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </div>
                  )}

                  {/* Loading overlay */}
                  {isPhotoLoading && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-xs font-bold">Uploading & Cropping picture...</p>
                    </div>
                  )}

                  {/* Success overlay */}
                  {isPhotoSuccess && (
                    <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-xs flex flex-col items-center justify-center text-white animate-fade-in">
                      <motion.div 
                        initial={{ scale: 0.8 }} 
                        animate={{ scale: 1 }}
                        className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-3"
                      >
                        <Check className="w-6 h-6 text-emerald-600" />
                      </motion.div>
                      <p className="text-xs font-black tracking-wider uppercase">Upload Confirmed!</p>
                    </div>
                  )}
                </div>

                {/* Cropping Controls (Zoom & reposition) */}
                {tempPhotoUrl && !cameraActive && !isPhotoLoading && !isPhotoSuccess && (
                  <div className="space-y-3.5 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 text-xs">
                      <ZoomIn className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-900 dark:text-slate-100 shrink-0">Scale & Crop Zoom:</span>
                      <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="0.1" 
                        value={photoZoom} 
                        onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 w-8 text-right">{photoZoom.toFixed(1)}x</span>
                    </div>

                    {/* Position buttons */}
                    <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-200/60">
                      <span className="font-bold text-slate-900 dark:text-slate-100">Shift Viewport:</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => setPhotoOffsetX(prev => prev - 15)} className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-[10px] font-bold">Left</button>
                        <button onClick={() => setPhotoOffsetX(prev => prev + 15)} className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-[10px] font-bold">Right</button>
                        <button onClick={() => setPhotoOffsetY(prev => prev - 15)} className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-[10px] font-bold">Up</button>
                        <button onClick={() => setPhotoOffsetY(prev => prev + 15)} className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-[10px] font-bold">Down</button>
                        <button 
                          onClick={() => {
                            setPhotoZoom(1);
                            setPhotoOffsetX(0);
                            setPhotoOffsetY(0);
                          }} 
                          className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-bold hover:text-red-500"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold pt-3 border-t border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={triggerFileInput}
                    className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border border-emerald-100"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload</span>
                  </button>

                  <button 
                    onClick={triggerFileInput}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <RefreshCw className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    <span>Change</span>
                  </button>

                  <button 
                    onClick={startCamera}
                    disabled={cameraActive}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border ${
                      cameraActive ? "bg-slate-100 text-slate-400 border-slate-100" : "bg-white border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Camera className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    <span>Take Photo</span>
                  </button>

                  <button 
                    onClick={removePhoto}
                    className="p-3 bg-red-50 hover:bg-red-100 text-rose-500 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all border border-red-100"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Remove</span>
                  </button>
                </div>

              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50">
                <button 
                  onClick={() => {
                    stopCamera();
                    setIsPhotoModalOpen(false);
                  }}
                  className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                
                <button 
                  onClick={savePhoto}
                  disabled={!tempPhotoUrl || isPhotoLoading}
                  className={`px-5 py-2 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs transition-all ${
                    tempPhotoUrl ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  <Check className="w-4 h-4" /> Save Avatar Changes
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
