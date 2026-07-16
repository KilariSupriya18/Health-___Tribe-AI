import React, { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

async function extractTextFromPDF(base64Data: string) {
  try {
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  } catch(e) {
    console.error("PDF Extraction Error", e);
    throw new Error("Unable to extract text.");
  }
}

import { UserAddress } from "./types";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { AddressModal } from "./components/AddressModal";
import {
  Activity,
  Heart,
  Baby,
  Sparkles,
  Brain,
  Bone,
  Smile,
  Search,
  Mic,
  MicOff,
  AlertTriangle,
  PhoneCall,
  MapPin,
  Calendar,
  Clock,
  User,
  Users,
  Briefcase,
  Layers,
  HeartHandshake,
  CheckCircle,
  FileText,
  Upload,
  ShoppingBag,
  Plus,
  Trash2,
  Tag,
  LogOut,
  Sliders,
  Bell,
  RefreshCw,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  Shield,
  HelpCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  CreditCard,
  Check,
  SearchCode,
  Moon,
  Sun,
  ShieldCheck,
  Share2,
  PlusCircle,
  HeartPulse,
  Apple,
  MessageSquare,
  QrCode,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Eye,
  Ear,
  UserCheck,
  Ribbon,
  Droplet,
  Accessibility,
  ShieldAlert,
  Menu,
  Star,
  UploadCloud, X, FileBox, ImageIcon} from "lucide-react";

import {
  Specialty,
  Doctor,
  Hospital,
  FamilyMember,
  TimelineRecord,
  Medicine,
  LabTest,
  Appointment,
  TriageResult,
  DietPlan,
  InteractionResponse,
  ReportAnalysis,
  AdminStats
} from "./types";

import { TRANSLATIONS } from "./translations";
import { motion, AnimatePresence } from "motion/react";
import ProfilePage from "./components/ProfilePage";
import { AICopilotWorkspace } from "./components/AICopilotWorkspace";
import { HealthHistoryTimeline } from "./components/HealthHistoryTimeline";
import { ABHAGateway } from "./components/ABHAGateway";

const SpecialtyIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
  switch (iconName) {
    case "Stethoscope":
      return <Stethoscope className={className} />;
    case "Heart":
      return <Heart className={className} />;
    case "Brain":
      return <Brain className={className} />;
    case "Bone":
      return <Bone className={className} />;
    case "Sparkles":
      return <Sparkles className={className} />;
    case "Baby":
      return <Baby className={className} />;
    case "Lungs":
      return <HeartPulse className={className} />;
    case "Eye":
      return <Eye className={className} />;
    case "Ear":
      return <Ear className={className} />;
    case "UserCheck":
      return <UserCheck className={className} />;
    case "Ribbon":
      return <Ribbon className={className} />;
    case "Droplet":
      return <Droplet className={className} />;
    case "Smile":
      return <Smile className={className} />;
    case "ShieldAlert":
      return <ShieldAlert className={className} />;
    case "FileText":
      return <FileText className={className} />;
    case "Accessibility":
      return <Accessibility className={className} />;
    case "Apple":
      return <Apple className={className} />;
    default:
      return <Activity className={className} />;
  }
};

export default function App() {
  // Navigation / UI Modes
  
  const handleCopilotAction = (action: any) => {
    if (!action) return;
    const type = action.type || action.action;
    const doctorId = action.doctorId;

    const findDoctor = (idOrSlug: string) => {
      if (!idOrSlug) return null;
      // 1. Try exact match in allDoctors
      let doc = allDoctors.find(d => d.id === idOrSlug || d.id.toLowerCase() === idOrSlug.toLowerCase());
      if (doc) return doc;

      // 2. Try matching name/slug keywords (e.g. "rajesh_varma" contains rajesh and varma, or "rajesh" matches "Dr. Rajesh Varma")
      const slug = idOrSlug.toLowerCase();
      doc = allDoctors.find(d => {
        const nameLower = d.name.toLowerCase();
        return nameLower.includes(slug) || slug.includes(nameLower.replace("dr. ", "").trim()) ||
               (slug.includes("rajesh") && nameLower.includes("rajesh")) ||
               (slug.includes("varma") && nameLower.includes("varma"));
      });
      if (doc) return doc;

      // 3. Fallback to current filtered doctors
      doc = doctors.find(d => d.id === idOrSlug || d.id.toLowerCase() === idOrSlug.toLowerCase());
      return doc || null;
    };

    if (type === "OPEN_BOOKING") {
      const doc = findDoctor(doctorId) || allDoctors[0] || doctors[0];
      if (doc) {
        // Switch to the doctors tab
        setActiveTab("doctors");
        // Automatically filter by recommended specialty
        if (doc.specialtyId) {
          setSelectedSpecialtyId(doc.specialtyId);
        } else if (doc.specialty) {
          // Find matching specialty ID or lower-case
          const spec = specialties.find(s => s.name.toLowerCase() === doc.specialty.toLowerCase() || s.id === doc.specialty.toLowerCase());
          if (spec) setSelectedSpecialtyId(spec.id);
        }
        
        // Highlight the card
        setHighlightedDoctorId(doc.id);
        
        // Scroll that doctor's card into view after tab switch renders
        setTimeout(() => {
          const cardElement = document.getElementById(`doctor-card-${doc.id}`);
          if (cardElement) {
            cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 400);

        // Automatically open the booking modal
        setSelectedDoctorForBooking(doc);
        
        triggerToast(`Opening booking reservation with ${doc.name}`);
        
        // Clear highlight after 4 seconds
        setTimeout(() => {
          setHighlightedDoctorId(null);
        }, 4000);
      }
    } else if (type === "OPEN_DOCTOR_PROFILE") {
      const doc = findDoctor(doctorId) || allDoctors[0] || doctors[0];
      if (doc) {
        setViewingDoctorProfile(doc);
        triggerToast(`Viewing profile of ${doc.name}`);
      } else {
        setActiveTab("doctors");
      }
    }
  };

  const [activeTab, setActiveTab] = useState<"home" | "copilot" | "doctors" | "timeline" | "family" | "store" | "admin" | "help" | "profile" | "abha" | "ai-assistant">("home");
  const [sessionMode, setSessionMode] = useState<"patient" | "doctor">("patient");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Responsive UI States
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);
  const [expandedDoctorProfileIds, setExpandedDoctorProfileIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Global Context / Profile state
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Authentication & Dynamic Profile States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("healthtribe_is_logged_in") === "true";
  });
  const [loggedInEmail, setLoggedInEmail] = useState<string>(() => {
    return localStorage.getItem("healthtribe_logged_in_email") || "";
  });
  const [loginEmailInput, setLoginEmailInput] = useState<string>("");
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);

  // Onboarding States for Google Sign-In
  const [isOnboardingActive, setIsOnboardingActive] = useState<boolean>(false);
  const [googleAuthLoading, setGoogleAuthLoading] = useState<boolean>(false);
  const [onboardingForm, setOnboardingForm] = useState({
    fullName: "",
    age: "",
    height: "",
    weight: "",
    phoneNumber: ""
  });

  // Form states for profile editing inside the drawer
  const [editProfileName, setEditProfileName] = useState("");
  const [editProfileAge, setEditProfileAge] = useState<number>(30);
  const [editProfileGender, setEditProfileGender] = useState("Female");
  const [editProfileBloodGroup, setEditProfileBloodGroup] = useState("O+");
  const [editProfileChronic, setEditProfileChronic] = useState("");
  const [editProfileAllergies, setEditProfileAllergies] = useState("");
  const [editProfileMedications, setEditProfileMedications] = useState("");

  // Synchronize editing form state when selected profile changes or drawer opens
  useEffect(() => {
    if (selectedMember) {
      setEditProfileName(selectedMember.name);
      setEditProfileAge(selectedMember.age);
      setEditProfileGender(selectedMember.gender);
      setEditProfileBloodGroup(selectedMember.bloodGroup || "O+");
      setEditProfileChronic(selectedMember.chronicConditions || "");
      setEditProfileAllergies(selectedMember.allergies || "");
      setEditProfileMedications(selectedMember.medications || "");
    }
  }, [selectedMember, isProfileDrawerOpen]);

  // Synchronize active profile with logged-in email on initial load
  useEffect(() => {
    if (familyMembers.length > 0 && loggedInEmail) {
      const email = loggedInEmail.toLowerCase();
      if (email === "kilarisupriya25@gmail.com") {
        const found = familyMembers.find(f => f.email?.toLowerCase() === "kilarisupriya25@gmail.com") || familyMembers.find(f => f.id === "fam-self");
        if (found) setSelectedMember(found);
      } else if (email === "supriya@gmail.com" || email === "supriya@example.com") {
        const found = familyMembers.find(f => f.id === "fam-self");
        if (found) setSelectedMember(found);
      } else if (email === "rami@gmail.com" || email === "father@gmail.com") {
        const found = familyMembers.find(f => f.id === "fam-1");
        if (found) setSelectedMember(found);
      } else if (email === "lakshmi@gmail.com" || email === "mother@gmail.com") {
        const found = familyMembers.find(f => f.id === "fam-2");
        if (found) setSelectedMember(found);
      } else if (email === "karthik@gmail.com" || email === "brother@gmail.com") {
        const found = familyMembers.find(f => f.id === "fam-3");
        if (found) setSelectedMember(found);
      } else {
        const userName = email.split("@")[0];
        const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
        const found = familyMembers.find(f => f.name.toLowerCase() === formattedName.toLowerCase());
        if (found) setSelectedMember(found);
      }
    }
  }, [familyMembers, loggedInEmail]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmailInput || !loginEmailInput.includes("@")) {
      triggerToast("Please enter a valid email address.", true);
      return;
    }

    const email = loginEmailInput.trim().toLowerCase();
    setLoggedInEmail(email);
    setIsLoggedIn(true);
    localStorage.setItem("healthtribe_is_logged_in", "true");
    localStorage.setItem("healthtribe_logged_in_email", email);

    // Dynamic routing/profiling based on email
    if (email.includes("doctor")) {
      setSessionMode("doctor");
      triggerToast("Welcome back, Dr. Arjun Patel! Doctor View activated.");
    } else {
      setSessionMode("patient");
      // Map common emails to existing profiles, or set a dynamic profile
      if (email === "supriya@gmail.com" || email === "supriya@example.com") {
        const found = familyMembers.find(f => f.id === "fam-self");
        if (found) setSelectedMember(found);
        triggerToast("Welcome back, Supriya Kilari!");
      } else if (email === "rami@gmail.com" || email === "father@gmail.com") {
        const found = familyMembers.find(f => f.id === "fam-1");
        if (found) setSelectedMember(found);
        triggerToast("Welcome back, Rami Kilari!");
      } else if (email === "lakshmi@gmail.com" || email === "mother@gmail.com") {
        const found = familyMembers.find(f => f.id === "fam-2");
        if (found) setSelectedMember(found);
        triggerToast("Welcome back, Lakshmi Kilari!");
      } else if (email === "karthik@gmail.com" || email === "brother@gmail.com") {
        const found = familyMembers.find(f => f.id === "fam-3");
        if (found) setSelectedMember(found);
        triggerToast("Welcome back, Karthik Kilari!");
      } else {
        // Create/retrieve dynamic profile for any other email
        const userName = email.split("@")[0];
        const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
        const existingDynamic = familyMembers.find(f => f.name.toLowerCase() === formattedName.toLowerCase());
        
        if (existingDynamic) {
          setSelectedMember(existingDynamic);
          triggerToast(`Welcome back, ${existingDynamic.name}!`);
        } else {
          // Add a new dynamic family member
          const newMember: FamilyMember = {
            id: `fam-${Date.now()}`,
            name: formattedName,
            relation: "Self",
            age: 30,
            gender: "Male",
            bloodGroup: "B+",
            allergies: "None",
            chronicConditions: "None",
            medications: "None"
          };
          
          fetch("/api/family", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newMember)
          }).then(() => {
            setFamilyMembers(prev => [...prev, newMember]);
            setSelectedMember(newMember);
          });
          
          triggerToast(`Welcome to HealthTribe AI, ${formattedName}! Created new clinical profile.`);
        }
      }
    }
  };

  const handleGoogleSignIn = () => {
    setGoogleAuthLoading(true);
    setTimeout(() => {
      setGoogleAuthLoading(false);
      const email = "kilarisupriya25@gmail.com";
      const isComplete = localStorage.getItem("healthtribe_onboarding_complete_kilarisupriya25@gmail.com") === "true";
      
      if (isComplete) {
        setLoggedInEmail(email);
        setIsLoggedIn(true);
        localStorage.setItem("healthtribe_is_logged_in", "true");
        localStorage.setItem("healthtribe_logged_in_email", email);
        
        // Find existing family member matching this email
        const found = familyMembers.find(f => f.email?.toLowerCase() === email) || familyMembers.find(f => f.id === "fam-self");
        if (found) {
          setSelectedMember(found);
        }
        triggerToast("Signed in with Google. Welcome back, Supriya Kilari!");
      } else {
        // Trigger onboarding form with pre-populated demo values
        setOnboardingForm({
          fullName: "Supriya Kilari",
          age: "29",
          height: "165",
          weight: "58",
          phoneNumber: "+91 94021 58210"
        });
        setIsOnboardingActive(true);
        triggerToast("Google Account verified! Please complete your profile setup.");
      }
    }, 1200);
  };

  const handleOnboardingSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const { fullName, age, height, weight, phoneNumber } = onboardingForm;
    
    // Validate required fields
    if (!fullName.trim()) {
      triggerToast("Please enter your Full Name.", true);
      return;
    }
    const ageVal = parseInt(age);
    if (!age || isNaN(ageVal) || ageVal <= 0) {
      triggerToast("Please enter a valid positive Age.", true);
      return;
    }
    const heightVal = parseInt(height);
    if (!height || isNaN(heightVal) || heightVal <= 0) {
      triggerToast("Please enter a valid Height in cm.", true);
      return;
    }
    const weightVal = parseInt(weight);
    if (!weight || isNaN(weightVal) || weightVal <= 0) {
      triggerToast("Please enter a valid Weight in kg.", true);
      return;
    }
    if (!phoneNumber.trim()) {
      triggerToast("Please enter your Phone Number.", true);
      return;
    }

    setLoading(true);
    try {
      // Create new dynamic family member / patient profile on backend
      const newMember = {
        name: fullName,
        relation: "Self",
        age: ageVal,
        gender: "Female",
        bloodGroup: "O+",
        allergies: "Peanuts, Penicillin",
        chronicConditions: "Mild Asthma",
        medications: "Inhaler (SOS)",
        height: `${heightVal} cm`,
        weight: `${weightVal} kg`,
        phone: phoneNumber,
        email: "kilarisupriya25@gmail.com",
        onboardingComplete: true
      };

      const res = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember)
      });
      const data = await res.json();
      
      if (data.success) {
        // Update local states
        setFamilyMembers(prev => {
          // Replace fam-self if it exists or add new
          const filtered = prev.filter(m => m.id !== "fam-self");
          return [...filtered, data.member];
        });
        setSelectedMember(data.member);
        
        // Save complete marker to local storage
        localStorage.setItem("healthtribe_onboarding_complete_kilarisupriya25@gmail.com", "true");
        localStorage.setItem("healthtribe_is_logged_in", "true");
        localStorage.setItem("healthtribe_logged_in_email", "kilarisupriya25@gmail.com");
        
        setLoggedInEmail("kilarisupriya25@gmail.com");
        setIsLoggedIn(true);
        setIsOnboardingActive(false);
        setActiveTab("home");
        
        triggerToast(`Welcome to HealthTribe AI, ${fullName}! Your clinical profile is ready.`);
      } else {
        triggerToast("Failed to save profile setup.", true);
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to save onboarding setup.", true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInEmail("");
    setLoginEmailInput("");
    localStorage.removeItem("healthtribe_is_logged_in");
    localStorage.removeItem("healthtribe_logged_in_email");
    triggerToast("Logged out of HealthTribe session.");
  };

  const handleSaveProfileChanges = async () => {
    if (!selectedMember) return;
    if (!editProfileName.trim()) {
      triggerToast("Name field cannot be left blank.", true);
      return;
    }
    
    setLoading(true);
    try {
      const updatedFields = {
        name: editProfileName,
        age: editProfileAge,
        gender: editProfileGender,
        bloodGroup: editProfileBloodGroup,
        chronicConditions: editProfileChronic,
        allergies: editProfileAllergies,
        medications: editProfileMedications
      };

      const res = await fetch(`/api/family/${selectedMember.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      
      if (data.success) {
        const updatedMember = data.member;
        setFamilyMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
        setSelectedMember(updatedMember);
        triggerToast("Health Profile details updated and synced with ABHA health vault.");
        setIsProfileDrawerOpen(false);
      } else {
        triggerToast("Failed to update profile.", true);
      }
    } catch (err) {
      console.error(err);
      triggerToast("Failed to update health profile.", true);
    } finally {
      setLoading(false);
    }
  };

  // Global Context / Profile state
  const [activeLanguage, setActiveLanguage] = useState<string>("English");
  const t = TRANSLATIONS[activeLanguage] || TRANSLATIONS["English"];
  const [systemNotifications, setSystemNotifications] = useState<string[]>([
    "Your ABHA Health Account has been verified successfully.",
    "Reminder: Dr. Supriya Kilari scheduled for July 10 at 10:30 AM."
  ]);

  // ABHA (Ayushman Bharat Health Account) State
  const [abhaConnected, setAbhaConnected] = useState<boolean>(true);
  const [abhaId, setAbhaId] = useState<string>("91-8042-5192-3301");
  const [abhaConsentHistory, setAbhaConsentHistory] = useState<string[]>([
    "AIMS Super Speciality Hospital granted access on July 4, 2026",
    "HealthTribe AI granted read-access for diagnostics sync"
  ]);

  // Loading & Action States
  const [loading, setLoading] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // App Database / Dynamic States
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [highlightedDoctorId, setHighlightedDoctorId] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timeline, setTimeline] = useState<TimelineRecord[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  // Search, Booking, & Cart States
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState("all");
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [viewingDoctorProfile, setViewingDoctorProfile] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState("2026-07-10");
  const [bookingTime, setBookingTime] = useState("10:30 AM");
  const [bookingNotes, setBookingNotes] = useState("");
  const [selectedBookingType, setSelectedBookingType] = useState<"In-Person" | "Video" | "Voice">("In-Person");

  // AI Triage & Copilot Chat
  const [copilotInput, setCopilotInput] = useState("");

  type MessageStatus = "sending" | "sent" | "failed" | "analysing" | "generating" | "complete";
  interface ChatMessage {
    id?: string;
    sender: "user" | "ai";
    text: string;
    triage?: TriageResult;
    status?: MessageStatus;
  }
  
  const [conversations, setConversations] = useState<{id: string, title: string, updatedAt: string}[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { sender: "ai", text: "Hello Supriya! I am your HealthTribe AI Copilot. Speak or type your symptoms. I will calculate critical safety alarms and guide your next clinical booking.", status: "complete" }
  ]);
  
  // Load conversations on mount
  useEffect(() => {
    fetch("/api/triage/conversations")
      .then(r => r.json())
      .then(d => {
        if (d.conversations && d.conversations.length > 0) {
          setConversations(d.conversations);
          setActiveConversationId(d.conversations[0].id);
          fetchMessages(d.conversations[0].id);
        } else {
          fetch("/api/triage/conversations", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({title: "New Assessment"}) })
            .then(r => r.json())
            .then(d2 => {
              if (d2.conversation) {
                setConversations([d2.conversation]);
                setActiveConversationId(d2.conversation.id);
              }
            });
        }
      });
  }, []);
  
  const fetchMessages = (convId: string) => {
    fetch(`/api/triage/conversations/${convId}/messages`)
      .then(r => r.json())
      .then(d => {
        if (d.messages && d.messages.length > 0) {
          setChatHistory(d.messages);
        } else {
          setChatHistory([{ sender: "ai", text: "Hello Supriya! I am your HealthTribe AI Copilot. Speak or type your symptoms. I will calculate critical safety alarms and guide your next clinical booking.", status: "complete" }]);
        }
      });
  };
  
  const startNewConversation = async () => {
    const r = await fetch("/api/triage/conversations", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({title: "New Assessment"}) });
    const d = await r.json();
    setConversations([d.conversation, ...conversations]);
    setActiveConversationId(d.conversation.id);
    setChatHistory([{ sender: "ai", text: "Hello Supriya! I am your HealthTribe AI Copilot. Speak or type your symptoms. I will calculate critical safety alarms and guide your next clinical booking.", status: "complete" }]);
  };

  const [isRecording, setIsRecording] = useState(false);
  const [latestTriage, setLatestTriage] = useState<TriageResult | null>(null);

  // Dynamic Vitals (EAV model)
  const [patientVitals, setPatientVitals] = useState<Record<string, { metric: string; value: string; status: "Normal" | "High" | "Borderline"; last_updated: string; color: string }[]>>({
    "fam-self": [
      { metric: "Blood Pressure", value: "120/80 mmHg", status: "Normal", last_updated: "Today", color: "text-emerald-400" },
      { metric: "Heart Rate", value: "72 BPM", status: "Normal", last_updated: "Today", color: "text-emerald-400" },
      { metric: "Blood Sugar (HbA1c)", value: "5.6%", status: "Normal", last_updated: "10 May 2026", color: "text-emerald-400" },
      { metric: "Mild Asthma Status", value: "Controlled", status: "Normal", last_updated: "Today", color: "text-emerald-400" }
    ],
    "fam-1": [
      { metric: "Blood Glucose (Fasting)", value: "140 mg/dL", status: "High", last_updated: "Morning", color: "text-rose-400" },
      { metric: "SpO2 (Oxygen Level)", value: "96%", status: "Normal", last_updated: "1 hour ago", color: "text-cyan-400" },
      { metric: "Respiratory Rate", value: "18 bpm", status: "Normal", last_updated: "1 hour ago", color: "text-amber-400" },
      { metric: "Mean Arterial BP", value: "102 mmHg", status: "Borderline", last_updated: "Morning", color: "text-amber-400" }
    ],
    "fam-2": [
      { metric: "Body Fat Percentage", value: "22%", status: "Normal", last_updated: "Yesterday", color: "text-emerald-400" },
      { metric: "Uric Acid", value: "7.2 mg/dL", status: "High", last_updated: "26 May 2026", color: "text-rose-400" },
      { metric: "Thyroid TSH Level", value: "2.4 mIU/L", status: "Normal", last_updated: "2 weeks ago", color: "text-emerald-400" },
      { metric: "Heart Rate (Resting)", value: "68 BPM", status: "Normal", last_updated: "Yesterday", color: "text-emerald-400" }
    ],
    "fam-3": [
      { metric: "Heart Rate (Max)", value: "172 BPM", status: "Normal", last_updated: "During Workout", color: "text-emerald-400" },
      { metric: "ECG Sinus Rhythm", value: "Perfect", status: "Normal", last_updated: "Today", color: "text-emerald-400" },
      { metric: "VO2 Max", value: "52 ml/kg/min", status: "Normal", last_updated: "Yesterday", color: "text-cyan-400" },
      { metric: "SpO2 Level", value: "99%", status: "Normal", last_updated: "Today", color: "text-cyan-400" }
    ],
    "ext-1": [
      { metric: "Blood Pressure", value: "145/95 mmHg", status: "High", last_updated: "5 mins ago", color: "text-rose-400" },
      { metric: "Heart Rate", value: "84 BPM", status: "Borderline", last_updated: "5 mins ago", color: "text-amber-400" },
      { metric: "SpO2 Level", value: "95%", status: "Normal", last_updated: "5 mins ago", color: "text-cyan-400" },
      { metric: "ECG Rhythm", value: "PVC Occasional", status: "Borderline", last_updated: "Real-time", color: "text-amber-400" }
    ],
    "ext-2": [
      { metric: "Intraocular Pressure", value: "18 mmHg", status: "Normal", last_updated: "Yesterday", color: "text-emerald-400" },
      { metric: "Blood Sugar (Fasting)", value: "110 mg/dL", status: "Normal", last_updated: "Yesterday", color: "text-emerald-400" },
      { metric: "Total Cholesterol", value: "210 mg/dL", status: "Borderline", last_updated: "1 week ago", color: "text-amber-400" },
      { metric: "Mean Heart Rate", value: "76 BPM", status: "Normal", last_updated: "Yesterday", color: "text-emerald-400" }
    ]
  });

  const [newVitalMetric, setNewVitalMetric] = useState("");
  const [newVitalValue, setNewVitalValue] = useState("");
  const [newVitalStatus, setNewVitalStatus] = useState<"Normal" | "High" | "Borderline">("Normal");

  const addCustomVital = () => {
    if (!newVitalMetric || !newVitalValue) {
      triggerToast("Please specify both a Metric Name and a Value to record the vital dynamically.", true);
      return;
    }
    const color = newVitalStatus === "High" ? "text-rose-400" : newVitalStatus === "Borderline" ? "text-amber-400" : "text-emerald-400";
    const newVital = {
      metric: newVitalMetric,
      value: newVitalValue,
      status: newVitalStatus,
      last_updated: "Just now",
      color
    };
    setPatientVitals(prev => ({
      ...prev,
      [doctorSelectedPatientId]: [...(prev[doctorSelectedPatientId] || []), newVital]
    }));
    triggerToast(`EAV Record Inserted: Added custom vital metric "${newVitalMetric}" for selected patient.`);
    setNewVitalMetric("");
    setNewVitalValue("");
  };

  // Post-Consultation State (Diet & Interaction Warning)
  const [dietDiagnosis, setDietDiagnosis] = useState("");
  const [activeDietPlan, setActiveDietPlan] = useState<DietPlan | null>(null);
  const [medsToCompare, setMedsToCompare] = useState<string[]>(["Metformin 500mg", "Atorvastatin 10mg"]);
  const [newMedInput, setNewMedInput] = useState("");
  const [interactionResult, setInteractionResult] = useState<InteractionResponse | null>(null);

  // Health Records File Parsing / OCR Scanner
  const [customRecordTitle, setCustomRecordTitle] = useState("");
  const [customRecordCategory, setCustomRecordCategory] = useState("Consultation");
  const [customRecordDetails, setCustomRecordDetails] = useState("");
  const [reportTextToAnalyze, setReportTextToAnalyze] = useState("");
  const [reportAnalysisResult, setReportAnalysisResult] = useState<ReportAnalysis | null>(null);
  const [reportFiles, setReportFiles] = useState<{name: string, size: number, data: string, mimeType: string, preview?: string}[]>([]);
  const [isDraggingReport, setIsDraggingReport] = useState(false);
  const [reportAnalysisStage, setReportAnalysisStage] = useState<string>("");
  const [reportAnalysisError, setReportAnalysisError] = useState<string | null>(null);
  const reportFileInputRef = useRef<HTMLInputElement>(null);

  // Store Cart
  const [cart, setCart] = useState<Array<{ medicine: Medicine; quantity: number }>>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([
    { id: "1", fullName: "Default User", mobile: "9999999999", house: "HSR Layout", area: "Sector 3", city: "Bangalore", state: "Karnataka", pincode: "560102", isDefault: true }
  ]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress>(addresses[0]);
  const [deliveryAddress, setDeliveryAddress] = useState(
    `${selectedAddress.house}, ${selectedAddress.area}, ${selectedAddress.city}`
  );
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  useEffect(() => {
    setDeliveryAddress(`${selectedAddress.house}, ${selectedAddress.area}, ${selectedAddress.city}`);
  }, [selectedAddress]);

  const handleIncrease = (id: string) => {
    setCart(cart.map(item => item.medicine.id === id ? { ...item, quantity: item.quantity + 1 } : item));
  };

  const handleDecrease = (id: string) => {
    const item = cart.find(i => i.medicine.id === id);
    if (item && item.quantity === 1) {
      setItemToRemove(id);
    } else if (item) {
      setCart(cart.map(i => i.medicine.id === id ? { ...i, quantity: i.quantity - 1 } : i));
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.medicine.id !== id));
    setItemToRemove(null);
  };

  // Family Unique Code Joiner State
  const [familyUniqueCode, setFamilyUniqueCode] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [adherenceReminders, setAdherenceReminders] = useState([
    { id: '1', name: 'Metformin 500mg', time: 'Afternoon • After Meal', completed: false },
    { id: '2', name: 'Atorvastatin 10mg', time: 'Bedtime • 10:00 PM', completed: false }
  ]);

  const markAsTaken = (id: string) => {
    setAdherenceReminders(prev => prev.map(item => item.id === id ? {...item, completed: true} : item));
    triggerToast("✅ Medicine marked as taken.");
  };
  const [newMemberRelation, setNewMemberRelation] = useState("Parent");
  const [newMemberAge, setNewMemberAge] = useState("");
  const [newMemberGender, setNewMemberGender] = useState("Female");
  const [newMemberAllergies, setNewMemberAllergies] = useState("");

  const [editMemberId, setEditMemberId] = useState<string>("");
  const [editMemberName, setEditMemberName] = useState<string>("");
  const [editMemberRelation, setEditMemberRelation] = useState<string>("Parent");
  const [editMemberAge, setEditMemberAge] = useState<string>("");
  const [editMemberGender, setEditMemberGender] = useState<string>("Female");
  const [editMemberAllergies, setEditMemberAllergies] = useState<string>("");
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isDeleteMemberModalOpen, setIsDeleteMemberModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(null);
  const [showAllSpecialties, setShowAllSpecialties] = useState<boolean>(false);
  const [showAllAppointments, setShowAllAppointments] = useState<boolean>(false);

  // Video Call Simulation States
  const [videoCallActive, setVideoCallActive] = useState<boolean>(false);
  const [videoDoctor, setVideoDoctor] = useState<Doctor | null>(null);
  const [cameraOn, setCameraOn] = useState<boolean>(true);
  const [micOn, setMicOn] = useState<boolean>(true);
  const [videoCallMuted, setVideoCallMuted] = useState<boolean>(false);

  // Doctor Portal / Diagnostic Command states
  const [doctorSelectedPatientId, setDoctorSelectedPatientId] = useState<string>("fam-self");
  const [doctorVoiceNotesActive, setDoctorVoiceNotesActive] = useState<boolean>(false);
  const [doctorDiagnosisInput, setDoctorDiagnosisInput] = useState("Chronic Hypertension review with mild cardiovascular spasms.");
  const [doctorPrescribedMeds, setDoctorPrescribedMeds] = useState<string>("Metformin 500mg (Once daily after dinner), Atorvastatin 10mg (Before sleep)");
  const [doctorTestRecommendation, setDoctorTestRecommendation] = useState("HbA1c Glucose profile & Fasting Blood Sugar");

  const [ePrescriptions, setEPrescriptions] = useState([
    { id: "erx-1", patient: "Supriya Kilari", abha: "91-8042-5192-3301", drug: "Metformin 500mg", qty: "30 Tablets", manufacturer: "Abbott Pharmaceuticals", status: "Awaiting Signature" },
    { id: "erx-2", patient: "Rami Kilari", abha: "91-3142-9852-2415", drug: "Ramipril 5mg", qty: "15 Tablets", manufacturer: "Cipla Health", status: "Awaiting Signature" },
    { id: "erx-3", patient: "Ramesh Sharma", abha: "91-4451-2244-1234", drug: "Clopidogrel 75mg", qty: "60 Tablets", manufacturer: "Sun Pharma", status: "Awaiting Signature" },
  ]);
  const approvePrescription = (id: string) => {
    setEPrescriptions(prev => prev.map(order => 
      order.id === id ? { ...order, status: "Signed & Approved" } : order
    ));
    triggerToast("E-prescription signed and approved. Dispatch triggered.");
  };

  // Payment Modal States
  const [paymentModalActive, setPaymentModalActive] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(800);
  const [paymentPurpose, setPaymentPurpose] = useState<string>("Consultation Fee");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"upi" | "card" | "gpay" | "cash">("upi");
  const [paymentCardNumber, setPaymentCardNumber] = useState("");
  const [paymentUpiId, setPaymentUpiId] = useState("supriya@upi");

  // Show helpful alerts
  const triggerToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 4000);
    } else {
      setSuccessToast(msg);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  // Fetch initial data
  const loadPlatformData = async () => {
    setLoading(true);
    try {
      const docRes = await fetch(`/api/doctors?specialty=${selectedSpecialtyId}&search=${globalSearchQuery}`);
      const docData = await docRes.json();
      setDoctors(docData.doctors || []);
      setSpecialties(docData.specialties || []);

      // Load all doctors unfiltered once
      const allDocRes = await fetch("/api/doctors");
      const allDocData = await allDocRes.json();
      setAllDoctors(allDocData.doctors || []);

      const hospRes = await fetch("/api/hospitals");
      const hospData = await hospRes.json();
      setHospitals(hospData.hospitals || []);

      const famRes = await fetch("/api/family");
      const famData = await famRes.json();
      setFamilyMembers(famData.familyMembers || []);
      if (famData.familyMembers && famData.familyMembers.length > 0 && !selectedMember) {
        setSelectedMember(famData.familyMembers[0]);
      }

      const apptRes = await fetch("/api/appointments");
      const apptData = await apptRes.json();
      setAppointments(apptData.appointments || []);

      const timeRes = await fetch(`/api/timeline?patientId=${selectedMember?.id || "all"}`);
      const timeData = await timeRes.json();
      setTimeline(timeData.timeline || []);

      const medRes = await fetch("/api/medicines");
      const medData = await medRes.json();
      setMedicines(medData.medicines || []);

      const labRes = await fetch("/api/labs");
      const labData = await labRes.json();
      setLabTests(labData.tests || []);

      // Load Admin Info
      const statRes = await fetch("/api/admin/stats");
      const statData = await statRes.json();
      setAdminStats(statData);

    } catch (err) {
      console.error("Error loading platform state:", err);
      triggerToast("System offline. Heuristic fallback engines active.", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, [selectedSpecialtyId, selectedMember?.id]);

  // Handle Voice / Text triage query
  const handleTriageSubmit = async (textToSend?: string) => {
    const query = textToSend || copilotInput;
    if (!query.trim()) return;
    
    // Ensure we have an active conversation
    let currentConvId = activeConversationId;
    if (!currentConvId) {
       const r = await fetch("/api/triage/conversations", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({title: "Symptom Triage: " + query.substring(0, 20)}) });
       const d = await r.json();
       currentConvId = d.conversation.id;
       setActiveConversationId(d.conversation.id);
       setConversations(prev => [d.conversation, ...prev]);
    }

    const userMsg: ChatMessage = { sender: "user", text: query, status: "sent" };
    setChatHistory(prev => [...prev, userMsg]);
    setCopilotInput("");
    setLoading(true);
    
    // Post user message to db
    fetch(`/api/triage/conversations/${currentConvId}/messages`, {
       method: "POST", headers: {"Content-Type": "application/json"},
       body: JSON.stringify({ message: query, sender: "user", status: "sent" })
    });

    // Stage 1: Sending...
    const aiMessageId = "temp-" + Date.now();
    setChatHistory(prev => [...prev, { id: aiMessageId, sender: "ai", text: "Sending...", status: "sending" }]);

    setTimeout(() => {
      // Stage 2: Reviewing...
      setChatHistory(prev => prev.map(m => m.id === aiMessageId ? { ...m, text: "Reviewing your symptoms against clinical knowledge graph...", status: "analysing" } : m));
      
      setTimeout(async () => {
        // Stage 3: Generating...
        setChatHistory(prev => prev.map(m => m.id === aiMessageId ? { ...m, text: "Generating triage assessment...", status: "generating" } : m));
        
        try {
          const response = await fetch("/api/triage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: query,
              history: chatHistory.map(m => ({ sender: m.sender, text: m.text })),
              familyMemberId: selectedMember?.id || "fam-self"
            })
          });
          const result: TriageResult = await response.json();
          setLatestTriage(result);
          
          setChatHistory(prev => prev.map(m => m.id === aiMessageId ? { ...m, text: result.aiDoctorResponse, triage: result, status: "complete" } : m));
          
          // Post AI message to db
          fetch(`/api/triage/conversations/${currentConvId}/messages`, {
             method: "POST", headers: {"Content-Type": "application/json"},
             body: JSON.stringify({ message: result.aiDoctorResponse, sender: "ai", triage: result, status: "complete" })
          });
          
          if (result.urgency === "RED" || result.urgency === "ORANGE") {
            setSystemNotifications(prev => [
              `⚠️ Triage alert: ${result.urgency} safety concerns registered for ${selectedMember?.name}.`,
              ...prev
            ]);
          }
          triggerToast("Symptoms processed with clinical safety algorithms.");
        } catch (err) {
          setChatHistory(prev => prev.map(m => m.id === aiMessageId ? { ...m, text: "Failed to generate assessment. Please try again.", status: "failed" } : m));
        } finally {
          setLoading(false);
        }
      }, 1000);
    }, 1000);
  };

  // Simulate Voice input to symptoms
  const handleVoiceTrigger = () => {
    if (isRecording) {
      setIsRecording(false);
      const phrases = [
        "I have sudden chest tightness and radiating pain in my left arm.",
        "Experiencing chronic high blood sugar spikes with mild dizziness.",
        "My child has severe skin rashes, fever, and coughing.",
        "Regular general consultation for thyroid and medication review."
      ];
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      setCopilotInput(phrase);
      triggerToast("Voice transcribed successfully!");
    } else {
      setIsRecording(true);
      triggerToast("AI listening... Click again to transcribe.");
    }
  };

  // Launch simulated video call
  const startVideoCall = (doc?: Doctor) => {
    if (!doc) {
      triggerToast("Doctor metadata is loading, please try again in a moment.", true);
      return;
    }
    setVideoDoctor(doc);
    setVideoCallActive(true);
    triggerToast(`Calling ${doc.name}... Connecting real-time room.`);
  };

  // Trigger payment gateway
  const openPaymentGate = (amount: number, purpose: string) => {
    setPaymentAmount(amount);
    setPaymentPurpose(purpose);
    setPaymentModalActive(true);
  };

  const executePayment = () => {
    setPaymentModalActive(false);
    triggerToast(`Payment of ₹${paymentAmount} processed successfully via ${selectedPaymentMethod.toUpperCase()}`);
    
    // Auto insert transaction timeline
    if (paymentPurpose.includes("Consultation")) {
      handleBookAppointment();
    } else if (paymentPurpose.includes("Medicine")) {
      checkoutCart();
    }
  };

  const [appointmentFilter, setAppointmentFilter] = useState<"Upcoming" | "Completed" | "Cancelled">("Upcoming");

  // Book Appointment Handler
  const handleBookAppointment = async () => {
    if (!selectedDoctorForBooking || !selectedMember) return;
    setLoading(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctorForBooking.id,
          patientId: selectedMember.id,
          date: bookingDate,
          time: bookingTime,
          type: selectedBookingType,
          notes: bookingNotes || "Direct Booking via Specialist Channel"
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast(`Booking with ${selectedDoctorForBooking.name} confirmed!`);
        setSelectedDoctorForBooking(null);
        setBookingNotes("");
        loadPlatformData();
        setActiveTab("home");
      }
    } catch (err) {
      triggerToast("Booking error.", true);
    } finally {
      setLoading(false);
    }
  };

  // Reschedule Appointment
  const handleReschedule = async (apptId: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/appointments/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: apptId,
          date: "2026-07-15",
          time: "11:30 AM"
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast("Appointment rescheduled to July 15 at 11:30 AM");
        loadPlatformData();
      }
    } catch (err) {
      triggerToast("Rescheduling failed.", true);
    } finally {
      setLoading(false);
    }
  };

  // Cancel Appointment
  const handleCancelAppointment = async (apptId: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: apptId })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast("Appointment has been cancelled successfully.");
        loadPlatformData();
      }
    } catch (err) {
      triggerToast("Cancellation failed.", true);
    } finally {
      setLoading(false);
    }
  };

  // Add Family Member manually
  const handleCreateFamilyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName) return;
    setLoading(true);
    try {
      const response = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newMemberName,
          relation: newMemberRelation,
          age: Number(newMemberAge) || 45,
          gender: newMemberGender,
          bloodGroup: "B+",
          allergies: newMemberAllergies || "None",
          chronicConditions: "Hypertension",
          medications: "None"
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast(`Health profile created for ${newMemberName}`);
        setNewMemberName("");
        setNewMemberAge("");
        setNewMemberAllergies("");
        loadPlatformData();
      }
    } catch (err) {
      triggerToast("Failed to create family record.", true);
    } finally {
      setLoading(false);
    }
  };


  const openEditMemberModal = (member: FamilyMember) => {
    setEditMemberId(member.id);
    setEditMemberName(member.name);
    setEditMemberRelation(member.relation || "Spouse");
    setEditMemberAge(member.age?.toString() || "");
    setEditMemberGender(member.gender || "Female");
    setEditMemberAllergies(member.allergies || "");
    setIsEditMemberModalOpen(true);
  };

  const handleUpdateFamilyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMemberName) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/family/${editMemberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editMemberName,
          relation: editMemberRelation,
          age: Number(editMemberAge) || 45,
          gender: editMemberGender,
          allergies: editMemberAllergies || "None",
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast(`Health profile updated for ${editMemberName}`);
        if (selectedMember?.id === editMemberId) {
          setSelectedMember(data.member);
        }
        setIsEditMemberModalOpen(false);
        loadPlatformData();
      } else {
        triggerToast("Failed to update profile.", true);
      }
    } catch (err) {
      triggerToast("Failed to update family record.", true);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteMemberModal = (member: FamilyMember) => {
    setMemberToDelete(member);
    setIsDeleteMemberModalOpen(true);
  };

  const handleDeleteFamilyProfile = async () => {
    if (!memberToDelete) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/family/${memberToDelete.id}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        triggerToast(`Deleted health profile for ${memberToDelete.name}`);
        if (selectedMember?.id === memberToDelete.id) {
          const remaining = familyMembers.filter(m => m.id !== memberToDelete.id);
          setSelectedMember(remaining.length > 0 ? remaining[0] : null);
        }
        setIsDeleteMemberModalOpen(false);
        setMemberToDelete(null);
        loadPlatformData();
      } else {
        triggerToast("Failed to delete profile.", true);
      }
    } catch (err) {
      triggerToast("Failed to delete family record.", true);
    } finally {
      setLoading(false);
    }
  };
  // Link member using Unique Code
  const handleLinkUniqueCode = () => {
    if (!familyUniqueCode) {
      triggerToast("Please input a valid unique link code.", true);
      return;
    }
    triggerToast(`Sync request approved. Connected to profile linked with ABHA record of ${familyUniqueCode}`);
    setFamilyUniqueCode("");
    // Insert mock record
    setFamilyMembers(prev => [
      ...prev,
      {
        id: `fam-linked-${Date.now()}`,
        name: "Devi Prasad Kilari",
        relation: "Grandfather",
        age: 79,
        gender: "Male",
        bloodGroup: "O-",
        allergies: "Contrast dyes",
        chronicConditions: "Chronic Kidney Disease",
        medications: "Erythropoietin injections"
      }
    ]);
  };

  // Prescription Generator by Doctor
  const handleDoctorSubmitPrescription = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Dr. Prescription: Cardiac & Hypertension Management`,
          patientId: doctorSelectedPatientId,
          category: "Prescription",
          doctorName: "Dr. Supriya Kilari (You)",
          details: `Diagnosis: ${doctorDiagnosisInput}Prescribed Meds: ${doctorPrescribedMeds}Required Labs: ${doctorTestRecommendation}`
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast("Digital prescription compiled & synchronized to patient's ABHA account.");
        setDoctorDiagnosisInput("");
        setDoctorPrescribedMeds("");
        setDoctorTestRecommendation("");
        loadPlatformData();
      }
    } catch (err) {
      triggerToast("Failed to write clinical summary.", true);
    } finally {
      setLoading(false);
    }
  };

  // Generate customized post-consultation diet
  const handleGenerateDiet = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosis: dietDiagnosis || selectedMember?.chronicConditions || "General recovery",
          medications: selectedMember?.medications || "None",
          allergies: selectedMember?.allergies || "None",
          foodPreference: "Balanced Indian"
        })
      });
      const data = await response.json();
      setActiveDietPlan(data);
      triggerToast("Clinical nutrition setup compiled by DietPlan Agent.");
    } catch (err) {
      triggerToast("Diet builder failed.", true);
    } finally {
      setLoading(false);
    }
  };

  // Medicine Interactive Warnings alerts
  const handleAddMedCompare = () => {
    if (!newMedInput.trim()) return;
    if (!medsToCompare.includes(newMedInput.trim())) {
      setMedsToCompare([...medsToCompare, newMedInput.trim()]);
    }
    setNewMedInput("");
  };

  const handleRemoveMedCompare = (med: string) => {
    setMedsToCompare(medsToCompare.filter(m => m !== med));
  };

  const handleResetDb = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (data.success) {
        triggerToast("Database seeds reset successfully!");
        loadPlatformData();
      }
    } catch (err) {
      triggerToast("Failed to reset database.", true);
    } finally {
      setLoading(false);
    }
  };

  const checkDrugInteractions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/interaction-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicines: medsToCompare,
          patientAllergies: selectedMember?.allergies || ""
        })
      });
      const data = await response.json();
      setInteractionResult(data);
      triggerToast("Safety checker cross-referenced against global contraindications.");
    } catch (err) {
      triggerToast("Safety alerts failed.", true);
    } finally {
      setLoading(false);
    }
  };

  // Custom record addition manually
  const handleCreateTimelineRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRecordTitle || !selectedMember) return;
    setLoading(true);
    try {
      const response = await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: customRecordTitle,
          patientId: selectedMember.id,
          category: customRecordCategory,
          details: customRecordDetails,
          doctorName: "Self-Reported Health Profile"
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast("Timeline card logged successfully.");
        setCustomRecordTitle("");
        setCustomRecordDetails("");
        loadPlatformData();
      }
    } catch (err) {
      triggerToast("Error saving diagnostics card.", true);
    } finally {
      setLoading(false);
    }
  };

  // OCR Report Scanner with AI Explanation
  const handleReportFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingReport(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processReportFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleReportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processReportFiles(Array.from(e.target.files));
    }
  };

  const processReportFiles = (files: File[]) => {
    const validFiles = files.filter(f => f.type.startsWith("image/") || f.type === "application/pdf");
    if (validFiles.length === 0) {
      triggerToast("Only images and PDFs are supported.", true);
      return;
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Str = (e.target?.result as string).split(',')[1];
        let preview: string | undefined;
        if (file.type.startsWith("image/")) {
          preview = e.target?.result as string;
        }
        setReportFiles(prev => [...prev, {
          name: file.name,
          size: file.size,
          mimeType: file.type,
          data: base64Str,
          preview
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReportFile = (index: number) => {
    setReportFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyzeReport = async () => {
    if (!reportTextToAnalyze.trim() && reportFiles.length === 0) {
      triggerToast("Provide report text or upload a document.", true);
      return;
    }
    setLoading(true);
    setReportAnalysisStage("Uploading report...");
    setReportAnalysisError(null);
    
    let combinedExtractedText = reportTextToAnalyze;
    
    try {
      if (reportFiles.length > 0) {
        setReportAnalysisStage("Reading PDF...");
        await new Promise(r => setTimeout(r, 400));
        setReportAnalysisStage("Extracting text...");
        
        for (const file of reportFiles) {
          if (file.mimeType === "application/pdf") {
            const extracted = await extractTextFromPDF(file.data);
            combinedExtractedText += "\n\n--- Extracted from " + file.name + " ---\n" + extracted;
          } else if (file.mimeType.startsWith("image/")) {
            // For images, we still need to rely on the backend/Gemini vision if we don't have frontend OCR for images
            // But to avoid Payload Too Large, we'll just send the text we have and warn the user.
            triggerToast("Image text extraction requires backend processing.", false);
          }
        }
      }
      
      setReportAnalysisStage("Analyzing report...");
      
      const response = await fetch("/api/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportText: combinedExtractedText,
          // Only send images if any, otherwise empty to save payload
          files: reportFiles.filter(f => !f.mimeType.includes("pdf")).map(f => ({ data: f.data, mimeType: f.mimeType, name: f.name }))
        })
      });
      
      if (!response.ok) {
         throw new Error("Unable to generate analysis. Please try again.");
      }
      
      setReportAnalysisStage("Generating summary...");
      const data = await response.json();
      
      if (data.error) {
         setReportAnalysisError("Unable to generate analysis. Please try again.");
         triggerToast("Unable to generate analysis. Please try again.", true);
         return;
      }
      
      setReportAnalysisResult(data);
      triggerToast("Biomarkers parsed. Actionable explanation compiled.");
      
      // Auto-save to timeline if patient selected
      if (selectedMember) {
        const summaryText = data.timelineEvent?.details || data.summary || data.clinicalInterpretation || "Lab Report Analyzed";
        const highlightsList = data.timelineEvent?.highlights || (data.findings ? data.findings.filter((f: any) => f.status === 'High' || f.status === 'Low' || f.status === 'Abnormal').map((f: any) => `⚠ ${f.marker} ${f.status}`) : []);
        const riskVal = data.timelineEvent?.riskLevel || (data.overview?.overallStatus?.toLowerCase().includes("attention") ? "Moderate" : "Low");
        
        await fetch("/api/timeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: data.overview?.reportType || (reportFiles.length > 0 ? "AI Analyzed Document: " + reportFiles[0].name : "AI Analyzed Clinical Parameters"),
            patientId: selectedMember.id,
            category: "Lab Report",
            details: summaryText,
            doctorName: "HealthTribe AI Diagnostics",
            highlights: highlightsList,
            riskLevel: riskVal,
            reportAnalysis: data
          })
        });
        loadPlatformData();
      }
      
    } catch (err: any) {
      if (err.message.includes("extract text")) {
         setReportAnalysisError("Unable to extract text.");
         triggerToast("Unable to extract text.", true);
      } else {
         setReportAnalysisError("Unable to generate analysis. Please try again.");
         triggerToast("Unable to generate analysis. Please try again.", true);
      }
    } finally {
      setLoading(false);
      setReportAnalysisStage("");
    }
  };

  // Medicine Store actions
  const addToCart = (med: Medicine) => {
    const existing = cart.find(item => item.medicine.id === med.id);
    if (existing) {
      setCart(cart.map(item => item.medicine.id === med.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { medicine: med, quantity: 1 }]);
    }
    triggerToast(`${med.name} added to pharmacy cart.`);
  };

  const applyCouponCode = async () => {
    if (!couponCode) return;
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        triggerToast(`Promo code ${couponCode.toUpperCase()} matched: ${data.coupon.discountPercent}% off!`);
      } else {
        triggerToast("Invalid promo coupon.", true);
      }
    } catch (err) {
      triggerToast("Coupon validation failure.", true);
    }
  };

  const checkoutCart = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch("/api/medicines/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(item => ({ id: item.medicine.id, quantity: item.quantity })),
          address: deliveryAddress,
          couponCode: appliedCoupon?.code
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast("Medicine dispatch approved. Delivery tracking code live.");
        setCart([]);
        setAppliedCoupon(null);
        setCouponCode("");
        loadPlatformData();
        setActiveTab("timeline");
      }
    } catch (err) {
      triggerToast("Payment validation failure on checkout.", true);
    } finally {
      setLoading(false);
    }
  };

  // Lab Testing reservation
  const handleBookLabTest = async (testId: string) => {
    if (!selectedMember) return;
    setLoading(true);
    try {
      const response = await fetch("/api/labs/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId,
          patientId: selectedMember.id,
          date: "2026-07-08",
          slot: "08:00 AM - 10:00 AM",
          address: "Home Extraction Ward, Bangalore"
        })
      });
      const data = await response.json();
      if (data.success) {
        triggerToast("Home collection slot booked! Record added to medical schedule.");
        loadPlatformData();
        setActiveTab("timeline");
      }
    } catch (err) {
      triggerToast("Failed to lock lab testing slot.", true);
    } finally {
      setLoading(false);
    }
  };

  // Sync ABHA health vault
  const syncAbhaRecords = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      triggerToast("ABHA Health Gateway database synced. Timeline records imported.");
      loadPlatformData();
    }, 1500);
  };

  const quickSymptomClick = (symptom: string) => {
    setCopilotInput(`I am experiencing high grade ${symptom}. Please perform real-time clinical triage.`);
    setActiveTab("copilot");
  };

  const showWelcomeCard = sessionMode === "doctor" && [
    "home",       // Practice Overview
    "copilot",    // Patient Queue
    "timeline"    // Telehealth Room
  ].includes(activeTab);

  return (
    <>
      {!isLoggedIn ? (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"} dark:bg-slate-950 dark:text-slate-200`}>
          {/* SUCCESS TOAST NOTIFIER */}
          {successToast && (
            <div className="fixed top-6 right-6 z-50 flex items-center p-4 bg-emerald-900 border border-emerald-800 text-white rounded-2xl shadow-2xl animate-bounce">
              <CheckCircle className="w-5 h-5 mr-3 text-emerald-300" />
              <span className="text-xs font-bold">{successToast}</span>
            </div>
          )}
          {errorToast && (
            <div className="fixed top-6 right-6 z-50 flex items-center p-4 bg-rose-950 border border-rose-800 text-white rounded-2xl shadow-2xl animate-bounce">
              <AlertTriangle className="w-5 h-5 mr-3 text-rose-300" />
              <span className="text-xs font-bold">{errorToast}</span>
            </div>
          )}

          <div className="absolute top-6 right-6 flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {isOnboardingActive ? (
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-2xl space-y-6 text-left">
              <div className="text-center space-y-1.5">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Create Your Profile</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Please complete this brief first-time clinical profile setup.
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleOnboardingSubmit(); }} className="space-y-4">
                {/* Email Address (Read Only) */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Google Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value="kilarisupriya25@gmail.com"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
                    />
                    <div className="absolute right-3.5 top-3.5 text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Supriya Kilari"
                    value={onboardingForm.fullName}
                    onChange={(e) => setOnboardingForm(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Age (Years) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    placeholder="e.g. 29"
                    value={onboardingForm.age}
                    onChange={(e) => setOnboardingForm(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Height & Weight */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                      Height (cm) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 165"
                      value={onboardingForm.height}
                      onChange={(e) => setOnboardingForm(prev => ({ ...prev, height: e.target.value }))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                      Weight (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 58"
                      value={onboardingForm.weight}
                      onChange={(e) => setOnboardingForm(prev => ({ ...prev, weight: e.target.value }))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 94021 58210"
                    value={onboardingForm.phoneNumber}
                    onChange={(e) => setOnboardingForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOnboardingActive(false)}
                    className="w-1/3 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 cursor-pointer text-center dark:bg-slate-950"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl shadow-lg cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 text-center"
                  >
                    Continue
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
              <div className="flex flex-col items-center">
                <div className="p-3 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-lg shrink-0 mb-3 animate-pulse">
                  <Activity className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">HealthTribe AI</h1>
                <p className="text-xs text-emerald-600 uppercase font-bold tracking-widest mt-1">India Care Gateway</p>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">Secure Healthcare Portal</h2>
                <p className="text-xs text-slate-400">
                  Access your personalized clinical dashboard, sync ABHA health records, order medicines, and connect with physicians.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={loginEmailInput}
                      onChange={(e) => setLoginEmailInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl shadow-lg cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Sign In Securely
                </button>
              </form>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  Or Connect Via
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <button
                type="button"
                disabled={googleAuthLoading}
                onClick={handleGoogleSignIn}
                className="w-full py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
              >
                {googleAuthLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                    <span>Connecting Google Account...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">Sign In with Google</span>
                  </>
                )}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  Demo Quick Access
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setLoginEmailInput("supriya@gmail.com");
                    triggerToast("Selected Supriya Kilari (Patient Demo)");
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-800 rounded-xl text-left cursor-pointer transition-all flex flex-col justify-between"
                >
                  <span className="text-[10px] font-black text-slate-800 dark:text-slate-100 block">Supriya Kilari</span>
                  <span className="text-[9px] text-slate-400 font-mono">supriya@gmail.com</span>
                </button>

                <button
                  onClick={() => {
                    setLoginEmailInput("father@gmail.com");
                    triggerToast("Selected Rami Kilari (Father Demo)");
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-800 rounded-xl text-left cursor-pointer transition-all flex flex-col justify-between"
                >
                  <span className="text-[10px] font-black text-slate-800 dark:text-slate-100 block">Rami Kilari</span>
                  <span className="text-[9px] text-slate-400 font-mono font-bold text-amber-600">father@gmail.com</span>
                </button>

                <button
                  onClick={() => {
                    setLoginEmailInput("mother@gmail.com");
                    triggerToast("Selected Lakshmi Kilari (Mother Demo)");
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-800 rounded-xl text-left cursor-pointer transition-all flex flex-col justify-between"
                >
                  <span className="text-[10px] font-black text-slate-800 dark:text-slate-100 block">Lakshmi Kilari</span>
                  <span className="text-[9px] text-slate-400 font-mono font-bold text-teal-600">mother@gmail.com</span>
                </button>

                <button
                  onClick={() => {
                    setLoginEmailInput("doctor@healthtribe.com");
                    triggerToast("Selected Dr. Arjun Patel (Doctor Demo)");
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-800 rounded-xl text-left cursor-pointer transition-all flex flex-col justify-between"
                >
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 block font-bold">Dr. Arjun Patel</span>
                  <span className="text-[9px] text-emerald-500 font-mono font-bold">doctor@healthtribe.com</span>
                </button>
              </div>

              <p className="text-[9px] text-slate-400 font-medium">
                🔒 Fully encrypted session secured by India National Digital Health Gateway
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className={`h-screen h-[100dvh] overflow-hidden flex flex-col md:flex-row text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors duration-300 ${isDarkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"} dark:bg-slate-950`}>
      
      {/* SUCCESS TOAST NOTIFIER */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center p-4 bg-emerald-900 border border-emerald-800 text-white rounded-2xl shadow-2xl animate-bounce">
          <CheckCircle className="w-5 h-5 mr-3 text-emerald-300" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}
      {errorToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center p-4 bg-rose-950 border border-rose-800 text-white rounded-2xl shadow-2xl animate-bounce">
          <AlertTriangle className="w-5 h-5 mr-3 text-rose-300" />
          <span className="text-xs font-bold">{errorToast}</span>
        </div>
      )}

      {/* SWIGGY / INSTAMART-LIKE DUAL WORKSPACE TOGGLE */}
      <div className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white rounded-full p-1.5 shadow-2xl flex items-center gap-1 border border-slate-800">
        <button
          onClick={() => {
            setSessionMode("patient");
            triggerToast("Switched Workspace to Patient Portal.");
          }}
          className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
            sessionMode === "patient" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <User className="w-3.5 h-3.5" /> Patient View
        </button>
        <button
          onClick={() => {
            setSessionMode("doctor");
            triggerToast("Switched Workspace to Practitioner Dashboard.");
          }}
          className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
            sessionMode === "doctor" ? "bg-teal-700 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" /> Doctor View
        </button>
      </div>

      {/* 1. SIDE NAVIGATION BAR - HIGHLY RESPONSIVE (Mini Sidebar on Tablet, Hidden on Mobile, Expanded on Desktop) */}
      <aside className={`hidden md:flex flex-col justify-between border-r shrink-0 transition-all duration-300 overflow-y-auto ${sidebarCollapsed ? "w-20" : "w-64"} ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} dark:bg-slate-900 dark:border-slate-800`}>
        <div className={sidebarCollapsed ? "p-3" : "p-4 lg:p-6"}>
          {/* Brand Logo */}
          <div className={`flex items-center gap-3 cursor-pointer mb-8 ${sidebarCollapsed ? "justify-center" : "justify-start"}`} onClick={() => setActiveTab("home")}>
            <div className="p-2 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-lg shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="text-left animate-fade-in">
                <span className="text-sm lg:text-base font-extrabold tracking-tight block">
                  HealthTribe AI
                </span>
                <span className="text-[9px] text-emerald-600 uppercase font-bold tracking-wider">
                  India Care Gateway
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            {!sidebarCollapsed && (
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-3 animate-fade-in">
                {sessionMode === "patient" ? "Patient Portal" : "Doctor Portal"}
              </h3>
            )}
            
            <nav className="space-y-1.5">
              {sessionMode === "patient" ? (
                // PATIENT SIDEBAR NAVIGATION LINKS
                <>
                  <button
                    id="patient-nav-home"
                    onClick={() => { setActiveTab("home"); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sidebarCollapsed ? "justify-center" : "justify-start"} ${
                      activeTab === "home"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/10"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                    title={t.homeDashboard}
                  >
                    <Activity className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate animate-fade-in">{t.homeDashboard}</span>}
                    {!sidebarCollapsed && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-auto" title="2 pending medications"></span>
                    )}
                  </button>

                  <button
                    id="patient-nav-copilot"
                    onClick={() => { setActiveTab("copilot"); }}
                    className={`w-full flex items-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sidebarCollapsed ? "justify-center" : "justify-between"} ${
                      activeTab === "copilot"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/10"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                    title={t.aiSymptomTriage}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Brain className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && <span className="truncate animate-fade-in">{t.aiSymptomTriage}</span>}
                    </div>
                    {!sidebarCollapsed && <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-[8px] px-1.5 py-0.5 rounded-md font-extrabold ml-2 shrink-0 animate-fade-in">AI</span>}
                  </button>

                  <button
                    id="patient-nav-doctors"
                    onClick={() => { setActiveTab("doctors"); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sidebarCollapsed ? "justify-center" : "justify-start"} ${
                      activeTab === "doctors"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                    title={t.doctorDiscovery}
                  >
                    <Smile className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate animate-fade-in">{t.doctorDiscovery}</span>}
                  </button>

                  <button
                    id="patient-nav-timeline"
                    onClick={() => { setActiveTab("timeline"); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sidebarCollapsed ? "justify-center" : "justify-start"} ${
                      activeTab === "timeline"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                    title={t.medicalTimeline}
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate animate-fade-in">{t.medicalTimeline}</span>}
                  </button>

                  <button
                    id="patient-nav-abha"
                    onClick={() => { setActiveTab("abha"); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sidebarCollapsed ? "justify-center" : "justify-start"} ${
                      activeTab === "abha"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                    title="ABHA Health Gateway"
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate animate-fade-in">ABHA Sync Gateway</span>}
                  </button>

                  <button
                    id="patient-nav-family"
                    onClick={() => { setActiveTab("family"); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sidebarCollapsed ? "justify-center" : "justify-start"} ${
                      activeTab === "family"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                    title={t.familyVault}
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate animate-fade-in">{t.familyVault}</span>}
                  </button>

                  <button
                    id="patient-nav-store"
                    onClick={() => { setActiveTab("store"); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sidebarCollapsed ? "justify-center" : "justify-start"} ${
                      activeTab === "store"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                    title={t.pharmacyAndLabs}
                  >
                    <ShoppingBag className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate animate-fade-in">{t.pharmacyAndLabs}</span>}
                  </button>

                  <button
                    id="patient-nav-help"
                    onClick={() => { setActiveTab("help"); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sidebarCollapsed ? "justify-center" : "justify-start"} ${
                      activeTab === "help"
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                    title={t.helpSupportSos}
                  >
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate animate-fade-in">{t.helpSupportSos}</span>}
                  </button>
                </>
              ) : (
                // DOCTOR SIDEBAR NAVIGATION LINKS (SEPARATE & DISTINCT)
                <>
                  <button
                    id="doctor-nav-home"
                    onClick={() => { setActiveTab("home"); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sidebarCollapsed ? "justify-center" : "justify-start"} ${
                      activeTab === "home"
                        ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/10"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                    title="Clinic Dashboard"
                  >
                    <Activity className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate animate-fade-in">Practice Overview</span>}
                  </button>

                  <button
                    id="doctor-nav-queue"
                    onClick={() => { setActiveTab("copilot"); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sidebarCollapsed ? "justify-center" : "justify-start"} ${
                      activeTab === "copilot"
                        ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/10"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                    title="Patient Queue"
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate animate-fade-in">Patient Queue</span>}
                    {!sidebarCollapsed && <span className="bg-amber-100 text-amber-950 font-black text-[9px] px-1.5 py-0.5 rounded-md ml-auto animate-fade-in">7 Waiting</span>}
                  </button>

                  <button
                    id="doctor-nav-ai"
                    onClick={() => { setActiveTab("ai-assistant"); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sidebarCollapsed ? "justify-center" : "justify-start"} ${
                      activeTab === "ai-assistant"
                        ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/10"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                    title="Doctor AI Assistant"
                  >
                    <Brain className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate animate-fade-in">AI Assistant</span>}
                  </button>

                  <button
                    id="doctor-nav-prescribe"
                    onClick={() => { setActiveTab("doctors"); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sidebarCollapsed ? "justify-center" : "justify-start"} ${
                      activeTab === "doctors"
                        ? "bg-emerald-700 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                    title="SOAP Prescriber"
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate animate-fade-in">SOAP Prescriber</span>}
                  </button>

                  <button
                    id="doctor-nav-telehealth"
                    onClick={() => { setActiveTab("timeline"); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sidebarCollapsed ? "justify-center" : "justify-start"} ${
                      activeTab === "timeline"
                        ? "bg-emerald-700 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                    title="Telehealth Calls"
                  >
                    <Video className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate animate-fade-in">Telehealth Room</span>}
                  </button>

                  <button
                    id="doctor-nav-analytics"
                    onClick={() => { setActiveTab("family"); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sidebarCollapsed ? "justify-center" : "justify-start"} ${
                      activeTab === "family"
                        ? "bg-emerald-700 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                    title="Practice Insights"
                  >
                    <TrendingUp className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate animate-fade-in">Practice Insights</span>}
                  </button>

                  <button
                    id="doctor-nav-store"
                    onClick={() => { setActiveTab("store"); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sidebarCollapsed ? "justify-center" : "justify-start"} ${
                      activeTab === "store"
                        ? "bg-emerald-700 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                    title="E-Rx Approvals"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate animate-fade-in">E-Rx Approvals</span>}
                  </button>

                  <button
                    id="doctor-nav-help"
                    onClick={() => { setActiveTab("help"); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${sidebarCollapsed ? "justify-center" : "justify-start"} ${
                      activeTab === "help"
                        ? "bg-emerald-700 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                    title="Clinical Guidelines"
                  >
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate animate-fade-in">Practice Guide</span>}
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* ABHA Status Section (Compact on Tablet, detailed on Desktop) */}
          {sessionMode === "patient" && !sidebarCollapsed && (
            <div className="mt-8 hidden md:block animate-fade-in">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-3">ABHA Gateway</h3>
              <div className={`p-4 rounded-2xl border text-left transition-all ${isDarkMode ? "bg-slate-800/80 border-slate-700" : "bg-emerald-50/60 border-emerald-100"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded-md">ABHA LIVE</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs font-bold truncate text-emerald-950">{selectedMember?.name || "Supriya Kilari"}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">{abhaId}</p>
                <button onClick={syncAbhaRecords} className="text-[10px] text-emerald-700 font-bold underline mt-2 flex items-center gap-1 cursor-pointer justify-start w-full">
                  <RefreshCw className="w-3 h-3 animate-spin-hover" /> <span>Sync Diagnostics</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Aside Footer Utilities (Saves space on Tablet) */}
        <div className={sidebarCollapsed ? "p-3 space-y-4" : "p-4 lg:p-6 border-t border-slate-200 dark:border-slate-800 space-y-4"}>
          <div className={`flex items-center justify-between gap-2 ${sidebarCollapsed ? "flex-col" : "flex-row"}`}>
            {!sidebarCollapsed && <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Dark Mode</span>}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className={`flex items-center justify-between gap-2 ${sidebarCollapsed ? "flex-col" : "flex-row"} pt-2 border-t border-slate-100 dark:border-slate-800/60`}>
            {!sidebarCollapsed && <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-bold">Collapse Menu</span>}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full cursor-pointer"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <div className={`flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 ${sidebarCollapsed ? "flex-col" : "flex-row"}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div 
                onClick={() => setActiveTab("profile")}
                className="w-9 h-9 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold rounded-full flex items-center justify-center shrink-0 cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all"
                title="View Health Profile"
              >
                {selectedMember?.name ? selectedMember.name.charAt(0) : "S"}
              </div>
              {!sidebarCollapsed && (
                <div className="text-left overflow-hidden animate-fade-in">
                  <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-100">{selectedMember?.name || "Guest Patient"}</p>
                  <span className="text-[9px] text-slate-400 truncate block font-mono">{loggedInEmail || "Demo Account"}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* STICKY TOP HEADER FOR MOBILE PHONES ONLY */}
      <header className={`flex md:hidden sticky top-0 z-40 h-16 w-full border-b px-4 items-center justify-between shrink-0 transition-all ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} dark:bg-slate-900 dark:border-slate-800`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-xl shadow-md">
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-xs font-black tracking-tight block">HealthTribe AI</span>
              <span className="text-[8px] text-emerald-600 uppercase font-black tracking-wider">India Care Gateway</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Language Switcher on Mobile */}
          <select
            value={activeLanguage}
            onChange={(e) => {
              setActiveLanguage(e.target.value);
              triggerToast(`Language switched to ${e.target.value}`);
            }}
            className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 rounded-xl px-1.5 py-1.5 cursor-pointer max-w-[80px]"
          >
            <option value="English">EN</option>
            <option value="Hindi">HI</option>
            <option value="Telugu">TE</option>
            <option value="Tamil">TA</option>
          </select>

          {/* Quick Role Switcher button on Mobile */}
          <button
            onClick={() => {
              const nextMode = sessionMode === "patient" ? "doctor" : "patient";
              setSessionMode(nextMode);
              setActiveTab("home");
              triggerToast(`Switched to mobile ${nextMode === "patient" ? "Patient Workspace" : "Doctor Practice"}`);
            }}
            className="px-2 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100 rounded-xl text-[9px] font-black cursor-pointer transition-all uppercase"
          >
            {sessionMode === "patient" ? "To Doctor" : "To Patient"}
          </button>

          {/* Quick Profile Drawer Trigger on Mobile */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`p-1.5 rounded-xl cursor-pointer transition-all ${
              activeTab === "profile"
                ? "bg-white text-emerald-600 border border-emerald-200"
                : "bg-emerald-50 dark:bg-slate-800 text-emerald-600 border border-emerald-100 dark:border-slate-700 hover:bg-emerald-100"
            }`}
            title="View Active Profile"
          >
            <User className="w-4 h-4 text-emerald-600" />
          </button>

          {/* Critical SOS Alarm Trigger */}
          <a
            href="tel:102"
            className="p-1.5 bg-rose-600 text-white rounded-xl animate-pulse hover:bg-rose-700"
            title="Emergency Hospital Direct Dial"
          >
            🚨
          </a>
        </div>
      </header>

      {/* MOBILE OVERLAY SIDEBAR DRAWER (OFF-CANVAS) */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileSidebar(false)}
              className="fixed inset-0 z-50 bg-black"
            />
            {/* Sidebar content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col justify-between border-r shadow-2xl p-5 overflow-y-auto ${
                isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-xl shadow-md">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-extrabold tracking-tight block">HealthTribe AI</span>
                      <span className="text-[8px] text-emerald-600 uppercase font-bold tracking-wider">India Care Gateway</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMobileSidebar(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-500 dark:text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-3">
                    {sessionMode === "patient" ? "Patient Portal" : "Doctor Portal"}
                  </h3>
                  
                  <nav className="space-y-1.5">
                    {sessionMode === "patient" ? (
                      <>
                        <button
                          onClick={() => { setActiveTab("home"); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "home" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Activity className="w-4 h-4" />
                          <span>{t.homeDashboard}</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("copilot"); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "copilot" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Brain className="w-4 h-4" />
                            <span>{t.aiSymptomTriage}</span>
                          </div>
                          <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-[8px] px-1.5 py-0.5 rounded-md font-extrabold">AI</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("doctors"); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "doctors" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Smile className="w-4 h-4" />
                          <span>{t.doctorDiscovery}</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("timeline"); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "timeline" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          <span>{t.medicalTimeline}</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("abha"); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "abha" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>ABHA Sync Gateway</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("family"); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "family" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          <span>{t.familyVault}</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("store"); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "store" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>{t.pharmacyAndLabs}</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("help"); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "help" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>{t.helpSupportSos}</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setActiveTab("home"); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "home" ? "bg-emerald-700 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Activity className="w-4 h-4" />
                          <span>Practice Overview</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("copilot"); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "copilot" ? "bg-emerald-700 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          <span>Patient Queue</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("ai-assistant"); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "ai-assistant" ? "bg-emerald-700 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Brain className="w-4 h-4" />
                          <span>AI Assistant</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("doctors"); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "doctors" ? "bg-emerald-700 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          <span>SOAP Prescriber</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("timeline"); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "timeline" ? "bg-emerald-700 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Video className="w-4 h-4" />
                          <span>Telehealth Room</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("family"); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "family" ? "bg-emerald-700 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span>Practice Insights</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("store"); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "store" ? "bg-emerald-700 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>E-Rx Approvals</span>
                        </button>

                        <button
                          onClick={() => { setActiveTab("help"); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === "help" ? "bg-emerald-700 text-white" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Practice Guide</span>
                        </button>
                      </>
                    )}
                  </nav>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Dark Mode</span>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full cursor-pointer"
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 bg-emerald-100 text-emerald-600 font-bold rounded-full flex items-center justify-center shrink-0">
                      {selectedMember?.name ? selectedMember.name.charAt(0) : "S"}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-bold truncate">{selectedMember?.name || "Guest Patient"}</p>
                      <span className="text-[9px] text-slate-400 truncate block font-mono">{loggedInEmail || "Demo Account"}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setShowMobileSidebar(false); }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 h-16 md:hidden flex items-center justify-around border-t px-2 shadow-xl pb-safe transition-all duration-300 ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} dark:bg-slate-900 dark:border-slate-800`}>
        {sessionMode === "patient" ? (
          // PATIENT QUICK MOBILE TABS
          <>
            <button
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${ activeTab === "home" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" : "text-slate-400 hover:text-slate-600" } dark:text-slate-400`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-0.5">Home</span>
            </button>

            <button
              onClick={() => setActiveTab("copilot")}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${ activeTab === "copilot" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" : "text-slate-400 hover:text-slate-600" } dark:text-slate-400`}
            >
              <Brain className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-0.5">Triage</span>
            </button>

            <button
              onClick={() => setActiveTab("doctors")}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${ activeTab === "doctors" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" : "text-slate-400 hover:text-slate-600" } dark:text-slate-400`}
            >
              <Smile className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-0.5">Doctors</span>
            </button>

            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${ activeTab === "timeline" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" : "text-slate-400 hover:text-slate-600" } dark:text-slate-400`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-0.5">Timeline</span>
            </button>

            <button
              onClick={() => setActiveTab("abha")}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${ activeTab === "abha" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" : "text-slate-400 hover:text-slate-600" } dark:text-slate-400`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-0.5">ABHA</span>
            </button>

            <button
              onClick={() => setActiveTab("store")}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${ activeTab === "store" ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" : "text-slate-400 hover:text-slate-600" } dark:text-slate-400`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-0.5">Store</span>
            </button>
          </>
        ) : (
          // DOCTOR QUICK MOBILE TABS
          <>
            <button
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${ activeTab === "home" ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40" : "text-slate-400 hover:text-slate-600" } dark:text-slate-400`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-0.5">Clinic</span>
            </button>

            <button
              onClick={() => setActiveTab("copilot")}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${ activeTab === "copilot" ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40" : "text-slate-400 hover:text-slate-600" } dark:text-slate-400`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-0.5">Queue</span>
            </button>

            <button
              onClick={() => setActiveTab("doctors")}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${ activeTab === "doctors" ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40" : "text-slate-400 hover:text-slate-600" } dark:text-slate-400`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-0.5">SOAP</span>
            </button>

            <button
              onClick={() => setActiveTab("timeline")}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${ activeTab === "timeline" ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40" : "text-slate-400 hover:text-slate-600" } dark:text-slate-400`}
            >
              <Video className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-0.5">Video</span>
            </button>

            <button
              onClick={() => setActiveTab("family")}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${ activeTab === "family" ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40" : "text-slate-400 hover:text-slate-600" } dark:text-slate-400`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-0.5">Stats</span>
            </button>
          </>
        )}
      </nav>

      {/* 2. MAIN WORKING CANVAS */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-20 md:pb-0">
        
        {/* DESKTOP STATUS NAV BAR (Hidden on mobile) */}
        <header className={`hidden md:flex h-16 border-b px-8 items-center justify-between sticky top-0 z-30 shrink-0 transition-colors ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} dark:bg-slate-900 dark:border-slate-800`}>
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {sessionMode === "patient" ? t.patientWorkspace : t.clinicalPractitioner}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Health Profile Button */}
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-3 py-2 font-extrabold text-xs rounded-xl transition-all cursor-pointer border shadow-xs ${
                activeTab === "profile"
                  ? "bg-white text-emerald-600 border-emerald-200"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700"
              }`}
              title="View and Edit Active Clinical Profile"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Profile: {selectedMember?.name || "Patient"}</span>
            </button>

            {/* Language Selection */}
            <select
              value={activeLanguage}
              onChange={(e) => {
                setActiveLanguage(e.target.value);
                triggerToast(`Switched interface layout language to ${e.target.value}`);
              }}
              className="bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 cursor-pointer border border-transparent dark:border-slate-700"
            >
              <option value="English">🇮🇳 English</option>
              <option value="Hindi">🇮🇳 Hindi (हिंदी)</option>
              <option value="Telugu">🇮🇳 Telugu (తెలుగు)</option>
              <option value="Tamil">🇮🇳 Tamil (தமிழ்)</option>
              <option value="Kannada">🇮🇳 Kannada (ಕನ್ನಡ)</option>
              <option value="Malayalam">🇮🇳 Malayalam (മലയാളം)</option>
              <option value="Marathi">🇮🇳 Marathi (मராठी)</option>
              <option value="Gujarati">🇮🇳 Gujarati (ગુજરાતી)</option>
              <option value="Bengali">🇮🇳 Bengali (বাংলা)</option>
              <option value="Punjabi">🇮🇳 Punjabi (ਪੰਜਾਬੀ)</option>
              <option value="Odia">🇮🇳 Odia (ଓଡ଼ିଆ)</option>
            </select>
          </div>
        </header>

        {/* BODY WORKFLOW */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 flex-1">
          
          {/* PATIENT PORTAL INTERFACES */}
          {sessionMode === "patient" && (
            <>
              {/* TAB 1: DASHBOARD */}
              {activeTab === "home" && (
                <div className="space-y-8 max-w-[1250px] mx-auto w-full text-left">
                  {/* HERO HEADER */}
                  <div className="bg-gradient-to-br from-emerald-800 to-teal-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl">
                    <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-emerald-600/20 to-transparent blur-3xl"></div>
                    <div className="relative z-10 max-w-xl">
                      <span className="bg-emerald-600/30 text-emerald-300 text-xs font-extrabold tracking-widest uppercase px-3 py-1 rounded-full mb-4 inline-block">
                        {t.heroBadge}
                      </span>
                      <h1 className="text-3xl font-extrabold tracking-tight mb-2 leading-tight">
                        {t.heroTitle}
                      </h1>
                      <p className="text-sm text-emerald-100/90 mb-6 leading-relaxed">
                        {t.heroSub}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => {
                            setCopilotInput("I am having sudden chest tightness and radiating pain.");
                            setActiveTab("copilot");
                          }}
                          className="px-5 py-3 bg-white dark:bg-slate-900 text-emerald-900 font-bold rounded-xl shadow-lg hover:bg-slate-100 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Brain className="w-4 h-4 text-emerald-700" /> Start AI Triage
                        </button>
                        <button
                          onClick={() => setActiveTab("doctors")}
                          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          Book Doctor Consultation
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE LIVE MEDICINE REMINDERS */}
                  <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
                        <h3 className="font-extrabold text-sm text-amber-950">Live Adherence Reminders</h3>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 uppercase">ABHA CareSync Active</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {adherenceReminders.filter(r => !r.completed).map(rem => (
                        <div key={rem.id} className="p-4 bg-white dark:bg-slate-900 border border-amber-100 rounded-2xl flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                              <Clock className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{rem.name}</p>
                              <span className="text-[10px] text-slate-400">Scheduled: {rem.time}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => markAsTaken(rem.id)}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer"
                          >
                            Taken
                          </button>
                        </div>
                      ))}
                      {adherenceReminders.filter(r => !r.completed).length === 0 && (
                        <p className="text-xs text-amber-800 font-bold">No pending reminders.</p>
                      )}
                    </div>
                  </div>
                  
                  {/* HISTORY */}
                  {adherenceReminders.some(r => r.completed) && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-sm space-y-4">
                      <h3 className="font-extrabold text-sm text-emerald-950">Today's Completed Medications</h3>
                      <div className="space-y-2">
                        {adherenceReminders.filter(r => r.completed).map(rem => (
                          <div key={rem.id} className="p-3 bg-white dark:bg-slate-900 border border-emerald-100 rounded-2xl flex justify-between items-center text-xs">
                             <span className="font-bold">{rem.name}</span>
                             <span className="text-emerald-700 font-bold">Taken</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SPECIALTY DIRECT ROUTER */}
                  <div>
                    <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-4">Find Care by Specialty</h3>
                    <motion.div layout className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(() => {
                        const heroIds = ["gen_physician", "pediatrician", "dermatologist", "orthopedic"];
                        const displayedSpecialties = showAllSpecialties
                          ? specialties
                          : specialties
                              .filter((spec) => heroIds.includes(spec.id))
                              .sort((a, b) => heroIds.indexOf(a.id) - heroIds.indexOf(b.id));

                        return displayedSpecialties.map((spec) => (
                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            key={spec.id}
                            onClick={() => {
                              setSelectedSpecialtyId(spec.id);
                              setActiveTab("doctors");
                            }}
                            className="bg-white dark:bg-slate-900 border border-slate-200/80 hover:border-emerald-500/40 p-5 rounded-2xl text-center cursor-pointer transition-all hover:shadow-md dark:border-slate-800"
                          >
                            <div className="w-12 h-12 mx-auto bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center mb-3">
                              <SpecialtyIcon iconName={spec.icon} className="w-6 h-6" />
                            </div>
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{spec.name}</h4>
                            <span className="text-[10px] text-slate-400 block mt-1">{spec.count} Verified Doctors</span>
                          </motion.div>
                        ));
                      })()}
                    </motion.div>

                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => setShowAllSpecialties(!showAllSpecialties)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl transition-all cursor-pointer border border-emerald-100 shadow-sm"
                      >
                        {showAllSpecialties ? (
                          <>
                            Show Less ↑
                          </>
                        ) : (
                          <>
                            View All Specialties ↓
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ACTIVE APPOINTMENTS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Appointments Schedule */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-6 dark:border-slate-800">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Active Consultation Bookings</h3>
                      
                      {/* Filter Tabs */}
                      <div className="flex gap-2 mb-4 border-b border-slate-200 dark:border-slate-700">
                        {(["Upcoming", "Completed", "Cancelled"] as const).map(status => {
                          const count = appointments.filter(a => a.status === status).length;
                          return (
                            <button
                              key={status}
                              onClick={() => setAppointmentFilter(status)}
                              className={`pb-2 text-xs font-bold border-b-2 transition-all ${ appointmentFilter === status ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-700" } dark:text-slate-300`}
                            >
                              {status} ({count})
                            </button>
                          );
                        })}
                      </div>
                      <motion.div layout className="space-y-4">
                        {(() => {
                          const filteredAppointments = appointments.filter(a => a.status === appointmentFilter);
                          const INITIAL_VISIBLE_APPOINTMENTS = 2;
                          
                          if (filteredAppointments.length === 0) {
                            return <p className="text-xs text-slate-400 py-4 text-center">No {appointmentFilter.toLowerCase()} appointments.</p>;
                          }
                          
                          const visibleAppointments = showAllAppointments 
                            ? filteredAppointments 
                            : filteredAppointments.slice(0, INITIAL_VISIBLE_APPOINTMENTS);
                            
                          return (
                            <>
                              <AnimatePresence>
                                {visibleAppointments.map((appt) => (
                                  <motion.div 
                                    layout
                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    key={appt.id} 
                                    className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3 origin-top"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-xs text-slate-900 dark:text-white">{appt.doctorName}</span>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                        appt.status === "Upcoming" ? "bg-emerald-100 text-emerald-800" :
                                        appt.status === "Completed" ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300" :
                                        "bg-rose-100 text-rose-800"
                                      }`}>
                                        {appt.status}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{appt.specialty} • Patient: {appt.patientName}</p>
                                    
                                    <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
                                      <span>📅 {appt.date}</span>
                                      <span>⏰ {appt.time}</span>
                                    </div>
                                    {appt.status === "Upcoming" && (
                                      <div className="flex gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                                        <button
                                          onClick={() => appt.type === "Video" ? startVideoCall(doctors[0]) : startVideoCall(doctors[0])}
                                          className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                                        >
                                          <Video className="w-3 h-3" /> Connect Video
                                        </button>
                                        <button
                                          onClick={() => handleReschedule(appt.id)}
                                          className="px-2 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-xl cursor-pointer"
                                        >
                                          Reschedule
                                        </button>
                                        <button
                                          onClick={() => handleCancelAppointment(appt.id)}
                                          className="px-2 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-[10px] rounded-xl cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    )}
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                              {filteredAppointments.length > INITIAL_VISIBLE_APPOINTMENTS && (
                                <div className="pt-2">
                                  <button
                                    onClick={() => setShowAllAppointments(!showAllAppointments)}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shadow-sm"
                                  >
                                    {showAllAppointments ? (
                                      "Show Less ▲"
                                    ) : (
                                      `Show ${filteredAppointments.length - INITIAL_VISIBLE_APPOINTMENTS} More Appointments ▼`
                                    )}
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </motion.div>
                    </div>

                    {/* Nearby Emergency Hospitals */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-6 dark:border-slate-800">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Nearby Emergency Trauma Centers</h3>
                      <div className="space-y-3">
                        {hospitals.map((hosp) => (
                          <div key={hosp.id} className="p-3 bg-rose-50/40 border border-rose-100/60 rounded-xl space-y-2">
                            <div className="flex justify-between">
                              <h4 className="font-bold text-xs text-rose-950">{hosp.name}</h4>
                              <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">SOS Active</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{hosp.address} • {hosp.distance}</p>
                            <div className="flex justify-between items-center text-[10px] text-emerald-800 font-bold">
                              <span>✓ ABHA / Ayushman Bharat Accepted</span>
                              <span className="text-slate-500 dark:text-slate-400">★ {hosp.rating}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: AI SYMPTOM COPILOT */}
              {activeTab === "copilot" && (
                <div className="max-w-[1100px] mx-auto w-full text-left">
                  <AICopilotWorkspace sessionMode="patient" onAction={handleCopilotAction} />
                </div>
              )}

              {/* TAB 3: DOCTOR DISCOVERY */}
              {activeTab === "doctors" && (
                <div className="space-y-5 max-w-[1250px] mx-auto w-full text-left">
                  {/* Specialized filter bar */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 p-3 sm:p-4 rounded-2xl flex flex-wrap gap-2 items-center justify-between dark:border-slate-800">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSelectedSpecialtyId("all")}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${ selectedSpecialtyId === "all" ? "bg-emerald-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700" } dark:text-slate-300`}
                      >
                        All Specialists
                      </button>
                      {specialties.map((spec) => (
                        <button
                          key={spec.id}
                          onClick={() => setSelectedSpecialtyId(spec.id)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${ selectedSpecialtyId === spec.id ? "bg-emerald-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700" } dark:text-slate-300`}
                        >
                          {spec.name}
                        </button>
                      ))}
                    </div>

                    <div className="text-[10px] text-slate-400 font-bold">
                      {doctors.length} Verified Care Providers
                    </div>
                  </div>

                  {/* DOCTORS RESPONSIVE GRID (2 columns on tablet/desktop, 1 column on mobile) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctors.map((doc) => {
                      const isExpanded = !!expandedDoctorProfileIds[doc.id];
                      return (
                        <div
                          id={`doctor-card-${doc.id}`}
                          key={doc.id}
                          className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                            highlightedDoctorId === doc.id
                              ? "border-emerald-500 ring-4 ring-emerald-500/10 dark:ring-emerald-500/20 scale-[1.01]"
                              : "border-slate-200/80 dark:border-slate-800"
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Doctor Header Block */}
                            <div className="flex items-start gap-3.5">
                              <img
                                src={doc.avatar}
                                alt={doc.name}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{doc.name}</h4>
                                  <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[8px] font-extrabold px-1.5 py-0.5 rounded-sm shrink-0">ABHA Verified</span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">{doc.specialty}</span>
                                  <span>•</span>
                                  <span>{doc.experience} Yrs Exp</span>
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{doc.hospital}</p>
                              </div>
                            </div>

                            {/* Ratings & Quick Bio section */}
                            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 space-y-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Patient Satisfaction</span>
                                <div className="flex items-center gap-1 text-amber-500 font-extrabold">
                                  <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                                  <span>{doc.rating || "4.9"}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">({(doc.experience * 18 + 12)} reviews)</span>
                                </div>
                              </div>

                              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2">
                                <p className={`text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] ${isExpanded ? "" : "line-clamp-2"}`}>
                                  {doc.bio}
                                </p>
                                <button
                                  onClick={() => setExpandedDoctorProfileIds(prev => ({ ...prev, [doc.id]: !isExpanded }))}
                                  className="text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold hover:underline mt-1 cursor-pointer"
                                >
                                  {isExpanded ? "Hide Bio" : "Show Bio & Specialties"}
                                </button>
                              </div>
                            </div>

                            {/* Standard Clinical Metrics */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] pt-1">
                              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/50 pb-1">
                                <span className="text-slate-400">Credentials:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[110px]" title={doc.education}>{doc.education}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/50 pb-1">
                                <span className="text-slate-400">Languages:</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[110px]" title={doc.languages.join(", ")}>{doc.languages.join(", ")}</span>
                              </div>
                            </div>

                            {/* Consultation Fee Badge */}
                            <div className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-2 rounded-xl border border-emerald-100/40 dark:border-emerald-950/40">
                              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">Direct Consultation Fee</span>
                              <span className="font-black text-emerald-800 dark:text-emerald-300 text-sm">₹{doc.fee}</span>
                            </div>
                          </div>

                          <div className="mt-3.5 pt-2 flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedDoctorForBooking(doc);
                                triggerToast(`Selected ${doc.name} for appointment scheduling.`);
                              }}
                              className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
                            >
                              Reserve Slot (In-Person/Video)
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* BOOKING CONFIGURATOR POPUP/MODAL */}
                  {selectedDoctorForBooking && (
                    <div className="fixed inset-0 bg-slate-100/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-left space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Secure Consultation Reservation</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Booking slot with {selectedDoctorForBooking.name}</p>
                          </div>
                          <button
                            onClick={() => setSelectedDoctorForBooking(null)}
                            className="text-slate-400 hover:text-slate-900 font-extrabold text-sm dark:text-white"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Appointment Type</label>
                              <select
                                value={selectedBookingType}
                                onChange={(e) => setSelectedBookingType(e.target.value as any)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-2 focus:ring-emerald-500 font-bold"
                              >
                                <option value="In-Person">In-Person Clinic Visit</option>
                                <option value="Video">Video Call Consultation</option>
                                <option value="Voice">Direct Voice Tele-consult</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Patient Profile</label>
                              <select
                                value={selectedMember?.id || ""}
                                onChange={(e) => {
                                  const member = familyMembers.find(f => f.id === e.target.value);
                                  if (member) setSelectedMember(member);
                                }}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-2 focus:ring-emerald-500 font-bold"
                              >
                                {familyMembers.map((m) => (
                                  <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Desired Date</label>
                              <input
                                type="date"
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-2 focus:ring-emerald-500 font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Time Slot Availability</label>
                              <select
                                value={bookingTime}
                                onChange={(e) => setBookingTime(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-2 focus:ring-emerald-500 font-bold"
                              >
                                {selectedDoctorForBooking?.availabilitySlots?.map((slot) => (
                                  <option key={slot} value={slot}>{slot}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Active Symptoms / Brief Notes</label>
                            <textarea
                              rows={2}
                              value={bookingNotes}
                              onChange={(e) => setBookingNotes(e.target.value)}
                              placeholder="Describe why you want this checkup..."
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-2.5 focus:ring-emerald-500"
                            />
                          </div>

                          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-left space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-emerald-900 font-medium">Verified Consultation Fee:</span>
                              <span className="font-bold text-emerald-950">₹{selectedDoctorForBooking.fee}</span>
                            </div>
                            <p className="text-[10px] text-emerald-700 leading-tight">By pressing continue, you will review instant payment gateways with direct hospital slot lock keys.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => setSelectedDoctorForBooking(null)}
                            className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              if (selectedDoctorForBooking) {
                                openPaymentGate(selectedDoctorForBooking.fee, `Consultation Fee with ${selectedDoctorForBooking.name}`);
                              }
                              setSelectedDoctorForBooking(null);
                            }}
                            className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                          >
                            Pay & Lock Booking Slot
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DOCTOR PROFILE POPUP/MODAL */}
                  {viewingDoctorProfile && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl text-left space-y-6 border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-4">
                            <img 
                              src={viewingDoctorProfile.avatar} 
                              alt={viewingDoctorProfile.name}
                              className="w-16 h-16 rounded-2xl object-cover border border-slate-100 dark:border-slate-800"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{viewingDoctorProfile.name}</h3>
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">ABHA Verified</span>
                              </div>
                              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{viewingDoctorProfile.specialty} • {viewingDoctorProfile.experience} Years Exp</p>
                              <p className="text-[10px] text-slate-400 mt-1">{viewingDoctorProfile.hospital}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setViewingDoctorProfile(null)}
                            className="text-slate-400 hover:text-slate-900 font-extrabold text-sm dark:text-white p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">Professional Biography</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{viewingDoctorProfile.bio}</p>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Education & Credentials:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{viewingDoctorProfile.education}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Consultation Fee:</span>
                            <span className="font-extrabold text-emerald-800 dark:text-emerald-400">₹{viewingDoctorProfile.fee}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Fluent Languages:</span>
                            <span className="font-bold text-slate-600 dark:text-slate-400">{viewingDoctorProfile.languages.join(", ")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Availability:</span>
                            <span className="font-bold text-slate-600 dark:text-slate-400">{viewingDoctorProfile.availabilitySlots?.join(", ") || "Mon - Sat"}</span>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => setViewingDoctorProfile(null)}
                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                          >
                            Close Profile
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDoctorForBooking(viewingDoctorProfile);
                              setViewingDoctorProfile(null);
                            }}
                            className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                          >
                            Book Appointment
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 4: MEDICAL TIMELINE & OCR SCRAPER */}
              {activeTab === "timeline" && (
                <div className="space-y-6 max-w-[1150px] mx-auto w-full text-left">
                  {/* BENTO 1: AI OCR Diagnostics scanner */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 text-left dark:border-slate-800">
                    <div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Smart Diagnostic Scanners
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-2">AI Diagnostic Report Parser (OCR Decoder)</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Paste clinic lab results or diagnostic parameters below. HealthTribe AI parses biomarkers and simplifies clinical explanations.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div
                          className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                            isDraggingReport ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          }`}
                          onDragOver={(e) => { e.preventDefault(); setIsDraggingReport(true); }}
                          onDragLeave={() => setIsDraggingReport(false)}
                          onDrop={handleReportFileDrop}
                        >
                          <input
                            type="file"
                            multiple
                            accept="image/*,application/pdf"
                            ref={reportFileInputRef}
                            className="hidden"
                            onChange={handleReportFileChange}
                          />
                          <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Drag & Drop Medical Reports (PDF, Image)
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">or</p>
                          <button
                            onClick={() => reportFileInputRef.current?.click()}
                            className="mt-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            Browse Files
                          </button>
                        </div>
                        
                        {reportFiles.length > 0 && (
                          <div className="space-y-2">
                            {reportFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  {file.preview ? (
                                    <div className="w-8 h-8 rounded overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                                      <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div className="flex flex-col truncate">
                                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                                    <span className="text-[9px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                                  </div>
                                </div>
                                <button onClick={() => removeReportFile(idx)} className="p-1 text-slate-400 hover:text-rose-500 shrink-0 cursor-pointer">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <textarea
                          rows={3}
                          value={reportTextToAnalyze}
                          onChange={(e) => setReportTextToAnalyze(e.target.value)}
                          placeholder="Or paste blood work parameters e.g., 'HbA1c 7.4%...'"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-3 focus:ring-emerald-500 focus:ring-2"
                        />
                        <button
                          onClick={handleAnalyzeReport}
                          disabled={loading}
                          className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {loading && reportAnalysisStage ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                              {reportAnalysisStage}
                            </>
                          ) : (
                            "Run Smart Diagnostic Analysis"
                          )}
                        </button>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl min-h-[180px]">
                        {loading && reportAnalysisStage ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-medium text-emerald-700 animate-pulse">{reportAnalysisStage}</p>
                          </div>
                        ) : reportAnalysisError ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                            <AlertTriangle className="w-8 h-8 text-rose-500" />
                            <p className="text-sm font-medium text-rose-600">{reportAnalysisError}</p>
                          </div>
                        ) : reportAnalysisResult ? (
                          <div className="space-y-4 text-xs animate-in fade-in zoom-in duration-300">
  {reportAnalysisResult.overview ? (
    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
      <div><span className="text-slate-400 text-[10px] uppercase tracking-wider block">Report Type</span><span className="font-semibold text-slate-700 dark:text-slate-200">{reportAnalysisResult.overview.reportType}</span></div>
      <div><span className="text-slate-400 text-[10px] uppercase tracking-wider block">Date</span><span className="font-semibold text-slate-700 dark:text-slate-200">{reportAnalysisResult.overview.date}</span></div>
      <div><span className="text-slate-400 text-[10px] uppercase tracking-wider block">Status</span>
        <span className={`font-semibold ${reportAnalysisResult.overview.overallStatus.toLowerCase().includes("attention") ? "text-rose-600" : "text-emerald-600"}`}>{reportAnalysisResult.overview.overallStatus}</span>
      </div>
      <div><span className="text-slate-400 text-[10px] uppercase tracking-wider block">AI Confidence</span><span className="font-semibold text-slate-700 dark:text-slate-200">{reportAnalysisResult.overview.confidence}</span></div>
    </div>
  ) : (
    reportAnalysisResult.summary && (
      <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl">
        <p className="font-bold text-emerald-950">AI Summary:</p>
        <p className="text-emerald-800 text-[11px] leading-relaxed mt-0.5">{reportAnalysisResult.summary}</p>
      </div>
    )
  )}
  
  {reportAnalysisResult.clinicalInterpretation && (
    <div>
       <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Clinical Interpretation</h4>
       <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">{reportAnalysisResult.clinicalInterpretation}</p>
    </div>
  )}

  {reportAnalysisResult.findings && reportAnalysisResult.findings.length > 0 && (
    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
      <h4 className="font-bold text-slate-800 dark:text-slate-200 sticky top-0 bg-white dark:bg-slate-900 pt-1 pb-2">Biomarkers & Findings</h4>
      {reportAnalysisResult.findings.map((finding, index) => {
        const isNormal = finding.status === "Normal";
        return (
          <div key={index} className={`p-2.5 rounded-lg border ${isNormal ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900" : "bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900"}`}>
            <div className="flex justify-between items-start mb-1.5">
              <div>
                <span className={`font-bold ${isNormal ? "text-emerald-800 dark:text-emerald-400" : "text-rose-800 dark:text-rose-400"}`}>{finding.marker}</span>
                {finding.trend && <span className="ml-2 text-[9px] uppercase tracking-wider bg-white/60 dark:bg-black/20 px-1.5 py-0.5 rounded">{finding.trend}</span>}
              </div>
              <div className="text-right">
                 <span className={`font-mono font-bold text-sm ${isNormal ? "text-emerald-700 dark:text-emerald-500" : "text-rose-700 dark:text-rose-500"}`}>{finding.value}</span>
                 {finding.referenceRange && <div className="text-[9px] text-slate-500 dark:text-slate-400">Ref: {finding.referenceRange}</div>}
              </div>
            </div>
            {!isNormal && finding.whyItMatters && (
              <div className="text-[10px] text-rose-700/80 dark:text-rose-300/80 leading-snug mt-1">
                <strong>Why it matters:</strong> {finding.whyItMatters}
              </div>
            )}
            {!isNormal && finding.possibleCauses && (
              <div className="text-[10px] text-rose-700/80 dark:text-rose-300/80 leading-snug mt-0.5">
                <strong>Causes:</strong> {finding.possibleCauses}
              </div>
            )}
          </div>
        );
      })}
    </div>
  )}

  {reportAnalysisResult.recommendations && typeof reportAnalysisResult.recommendations === 'object' && !Array.isArray(reportAnalysisResult.recommendations) && (
    <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
      <h4 className="font-bold text-slate-800 dark:text-slate-200">Actionable Recommendations</h4>
      
      {reportAnalysisResult.recommendations.physicianReview && (
        <div className="flex gap-2 text-[11px] text-slate-700 dark:text-slate-300">
           <span className="text-blue-500 mt-0.5">⚕️</span> <span>{reportAnalysisResult.recommendations.physicianReview}</span>
        </div>
      )}
      {reportAnalysisResult.recommendations.repeatTesting && (
        <div className="flex gap-2 text-[11px] text-slate-700 dark:text-slate-300">
           <span className="text-indigo-500 mt-0.5">📅</span> <span>Repeat Testing: {reportAnalysisResult.recommendations.repeatTesting}</span>
        </div>
      )}
      {reportAnalysisResult.recommendations.lifestyleChanges && reportAnalysisResult.recommendations.lifestyleChanges.length > 0 && (
        <div className="flex gap-2 text-[11px] text-slate-700 dark:text-slate-300">
           <span className="text-emerald-500 mt-0.5">🌱</span> 
           <div>
             <strong>Lifestyle:</strong>
             <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
               {reportAnalysisResult.recommendations.lifestyleChanges.map((r, i) => <li key={i}>{r}</li>)}
             </ul>
           </div>
        </div>
      )}
      {reportAnalysisResult.recommendations.medicationsToDiscuss && reportAnalysisResult.recommendations.medicationsToDiscuss.length > 0 && (
        <div className="flex gap-2 text-[11px] text-slate-700 dark:text-slate-300">
           <span className="text-amber-500 mt-0.5">💊</span> 
           <div>
             <strong>Medications to Discuss:</strong>
             <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
               {reportAnalysisResult.recommendations.medicationsToDiscuss.map((r, i) => <li key={i}>{r}</li>)}
             </ul>
           </div>
        </div>
      )}
      {reportAnalysisResult.recommendations.emergencyWarningSigns && reportAnalysisResult.recommendations.emergencyWarningSigns.length > 0 && (
        <div className="flex gap-2 text-[11px] text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg mt-2">
           <span className="mt-0.5">⚠️</span> 
           <div>
             <strong>Emergency Warning Signs:</strong>
             <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
               {reportAnalysisResult.recommendations.emergencyWarningSigns.map((r, i) => <li key={i}>{r}</li>)}
             </ul>
           </div>
        </div>
      )}
    </div>
  )}

  <div className="text-[10px] text-slate-400 leading-tight mt-4 pt-2 border-t border-slate-200 dark:border-slate-800">
    Disclaimer: AI recommendations are for guidance only. Consult your physician for medical advice.
  </div>
</div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 opacity-60">
                            <Activity className="w-8 h-8 text-slate-400" />
                            <p className="text-xs text-slate-500 dark:text-slate-400">AI Report findings will appear here dynamically after processing.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BENTO 2: TIMELINE LIST */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 dark:border-slate-800">
                    <div className="flex flex-wrap justify-between items-center gap-4 text-left">
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">ABHA Linked Medical Timeline</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Historical diagnoses, prescriptions, and metabolic tests</p>
                      </div>

                      {/* Add self manual record */}
                      <button
                        onClick={() => {
                          setCustomRecordTitle("Self Log: Mild tightness & post exercise review");
                          setCustomRecordDetails("Blood Pressure measured at 122/80 at home. Heart rate stable.");
                          triggerToast("Ready to save manually to ABHA records.");
                        }}
                        className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
                      >
                        + Add Custom Record
                      </button>
                    </div>

                    {/* Manual adding panel if state loaded */}
                    {customRecordTitle && (
                      <form onSubmit={handleCreateTimelineRecord} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-3 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={customRecordTitle}
                            onChange={(e) => setCustomRecordTitle(e.target.value)}
                            placeholder="Record Title"
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-2 focus:ring-emerald-500 font-bold w-full"
                          />
                          <select
                            value={customRecordCategory}
                            onChange={(e) => setCustomRecordCategory(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-2 focus:ring-emerald-500 font-bold"
                          >
                            <option value="Consultation">Consultation Record</option>
                            <option value="Lab Report">Lab Report</option>
                            <option value="Prescription">Prescription</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          value={customRecordDetails}
                          onChange={(e) => setCustomRecordDetails(e.target.value)}
                          placeholder="Record Details"
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-2 focus:ring-emerald-500 font-bold w-full"
                        />
                        <div className="flex gap-2">
                          <button type="submit" className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[10px] font-bold cursor-pointer">
                            Log to Timeline
                          </button>
                          <button onClick={() => setCustomRecordTitle("")} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold cursor-pointer">
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-4 pt-2">
                      <HealthHistoryTimeline records={timeline} />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: FAMILY HEALTH VAULT */}
              {activeTab === "family" && (
                <div className="space-y-6 text-left max-w-[1150px] mx-auto w-full">
                  {/* Join Unique Code Section (AS REQUESTED) */}
                  <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-sm text-emerald-400">Dynamic Cross-Account Connection</h3>
                      <p className="text-xs text-slate-300">
                        Connect with another family member who is already using HealthTribe AI via their unique profile access code.
                      </p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <input
                        type="text"
                        value={familyUniqueCode}
                        onChange={(e) => setFamilyUniqueCode(e.target.value)}
                        placeholder="Enter Unique Code (e.g. TRIBE-941)"
                        className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-full md:w-64"
                      />
                      <button
                        onClick={handleLinkUniqueCode}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl whitespace-nowrap cursor-pointer"
                      >
                        Connect Profile
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Add Family Member Profile */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 dark:border-slate-800">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Add New Family Record</h3>
                      
                      <form onSubmit={handleCreateFamilyProfile} className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                          <input
                            type="text"
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            placeholder="Father/Mother/Child Name"
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-xs focus:ring-emerald-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Relation</label>
                            <select
                              value={newMemberRelation}
                              onChange={(e) => setNewMemberRelation(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs focus:ring-emerald-500 font-bold"
                            >
                              <option value="Father">Father</option>
                              <option value="Mother">Mother</option>
                              <option value="Child">Child</option>
                              <option value="Spouse">Spouse</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Age</label>
                            <input
                              type="number"
                              value={newMemberAge}
                              onChange={(e) => setNewMemberAge(e.target.value)}
                              placeholder="Age"
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2 text-xs focus:ring-emerald-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gender</label>
                          <select
                            value={newMemberGender}
                            onChange={(e) => setNewMemberGender(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs focus:ring-emerald-500 font-bold"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Allergies</label>
                          <input
                            type="text"
                            value={newMemberAllergies}
                            onChange={(e) => setNewMemberAllergies(e.target.value)}
                            placeholder="Contrast dyes / Penicillin etc."
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-xs focus:ring-emerald-500"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Save New Profile
                        </button>
                      </form>
                    </div>

                    {/* Show Family Profiles List */}
                    <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 dark:border-slate-800">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active Family Profiles</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {familyMembers.map((member) => (
                          <div
                            key={member.id}
                            onClick={() => {
                              setSelectedMember(member);
                              triggerToast(`Switched active context to ${member.name}`);
                            }}
                            className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${ selectedMember?.id === member.id ? "bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500" : "bg-slate-50 border-slate-200 hover:border-slate-300" } dark:bg-slate-950 dark:border-slate-800`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-emerald-100 text-emerald-800 font-bold rounded-full flex items-center justify-center">
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{member.name}</h4>
                                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 font-bold">
                                  {member.relation}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                              <p>Age: <strong className="text-slate-800 dark:text-slate-200">{member.age}</strong> • Gender: <strong className="text-slate-800 dark:text-slate-200">{member.gender}</strong></p>
                              <p className="truncate">Allergies: <strong className="text-rose-600">{member.allergies || "None"}</strong></p>
                              <p className="truncate">Conditions: <strong className="text-amber-700">{member.chronicConditions || "None"}</strong></p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-between items-center text-[10px] font-mono text-slate-400 dark:border-slate-800">
                              <span>Profile Code: TRIBE-33{member.id.substr(member.id.length - 2)}</span>
                              <div className="flex gap-3">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditMemberModal(member);
                                  }}
                                  className="text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold dark:text-slate-400"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteMemberModal(member);
                                  }}
                                  className="text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-bold dark:text-slate-400"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PHARMACY STORE & LAB TESTING */}
              {activeTab === "store" && (
                <div className="space-y-8 text-left max-w-[1250px] mx-auto w-full">
                  
                  {/* BENTO SECTION: PHARMACY STORE */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Medicines List Grid */}
                    <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 dark:border-slate-800">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Health Pharmacy Store</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {medicines.map((med) => (
                          <div key={med.id} className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{med.name}</h4>
                                {med.rxRequired && (
                                  <span className="text-[8px] bg-rose-100 text-rose-800 font-extrabold px-1 py-0.5 rounded">Rx Required</span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400">{med.manufacturer} • {med.strength}</p>
                              <p className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded w-fit mt-1">
                                {med.category}
                              </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-200/40 flex justify-between items-center dark:border-slate-800">
                              <div>
                                <span className="text-xs font-extrabold text-slate-900 dark:text-white">₹{med.mrp - (med.mrp * med.discount / 100)}</span>
                                <span className="text-[10px] text-slate-400 line-through ml-1.5">₹{med.mrp}</span>
                              </div>
                              <button
                                onClick={() => addToCart(med)}
                                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-xl cursor-pointer"
                              >
                                + Add Cart
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shopping Cart Drawer */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 p-6 rounded-3xl shadow-xs flex flex-col justify-between dark:border-slate-800">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Your Pharmacy Cart</h3>
                        {cart.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-8">Your basket is empty.</p>
                        ) : (
                          <div className="space-y-3">
                            {cart.map((item) => (
                              <div key={item.medicine.id} className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white">{item.medicine.name}</p>
                                  <span className="text-[10px] text-slate-400">Qty: {item.quantity}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    ₹{(item.medicine.mrp - (item.medicine.mrp * item.medicine.discount / 100)) * item.quantity}
                                  </span>
                                  <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
                                    <button onClick={() => handleDecrease(item.medicine.id)} className="w-5 h-5 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded text-xs">−</button>
                                    <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                                    <button onClick={() => handleIncrease(item.medicine.id)} className="w-5 h-5 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded text-xs">+</button>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Coupon code input */}
                            <div className="flex gap-2 pt-3">
                              <input
                                type="text"
                                placeholder="PROMO CODE"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 w-full"
                              />
                              <button
                                onClick={applyCouponCode}
                                className="px-3 py-1 bg-slate-900 text-white text-[10px] rounded-xl font-bold cursor-pointer whitespace-nowrap"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {cart.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex justify-between items-center">
                              <span>Shipping Address:</span>
                              <div className="flex flex-col items-end gap-1">
                                <span className="font-bold text-slate-800 dark:text-slate-200 text-right max-w-[140px] truncate">{deliveryAddress}</span>
                                <button onClick={() => setIsAddressModalOpen(true)} className="text-[9px] font-bold text-emerald-700 underline cursor-pointer">Change Address</button>
                              </div>
                            </div>
                            {appliedCoupon && (
                              <div className="flex justify-between text-emerald-800 font-bold">
                                <span>Promo Discount ({appliedCoupon.code}):</span>
                                <span>- ₹{appliedCoupon.maxDiscount}</span>
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => openPaymentGate(250, "Pharmacy Medicine Order Fulfillment")}
                            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                          >
                            Lock Order & Continue Payment
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* LAB TESTING RESERVATIONS */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 dark:border-slate-800">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Diagnostic Laboratory Packages (Free Home Collection)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {labTests.map((test) => (
                        <div key={test.id} className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between text-left">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {test.tags?.map((tag) => (
                                <span key={tag} className="bg-emerald-100 text-emerald-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{test.name}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{test.description}</p>
                            <p className="text-[10px] text-amber-800 font-bold">Preparation: {test.preparation}</p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-between items-center dark:border-slate-800">
                            <div>
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white">₹{test.price}</span>
                              <span className="text-[10px] text-slate-400 line-through ml-1.5">₹{test.originalPrice}</span>
                            </div>
                            <button
                              onClick={() => handleBookLabTest(test.id)}
                              className="px-3.5 py-1.5 bg-slate-900 text-white font-bold text-[10px] rounded-xl cursor-pointer"
                            >
                              Book Test
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* POST-CONSULTATION AI DIET BUILDER */}
                  <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4">
                    <div className="flex items-center gap-2">
                      <Apple className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-extrabold text-sm text-emerald-400">Post-Consultation AI Diet Plan Agent</h3>
                    </div>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      Based on diagnosed metrics and active medications, HealthTribe AI designs specialized dietary advice that protects against blood sugar surges and stomach irritations.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Diagnosis / Recovering Condition</label>
                        <input
                          type="text"
                          value={dietDiagnosis}
                          onChange={(e) => setDietDiagnosis(e.target.value)}
                          placeholder="e.g. Hypertension, Gastritis, Diabetes..."
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100"
                        />
                        <button
                          onClick={handleGenerateDiet}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Generate Nutrition Guide
                        </button>
                      </div>

                      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 text-xs space-y-3">
                        {activeDietPlan ? (
                          <>
                            <div className="p-2 bg-slate-800 rounded-xl">
                              <p className="font-bold text-emerald-400">Scientific Rationale:</p>
                              <p className="text-slate-300 text-[11px] leading-tight mt-0.5">{activeDietPlan.scientificRationale}</p>
                            </div>
                            <div className="space-y-1 text-[11px]">
                              <p>🥞 <strong>Breakfast:</strong> {activeDietPlan.breakfast}</p>
                              <p>🍲 <strong>Lunch:</strong> {activeDietPlan.lunch}</p>
                              <p>🥗 <strong>Dinner:</strong> {activeDietPlan.dinner}</p>
                              <p>🍎 <strong>Snacks & Fluids:</strong> {activeDietPlan.snacks}</p>
                            </div>
                          </>
                        ) : (
                          <div className="h-full flex items-center justify-center text-center">
                            <p className="text-slate-500 dark:text-slate-400 text-xs py-6">Your customized metabolic menu will display here after processing.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DRUG INTERACTION ALERTS */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 dark:border-slate-800">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Drug-Drug Cross Interaction Safety Alarms</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cross reference active prescriptions against other pills to instantly trigger safety overrides for heart strain or metabolic imbalances.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add medication (e.g. Ramipril, Alcohol)"
                            value={newMedInput}
                            onChange={(e) => setNewMedInput(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs w-full"
                          />
                          <button
                            onClick={handleAddMedCompare}
                            className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                          >
                            Add
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {medsToCompare.map((m) => (
                            <span key={m} className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 font-bold">
                              {m}
                              <button onClick={() => handleRemoveMedCompare(m)} className="text-slate-400 hover:text-slate-900 dark:text-white">✕</button>
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={checkDrugInteractions}
                          className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Run Cross-Med Interaction Audit
                        </button>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl">
                        {interactionResult ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Safety Status:</span>
                              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                                interactionResult.safe ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                              }`}>
                                {interactionResult.safe ? "No critical alarms" : `${interactionResult.alertsCount} Safety Overrides`}
                              </span>
                            </div>

                            <div className="space-y-3 max-h-[140px] overflow-y-auto">
                              {interactionResult.alerts?.map((al, idx) => (
                                <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-rose-100 rounded-xl space-y-1">
                                  <p className="text-rose-900 font-extrabold text-[11px] flex items-center gap-1">
                                    🚨 {al.interaction} ({al.severity})
                                  </p>
                                  <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal">{al.risk}</p>
                                  <p className="text-[10px] text-emerald-800 font-bold">Recommended action: {al.advice}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-center py-6">
                            <p className="text-xs text-slate-400">Interaction safety logs will display here after processing.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 7: HELP SUPPORT FAQ */}
              {activeTab === "help" && (
                <div className="space-y-6 text-left max-w-[1100px] mx-auto w-full">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 dark:border-slate-800">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">HealthTribe Help Center & Safeguards</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Frequently Asked Questions & Operational Guidelines</p>

                    <div className="space-y-3">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mb-1">How does the AI Symptom Triage operate?</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          Our symptom analysis engine integrates with Gemini 3.5-flash to cross-reference your descriptions against verified clinical frameworks. It calculates safety parameters categorized as Green (Routine), Yellow (Same Day), Orange (Within 24 Hours), or Red (Emergency) and coordinates instant hospital / specialist matches.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mb-1">What is India's ABHA ecosystem link?</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          Ayushman Bharat Health Account (ABHA) establishes a secure nationwide framework for consent-based diagnostic records transfer. Connecting your account imports prior scans, thyroid checks, and historical prescriptions straight into your medical timeline automatically.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mb-1">How secure is my data?</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          All health records are strictly locked. No third-party applications can read diagnostic datasets without explicit user authorization requested in our security center.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: PATIENT PROFILE PAGE */}
              {activeTab === "profile" && (
                <div className="max-w-[1100px] mx-auto w-full text-left">
                  <ProfilePage
                    sessionMode="patient"
                    activeMember={selectedMember}
                    onSavePatientProfile={(updatedData) => {
                      if (selectedMember) {
                        const updated = { ...selectedMember, ...updatedData };
                        setSelectedMember(updated);
                        setFamilyMembers(prev => prev.map(m => m.id === selectedMember.id ? updated : m));
                      }
                    }}
                    onGoBack={() => setActiveTab("home")}
                    triggerToast={triggerToast}
                  />
                </div>
              )}

              {/* TAB 9: ABHA INTEGRATED GATEWAY */}
              {activeTab === "abha" && selectedMember && (
                <div className="max-w-[1100px] mx-auto w-full text-left">
                  <ABHAGateway
                    activeMember={selectedMember}
                    familyMembers={familyMembers}
                    onMemberChange={setSelectedMember}
                    triggerToast={triggerToast}
                    isDarkMode={isDarkMode}
                    onRefreshTimeline={loadPlatformData}
                    onNavigateToTab={(tab) => setActiveTab(tab as any)}
                  />
                </div>
              )}
            </>
          )}

          {/* DOCTOR / PRACTITIONER PORTAL WORKFLOW - COMPLETELY SEPARATED & ENHANCED (AS REQUESTED) */}
          {sessionMode === "doctor" && activeTab !== "admin" && (
            <div className={"space-y-8 text-left animate-fade-in pb-16 dark:bg-slate-900"}>
              
              
              {/* PRACTICE HEADER CARD (REUSABLE ACCROSS PORTAL) */}
              {showWelcomeCard && (
                <div className="bg-gradient-to-r from-teal-900 via-teal-850 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10 transform translate-x-12 -translate-y-6">
                    <Activity className="w-96 h-96" />
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                    <div>
                      <span className="bg-teal-850 text-teal-300 border border-teal-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                        Practice Management Room • Live Gate
                      </span>
                      <h1 className="text-xl md:text-2xl font-black mt-3 flex items-center gap-2">
                        Welcome, Dr. Supriya Kilari <span className="text-sm font-normal text-teal-400">• Cardiology Consultant</span>
                      </h1>
                      <p className="text-xs text-teal-100/80 mt-1 font-medium">AIMS Super Speciality Hospital, Bangalore • ABHA Registered ID: DOC-91-84021</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setActiveTab("timeline"); setVideoCallActive(true); setVideoDoctor(doctors.find(d => d.id === "D000") || doctors[0]); }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Video className="w-4 h-4 shrink-0" /> Initiate Telehealth Call
                      </button>
                      <button 
                        onClick={() => triggerToast("All clinician telemetry nodes synchronized to ABHA cloud registry.")}
                        className="px-4 py-2 bg-teal-800/80 hover:bg-teal-800 text-white border border-teal-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Sync Cloud Gate
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCTOR TAB 1: CLINIC OVERVIEW / DASHBOARD */}
              {activeTab === "home" && (
                <div className="space-y-8">
                  {/* BENTO PRACTICE METRICS GRID */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-2xl">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="text-slate-400 text-[9px] uppercase font-black tracking-wider">Patients Consulted</span>
                        <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">421</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-2xl relative">
                        <Clock className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                      </div>
                      <div className="text-left">
                        <span className="text-slate-400 text-[9px] uppercase font-black tracking-wider">Queue Waiting</span>
                        <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">7 Patients</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 rounded-2xl">
                        <Video className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="text-slate-400 text-[9px] uppercase font-black tracking-wider">Remote Rooms Live</span>
                        <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">2 Pending</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 rounded-2xl">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="text-slate-400 text-[9px] uppercase font-black tracking-wider">Monthly Income</span>
                        <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">₹1,24,500</p>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE PATIENT LIVE VITALS TELEMETRY & ECG PULSE STREAM (AS REQUESTED) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Live ECG Vitals Card */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping"></span>
                            <span className="text-xs text-rose-600 uppercase font-black tracking-widest font-mono">Live Vitals Stream</span>
                          </div>
                          <select
                            value={doctorSelectedPatientId}
                            onChange={(e) => { setDoctorSelectedPatientId(e.target.value); triggerToast(`Vitals stream switched to patient ID: ${e.target.value}`); }}
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-900 dark:text-white rounded-xl px-2 py-1 cursor-pointer"
                          >
                            <option value="fam-self">Supriya Kilari (Self)</option>
                            <option value="fam-1">Rami Kilari (Father)</option>
                            <option value="fam-2">Lakshmi Kilari (Mother)</option>
                            <option value="ext-1">Ramesh Sharma (Patient)</option>
                            <option value="ext-2">Praveen Rao (Patient)</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <p className="font-extrabold text-sm text-slate-200">
                            Monitoring: {
                              doctorSelectedPatientId === "fam-self" ? "Supriya Kilari" :
                              doctorSelectedPatientId === "fam-1" ? "Rami Kilari" :
                              doctorSelectedPatientId === "fam-2" ? "Lakshmi Kilari" :
                              doctorSelectedPatientId === "ext-1" ? "Ramesh Sharma" : "Praveen Rao"
                            }
                          </p>
                          <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded-md">ABHA LIVE CONNECT</span>
                        </div>

                        {/* HIGH-FIDELITY ANIMATED ECG SINUS WAVE */}
                        <div className="h-28 bg-slate-100 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 my-4 flex items-center justify-center relative overflow-hidden p-2">
                          <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                            {/* Grid background lines */}
                            <g className="stroke-slate-200 dark:stroke-slate-900/60 stroke-1">
                              <line x1="0" y1="20" x2="400" y2="20" />
                              <line x1="0" y1="40" x2="400" y2="40" />
                              <line x1="0" y1="60" x2="400" y2="60" />
                              <line x1="0" y1="80" x2="400" y2="80" />
                              <line x1="50" y1="0" x2="50" y2="100" />
                              <line x1="100" y1="0" x2="100" y2="100" />
                              <line x1="150" y1="0" x2="150" y2="100" />
                              <line x1="200" y1="0" x2="200" y2="100" />
                              <line x1="250" y1="0" x2="250" y2="100" />
                              <line x1="300" y1="0" x2="300" y2="100" />
                              <line x1="350" y1="0" x2="350" y2="100" />
                            </g>
                            
                            {/* Animated Sinus rhythm path */}
                            <path
                              d="M 0,50 L 30,50 L 40,48 L 45,50 L 55,50 L 60,35 L 65,75 L 70,15 L 75,55 L 80,50 L 95,50 L 105,48 L 110,50 L 130,50 L 140,48 L 145,50 L 155,50 L 160,35 L 165,75 L 170,15 L 175,55 L 180,50 L 195,50 L 205,48 L 210,50 L 230,50 L 240,48 L 245,50 L 255,50 L 260,35 L 265,75 L 270,15 L 275,55 L 280,50 L 295,50 L 305,48 L 310,50 L 330,50 L 340,48 L 345,50 L 355,50 L 360,35 L 365,75 L 370,15 L 375,55 L 380,50 L 400,50"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              className="animate-ecg-pulse"
                              strokeDasharray="400"
                              strokeDashoffset="400"
                            />
                          </svg>
                          <span className="absolute top-2 right-4 text-[9px] text-emerald-600 font-mono font-bold animate-pulse">● SWEEP SPEED: 25mm/s</span>
                        </div>
                      </div>

                      {/* Numerical vitals readouts */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center mt-2">
                        {(patientVitals[doctorSelectedPatientId] || [
                          { metric: "Heart Rate", value: "72 BPM", status: "Normal", last_updated: "Today", color: "text-emerald-600" },
                          { metric: "Blood Pressure", value: "120/80 mmHg", status: "Normal", last_updated: "Today", color: "text-emerald-600" }
                        ]).map((vt, idx) => (
                          <div key={idx} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between text-left">
                            <div>
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider truncate">{vt.metric}</span>
                              <span className={`text-sm md:text-base font-black ${vt.color} font-mono block mt-1`}>{vt.value}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 text-[8px] text-slate-500 dark:text-slate-400 font-mono">
                              <span className={vt.status === "High" ? "text-rose-600 font-bold" : vt.status === "Borderline" ? "text-amber-600 font-bold" : "text-emerald-600"}>
                                {vt.status}
                              </span>
                              <span>{vt.last_updated}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Interactive form to add dynamic attribute/vital (EAV Model) */}
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-left">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">
                          ⚡ Clinical EAV Schema Engine: Record Custom Patient Vital / Specialty Attribute
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <input
                            type="text"
                            placeholder="Metric (e.g. SpO2, Uric Acid)"
                            value={newVitalMetric}
                            onChange={(e) => setNewVitalMetric(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white rounded-xl px-2.5 py-1.5 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g. 98%, 7.2 mg/dL)"
                            value={newVitalValue}
                            onChange={(e) => setNewVitalValue(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white rounded-xl px-2.5 py-1.5 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
                          />
                          <select
                            value={newVitalStatus}
                            onChange={(e) => setNewVitalStatus(e.target.value as any)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white rounded-xl px-2 py-1.5 focus:outline-none focus:border-emerald-500/50"
                          >
                            <option value="Normal">Normal Status</option>
                            <option value="Borderline">Borderline Risk</option>
                            <option value="High">High Risk Alerter</option>
                          </select>
                          <button
                            onClick={addCustomVital}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                          >
                            Insert Metric
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Today's appointments load mini bento chart */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Monthly Consult Load</h3>
                        <p className="text-[11px] text-slate-400">Total clinical appointments per month (2026)</p>
                        
                        {/* HIGH FIDELITY SVG AREA CHART - FULLY RESPONSIVE */}
                        <div className="h-32 mt-4 relative w-full">
                          <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            {/* Gridlines */}
                            <line x1="0" y1="10" x2="200" y2="10" stroke="#f1f5f9" strokeWidth="0.5" className="dark:stroke-slate-800" />
                            <line x1="0" y1="35" x2="200" y2="35" stroke="#f1f5f9" strokeWidth="0.5" className="dark:stroke-slate-800" />
                            <line x1="0" y1="60" x2="200" y2="60" stroke="#f1f5f9" strokeWidth="0.5" className="dark:stroke-slate-800" />
                            
                            {/* Area Fill */}
                            <path
                              d="M 10,70 L 40,40 L 70,55 L 100,20 L 130,30 L 160,15 L 190,5 L 190,70 Z"
                              fill="url(#chartGrad)"
                            />
                            
                            {/* Line Chart */}
                            <path
                              d="M 10,70 Q 40,40 70,55 T 100,20 T 130,30 T 160,15 T 190,5"
                              fill="none"
                              stroke="#059669"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            
                            {/* Nodes */}
                            <circle cx="100" cy="20" r="3" fill="#047857" />
                            <circle cx="160" cy="15" r="3" fill="#047857" />
                            <circle cx="190" cy="5" r="3" fill="#047857" />
                          </svg>

                          <div className="flex justify-between items-center text-[8px] font-mono font-bold text-slate-400 mt-2 px-1">
                            <span>Jan (12)</span>
                            <span>Mar (24)</span>
                            <span>May (38)</span>
                            <span>Jul (56)</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Practice growth trend:</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-0.5">
                          ▲ 28% This Quarter
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* ACTIVE QUEUE QUICK LIST */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-xs text-left space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Today's Checked-In Patients</h3>
                        <p className="text-xs text-slate-400">Manage triage list, launch video consultation, or draft medication plans.</p>
                      </div>
                      <button 
                        onClick={() => { setActiveTab("copilot"); }} 
                        className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Launch Queue Center <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Patient Ramesh */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[8px] bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded-md animate-pulse">EMERGENCY (RED)</span>
                            <span className="text-[10px] text-slate-400 font-mono">02:00 PM • Video</span>
                          </div>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Ramesh Sharma</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Age 64 • Post-angioplasty weekly rehab check</p>
                        </div>
                        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800">
                          <button 
                            onClick={() => { setDoctorSelectedPatientId("ext-1"); setActiveTab("doctors"); }}
                            className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] rounded-xl cursor-pointer text-center"
                          >
                            Prescribe SOAP
                          </button>
                          <button 
                            onClick={() => { setDoctorSelectedPatientId("ext-1"); setActiveTab("timeline"); setVideoCallActive(true); setVideoDoctor(doctors.find(d => d.id === "D000") || doctors[0]); }}
                            className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9px] rounded-xl cursor-pointer"
                          >
                            Call
                          </button>
                        </div>
                      </div>

                      {/* Patient Rami */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[8px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-md">HIGH RISK (ORANGE)</span>
                            <span className="text-[10px] text-slate-400 font-mono">09:00 AM • Video</span>
                          </div>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Rami Kilari</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Age 58 • Hypertension drug titration follow-up</p>
                        </div>
                        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800">
                          <button 
                            onClick={() => { setDoctorSelectedPatientId("fam-1"); setActiveTab("doctors"); }}
                            className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] rounded-xl cursor-pointer text-center"
                          >
                            Prescribe SOAP
                          </button>
                          <button 
                            onClick={() => { setDoctorSelectedPatientId("fam-1"); setActiveTab("timeline"); setVideoCallActive(true); setVideoDoctor(doctors.find(d => d.id === "D000") || doctors[0]); }}
                            className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9px] rounded-xl cursor-pointer"
                          >
                            Call
                          </button>
                        </div>
                      </div>

                      {/* Patient Karthik */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[8px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md">STABLE (GREEN)</span>
                            <span className="text-[10px] text-slate-400 font-mono">11:30 AM • Clinic</span>
                          </div>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Karthik Kilari</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Age 24 • Athletic cardiac clearance check</p>
                        </div>
                        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800">
                          <button 
                            onClick={() => { setDoctorSelectedPatientId("fam-3"); setActiveTab("doctors"); }}
                            className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] rounded-xl cursor-pointer text-center"
                          >
                            Prescribe SOAP
                          </button>
                          <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-xl text-[9px] font-bold text-center">In-Person</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ai-assistant" && (
                <AICopilotWorkspace sessionMode="doctor" patientId={doctorSelectedPatientId} onAction={handleCopilotAction} />
              )}
              
              {/* DOCTOR TAB 2: PATIENT QUEUE SPLIT SCREEN (AS REQUESTED) */}
              {activeTab === "copilot" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* Left Column: Today's Triage Patient List */}
                  <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-4">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Clinical Waiting Room</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Select a patient profile to view historical ABHA records</p>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {[
                        { id: "ext-1", name: "Ramesh Sharma", relation: "Patient", age: 64, triage: "RED", time: "02:00 PM", notes: "Post-angioplasty rehab check" },
                        { id: "fam-1", name: "Rami Kilari", relation: "Father", age: 58, triage: "ORANGE", time: "09:00 AM", notes: "Hypertension drug titration" },
                        { id: "fam-2", name: "Lakshmi Kilari", relation: "Mother", age: 54, triage: "YELLOW", time: "04:00 PM", notes: "Allergy patch test follow-up" },
                        { id: "fam-3", name: "Karthik Kilari", relation: "Brother", age: 24, triage: "GREEN", time: "11:30 AM", notes: "Athletic cardiac clearance" },
                        { id: "fam-self", name: "Supriya Kilari", relation: "Self", age: 29, triage: "GREEN", time: "10:30 AM", notes: "Routine screening" },
                        { id: "ext-2", name: "Praveen Rao", relation: "Patient", age: 52, triage: "ORANGE", time: "10:00 AM", notes: "Cardiovascular stress review" },
                      ].map((pat) => (
                        <div
                          key={pat.id}
                          onClick={() => { setDoctorSelectedPatientId(pat.id); triggerToast(`Selected patient profile: ${pat.name}`); }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                            doctorSelectedPatientId === pat.id
                              ? "bg-teal-50/50 border-teal-500/80 dark:bg-teal-950/20 dark:border-teal-700"
                              : "bg-slate-50 border-slate-100 dark:bg-slate-800/40 dark:border-slate-800/60 hover:bg-slate-100/60"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate max-w-[120px]">{pat.name}</h4>
                            <span className="text-[9px] font-mono text-slate-400 font-bold">{pat.time}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium truncate">{pat.notes}</p>
                          
                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200/30 dark:border-slate-800">
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">Age: {pat.age}</span>
                            {pat.triage === "RED" && <span className="text-[8px] bg-rose-100 text-rose-800 font-black px-1.5 py-0.5 rounded-md animate-pulse">RED</span>}
                            {pat.triage === "ORANGE" && <span className="text-[8px] bg-amber-100 text-amber-800 font-black px-1.5 py-0.5 rounded-md">ORANGE</span>}
                            {pat.triage === "YELLOW" && <span className="text-[8px] bg-yellow-100 text-yellow-800 font-black px-1.5 py-0.5 rounded-md">YELLOW</span>}
                            {pat.triage === "GREEN" && <span className="text-[8px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-md">GREEN</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Selected Patient ABHA Medical Records Viewer */}
                  <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-xs text-left space-y-6">
                    {(() => {
                      const activeProfile = 
                        doctorSelectedPatientId === "fam-self" ? { name: "Supriya Kilari", age: 29, gender: "Female", group: "O+", allergies: "Peanuts, Penicillin", chronic: "Mild Asthma", medications: "Inhaler (SOS)", abha: "91-8042-5192-3301" } :
                        doctorSelectedPatientId === "fam-1" ? { name: "Rami Kilari", age: 58, gender: "Male", group: "O+", allergies: "None", chronic: "Type 2 Diabetes, Hypertension", medications: "Metformin 500mg, Ramipril 5mg", abha: "91-3142-9852-2415" } :
                        doctorSelectedPatientId === "fam-2" ? { name: "Lakshmi Kilari", age: 54, gender: "Female", group: "A+", allergies: "Sulfa drugs", chronic: "Thyroid", medications: "Thyronorm 50mcg", abha: "91-7214-3652-9801" } :
                        doctorSelectedPatientId === "fam-3" ? { name: "Karthik Kilari", age: 24, gender: "Male", group: "O+", allergies: "Dust mites", chronic: "None", medications: "None", abha: "91-1052-3214-7411" } :
                        doctorSelectedPatientId === "ext-1" ? { name: "Ramesh Sharma", age: 64, gender: "Male", group: "B+", allergies: "Penicillin, Sulfa", chronic: "Post-Angioplasty Rehabilitation, Stage II Hypertension", medications: "Aspirin 75mg, Clopidogrel 75mg", abha: "91-4451-2244-1234" } :
                        { name: "Praveen Rao", age: 52, gender: "Male", group: "AB+", allergies: "Aspirin", chronic: "Hypertensive cardiovascular stress", medications: "Sorbilate (SOS)", abha: "91-8902-1244-9855" };

                      return (
                        <>
                          <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{activeProfile.name}</h3>
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">ABHA LIVE RECORD</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1">National Health Registry ID: {activeProfile.abha}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 font-bold block uppercase">Blood Group</span>
                              <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">{activeProfile.group}</span>
                            </div>
                          </div>

                          {/* Demographics & Core Info */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                              <span className="text-[9px] text-slate-400 font-bold block uppercase">Age & Gender</span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeProfile.age} yrs • {activeProfile.gender}</span>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                              <span className="text-[9px] text-slate-400 font-bold block uppercase">Active Medications</span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">{activeProfile.medications}</span>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                              <span className="text-[9px] text-slate-400 font-bold block uppercase">Chronic Conditions</span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">{activeProfile.chronic}</span>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-rose-100 dark:border-rose-950/20 bg-rose-50/20">
                              <span className="text-[9px] text-rose-500 font-bold block uppercase">Allergies Override</span>
                              <span className="text-xs font-extrabold text-rose-800 dark:text-rose-400 truncate block">{activeProfile.allergies}</span>
                            </div>
                          </div>

                          {/* Historical records retrieved via ABHA */}
                          <div className="space-y-3">
                            <HealthHistoryTimeline 
                              records={timeline.filter(t => t.patientId === doctorSelectedPatientId || doctorSelectedPatientId === "ext-1")} 
                            />
                          </div>

                          <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => { setActiveTab("doctors"); }}
                              className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl text-center cursor-pointer"
                            >
                              Open SOAP Prescriber with Patient Context
                            </button>
                            <button
                              onClick={() => { setActiveTab("timeline"); setVideoCallActive(true); setVideoDoctor(doctors.find(d => d.id === "D000") || doctors[0]); }}
                              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                            >
                              Call Patient Secure Room
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* DOCTOR TAB 3: SOAP CLINICAL PRESCRIBER & DICTATION COPILOT */}
              {activeTab === "doctors" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Prescriber Form Body */}
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-6">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">SOAP Consultation Prescriber Interface</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Directly document patient queries and sync prescriptions to Indian ABHA gateways.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Active Patient Context</label>
                          <select
                            value={doctorSelectedPatientId}
                            onChange={(e) => { setDoctorSelectedPatientId(e.target.value); triggerToast(`Prescription context changed.`); }}
                            className="w-full bg-slate-50 dark:bg-slate-800 text-xs rounded-xl p-3 font-bold border border-slate-200 dark:border-slate-700"
                          >
                            <option value="fam-self">Supriya Kilari (Self)</option>
                            <option value="fam-1">Rami Kilari (Father)</option>
                            <option value="fam-2">Lakshmi Kilari (Mother)</option>
                            <option value="ext-1">Ramesh Sharma (Patient)</option>
                            <option value="ext-2">Praveen Rao (Patient)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Prescriber Speech Documentation</label>
                          <button
                            onClick={() => {
                              setDoctorVoiceNotesActive(!doctorVoiceNotesActive);
                              if (!doctorVoiceNotesActive) {
                                setDoctorPrescribedMeds("Metformin 500mg (Once daily after lunch), Atorvastatin 10mg (Bedtime)");
                                setDoctorDiagnosisInput("Hypertensive cardiovascular spasms with insulin resistance evaluation.");
                                setDoctorTestRecommendation("HbA1c profile, Fasting Serum Insulin & Lipid Screening.");
                                triggerToast("Speech dictation transcribed to prescription template!");
                              }
                            }}
                            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              doctorVoiceNotesActive ? "bg-rose-600 text-white animate-pulse" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-200"
                            }`}
                          >
                            <Mic className="w-4 h-4" /> {doctorVoiceNotesActive ? "Speech Dictation live..." : "Dictate SOAP Consultation Notes"}
                          </button>
                        </div>
                      </div>

                      {/* Diagnostic Inputs */}
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Clinical Impressions / Diagnostic Diagnosis</label>
                          <input
                            type="text"
                            value={doctorDiagnosisInput}
                            onChange={(e) => setDoctorDiagnosisInput(e.target.value)}
                            placeholder="e.g. Stage I hypertension combined with post-exercise cardiospasms."
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Prescribed Pharmacotherapy Medicines</label>
                          <textarea
                            rows={3}
                            value={doctorPrescribedMeds}
                            onChange={(e) => setDoctorPrescribedMeds(e.target.value)}
                            placeholder="Generic Drug name, strength, dosage, and schedule constraints..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Required Laboratory Assessments</label>
                          <input
                            type="text"
                            value={doctorTestRecommendation}
                            onChange={(e) => setDoctorTestRecommendation(e.target.value)}
                            placeholder="e.g. HbA1c profile, fasting blood sugar, serum lipid profile..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {/* Safe drug allergy auditor button */}
                        <button
                          onClick={() => {
                            const hasAllergy = 
                              doctorSelectedPatientId === "fam-self" && (doctorPrescribedMeds.toLowerCase().includes("penicillin") || doctorPrescribedMeds.toLowerCase().includes("metformin"));
                            
                            if (hasAllergy || doctorSelectedPatientId === "ext-1") {
                              triggerToast("CRITICAL ALERT: Potential medication cross-sensitivity warning flagged!", true);
                              setInteractionResult({
                                safe: false,
                                alertsCount: 1,
                                alerts: [{
                                  interaction: "Penicillin Allergy Cross-Reactivity",
                                  severity: "CRITICAL",
                                  risk: "Patient is registered as highly penicillin-sensitive on ABHA. The specified pharmacotherapy list could trigger anaphylactic responses.",
                                  advice: "Substitute with alternate non-beta-lactam antibiotics immediately."
                                }]
                              });
                            } else {
                              triggerToast("No drug-allergy contraindications found for this prescription plan.");
                              setInteractionResult({
                                safe: true,
                                alertsCount: 0,
                                alerts: []
                              });
                            }
                          }}
                          className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Run Allergy Audit
                        </button>

                        <button
                          onClick={handleDoctorSubmitPrescription}
                          className="flex-1 py-3 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                        >
                          Lock, Sign & Sync Prescription to ABHA
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Interaction Checker & AI Clinical assistant */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-xs text-left space-y-6">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Clinical Copilot Safety Center</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Run automatic safety checks before signing e-prescriptions.</p>
                    </div>

                    {/* Safety Audit Results */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl min-h-[140px] flex items-center justify-center">
                      {interactionResult ? (
                        <div className="space-y-3 w-full text-xs">
                          <div className="flex justify-between items-center border-b border-slate-200/40 pb-2 dark:border-slate-800">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Safety Check Status:</span>
                            <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              interactionResult.safe ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800 animate-pulse"
                            }`}>
                              {interactionResult.safe ? "No critical alarms" : "Safety Alert Active"}
                            </span>
                          </div>

                          {interactionResult.alerts && interactionResult.alerts.length > 0 ? (
                            interactionResult.alerts?.map((al, idx) => (
                              <div key={idx} className="p-2.5 bg-rose-50/50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900 rounded-xl space-y-1">
                                <p className="text-rose-800 dark:text-rose-400 font-extrabold text-[11px]">⚠️ {al.interaction}</p>
                                <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-snug">{al.risk}</p>
                                <p className="text-[10px] text-teal-800 dark:text-teal-400 font-bold mt-1">Recommended Override: {al.advice}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-slate-400 text-xs py-4">Prescribed medicines conform to registered health history.</p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-slate-400 text-xs py-4">
                          Allergy checklist pending audit. Click "Run Allergy Audit" to check.
                        </div>
                      )}
                    </div>

                    {/* Gemini Clinical Suggestion helper */}
                    <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3 text-xs border border-slate-800">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Brain className="w-4 h-4" />
                        <span className="font-extrabold text-xs">Gemini Clinical Suggestion</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-normal">
                        Let Gemini's clinical assistant model cross-reference diagnosed symptoms to draft safety medication plans.
                      </p>
                      <button
                        onClick={async () => {
                          setLoading(true);
                          try {
                            const activeProfile = 
                              doctorSelectedPatientId === "fam-self" ? "Supriya Kilari" : "Rami Kilari";
                            triggerToast(`Consulting Gemini clinical engine for ${activeProfile}...`);
                            
                            setTimeout(() => {
                              setDoctorDiagnosisInput("Type II Diabetes Mellitus with borderline chronic hypertension.");
                              setDoctorPrescribedMeds("Metformin 500mg (Once daily, post-dinner), Ramipril 2.5mg (Once daily, morning)");
                              setDoctorTestRecommendation("Serum Creatinine, Fasting HbA1c, and Lipid checkup.");
                              triggerToast("Gemini draft successfully applied to clinical prescriber form!");
                              setLoading(false);
                            }, 1500);
                          } catch (err) {
                            setLoading(false);
                          }
                        }}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] rounded-xl cursor-pointer"
                      >
                        Ask Gemini to Draft Prescription
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCTOR TAB 4: SECURE TELEHEALTH ROOM */}
              {activeTab === "timeline" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-xs text-left space-y-6">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Secure Telehealth Consultation Hub</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Launches high-fidelity simulated remote room sessions with registered patients.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2 text-xs">
                        <p className="font-bold text-slate-800 dark:text-slate-200">Session Setup Parameters:</p>
                        <p>🖥️ Enforce HIPAA compliant encryption tunnels</p>
                        <p>🔊 Enforce echo cancellation audio modules</p>
                        <p>📹 Enforce 1080p WebRTC camera resolutions</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Select Queued Patient for Tele-call</label>
                        <select
                          value={doctorSelectedPatientId}
                          onChange={(e) => setDoctorSelectedPatientId(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 text-xs rounded-xl p-3 border border-slate-200 dark:border-slate-700"
                        >
                          <option value="fam-self">Supriya Kilari (Self)</option>
                          <option value="fam-1">Rami Kilari (Father)</option>
                          <option value="ext-1">Ramesh Sharma (Patient)</option>
                          <option value="ext-2">Praveen Rao (Patient)</option>
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          setVideoCallActive(true);
                          setVideoDoctor(doctors.find(d => d.id === "D000") || doctors[0]);
                          triggerToast("Launching encrypted secure consultation server...");
                        }}
                        className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Establish Live WebRTC Feed Now
                      </button>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center bg-slate-950">
                      <div className="text-center space-y-2 text-white">
                        <Video className="w-8 h-8 mx-auto text-rose-600 animate-pulse" />
                        <p className="text-xs font-bold">Encrypted Camera Node Ready</p>
                        <p className="text-[10px] text-slate-400">Selected patient feed awaits secure trigger</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCTOR TAB 5: PRACTICE INSIGHTS & ANALYTICS */}
              {activeTab === "family" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bar Chart Specialty distribution */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-left space-y-4">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Specialty Consultation Load</h3>
                        <p className="text-[11px] text-slate-400">Comparison of clinic consultations completed this month</p>
                      </div>

                      <div className="space-y-4 text-xs font-medium">
                        {[
                          { specialty: "Cardiology (Consultant)", count: 182, percent: 55, color: "bg-emerald-600" },
                          { specialty: "General Medicine", count: 85, percent: 25, color: "bg-teal-600" },
                          { specialty: "Pediatrics", count: 32, percent: 12, color: "bg-cyan-600" },
                          { specialty: "Neurology", count: 18, percent: 8, color: "bg-amber-600" },
                        ].map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-800 dark:text-slate-200 font-bold">{item.specialty}</span>
                              <span className="text-slate-500 dark:text-slate-400 font-mono">{item.count} appointments ({item.percent}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                              <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.percent}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Revenue stack chart */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-left space-y-4">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Practice Income Distribution</h3>
                        <p className="text-[11px] text-slate-400">Clinical income streams for current calendar quarter</p>
                      </div>

                      <div className="space-y-4">
                        <div className="w-full h-8 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex">
                          <div className="bg-emerald-600 h-full cursor-pointer" style={{ width: "62%" }} title="Direct Fees (62%)"></div>
                          <div className="bg-teal-500 h-full cursor-pointer" style={{ width: "28%" }} title="Telehealth (28%)"></div>
                          <div className="bg-cyan-500 h-full cursor-pointer" style={{ width: "10%" }} title="Lab Referrals (10%)"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block mr-1"></span>
                            <span className="text-slate-500 dark:text-slate-400 block text-[9px] uppercase font-bold mt-0.5">Direct Fees</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">62% (₹77,190)</span>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block mr-1"></span>
                            <span className="text-slate-500 dark:text-slate-400 block text-[9px] uppercase font-bold mt-0.5">Telehealth</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">28% (₹34,860)</span>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block mr-1"></span>
                            <span className="text-slate-500 dark:text-slate-400 block text-[9px] uppercase font-bold mt-0.5">Lab Referrals</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">10% (₹12,450)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCTOR TAB 6: PHARMACY OVERRIDE VERIFICATION CENTER */}
              {activeTab === "store" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-xs text-left space-y-6">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Prescription Medicine Verification Room</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Review and approve e-prescription pharmacy dispatch requests submitted by patients.</p>
                  </div>

                  <div className="space-y-4">
                    {ePrescriptions.map((order) => (
                      <div key={order.id} className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 dark:text-white">{order.patient}</span>
                            <span className="text-[9px] text-slate-400 font-mono">{order.abha}</span>
                          </div>
                          <p className="font-bold text-teal-800 dark:text-teal-400">{order.drug} • {order.qty}</p>
                          <p className="text-[10px] text-slate-400">Mfg: {order.manufacturer}</p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                          <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full ${order.status === "Signed & Approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                            {order.status}
                          </span>
                          {order.status !== "Signed & Approved" && (
                            <button
                              onClick={() => approvePrescription(order.id)}
                              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-teal-900 dark:hover:bg-teal-850 text-white font-bold text-[10px] rounded-xl cursor-pointer"
                            >
                              Sign & Approve Release
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DOCTOR TAB 7: PRACTICE HELP & GUIDELINES */}
              {activeTab === "help" && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-xs text-left space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Clinical Guidelines & Cardiology SOP Reference</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Standard dosage references and trauma critical procedures.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-2">Hypertension Crisis SOP</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        If patient reports diastolic blood pressure exceeding 120 mmHg accompanied by chest tightening:
                        1. Direct patient to chew Aspirin 325mg immediately.
                        2. Establish direct telemetry stream.
                        3. Issue direct emergency red triage signal and coordinate dispatch to nearest cardiac facility.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-2">Myocardial Infarction Post-Op</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        Weekly follow-up requires monitoring:
                        - Dual Antiplatelet Therapy (DAPT) compliance (Aspirin + Clopidogrel).
                        - High-intensity statin tolerance (Atorvastatin 40/80mg).
                        - Rest pulse stability: Target resting heart rate at 55-65 BPM using beta-blocker titration.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCTOR TAB 8: PROFESSIONAL PROFILE PAGE */}
              {activeTab === "profile" && (
                <ProfilePage
                  sessionMode="doctor"
                  activeMember={null}
                  onSavePatientProfile={() => {}}
                  onGoBack={() => setActiveTab("home")}
                  triggerToast={triggerToast}
                />
              )}
            </div>
          )}

          {/* TAB: ADMIN SANDBOX CONTROLS PANEL */}
          {activeTab === "admin" && (
            <div className="space-y-6 text-left">
              <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-extrabold text-base text-emerald-400">Sandbox Environment Administrator Panel</h3>
                    <p className="text-xs text-slate-300 mt-0.5">Simulate global database states, flush transaction queues, and monitor audit traces.</p>
                  </div>
                  <button
                    onClick={handleResetDb}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" /> Reset Database Seeds
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-800 rounded-2xl text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Patient Users</span>
                    <p className="text-xl font-extrabold mt-1">{adminStats?.usersCount || 3}</p>
                  </div>
                  <div className="p-4 bg-slate-800 rounded-2xl text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Lock Slot Bookings</span>
                    <p className="text-xl font-extrabold mt-1">{adminStats?.appointmentsCount || 1}</p>
                  </div>
                  <div className="p-4 bg-slate-800 rounded-2xl text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Medicine Deliveries</span>
                    <p className="text-xl font-extrabold mt-1">{adminStats?.medicineOrdersCount || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-800 rounded-2xl text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Simulated Revenue</span>
                    <p className="text-xl font-extrabold text-emerald-400 mt-1">₹{adminStats?.totalRevenue || 800}</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Log Feed */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 p-6 rounded-3xl shadow-xs space-y-4 dark:border-slate-800">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Platform Activity Audit Log Traces</h3>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl max-h-[300px] overflow-y-auto font-mono text-[10px] text-slate-700 dark:text-slate-300 space-y-2">
                  {adminStats?.auditLogs ? (
                    adminStats?.auditLogs?.map((log) => (
                      <div key={log.id} className="border-b border-slate-200/60 pb-1.5 leading-normal dark:border-slate-800">
                        <span className="text-emerald-700 font-bold">[{log.timestamp}]</span>{" "}
                        <span className="text-slate-900 dark:text-white font-extrabold">{log.action}</span> -{" "}
                        <span className="text-slate-500 dark:text-slate-400">User: {log.user} (IP: {log.ip})</span>{" "}
                        <p className="text-slate-600 dark:text-slate-400 pl-4 mt-0.5">{log.details}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No logged audit trails found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* 3. SIMULATED VIDEO CALL ROOM (AS REQUESTED) */}
      {videoCallActive && videoDoctor && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex flex-col justify-between p-6">
          {/* Header video info */}
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping"></span>
              <p className="text-xs font-bold">HealthTribe Secure Room • Connected to {videoDoctor.name}</p>
            </div>
            <button
              onClick={() => setVideoCallActive(false)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs cursor-pointer"
            >
              End Call Room
            </button>
          </div>

          {/* Video Frames */}
          <div className="flex-1 my-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center max-w-4xl mx-auto w-full">
            {/* Doctor feed */}
            <div className="relative rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden aspect-video shadow-2xl flex items-center justify-center">
              {cameraOn ? (
                <img
                  src={videoDoctor.avatar}
                  alt={videoDoctor.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-slate-400 font-bold text-sm">Doctor Feed Switched Off</div>
              )}
              <span className="absolute bottom-4 left-4 bg-slate-950/60 text-white text-[10px] px-2.5 py-1 rounded font-bold">
                {videoDoctor.name} (Verified Clinician)
              </span>
            </div>

            {/* Self patient feed */}
            <div className="relative rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden aspect-video shadow-2xl flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-tr from-emerald-950 to-slate-900 flex items-center justify-center">
                <User className="w-16 h-16 text-emerald-400 animate-pulse" />
              </div>
              <span className="absolute bottom-4 left-4 bg-slate-950/60 text-white text-[10px] px-2.5 py-1 rounded font-bold">
                {selectedMember?.name || "You"} (Self)
              </span>
            </div>
          </div>

          {/* Interactive media control tools (AS REQUESTED) */}
          <div className="flex justify-center items-center gap-4 text-white">
            <button
              onClick={() => {
                setCameraOn(!cameraOn);
                triggerToast(cameraOn ? "Self Video Turned Off" : "Self Video Turned On");
              }}
              className={`p-4 rounded-full cursor-pointer transition-all ${cameraOn ? "bg-slate-800 hover:bg-slate-700" : "bg-rose-600 text-white"}`}
              title="Toggle Camera Feed"
            >
              {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                setMicOn(!micOn);
                triggerToast(micOn ? "Self Microphone Muted" : "Self Microphone Unmuted");
              }}
              className={`p-4 rounded-full cursor-pointer transition-all ${micOn ? "bg-slate-800 hover:bg-slate-700" : "bg-rose-600 text-white"}`}
              title="Toggle Mute Voice"
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                setVideoCallMuted(!videoCallMuted);
                triggerToast(videoCallMuted ? "Speaker Output Unmuted" : "Speaker Output Muted");
              }}
              className={`p-4 rounded-full cursor-pointer transition-all ${!videoCallMuted ? "bg-slate-800 hover:bg-slate-700" : "bg-rose-600 text-white"}`}
              title="Toggle Speaker Volume"
            >
              {!videoCallMuted ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

      {/* 4. PAYMENT POPUP GATEWAY */}
      {paymentModalActive && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl text-left space-y-4 text-slate-800 dark:text-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Secure Payment Checkout</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{paymentPurpose}</p>
              </div>
              <button
                onClick={() => setPaymentModalActive(false)}
                className="text-slate-400 hover:text-slate-900 font-bold dark:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Amount Due:</span>
              <span className="text-lg font-extrabold text-emerald-800">₹{paymentAmount}</span>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Select Payment Method</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod("upi")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${ selectedPaymentMethod === "upi" ? "border-emerald-600 bg-emerald-50 text-emerald-950" : "border-slate-200" } dark:border-slate-800`}
                >
                  BHIM UPI ID
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod("card")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${ selectedPaymentMethod === "card" ? "border-emerald-600 bg-emerald-50 text-emerald-950" : "border-slate-200" } dark:border-slate-800`}
                >
                  Credit/Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod("gpay")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${ selectedPaymentMethod === "gpay" ? "border-emerald-600 bg-emerald-50 text-emerald-950" : "border-slate-200" } dark:border-slate-800`}
                >
                  Google Pay Wallet
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod("cash")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${ selectedPaymentMethod === "cash" ? "border-emerald-600 bg-emerald-50 text-emerald-950" : "border-slate-200" } dark:border-slate-800`}
                >
                  Cash / Pay on Delivery
                </button>
              </div>

              {selectedPaymentMethod === "upi" && (
                <input
                  type="text"
                  placeholder="Enter UPI VPA e.g. name@upi"
                  value={paymentUpiId}
                  onChange={(e) => setPaymentUpiId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono"
                />
              )}

              {selectedPaymentMethod === "card" && (
                <input
                  type="text"
                  placeholder="4111 2222 3333 4444"
                  value={paymentCardNumber}
                  onChange={(e) => setPaymentCardNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono"
                />
              )}
            </div>

            <button
              onClick={executePayment}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg"
            >
              Verify Payment Token & Settle Transaction
            </button>
          </div>
        </div>
      )}

      {/* 5. INTERACTIVE HEALTH PROFILE DRAWER */}
      {isProfileDrawerOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex justify-end">
          {/* Overlay click to close */}
          <div className="absolute inset-0" onClick={() => setIsProfileDrawerOpen(false)} />

          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full z-10 text-slate-800 dark:text-slate-100 overflow-hidden animate-slide-in">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  Health Profile Sync
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">ABHA ID: ABHA-3829-1920-1123</p>
              </div>
              <button
                onClick={() => setIsProfileDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Active Session Info Banner */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Secure Demographics Profile</span>
                </div>
                <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                  Session: <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">{loggedInEmail}</span>. All clinical views, appointment scheduling history, and vital tracking logs on every screen dynamically adjust to the active profile chosen below.
                </p>
              </div>

              {/* ACTIVE PROFILE CHANGER / DROPDOWN */}
              <div className="space-y-2">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Active Member Profile
                </label>
                <select
                  value={selectedMember?.id || ""}
                  onChange={(e) => {
                    const found = familyMembers.find(m => m.id === e.target.value);
                    if (found) {
                      setSelectedMember(found);
                      triggerToast(`Switched active profile context to ${found.name}.`);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                >
                  {familyMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  Edit Profile Demographics
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* Editable Fields Form */}
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editProfileName}
                    onChange={(e) => setEditProfileName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white"
                  />
                </div>

                {/* Age & Gender in a grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      value={editProfileAge}
                      onChange={(e) => setEditProfileAge(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Gender
                    </label>
                    <select
                      value={editProfileGender}
                      onChange={(e) => setEditProfileGender(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Blood Group
                  </label>
                  <select
                    value={editProfileBloodGroup}
                    onChange={(e) => setEditProfileBloodGroup(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                {/* Medical Description / Chronic conditions */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Medical Description (Chronic Conditions)
                  </label>
                  <textarea
                    rows={2}
                    value={editProfileChronic}
                    onChange={(e) => setEditProfileChronic(e.target.value)}
                    placeholder="e.g. Hypertension, Diabetes, Asthma"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-white placeholder-slate-400"
                  />
                </div>

                {/* Allergies */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Known Allergies
                  </label>
                  <textarea
                    rows={2}
                    value={editProfileAllergies}
                    onChange={(e) => setEditProfileAllergies(e.target.value)}
                    placeholder="e.g. Peanut allergy, Penicillin, Sulfa"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-white placeholder-slate-400"
                  />
                </div>

                {/* Medications */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Current Medications
                  </label>
                  <textarea
                    rows={2}
                    value={editProfileMedications}
                    onChange={(e) => setEditProfileMedications(e.target.value)}
                    placeholder="e.g. Metformin 500mg daily, Amlodipine 5mg"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-white placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 space-y-3 shrink-0">
              <button
                onClick={handleSaveProfileChanges}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Save Health Profile Details
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-transparent border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out of Secure Session
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* EDIT FAMILY MEMBER MODAL */}
      {isEditMemberModalOpen && (
        <div className="fixed inset-0 bg-slate-900 dark:bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Edit Family Record</h3>
            <form onSubmit={handleUpdateFamilyProfile} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={editMemberName}
                  onChange={(e) => setEditMemberName(e.target.value)}
                  placeholder="Father/Mother/Child Name"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-xs focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Relation</label>
                  <select
                    value={editMemberRelation}
                    onChange={(e) => setEditMemberRelation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs focus:ring-emerald-500 font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Child">Child</option>
                    <option value="Spouse">Spouse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    value={editMemberAge}
                    onChange={(e) => setEditMemberAge(e.target.value)}
                    placeholder="Age"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2 text-xs focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gender</label>
                <select
                  value={editMemberGender}
                  onChange={(e) => setEditMemberGender(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs focus:ring-emerald-500 font-bold text-slate-900 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Allergies</label>
                <input
                  type="text"
                  value={editMemberAllergies}
                  onChange={(e) => setEditMemberAllergies(e.target.value)}
                  placeholder="Contrast dyes / Penicillin etc."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-xs focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsEditMemberModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {itemToRemove && (
        <ConfirmationModal
          isOpen={!!itemToRemove}
          title="Remove Item?"
          message="Are you sure you want to remove this medicine from your cart?"
          onConfirm={() => removeFromCart(itemToRemove!)}
          onCancel={() => setItemToRemove(null)}
        />
      )}

      
      {isDeleteMemberModalOpen && memberToDelete && (
        <ConfirmationModal
          isOpen={isDeleteMemberModalOpen}
          title="Delete Family Profile"
          message={`Are you sure you want to delete ${memberToDelete.name}? This action cannot be undone.`}
          onConfirm={handleDeleteFamilyProfile}
          onCancel={() => { setIsDeleteMemberModalOpen(false); setMemberToDelete(null); }}
        />
      )}
      {isAddressModalOpen && (
        <AddressModal
          isOpen={isAddressModalOpen}
          addresses={addresses}
          selectedAddress={selectedAddress}
          onSelect={(addr) => { setSelectedAddress(addr); setIsAddressModalOpen(false); }}
          onClose={() => setIsAddressModalOpen(false)}
        />
      )}

    </div>
    )}
    </>
  );
}
