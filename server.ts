import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { aiService } from "./server/ai/AIService";
import { PromptBuilder } from "./server/ai/PromptBuilder";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));


// ---------------------------------------------------------
// IN-MEMORY DATABASE STATE (Pre-seeded & Dynamic)
// ---------------------------------------------------------

const SEEDED_SPECIALTIES = [
  { id: "gen_physician", name: "General Physician", description: "Primary care & general health", count: 124, icon: "Stethoscope" },
  { id: "cardiologist", name: "Cardiology", description: "Heart & cardiovascular care", count: 42, icon: "Heart" },
  { id: "neurologist", name: "Neurology", description: "Brain, nerves & neurological care", count: 29, icon: "Brain" },
  { id: "orthopedic", name: "Orthopedics", description: "Bones, joints & musculoskeletal care", count: 52, icon: "Bone" },
  { id: "dermatologist", name: "Dermatology", description: "Skin, hair & cosmetic care", count: 64, icon: "Sparkles" },
  { id: "pediatrician", name: "Pediatrics", description: "Child health & development", count: 85, icon: "Baby" },
  { id: "gastroenterologist", name: "Gastroenterology", description: "Digestive system & liver care", count: 33, icon: "Stomach" },
  { id: "pulmonology", name: "Pulmonology", description: "Lungs & respiratory care", count: 18, icon: "Lungs" },
  { id: "endocrinology", name: "Endocrinology", description: "Hormones & endocrine disorders", count: 22, icon: "Activity" },
  { id: "ophthalmology", name: "Ophthalmology", description: "Eye & vision care", count: 41, icon: "Eye" },
  { id: "ent", name: "ENT", description: "Ear, nose & throat care", count: 26, icon: "Ear" },
  { id: "psychiatry", name: "Psychiatry", description: "Mental health & emotional well-being", count: 35, icon: "UserCheck" },
  { id: "gynecology", name: "Gynecology", description: "Women's health & reproductive care", count: 76, icon: "Heart" },
  { id: "urology", name: "Urology", description: "Urinary tract & male health", count: 19, icon: "Activity" },
  { id: "oncology", name: "Oncology", description: "Cancer care & treatment", count: 15, icon: "Ribbon" },
  { id: "hematology", name: "Hematology", description: "Blood disorders & care", count: 12, icon: "Droplet" },
  { id: "rheumatology", name: "Rheumatology", description: "Autoimmune & joint diseases", count: 14, icon: "Activity" },
  { id: "dentistry", name: "Dentistry", description: "Teeth & oral health", count: 110, icon: "Smile" },
  { id: "allergy_immunology", name: "Allergy & Immunology", description: "Allergies & immune system", count: 20, icon: "ShieldAlert" },
  { id: "nephrology", name: "Nephrology", description: "Kidney health & diseases", count: 17, icon: "Activity" },
  { id: "plastic_surgery", name: "Plastic Surgery", description: "Reconstructive & cosmetic surgery", count: 21, icon: "Smile" },
  { id: "radiology", name: "Radiology", description: "Imaging & diagnostic radiology", count: 28, icon: "FileText" },
  { id: "physiotherapy", name: "Physiotherapy", description: "Rehabilitation & physical therapy", count: 45, icon: "Accessibility" },
  { id: "nutrition_dietetics", name: "Nutrition & Dietetics", description: "Diet, nutrition & lifestyle", count: 30, icon: "Apple" }
];

const SEEDED_DOCTORS = [
  {
    id: "D000",
    name: "Dr. Supriya Kilari",
    specialty: "Cardiology",
    specialtyId: "cardiologist",
    experience: 14,
    rating: 4.9,
    reviewsCount: 312,
    hospital: "AIMS Super Speciality Hospital",
    languages: ["English", "Telugu", "Hindi"],
    fee: 800,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    bio: "Dr. Supriya Kilari is a senior cardiologist specializing in interventional cardiology and preventive heart health. With over 14 years of experience, she is dedicated to guiding patients through complex cardiovascular journeys.",
    education: "MD - Cardiology (AIIMS), MBBS (JIPMER)",
    availabilitySlots: ["09:00 AM", "10:30 AM", "11:00 AM", "03:00 PM", "04:30 PM", "06:00 PM"]
  },
  {
    id: "D001",
    name: "Dr. Rajesh Varma",
    specialty: "Cardiology",
    specialtyId: "cardiologist",
    experience: 12,
    rating: 4.8,
    reviewsCount: 245,
    hospital: "City Heart Hospital",
    languages: ["English", "Hindi", "Punjabi"],
    fee: 800,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200",
    bio: "Dr. Rajesh Varma is an expert in non-invasive cardiology and clinical heart health assessments.",
    education: "DM - Cardiology (KGMC), MD",
    availabilitySlots: ["10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"]
  },
  {
    id: "D002",
    name: "Dr. Rohan Mehta",
    specialty: "Neurology",
    specialtyId: "neurologist",
    experience: 10,
    rating: 4.7,
    reviewsCount: 180,
    hospital: "NeuroCare Institute",
    languages: ["English", "Gujarati", "Hindi"],
    fee: 900,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
    bio: "Dr. Rohan Mehta specializes in managing chronic migraines, stroke rehabilitation, and spinal nerve care.",
    education: "DM - Neurology (NIMHANS), MD",
    availabilitySlots: ["09:30 AM", "11:30 AM", "03:30 PM", "05:00 PM"]
  },
  {
    id: "D003",
    name: "Dr. Priya Nair",
    specialty: "Dermatology",
    specialtyId: "dermatologist",
    experience: 8,
    rating: 4.6,
    reviewsCount: 195,
    hospital: "Skin Bliss Clinic",
    languages: ["English", "Malayalam", "Tamil"],
    fee: 700,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200",
    bio: "Dr. Priya Nair is renowned for clinical dermatology, allergy tracking, and advanced skin rejuvenation therapies.",
    education: "MD - Dermatology (Amrita Inst), MBBS",
    availabilitySlots: ["10:30 AM", "12:00 PM", "04:00 PM", "06:00 PM"]
  },
  {
    id: "D004",
    name: "Dr. Vikram Shah",
    specialty: "Orthopedics",
    specialtyId: "orthopedic",
    experience: 15,
    rating: 4.9,
    reviewsCount: 320,
    hospital: "OrthoMax Hospital",
    languages: ["English", "Hindi", "Marathi"],
    fee: 900,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&q=80&w=200",
    bio: "Dr. Vikram Shah is a leading orthopedic surgeon focusing on joint replacements, sports injuries, and musculoskeletal repair.",
    education: "MS - Orthopedics (KEM Mumbai), MBBS",
    availabilitySlots: ["09:00 AM", "11:00 AM", "02:00 PM", "05:00 PM"]
  },
  {
    id: "D005",
    name: "Dr. Meera Iyer",
    specialty: "Pediatrics",
    specialtyId: "pediatrician",
    experience: 9,
    rating: 4.7,
    reviewsCount: 150,
    hospital: "ChildCare Hospital",
    languages: ["English", "Tamil", "Telugu"],
    fee: 600,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200",
    bio: "Dr. Meera Iyer offers warm, friendly primary pediatric care, routine child vaccinations, and developmental monitoring.",
    education: "DCH (Child Health - Madras Medical), MBBS",
    availabilitySlots: ["09:00 AM", "10:30 AM", "12:30 PM", "03:30 PM"]
  },
  {
    id: "D006",
    name: "Dr. Amit Das",
    specialty: "General Physician",
    specialtyId: "gen_physician",
    experience: 7,
    rating: 4.5,
    reviewsCount: 410,
    hospital: "HealthFirst Clinic",
    languages: ["English", "Bengali", "Hindi"],
    fee: 500,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
    bio: "Dr. Amit Das provides general health checks, blood pressure reviews, diabetic consults, and primary triage.",
    education: "MD - General Medicine (Calcutta Medical), MBBS",
    availabilitySlots: ["08:30 AM", "10:30 AM", "02:30 PM", "05:00 PM"]
  },
  {
    id: "D007",
    name: "Dr. Neha Kapoor",
    specialty: "ENT",
    specialtyId: "ent",
    experience: 11,
    rating: 4.6,
    reviewsCount: 135,
    hospital: "ENT Care Center",
    languages: ["English", "Hindi", "Odia"],
    fee: 650,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    bio: "Dr. Neha Kapoor is dedicated to treatment of ear, nose, and throat disorders with advanced diagnostics.",
    education: "MS - ENT (AIIMS), MBBS",
    availabilitySlots: ["10:00 AM", "11:00 AM", "03:00 PM", "04:30 PM"]
  },
  {
    id: "D008",
    name: "Dr. Arjun Patel",
    specialty: "Gastroenterology",
    specialtyId: "gastroenterologist",
    experience: 13,
    rating: 4.8,
    reviewsCount: 220,
    hospital: "DigestWell Hospital",
    languages: ["English", "Gujarati", "Hindi"],
    fee: 850,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    bio: "Dr. Arjun Patel is a specialist in digestive systems, endoscopy, and hepatic/liver wellness.",
    education: "DM - Gastroenterology (SGPGI), MD",
    availabilitySlots: ["09:30 AM", "11:30 AM", "03:30 PM", "05:30 PM"]
  },
  {
    id: "D009",
    name: "Dr. Kavita Reddy",
    specialty: "Pulmonology",
    specialtyId: "pulmonology",
    experience: 14,
    rating: 4.8,
    reviewsCount: 165,
    hospital: "BreathEasy Lung Clinic",
    languages: ["English", "Telugu", "Hindi"],
    fee: 800,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200",
    bio: "Dr. Kavita Reddy is a highly-regarded pulmonologist dedicated to respiratory care, asthma therapies, and advanced lung wellness programs.",
    education: "MD - Pulmonology, MBBS",
    availabilitySlots: ["09:00 AM", "11:00 AM", "03:00 PM", "05:00 PM"]
  },
  {
    id: "D010",
    name: "Dr. Alok Sharma",
    specialty: "Endocrinology",
    specialtyId: "endocrinology",
    experience: 11,
    rating: 4.6,
    reviewsCount: 112,
    hospital: "Metabolism Care Center",
    languages: ["English", "Hindi"],
    fee: 750,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
    bio: "Dr. Alok Sharma is a dedicated endocrinologist specializing in diabetes care, metabolic therapies, and hormonal balance treatments.",
    education: "DM - Endocrinology, MD",
    availabilitySlots: ["10:00 AM", "12:00 PM", "04:00 PM"]
  },
  {
    id: "D011",
    name: "Dr. Shalini Joshi",
    specialty: "Ophthalmology",
    specialtyId: "ophthalmology",
    experience: 9,
    rating: 4.7,
    reviewsCount: 140,
    hospital: "Iris Eye Hospital",
    languages: ["English", "Hindi", "Kannada"],
    fee: 600,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    bio: "Dr. Shalini Joshi provides comprehensive diagnostic and corrective eye care with precise diagnostic workflows.",
    education: "MS - Ophthalmology, MBBS",
    availabilitySlots: ["09:30 AM", "11:30 AM", "02:30 PM", "04:30 PM"]
  },
  {
    id: "D012",
    name: "Dr. Rajesh Khanna",
    specialty: "Psychiatry",
    specialtyId: "psychiatry",
    experience: 16,
    rating: 4.9,
    reviewsCount: 205,
    hospital: "MindSpace Wellness",
    languages: ["English", "Hindi", "Punjabi"],
    fee: 1000,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
    bio: "Dr. Rajesh Khanna is a compassionate psychiatrist focused on mental health, anxiety solutions, and supportive cognitive therapies.",
    education: "MD - Psychiatry, DPM",
    availabilitySlots: ["10:30 AM", "01:00 PM", "03:30 PM", "06:00 PM"]
  },
  {
    id: "D013",
    name: "Dr. Sunita Rao",
    specialty: "Gynecology",
    specialtyId: "gynecology",
    experience: 18,
    rating: 4.9,
    reviewsCount: 280,
    hospital: "Matrika Women's Hospital",
    languages: ["English", "Telugu", "Kannada"],
    fee: 950,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200",
    bio: "Dr. Sunita Rao provides comprehensive maternal-fetal care, reproductive health guidance, and wellness programs for women.",
    education: "MD - Gynecology, DGO",
    availabilitySlots: ["09:00 AM", "11:30 AM", "03:00 PM", "05:30 PM"]
  },
  {
    id: "D014",
    name: "Dr. Vijay Kumar",
    specialty: "Urology",
    specialtyId: "urology",
    experience: 12,
    rating: 4.5,
    reviewsCount: 98,
    hospital: "UroHealth Institute",
    languages: ["English", "Hindi", "Tamil"],
    fee: 700,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
    bio: "Dr. Vijay Kumar is an experienced urologist offering clinical consultations, prostate screenings, and urinary tract treatments.",
    education: "MCh - Urology, MS",
    availabilitySlots: ["11:00 AM", "01:00 PM", "04:00 PM", "06:00 PM"]
  },
  {
    id: "D015",
    name: "Dr. Emily Fernandes",
    specialty: "Oncology",
    specialtyId: "oncology",
    experience: 15,
    rating: 4.8,
    reviewsCount: 190,
    hospital: "Hope Cancer Pavilion",
    languages: ["English", "Konkani", "Hindi"],
    fee: 1200,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200",
    bio: "Dr. Emily Fernandes is a dedicated medical oncologist guiding families through custom-targeted cancer care and therapy paths.",
    education: "DM - Medical Oncology, MD",
    availabilitySlots: ["10:00 AM", "12:30 PM", "03:00 PM", "05:00 PM"]
  },
  {
    id: "D016",
    name: "Dr. Sandeep Mahto",
    specialty: "Nephrology",
    specialtyId: "nephrology",
    experience: 10,
    rating: 4.6,
    reviewsCount: 115,
    hospital: "Kidney Care Labs",
    languages: ["English", "Hindi", "Maithili"],
    fee: 800,
    availableToday: true,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
    bio: "Dr. Sandeep Mahto is an expert nephrologist specializing in hypertension, chronic kidney disease, and dialysis therapies.",
    education: "DM - Nephrology, MD",
    availabilitySlots: ["09:00 AM", "10:30 AM", "02:30 PM", "04:30 PM"]
  }
];

const SEEDED_HOSPITALS = [
  {
    id: "hosp-1",
    name: "AIMS Super Speciality Hospital",
    distance: "1.2 km",
    rating: 4.8,
    specialties: ["Cardiology", "Neurology", "Emergency Care", "Pediatrics"],
    emergency: true,
    address: "HSR Layout Sector 3, Bangalore",
    govBenefits: true,
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "hosp-2",
    name: "St. Mary's General Hospital",
    distance: "3.5 km",
    rating: 4.5,
    specialties: ["General Surgery", "Orthopedics", "Pulmonology"],
    emergency: true,
    address: "Koramangala 8th Block, Bangalore",
    govBenefits: true,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "hosp-3",
    name: "Aarogyasri Central Hospital",
    distance: "5.1 km",
    rating: 4.6,
    specialties: ["Ayushman Bharat", "Cardiology", "Dialysis", "Oncology"],
    emergency: true,
    address: "Whitefield Main Road, Bangalore",
    govBenefits: true,
    image: "https://images.unsplash.com/photo-1586773860418-d3b3da9601ee?auto=format&fit=crop&q=80&w=400"
  }
];

const SEEDED_MEDICINES = [
  { id: "med-1", name: "Metformin 500mg", strength: "500mg", manufacturer: "Cipla Ltd", mrp: 120, discount: 15, rxRequired: true, category: "Diabetes" },
  { id: "med-2", name: "Atorvastatin 10mg", strength: "10mg", manufacturer: "Sun Pharma", mrp: 180, discount: 10, rxRequired: true, category: "Heart Care" },
  { id: "med-3", name: "Paracetamol 650mg", strength: "650mg", manufacturer: "GSK", mrp: 30, discount: 5, rxRequired: false, category: "Pain & Fever" },
  { id: "med-4", name: "Amoxicillin 500mg", strength: "500mg", manufacturer: "Abbott", mrp: 150, discount: 12, rxRequired: true, category: "Antibiotics" }
];

const SEEDED_LAB_TESTS = [
  { id: "lab-1", name: "Comprehensive Full Body Checkup", description: "Includes 84 vital parameters (Liver, Kidney, Thyroid, Blood count etc)", preparation: "Fasting required for 10-12 hours", price: 1499, originalPrice: 3299, tags: ["Popular", "Highly Recommended"] },
  { id: "lab-2", name: "HbA1c & Blood Sugar Fasting", description: "Standard screening for Diabetes monitoring", preparation: "8 hours fasting required", price: 499, originalPrice: 999, tags: ["Diabetes"] },
  { id: "lab-3", name: "Lipid Profile (Cholesterol Check)", description: "Evaluates risk of heart disease & stroke", preparation: "12 hours fasting required", price: 599, originalPrice: 1200, tags: ["Heart Care"] }
];

const SEEDED_COUPONS = [
  { code: "HEALTH50", discountPercent: 50, maxDiscount: 200, description: "Save 50% on your first AI Consultation or booking." },
  { code: "TRIBE20", discountPercent: 20, maxDiscount: 500, description: "Flat 20% discount on medicines and lab tests." },
  { code: "AYUSHMAN", discountPercent: 100, maxDiscount: 1000, description: "Free screening for verified low-income cardholders." }
];

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string;
  chronicConditions: string;
  medications: string;
  height?: string;
  weight?: string;
  phone?: string;
  email?: string;
  onboardingComplete?: boolean;
  abhaNumber?: string;
  abhaVerified?: boolean;
}

// STATE STORAGE
let db: {
  appointments: any[];
  familyMembers: FamilyMember[];
  medicalTimeline: any[];
  medicineOrders: any[];
  labBookings: any[];
  abhaIdentities: any[];
  consentRecords: any[];
  importSessions: any[];
  importedHealthRecords: any[];
  supportChats: any[];
  triageConversations: any[];
  triageMessages: any[];
  auditLogs: any[];
  settings: any;
  aiConversations: any[];
  doctors: any[];
} = {
  aiConversations: [],
  doctors: SEEDED_DOCTORS,

  appointments: [
    {
      id: "appt-seeded-1",
      doctorId: "D000",
      doctorName: "Dr. Supriya Kilari",
      specialty: "Cardiologist",
      patientName: "Supriya Kilari",
      date: "2026-07-10",
      time: "10:30 AM",
      status: "Upcoming",
      type: "In-Person",
      fee: 800,
      notes: "Routine cardiac screening & mild tightness review."
    },
    {
      id: "appt-seeded-2",
      doctorId: "D000",
      doctorName: "Dr. Supriya Kilari",
      specialty: "Cardiologist",
      patientName: "Rami Kilari",
      date: "2026-07-06",
      time: "09:00 AM",
      status: "Upcoming",
      type: "Video",
      fee: 800,
      notes: "Hypertension drug titration follow-up."
    },
    {
      id: "appt-seeded-3",
      doctorId: "D003",
      doctorName: "Dr. Priya Nair",
      specialty: "Dermatologist",
      patientName: "Lakshmi Kilari",
      date: "2026-07-08",
      time: "04:00 PM",
      status: "Upcoming",
      type: "In-Person",
      fee: 700,
      notes: "Allergy patch test follow-up."
    },
    {
      id: "appt-seeded-4",
      doctorId: "D000",
      doctorName: "Dr. Supriya Kilari",
      specialty: "Cardiologist",
      patientName: "Karthik Kilari",
      date: "2026-07-05",
      time: "11:30 AM",
      status: "Upcoming",
      type: "In-Person",
      fee: 800,
      notes: "Athletic cardiac clearance check."
    },
    {
      id: "appt-seeded-5",
      doctorId: "D005",
      doctorName: "Dr. Meera Iyer",
      specialty: "Pediatrics",
      patientName: "Aditi Rao",
      date: "2026-07-07",
      time: "10:30 AM",
      status: "Upcoming",
      type: "Video",
      fee: 600,
      notes: "Routine vaccination counseling."
    },
    {
      id: "appt-seeded-6",
      doctorId: "D000",
      doctorName: "Dr. Supriya Kilari",
      specialty: "Cardiologist",
      patientName: "Sita Kilari",
      date: "2026-07-12",
      time: "11:00 AM",
      status: "Upcoming",
      type: "In-Person",
      fee: 800,
      notes: "Aortic flow echo review."
    },
    {
      id: "appt-seeded-7",
      doctorId: "D000",
      doctorName: "Dr. Supriya Kilari",
      specialty: "Cardiologist",
      patientName: "Ramesh Sharma",
      date: "2026-07-05",
      time: "02:00 PM",
      status: "Upcoming",
      type: "Video",
      fee: 800,
      notes: "Post-angioplasty weekly rehab check."
    },
    {
      id: "appt-seeded-8",
      doctorId: "D001",
      doctorName: "Dr. Rajesh Varma",
      specialty: "Cardiologist",
      patientName: "Supriya Kilari",
      date: "2026-06-28",
      time: "10:00 AM",
      status: "Completed",
      type: "In-Person",
      fee: 950,
      notes: "Initial annual lipid evaluation."
    },
    {
      id: "appt-seeded-9",
      doctorId: "D000",
      doctorName: "Dr. Supriya Kilari",
      specialty: "Cardiologist",
      patientName: "Rajesh Sharma",
      date: "2026-07-04",
      time: "04:30 PM",
      status: "Completed",
      type: "In-Person",
      fee: 800,
      notes: "Chest tightness diagnostic check. Advised rest."
    },
    {
      id: "appt-seeded-10",
      doctorId: "D000",
      doctorName: "Dr. Supriya Kilari",
      specialty: "Cardiologist",
      patientName: "Anjali Deshmukh",
      date: "2026-07-03",
      time: "11:00 AM",
      status: "Completed",
      type: "Video",
      fee: 800,
      notes: "Arrhythmia ECG reading."
    },
    {
      id: "appt-seeded-11",
      doctorId: "D004",
      doctorName: "Dr. Vikram Shah",
      specialty: "Orthopedics",
      patientName: "Karthik Kilari",
      date: "2026-06-25",
      time: "03:00 PM",
      status: "Completed",
      type: "In-Person",
      fee: 900,
      notes: "Ankle sprain ligament review."
    },
    {
      id: "appt-seeded-12",
      doctorId: "D006",
      doctorName: "Dr. Amit Das",
      specialty: "General Physician",
      patientName: "Rami Kilari",
      date: "2026-06-20",
      time: "09:30 AM",
      status: "Completed",
      type: "In-Person",
      fee: 500,
      notes: "Seasonal allergy and cold checkup."
    },
    {
      id: "appt-seeded-13",
      doctorId: "D000",
      doctorName: "Dr. Supriya Kilari",
      specialty: "Cardiologist",
      patientName: "Vikram Jeet",
      date: "2026-07-02",
      time: "03:00 PM",
      status: "Cancelled",
      type: "Voice",
      fee: 800,
      notes: "Patient rescheduled due to work travel."
    },
    {
      id: "appt-seeded-14",
      doctorId: "D002",
      doctorName: "Dr. Rohan Mehta",
      specialty: "Neurology",
      patientName: "Sita Kilari",
      date: "2026-06-18",
      time: "11:00 AM",
      status: "Completed",
      type: "In-Person",
      fee: 1000,
      notes: "Age-related memory reflex check."
    },
    {
      id: "appt-seeded-15",
      doctorId: "D000",
      doctorName: "Dr. Supriya Kilari",
      specialty: "Cardiologist",
      patientName: "Nisha Patel",
      date: "2026-07-05",
      time: "08:30 AM",
      status: "Upcoming",
      type: "In-Person",
      fee: 800,
      notes: "Mitral valve prolapse status."
    },
    {
      id: "appt-seeded-16",
      doctorId: "D000",
      doctorName: "Dr. Supriya Kilari",
      specialty: "Cardiologist",
      patientName: "Praveen Rao",
      date: "2026-07-05",
      time: "10:00 AM",
      status: "Upcoming",
      type: "Video",
      fee: 800,
      notes: "Hypertensive cardiovascular stress review."
    },
    {
      id: "appt-seeded-17",
      doctorId: "D000",
      doctorName: "Dr. Supriya Kilari",
      specialty: "Cardiologist",
      patientName: "Preeti Sinha",
      date: "2026-07-05",
      time: "12:00 PM",
      status: "Upcoming",
      type: "Voice",
      fee: 800,
      notes: "Post-op medication dosage review."
    },
    {
      id: "appt-seeded-18",
      doctorId: "D000",
      doctorName: "Dr. Supriya Kilari",
      specialty: "Cardiologist",
      patientName: "Rahul Dravid",
      date: "2026-07-05",
      time: "01:30 PM",
      status: "Upcoming",
      type: "In-Person",
      fee: 800,
      notes: "Bradycardia monitoring during fitness cycles."
    },
    {
      id: "appt-seeded-19",
      doctorId: "D000",
      doctorName: "Dr. Supriya Kilari",
      specialty: "Cardiologist",
      patientName: "Sunil Gavaskar",
      date: "2026-07-05",
      time: "03:30 PM",
      status: "Upcoming",
      type: "In-Person",
      fee: 800,
      notes: "Vascular stiffness assessment."
    },
    {
      id: "appt-seeded-20",
      doctorId: "D000",
      doctorName: "Dr. Supriya Kilari",
      specialty: "Cardiologist",
      patientName: "Aditi G",
      date: "2026-07-05",
      time: "04:00 PM",
      status: "Upcoming",
      type: "Video",
      fee: 800,
      notes: "Heart palpitations review."
    }
  ],
  familyMembers: [
    { id: "fam-self", name: "Supriya Kilari", relation: "Self", age: 29, gender: "Female", bloodGroup: "O+", allergies: "Peanuts, Penicillin", chronicConditions: "Mild Asthma", medications: "Inhaler (SOS)" },
    { id: "fam-1", name: "Rami Kilari", relation: "Father", age: 58, gender: "Male", bloodGroup: "O+", allergies: "None", chronicConditions: "Type 2 Diabetes, Hypertension", medications: "Metformin 500mg, Ramipril 5mg" },
    { id: "fam-2", name: "Lakshmi Kilari", relation: "Mother", age: 54, gender: "Female", bloodGroup: "A+", allergies: "Sulfa drugs", chronicConditions: "Thyroid", medications: "Thyronorm 50mcg" },
    { id: "fam-3", name: "Karthik Kilari", relation: "Brother", age: 24, gender: "Male", bloodGroup: "O+", allergies: "Dust mites", chronicConditions: "None", medications: "None" },
    { id: "fam-4", name: "Sita Kilari", relation: "Grandmother", age: 81, gender: "Female", bloodGroup: "B+", allergies: "Aspirin", chronicConditions: "Osteoarthritis, Mild Angina", medications: "Glucosamine, Sorbitrate (SOS)" }
  ],
  medicalTimeline: [
    {
      id: "timeline-1",
      date: "2026-06-15",
      title: "Annual Heart Health Checkup",
      patientId: "fam-self",
      patientName: "Supriya Kilari",
      category: "Consultation",
      doctorName: "Dr. Supriya Kilari",
      details: "Sinus rhythm normal, blood pressure stable at 118/75.",
      attachments: ["ECG_Report_June.pdf"]
    },
    {
      id: "timeline-2",
      date: "2026-05-10",
      title: "Blood Sugar Fasting",
      patientId: "fam-1",
      patientName: "Rami Kilari",
      category: "Lab Report",
      doctorName: "Diagnostic Labs Inc.",
      details: "Fasting sugar: 128 mg/dL. HbA1c: 7.1%. Control is fair but requires mild exercise monitoring.",
      attachments: ["Sugar_Report_May.pdf"]
    }
  ],
  medicineOrders: [] as any[],
  labBookings: [] as any[],
  abhaIdentities: [] as any[],
  consentRecords: [] as any[],
  importSessions: [] as any[],
  importedHealthRecords: [] as any[],
  supportChats: [
    { sender: "ai", text: "Hello! I am your HealthTribe AI Copilot. Describe any symptoms, check drug interactions, or get dietary recommendations. How are you feeling today?", timestamp: "2026-07-04T23:00:00Z" }
  ],
  triageConversations: [] as any[],
  triageMessages: [] as any[],
  auditLogs: [
    { id: "log-1", action: "System Boot", timestamp: new Date().toISOString(), user: "SYSTEM", ip: "127.0.0.1", details: "HealthTribe platform initialized successfully." }
  ],
  settings: {
    notificationsEnabled: true,
    emailAlerts: true,
    smsAlerts: true,
    caregiverMode: true,
    governmentBenefitsScreening: true,
    selectedLanguage: "English"
  }
};

// Log helper
function addLog(action: string, user: string, details: string) {
  db.auditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    action,
    timestamp: new Date().toISOString(),
    user,
    ip: "10.0.0.8",
    details
  });
}

// ---------------------------------------------------------
// REST API ENDPOINTS
// ---------------------------------------------------------

// Metadata & Diagnostics
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    engine: "HealthTribe Full-Stack AI Core",
    timestamp: new Date().toISOString(),
    geminiConnected: aiService.isAvailable()
  });
});

// Admin Stats
app.get("/api/admin/stats", (req, res) => {
  const totalRevenue = db.appointments.reduce((sum, a) => sum + (a.fee || 0), 0) +
                       db.medicineOrders.reduce((sum, o) => sum + (o.total || 0), 0) +
                       db.labBookings.reduce((sum, l) => sum + (l.price || 0), 0);
  res.json({
    usersCount: db.familyMembers.length,
    doctorsCount: SEEDED_DOCTORS.length,
    hospitalsCount: SEEDED_HOSPITALS.length,
    appointmentsCount: db.appointments.length,
    medicineOrdersCount: db.medicineOrders.length,
    labBookingsCount: db.labBookings.length,
    totalRevenue,
    auditLogs: db.auditLogs.slice(0, 50),
    appointments: db.appointments,
    familyMembers: db.familyMembers,
    medicalTimeline: db.medicalTimeline
  });
});

// ---------------------------------------------------------
// ABHA HEALTH DATA GATEWAY API ENDPOINTS
// ---------------------------------------------------------

// ABHA TEMP OTP STORAGE
const abhaOtpStorage = new Map<string, { otp: string; expiresAt: number; abhaNumber: string; abhaAddress: string }>();

// Generate OTP
app.post("/api/v1/abha/generate-otp", (req, res) => {
  const { abhaNumber, abhaAddress, patientId } = req.body;
  if (!abhaNumber && !abhaAddress) {
    return res.status(400).json({ error: "ABHA Number or ABHA Address is required." });
  }

  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  // Generate random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

  abhaOtpStorage.set(transactionId, {
    otp,
    expiresAt,
    abhaNumber: abhaNumber || `${patientId}_num@abha`,
    abhaAddress: abhaAddress || `${patientId}@abha`
  });

  console.log(`[ABHA GATEWAY] Generated OTP: ${otp} for transaction: ${transactionId}`);
  addLog("ABHA OTP Generation", patientId || "SYSTEM", `Generated ABHA OTP for transaction: ${transactionId}`);

  res.json({
    success: true,
    message: "OTP sent successfully to your registered mobile number (+91 ******9932).",
    transactionId,
    otpHint: otp // Expose OTP hint to UI for easy demonstration/flow
  });
});

// Verify OTP
app.post("/api/v1/abha/verify-otp", (req, res) => {
  const { transactionId, otp, patientId } = req.body;
  if (!transactionId || !otp || !patientId) {
    return res.status(400).json({ error: "Transaction ID, OTP, and Patient ID are required." });
  }

  // Handle mock error codes
  if (otp === "000000") {
    return res.status(400).json({ error: "OTP has expired. Please request a new OTP." });
  }
  if (otp === "999999") {
    return res.status(400).json({ error: "Internal Gateway Error. ABHA linking failed." });
  }

  const stored = abhaOtpStorage.get(transactionId);
  if (!stored) {
    return res.status(400).json({ error: "Invalid transaction session." });
  }

  if (Date.now() > stored.expiresAt) {
    abhaOtpStorage.delete(transactionId);
    return res.status(400).json({ error: "OTP has expired. Please generate a new OTP." });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP. Please check and try again." });
  }

  // Remove existing linked identity for this patient (relinking scenario)
  db.abhaIdentities = db.abhaIdentities.filter((id: any) => id.patientId !== patientId);

  // Store active linked identity
  const newIdentity = {
    id: `abha_id_${Date.now()}`,
    patientId,
    abhaNumber: stored.abhaNumber,
    abhaAddress: stored.abhaAddress,
    mobile: "+91 98402 12345",
    linkedAt: new Date().toISOString(),
    verified: true,
    status: "ACTIVE"
  };

  db.abhaIdentities.push(newIdentity);

  // Sync to family member profile as well
  const memberIndex = db.familyMembers.findIndex((m: any) => m.id === patientId);
  if (memberIndex !== -1) {
    db.familyMembers[memberIndex].abhaNumber = stored.abhaNumber;
    // Note: our types also have abhaVerified.
    (db.familyMembers[memberIndex] as any).abhaVerified = true;
  }

  addLog("ABHA Account Linking", patientId, `Successfully linked ABHA Identity ${stored.abhaAddress}`);
  abhaOtpStorage.delete(transactionId);

  res.json({
    success: true,
    message: "ABHA Identity successfully verified and linked.",
    identity: newIdentity
  });
});

// Unlink ABHA Address
app.post("/api/v1/abha/unlink", (req, res) => {
  const { patientId } = req.body;
  if (!patientId) {
    return res.status(400).json({ error: "Patient ID is required." });
  }

  const index = db.abhaIdentities.findIndex((id: any) => id.patientId === patientId);
  if (index !== -1) {
    const abhaAddress = db.abhaIdentities[index].abhaAddress;
    db.abhaIdentities.splice(index, 1);

    // Update family member profile
    const memberIndex = db.familyMembers.findIndex((m: any) => m.id === patientId);
    if (memberIndex !== -1) {
      delete db.familyMembers[memberIndex].abhaNumber;
      (db.familyMembers[memberIndex] as any).abhaVerified = false;
    }

    addLog("ABHA Account Unlinking", patientId, `Successfully unlinked ABHA Address ${abhaAddress}`);
    return res.json({ success: true, message: "ABHA Address unlinked successfully." });
  }

  res.status(404).json({ error: "No linked ABHA Identity found for this patient." });
});

// Fetch Active ABHA Identity
app.get("/api/v1/abha/identity/:patientId", (req, res) => {
  const { patientId } = req.params;
  const identity = db.abhaIdentities.find((id: any) => id.patientId === patientId);
  res.json({ linked: !!identity, identity: identity || null });
});

// Discover participating hospitals
app.get("/api/v1/abha/hospitals", (req, res) => {
  const abhaHospitals = [
    { id: "hip-aiims", name: "AIIMS Bangalore Super Speciality", address: "Anugraha Layout, Bangalore", abhaActive: true, distance: "1.5 km", abhaStatus: "CONNECTED" },
    { id: "hip-apollo", name: "Apollo Greams Road Clinic", address: "Bannerghatta Main Road, Bangalore", abhaActive: true, distance: "2.8 km", abhaStatus: "CONNECTED" },
    { id: "hip-manipal", name: "Manipal Medical Center", address: "HAL Airport Road, Bangalore", abhaActive: true, distance: "4.1 km", abhaStatus: "DISCOVERED" },
    { id: "hip-fortis", name: "Fortis Escorts Cardiac Ward", address: "Cunningham Road, Bangalore", abhaActive: true, distance: "5.5 km", abhaStatus: "DISCOVERED" },
  ];
  res.json({ success: true, hospitals: abhaHospitals });
});

// Request Consent
app.post("/api/v1/consent/request", (req, res) => {
  const { patientId, abhaAddress, hipId, hipName, purpose, consentExpiry, dataTypes } = req.body;

  if (!patientId || !abhaAddress || !hipId) {
    return res.status(400).json({ error: "Patient ID, ABHA Address, and HIP ID are required." });
  }

  const consentId = `con_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const newConsent = {
    id: consentId,
    patientId,
    abhaAddress,
    hiuId: "HealthTribe-HIU",
    hipId,
    hipName,
    purpose: purpose || "Referral & diagnostics consolidation",
    consentExpiry: consentExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "GRANTED", // Auto-granted for seamless mock sandbox experience, but editable
    dataTypes: dataTypes || ["Prescription", "DiagnosticReport", "DischargeSummary"],
    createdAt: new Date().toISOString(),
    grantedAt: new Date().toISOString()
  };

  db.consentRecords.push(newConsent);
  addLog("Consent Created", patientId, `Created consent request ${consentId} for ${hipName}`);

  res.json({ success: true, message: "Consent requested and granted successfully.", consent: newConsent });
});

// Consent action (Grant/Revoke)
app.post("/api/v1/consent/action", (req, res) => {
  const { consentId, action, patientId } = req.body; // action: GRANTED or REVOKED
  if (!consentId || !action) {
    return res.status(400).json({ error: "Consent ID and action (GRANTED/REVOKED) are required." });
  }

  const index = db.consentRecords.findIndex((c: any) => c.id === consentId);
  if (index !== -1) {
    db.consentRecords[index].status = action;
    if (action === "GRANTED") {
      db.consentRecords[index].grantedAt = new Date().toISOString();
    }
    addLog(`Consent ${action}`, patientId || "SYSTEM", `Updated consent ${consentId} status to ${action}`);
    return res.json({ success: true, message: `Consent status successfully marked as ${action}.`, consent: db.consentRecords[index] });
  }

  res.status(404).json({ error: "Consent record not found." });
});

// List Consents
app.get("/api/v1/consent/list/:patientId", (req, res) => {
  const { patientId } = req.params;
  const list = db.consentRecords.filter((c: any) => c.patientId === patientId);
  res.json({ success: true, consents: list });
});

// Initiate ABHA Records Import
app.post("/api/v1/abha/import/:patientId", async (req, res) => {
  const { patientId } = req.params;
  const { consentId, hipId, hipName } = req.body;

  if (!consentId || !hipId || !hipName) {
    return res.status(400).json({ error: "Consent ID, HIP ID, and HIP Name are required." });
  }

  // Validate active consent status
  const consent = db.consentRecords.find((c: any) => c.id === consentId);
  if (!consent || consent.status !== "GRANTED") {
    return res.status(400).json({ error: "Active GRANTED consent is required to import health records." });
  }

  const sessionId = `imp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const newSession = {
    id: sessionId,
    patientId,
    consentId,
    hipId,
    hipName,
    status: "PENDING",
    progress: 0,
    createdAt: new Date().toISOString()
  };

  db.importSessions.push(newSession);
  addLog("ABHA Import Started", patientId, `Started diagnostic records import session ${sessionId} from ${hipName}`);

  // Simulate background multi-stage progress advancement using server setTimeout
  const stages = [
    { status: "AUTHENTICATING", progress: 15 },
    { status: "FETCHING_METADATA", progress: 40 },
    { status: "DECRYPTING", progress: 65 },
    { status: "PARSING", progress: 85 },
    { status: "COMPLETED", progress: 100 }
  ];

  let currentStageIndex = 0;

  const advanceStage = () => {
    const sessionIndex = db.importSessions.findIndex((s: any) => s.id === sessionId);
    if (sessionIndex === -1) return;

    if (currentStageIndex < stages.length) {
      const stage = stages[currentStageIndex];
      db.importSessions[sessionIndex].status = stage.status;
      db.importSessions[sessionIndex].progress = stage.progress;
      currentStageIndex++;

      if (stage.status === "COMPLETED") {
        // Core business logic: execute actual records insertion & AI generation!
        completeImportFlow(patientId, hipId, hipName).catch(console.error);
      } else {
        setTimeout(advanceStage, 1000);
      }
    }
  };

  // Start background simulations
  setTimeout(advanceStage, 800);

  res.json({ success: true, message: "Import session initialized successfully.", sessionId });
});

// Import Session Status Poller
app.get("/api/v1/abha/import/session/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = db.importSessions.find((s: any) => s.id === sessionId);
  if (!session) {
    return res.status(404).json({ error: "Import session not found." });
  }
  res.json({ success: true, session });
});

async function completeImportFlow(patientId: string, hipId: string, hipName: string) {
  let records: any[] = [];
  const pName = db.familyMembers.find((m: any) => m.id === patientId)?.name || "Patient";

  if (hipId === "hip-aiims") {
    records = [
      {
        id: `rec-aiims-${Date.now()}-1`,
        date: "2026-04-18",
        title: "Echocardiogram Diagnostic Assay",
        patientId,
        patientName: pName,
        category: "Lab Report",
        doctorName: "Dr. Sandeep Mahto",
        details: "LVEF 60%. Mild diastolic dysfunction observed. Left atrium borderline dilated.",
        hospital: hipName,
        specialty: "Cardiology",
        source: "ABHA",
        type: "Lab Report"
      },
      {
        id: `rec-aiims-${Date.now()}-2`,
        date: "2026-04-18",
        title: "Clinical Consultation Summary",
        patientId,
        patientName: pName,
        category: "Consultation",
        doctorName: "Dr. Sandeep Mahto",
        details: "Diagnosed with Type-C Hypertension. Advised low salt Diet, morning exercise, and Ramipril 5mg.",
        hospital: hipName,
        specialty: "Cardiology",
        source: "ABHA",
        type: "Consultation"
      }
    ];
  } else if (hipId === "hip-apollo") {
    records = [
      {
        id: `rec-apollo-${Date.now()}-1`,
        date: "2026-05-12",
        title: "HbA1c Glycemic Panel",
        patientId,
        patientName: pName,
        category: "Lab Report",
        doctorName: "Dr. Anika Verma",
        details: "HbA1c is 7.2%. Fasting glucose is 134 mg/dL. Consistent with mild Type 2 diabetes control.",
        hospital: hipName,
        specialty: "Endocrinology",
        source: "ABHA",
        type: "Lab Report"
      },
      {
        id: `rec-apollo-${Date.now()}-2`,
        date: "2026-05-13",
        title: "Therapeutic Drug Prescription",
        patientId,
        patientName: pName,
        category: "Prescription",
        doctorName: "Dr. Anika Verma",
        details: "Rx: Metformin 500mg (OD, after breakfast) and Atorvastatin 10mg (HS). Avoid alcohol.",
        hospital: hipName,
        specialty: "Endocrinology",
        source: "ABHA",
        type: "Prescription"
      }
    ];
  } else {
    records = [
      {
        id: `rec-gen-${Date.now()}-1`,
        date: "2026-03-24",
        title: "General Wellness Screening",
        patientId,
        patientName: pName,
        category: "Lab Report",
        doctorName: "Dr. Amit Das",
        details: "Serum Cholesterol 220 mg/dL. LDL 135 mg/dL. Borderline hyperlipidemia.",
        hospital: hipName,
        specialty: "Internal Medicine",
        source: "ABHA",
        type: "Lab Report"
      }
    ];
  }

  for (const rec of records) {
    db.medicalTimeline.unshift(rec);
    db.importedHealthRecords.push({
      id: rec.id,
      patientId,
      hipId,
      hipName,
      recordType: rec.type,
      title: rec.title,
      date: rec.date,
      doctorName: rec.doctorName,
      details: rec.details,
      careContextRef: `OPD-${Math.floor(10000 + Math.random() * 90000)}`
    });
  }

  const promptPayload = PromptBuilder.buildABHAPrompt(records, pName);

  let summary = "";
  if (aiService.isAvailable()) {
    try {
      // Use retryWithBackoff as defined in server.ts
      const responseText = await aiService.generateContent(promptPayload);
      const response = { text: responseText };
      summary = response.text || "Analyzed imported clinical data successfully.";
    } catch (err) {
      console.error("Gemini ABHA records summary error:", err);
      summary = generateHeuristicABHASummary(records, pName);
    }
  } else {
    summary = generateHeuristicABHASummary(records, pName);
  }

  const summaryEvent = {
    id: `rec-summary-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    title: `ABHA AI Summary: ${hipName} Consolidated Insights`,
    patientId,
    patientName: pName,
    category: "Consultation",
    doctorName: "HealthTribe AI Clinical Agent",
    details: summary,
    hospital: hipName,
    specialty: "AI Diagnostics",
    source: "ABHA" as const,
    type: "Triage" as const,
    aiSummary: summary
  };

  db.medicalTimeline.unshift(summaryEvent);
  addLog("ABHA AI Summary Generated", patientId, `Successfully generated clinical AI digest for ${hipName} imports.`);
}

function generateHeuristicABHASummary(records: any[], pName: string) {
  if (records.some(r => r.title.includes("Echocardiogram"))) {
    return `Clinically verified Echo assay for ${pName} shows borderline Left Atrium dilation and mild diastolic dysfunction with stable LVEF (60%). Concomitant diagnostic review suggests active Type-C Hypertension. Patient is advised to maintain low-sodium nutrition, incorporate active morning walks, and strictly adhere to Ramipril 5mg daily. Follow-up consultation with a Cardiologist is recommended in 30 days to re-evaluate vascular pressures.`;
  } else if (records.some(r => r.title.includes("Glycemic"))) {
    return `Imported metabolic data for ${pName} verifies HbA1c at 7.2% and Fasting Glucose at 134 mg/dL, indicating active Type-2 diabetes progression requiring therapeutic drug titration. Patient's therapeutic regimen consists of Metformin 500mg daily and Atorvastatin 10mg at bedtime to protect cardiovascular parameters. It is critical to strictly avoid alcohol to bypass adverse drug interactions. Recommend repeating HbA1c and lipid assays in 3 months.`;
  }
  return `Consolidated records for ${pName} show a borderline serum cholesterol profile of 220 mg/dL and LDL of 135 mg/dL. These parameters suggest minor cardiovascular hyperlipidemia risk. Recommended actions include adopting a diet low in saturated fats, maintaining active hydration, and scheduling a routine lipid profiling session in 90 days.`;
}

// Reset Database API
app.post("/api/admin/reset", (req, res) => {
  db.appointments = [
    {
      id: "appt-seeded-1",
      doctorId: "doc-1",
      doctorName: "Dr. Supriya Kilari",
      specialty: "Cardiologist",
      patientName: "Supriya Kilari",
      date: "2026-07-10",
      time: "10:30 AM",
      status: "Upcoming",
      type: "In-Person",
      fee: 800,
      notes: "Routine cardiac screening & mild tightness review."
    }
  ];
  db.medicineOrders = [];
  db.labBookings = [];
  db.medicalTimeline = db.medicalTimeline.slice(0, 2);
  db.supportChats = [
    { sender: "ai", text: "Hello! I am your HealthTribe AI Copilot. Describe any symptoms, check drug interactions, or get dietary recommendations. How are you feeling today?", timestamp: "2026-07-04T23:00:00Z" }
  ];
  db.triageConversations = [];
  db.triageMessages = [];
  addLog("Database Reset", "ADMIN", "All dynamic transactions wiped. Seed data preserved.");
  res.json({ success: true, message: "Database reset successfully." });
});

// Doctor Listings & Search
app.get("/api/doctors", (req, res) => {
  const { specialty, search, lang } = req.query;
  let filtered = [...SEEDED_DOCTORS];

  if (specialty && specialty !== "all") {
    filtered = filtered.filter(d => d.specialtyId === specialty || d.specialty.toLowerCase() === (specialty as string).toLowerCase());
  }

  if (search) {
    const s = (search as string).toLowerCase();
    filtered = filtered.filter(d => 
      d.name.toLowerCase().includes(s) || 
      d.specialty.toLowerCase().includes(s) || 
      d.hospital.toLowerCase().includes(s)
    );
  }

  if (lang) {
    filtered = filtered.filter(d => d.languages.includes(lang as string));
  }

  res.json({
    specialties: SEEDED_SPECIALTIES,
    doctors: filtered
  });
});

// Hospitals Listing
app.get("/api/hospitals", (req, res) => {
  res.json({ hospitals: SEEDED_HOSPITALS });
});

// Family Health Vault
app.get("/api/family", (req, res) => {
  res.json({ familyMembers: db.familyMembers });
});

app.post("/api/family", (req, res) => {
  const { name, relation, age, gender, bloodGroup, allergies, chronicConditions, medications, height, weight, phone, email, onboardingComplete } = req.body;
  if (!name || !relation) {
    return res.status(400).json({ error: "Name and relation are required." });
  }
  const newMember = {
    id: `fam-${Date.now()}`,
    name,
    relation,
    age: Number(age) || 30,
    gender: gender || "Other",
    bloodGroup: bloodGroup || "Unknown",
    allergies: allergies || "None",
    chronicConditions: chronicConditions || "None",
    medications: medications || "None",
    height: height || "",
    weight: weight || "",
    phone: phone || "",
    email: email || "",
    onboardingComplete: onboardingComplete || false
  };
  db.familyMembers.push(newMember);
  addLog("Add Family Member", name, `Added family profile for ${name} (${relation})`);
  res.json({ success: true, member: newMember });
});

app.put("/api/family/:id", (req, res) => {
  const { id } = req.params;
  const { name, relation, age, gender, bloodGroup, allergies, chronicConditions, medications, height, weight, phone, email, onboardingComplete } = req.body;
  const idx = db.familyMembers.findIndex(m => m.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Profile not found." });
  }
  db.familyMembers[idx] = {
    ...db.familyMembers[idx],
    name: name || db.familyMembers[idx].name,
    relation: relation || db.familyMembers[idx].relation,
    age: age !== undefined ? Number(age) : db.familyMembers[idx].age,
    gender: gender || db.familyMembers[idx].gender,
    bloodGroup: bloodGroup || db.familyMembers[idx].bloodGroup,
    allergies: allergies !== undefined ? allergies : db.familyMembers[idx].allergies,
    chronicConditions: chronicConditions !== undefined ? chronicConditions : db.familyMembers[idx].chronicConditions,
    medications: medications !== undefined ? medications : db.familyMembers[idx].medications,
    height: height !== undefined ? height : db.familyMembers[idx].height,
    weight: weight !== undefined ? weight : db.familyMembers[idx].weight,
    phone: phone !== undefined ? phone : db.familyMembers[idx].phone,
    email: email !== undefined ? email : db.familyMembers[idx].email,
    onboardingComplete: onboardingComplete !== undefined ? onboardingComplete : db.familyMembers[idx].onboardingComplete
  };
  addLog("Update Profile", db.familyMembers[idx].name, `Updated health profile for ${db.familyMembers[idx].name}`);
  res.json({ success: true, member: db.familyMembers[idx] });
});


app.delete("/api/family/:id", (req, res) => {
  const { id } = req.params;
  const idx = db.familyMembers.findIndex((m) => m.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Profile not found." });
  }
  const deletedName = db.familyMembers[idx].name;
  db.familyMembers.splice(idx, 1);
  addLog("Delete Profile", deletedName, `Deleted family profile for ${deletedName}`);
  res.json({ success: true });
});
// Medical Timeline
app.get("/api/timeline", (req, res) => {
  const { patientId } = req.query;
  let list = db.medicalTimeline;
  if (patientId && patientId !== "all") {
    list = list.filter(t => t.patientId === patientId);
  }
  res.json({ timeline: list });
});

app.post("/api/timeline", (req, res) => {
  const { title, patientId, category, doctorName, details, highlights, riskLevel, reportAnalysis } = req.body;
  if (!title || !patientId) {
    return res.status(400).json({ error: "Title and patientId are required." });
  }
  const patient = db.familyMembers.find(f => f.id === patientId);
  const newRecord = {
    id: `timeline-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    title,
    patientId,
    patientName: patient ? patient.name : "Unknown",
    category: category || "Consultation",
    doctorName: doctorName || "HealthTribe Care Specialist",
    details: details || "",
    attachments: [],
    highlights: highlights || [],
    riskLevel: riskLevel || "Low",
    reportAnalysis: reportAnalysis || null
  };
  db.medicalTimeline.unshift(newRecord);
  addLog("Create Timeline Event", newRecord.patientName, `Added health record: ${title}`);
  res.json({ success: true, record: newRecord });
});

// Medicine Ordering
app.get("/api/medicines", (req, res) => {
  res.json({ medicines: SEEDED_MEDICINES });
});

app.post("/api/medicines/order", (req, res) => {
  const { items, address, paymentMethod, couponCode } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "No items in cart." });
  }

  let subtotal = 0;
  const processedItems = items.map((cartItem: any) => {
    const med = SEEDED_MEDICINES.find(m => m.id === cartItem.id);
    if (!med) return cartItem;
    const price = med.mrp * (1 - med.discount / 100);
    subtotal += price * cartItem.quantity;
    return { ...med, quantity: cartItem.quantity, finalPrice: price };
  });

  let discount = 0;
  if (couponCode) {
    const coupon = SEEDED_COUPONS.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    if (coupon) {
      discount = (subtotal * coupon.discountPercent) / 100;
      if (discount > coupon.maxDiscount) discount = coupon.maxDiscount;
    }
  }

  const finalTotal = Math.max(0, subtotal - discount) + 50; // 50 delivery charge

  const newOrder = {
    id: `order-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    items: processedItems,
    subtotal,
    discount,
    deliveryFee: 50,
    total: finalTotal,
    address: address || "Default Address",
    paymentMethod: paymentMethod || "UPI",
    status: "Processing"
  };

  db.medicineOrders.push(newOrder);
  addLog("Medicine Order", "User", `Placed medicine order ${newOrder.id} - Total: ₹${finalTotal.toFixed(2)}`);

  // Add auto-generated follow-up medicine reminder to patient timeline
  db.medicalTimeline.unshift({
    id: `timeline-order-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    title: "Prescribed Medicine Delivery Scheduled",
    patientId: "fam-self",
    patientName: "Supriya Kilari",
    category: "Prescription",
    doctorName: "HealthTribe Pharmacy",
    details: `Delivery of ${processedItems.map((pi: any) => pi.name).join(", ")} is confirmed. Auto medicine alert activated.`,
    attachments: []
  });

  res.json({ success: true, order: newOrder });
});

// Lab Testing
app.get("/api/labs", (req, res) => {
  res.json({ tests: SEEDED_LAB_TESTS });
});

app.post("/api/labs/book", (req, res) => {
  const { testId, patientId, date, slot, address } = req.body;
  const test = SEEDED_LAB_TESTS.find(t => t.id === testId);
  const patient = db.familyMembers.find(f => f.id === patientId);

  if (!test || !patient) {
    return res.status(404).json({ error: "Test or patient profile not found." });
  }

  const newBooking = {
    id: `lab-${Date.now()}`,
    testId,
    testName: test.name,
    patientId,
    patientName: patient.name,
    date,
    slot,
    address: address || "Home Visit Service",
    price: test.price,
    status: "Scheduled"
  };

  db.labBookings.push(newBooking);
  addLog("Lab Booking", patient.name, `Booked ${test.name} for ${date} (${slot})`);

  // Add to medical timeline
  db.medicalTimeline.unshift({
    id: `timeline-lab-${Date.now()}`,
    date,
    title: `Lab Test Scheduled: ${test.name}`,
    patientId,
    patientName: patient.name,
    category: "Lab Report",
    doctorName: "HealthTribe Labs",
    details: `Home sample collection booked for ${date} at ${slot}. Preparation required: ${test.preparation}.`,
    attachments: []
  });

  res.json({ success: true, booking: newBooking });
});

// Appointments (CRUD)
app.get("/api/appointments", (req, res) => {
  res.json({ appointments: db.appointments });
});

app.post("/api/appointments", (req, res) => {
  const { doctorId, patientId, date, time, type, notes } = req.body;
  const doctor = SEEDED_DOCTORS.find(d => d.id === doctorId);
  const patient = db.familyMembers.find(f => f.id === patientId);

  if (!doctor || !patient) {
    return res.status(404).json({ error: "Doctor or Patient profile not found." });
  }

  const newAppt = {
    id: `appt-${Date.now()}`,
    doctorId,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    patientName: patient.name,
    date,
    time,
    status: "Upcoming",
    type: type || "In-Person",
    fee: doctor.fee,
    notes: notes || "Initial Consultation"
  };

  db.appointments.push(newAppt);
  addLog("Book Appointment", patient.name, `Scheduled consultation with ${doctor.name} on ${date} at ${time}`);

  // Create visit prep list and add to timeline automatically!
  db.medicalTimeline.unshift({
    id: `timeline-appt-${Date.now()}`,
    date,
    title: `Consultation with ${doctor.name}`,
    patientId: patient.id,
    patientName: patient.name,
    category: "Consultation",
    doctorName: doctor.name,
    details: `Scheduled ${type} visit. Notes: ${newAppt.notes}. Follow instructions for pre-visit checklist: bring all active medications and prior diagnostics.`,
    attachments: []
  });

  res.json({ success: true, appointment: newAppt });
});

app.post("/api/appointments/cancel", (req, res) => {
  const { appointmentId } = req.body;
  const index = db.appointments.findIndex(a => a.id === appointmentId);
  if (index === -1) {
    return res.status(404).json({ error: "Appointment not found." });
  }
  const appt = db.appointments[index];
  appt.status = "Cancelled";
  addLog("Cancel Appointment", appt.patientName, `Cancelled appointment with ${appt.doctorName}`);
  res.json({ success: true, appointment: appt });
});

app.post("/api/appointments/reschedule", (req, res) => {
  const { appointmentId, date, time } = req.body;
  const index = db.appointments.findIndex(a => a.id === appointmentId);
  if (index === -1) {
    return res.status(404).json({ error: "Appointment not found." });
  }
  const appt = db.appointments[index];
  appt.date = date;
  appt.time = time;
  appt.status = "Upcoming";
  addLog("Reschedule Appointment", appt.patientName, `Rescheduled consultation with ${appt.doctorName} to ${date} at ${time}`);
  res.json({ success: true, appointment: appt });
});

// Coupons Apply Validation
app.post("/api/coupons/apply", (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Coupon code is required." });
  const coupon = SEEDED_COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase());
  if (coupon) {
    res.json({ success: true, coupon });
  } else {
    res.status(400).json({ success: false, error: "Invalid coupon code." });
  }
});

// ---------------------------------------------------------
// Helper for retrying AI calls with exponential backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const isQuota = err.status === "RESOURCE_EXHAUSTED" || err.status === 429 || err.status === 503 || (err.message && (err.message.includes("429") || err.message.includes("503")));
    const isNetwork = err.message && (err.message.includes("fetch failed") || err.message.includes("ECONNRESET") || err.message.includes("socket hang up"));
    if (retries > 0 && (isQuota || isNetwork)) {
      console.log(`Error: ${err.message}, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

// AI Doctor Assistant Chatbot
app.post("/api/doctor-chat", async (req, res) => {
  const { query, history } = req.body;
  if (!aiService.isAvailable()) {
    return res.json({ response: "AI service currently unavailable." });
  }

  // Gather context from DB
    const doctorContext = {
    appointments: db.appointments.filter(a => a.doctorId === "D000"), // assuming Dr Supriya
    patients: db.familyMembers,
    today: new Date().toISOString().split("T")[0]
  };
  
  // Use PromptBuilder
  const promptPayload = PromptBuilder.buildDoctorPrompt(doctorContext, history, query, db.medicalTimeline);
  
  try {

    const responseText = await aiService.generateContent(promptPayload);
    const response = { text: responseText };
    res.json({ response: response.text || "I am currently unable to provide an AI response, please try again." });
  } catch (err: any) {
    console.error("Doctor Chat Error:", err);
    res.json({ response: "AI service is currently busy or unavailable, returning heuristic response. Patient condition seems stable. Please monitor carefully." });
  }
});


// Triage Conversations API
app.get("/api/triage/conversations", (req, res) => {
  res.json({ conversations: db.triageConversations || [] });
});

app.post("/api/triage/conversations", (req, res) => {
  const { title } = req.body;
  const newConversation = {
    id: "conv-" + Date.now(),
    title: title || "Symptom Triage",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.triageConversations.unshift(newConversation);
  res.json({ conversation: newConversation });
});

app.get("/api/triage/conversations/:id/messages", (req, res) => {
  const { id } = req.params;
  const messages = (db.triageMessages || []).filter(m => m.conversationId === id);
  res.json({ messages });
});

app.post("/api/triage/conversations/:id/messages", (req, res) => {
  const { id } = req.params;
  const { message, sender, triage, status } = req.body;
  
  const newMessage = {
    id: "msg-" + Date.now() + Math.random(),
    conversationId: id,
    sender,
    text: message,
    triage,
    status: status || "complete",
    timestamp: new Date().toISOString()
  };
  
  db.triageMessages.push(newMessage);
  
  // Update conversation updatedAt
  const conv = db.triageConversations.find(c => c.id === id);
  if (conv) {
    conv.updatedAt = new Date().toISOString();
  }
  
  res.json({ message: newMessage });
});

// Update specific message (for streaming / status updates)
app.put("/api/triage/messages/:msgId", (req, res) => {
  const { msgId } = req.params;
  const { status, triage, text } = req.body;
  
  const msg = db.triageMessages.find(m => m.id === msgId);
  if (msg) {
    if (status) msg.status = status;
    if (triage) msg.triage = triage;
    if (text !== undefined) msg.text = text;
    res.json({ message: msg });
  } else {
    res.status(404).json({ error: "Message not found" });
  }
});

// AI Chatbot Symptom Copilot & Smart Triage
app.post("/api/triage", async (req, res) => {
  const { message, history, familyMemberId } = req.body;
  const patient = db.familyMembers.find(f => f.id === familyMemberId) || db.familyMembers[0];

  const systemPrompt = `You are a real-time, high-performance Triage Copilot for HealthTribe AI.
Analyze symptoms instantly and provide structured health guidance.
Strictly respond ONLY with this JSON schema:
{
  "assessment": "Short assessment summary",
  "urgency": "RED" | "ORANGE" | "YELLOW" | "GREEN" | "BLUE",
  "clinicalCategories": string[],
  "followUpQuestions": string[],
  "recommendations": string[],
  "specialist": "General Physician" | "Cardiologist" | "Pediatrician" | "Dermatologist" | "Neurologist" | "Orthopedic" | "ENT" | "Gastroenterologist" | "Pulmonologist" | "Endocrinologist" | "Ophthalmologist" | "Psychiatrist" | "Gynecologist" | "Urologist" | "Oncologist" | "Nephrologist" | "Plastic Surgeon" | "Radiologist" | "Physiotherapist" | "Nutritionist",
  "emergencyWarnings": string[],
  "nearbyHospitalRecommendation": string,
  "aiDoctorResponse": "Friendly, professional medical response"
}
Guidelines:
1. Identify red-flags immediately.
2. Distinguish: Emergency, Urgent, 24h, Routine, Self-care.
3. Explain why this classification was made.
4. Include a medical disclaimer.
5. Patient: ${patient.name}, Age: ${patient.age}, Gender: ${patient.gender}, Chronic: ${patient.chronicConditions || "None"}.`;

  if (aiService.isAvailable()) {
    try {
      const promptPayload = PromptBuilder.buildTriagePrompt(patient, message, history);
      const responseText = await aiService.generateContent(promptPayload);
      const response = { text: responseText };

      const triageResult = JSON.parse(response.text || "{}");
      
      // Update persistent memory
      db.supportChats.push({
          sender: "user",
          text: message,
          timestamp: new Date().toISOString()
      });
      db.supportChats.push({
          sender: "ai",
          text: "Triage assessment provided.",
          triage: triageResult,
          timestamp: new Date().toISOString()
      });

      res.json(triageResult);
    } catch (err) {
      console.error("Gemini triage error:", err);
      res.json(generateHeuristicTriage(message, patient));
    }
  } else {
    res.json(generateHeuristicTriage(message, patient));
  }
});

// Heuristic fallback for Triage
function generateHeuristicTriage(message: string, patient: any) {
  const msg = message.toLowerCase();
  let urgency = "GREEN";
  let urgencyColor = "green";
  let specialty = "General Physician";
  let assessment = "We evaluated your symptoms and recommend general monitoring.";
  let warnings = ["High fever over 103°F", "Severe body pain"];
  let homeCare = ["Rest adequately", "Keep hydrated with fluids", "Track temperature twice daily"];
  let followups = ["How long have you been feeling this way?", "Do you have any fever or headache?"];
  let responseText = "Hello! Based on a quick assessment of your description, your symptoms appear manageable, but we recommend scheduling a routine general consultation to ensure prompt guidance.";

  if (msg.includes("chest") || msg.includes("heart") || msg.includes("breathing") || msg.includes("cardiac") || msg.includes("stroke")) {
    urgency = "RED";
    urgencyColor = "red";
    specialty = "Cardiologist";
    assessment = "Potential cardiac or respiratory emergency suspected. Immediate evaluation required.";
    warnings = ["Crushing chest pain radiating to left arm/jaw", "Sudden short of breath", "Cold sweats, dizziness or fainting"];
    homeCare = ["Sit down and stay calm", "Loosen tight clothing", "Do not exert yourself. Prepare for emergency transport."];
    followups = ["Is the pain radiating anywhere else?", "Are you experiencing shortness of breath?", "Do you have history of heart disease?"];
    responseText = "⚠️ WARNING: Chest pain or difficulty breathing are critical indicators. Please activate the Emergency SOS trigger immediately, contact our featured emergency hospital, and seek care right away.";
  } else if (msg.includes("skin") || msg.includes("rash") || msg.includes("acne") || msg.includes("allergy") || msg.includes("spots")) {
    urgency = "YELLOW";
    urgencyColor = "yellow";
    specialty = "Dermatologist";
    assessment = "Mild-to-moderate skin inflammation or allergic reaction detected.";
    warnings = ["Rapid swelling of face, lips, or tongue", "Difficulty swallowing", "Severe spreading blisters"];
    homeCare = ["Avoid scratching or harsh soaps", "Apply cooling calamine lotion", "Keep track of active food/contact triggers"];
    followups = ["Is the rash itchy or painful?", "Have you eaten new foods or touched new plants?", "Is there any facial swelling?"];
    responseText = "Based on your description, this looks like a dermatological concern. I suggest keeping the skin clean, avoiding triggers, and scheduling a consultation with a certified dermatologist.";
  } else if (msg.includes("fever") || msg.includes("cough") || msg.includes("headache") || msg.includes("cold") || msg.includes("stomach")) {
    urgency = "YELLOW";
    urgencyColor = "yellow";
    specialty = "General Physician";
    assessment = "Viral, flu-like symptoms or acute gastritis checkup recommended.";
    warnings = ["Persistent high fever over 3 days", "Severe abdominal pain", "Blood in vomit or stool"];
    homeCare = ["Use paracetamol if fever persists", "Eat light, non-spicy meals", "Drink warm oral rehydration solution"];
    followups = ["What is your current body temperature?", "Do you have vomiting or loose stools?", "Are you able to hold down liquids?"];
    responseText = "Your symptoms resemble a standard viral infection or digestive irritation. Stay well hydrated, eat light bland food, and speak to a General Physician if there is no improvement within 24 hours.";
  }

  return {
    urgency,
    assessment,
    urgencyColor,
    specialtySuggestion: specialty,
    homeCareTips: homeCare,
    emergencyWarnings: warnings,
    followupQuestions: followups,
    aiDoctorResponse: responseText
  };
}

// AI Diet Plan Generator Post-Consultation
app.post("/api/diet", async (req, res) => {
  const { diagnosis, medications, allergies, foodPreference } = req.body;

  const prompt = `You are a certified Clinical Nutrition Specialist Agent.
Generate a tailored post-consultation recovery diet plan for a patient with:
- Diagnosis: "${diagnosis || "General recovery"}"
- Active Medications: "${medications || "None"}"
- Allergies: "${allergies || "None"}"
- Food Preferences: "${foodPreference || "Vegetarian (Indian style)"}"

The diet plan must support recovery based strictly on medical science, respecting allergies and medicines (e.g., low sodium for hypertension, simple digestible foods for gastritis, low glycemic index for diabetes).

You MUST respond ONLY with a JSON object following this exact schema:
{
  "scientificRationale": "Clinical reason why this nutrition setup matches the recovery need.",
  "breakfast": "Meal recommendation with healthy ingredients",
  "lunch": "Full balanced recovery lunch plan",
  "dinner": "Light recovery dinner plan",
  "snacks": "Recovery snacks, hydration guidance, and foods to avoid"
}
Return only the raw json, no backticks, formatting, or extra text.`;

  if (aiService.isAvailable()) {
    try {
      const promptPayload = PromptBuilder.buildDietPrompt(diagnosis, medications, foodPreference, null);
      const responseText = await aiService.generateContent(promptPayload);
      const response = { text: responseText };
      res.json(JSON.parse(response.text || "{}"));
    } catch (err) {
      console.error("Gemini diet generation error:", err);
      res.json(generateHeuristicDiet(diagnosis, foodPreference));
    }
  } else {
    res.json(generateHeuristicDiet(diagnosis, foodPreference));
  }
});

function generateHeuristicDiet(diagnosis: string, foodPref: string) {
  const diag = (diagnosis || "").toLowerCase();
  if (diag.includes("heart") || diag.includes("cardiac") || diag.includes("hypertension")) {
    return {
      scientificRationale: "Focuses on a DASH-inspired, low-sodium regimen to ease cardiac workload and stabilize arterial pressures.",
      breakfast: "Oatmeal with sliced almonds, chia seeds, and fresh berries. Green tea.",
      lunch: "Brown rice or 2 whole-wheat rotis with boiled dal, steamed spinach, and low-fat curd.",
      dinner: "Roti with baked paneer / grilled chicken, cucumber salad, and stir-fried bottle gourd (lauki).",
      snacks: "Unsalted walnuts, fresh coconut water. Avoid pickles, papads, and excessive salt."
    };
  } else if (diag.includes("diabetes") || diag.includes("sugar")) {
    return {
      scientificRationale: "Emphasizes complex carbohydrates, low glycemic index foods, and high fiber to prevent glycemic spikes.",
      breakfast: "Moong dal chilla with vegetable stuffing or vegetable daliya.",
      lunch: "Quinoa or brown rice with high-fiber mixed veg curry, roasted chana, and methi saag.",
      dinner: "Multigrain chapati with light paneer bhurji and raw sprout salad.",
      snacks: "Roasted makhana, buttermilk, green apples. Avoid sweet juices and white bread."
    };
  }

  return {
    scientificRationale: "Balanced light nutrition rich in vitamins, minerals, and clean proteins to accelerate general tissue healing and energy recovery.",
    breakfast: "Oats porridge with almonds, soft-boiled egg or steamed idlis.",
    lunch: "Warm khichdi with mixed vegetables, low-fat yogurt, and stir-fried carrots.",
    dinner: "Warm vegetable soup, soft roti with bottle gourd curry or grilled fish.",
    snacks: "Fresh papaya, herbal chamomile tea, roasted almonds. Avoid deep-fried, heavy or highly spiced items."
  };
}

// Medicine Interaction Warning Alert Engine
app.post("/api/interaction-check", async (req, res) => {
  const { medicines, patientAllergies } = req.body;

  if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
    return res.status(400).json({ error: "Provide a list of medicines to evaluate." });
  }

  const prompt = `You are an automated Drug Safety and Interaction Check Agent.
Analyze the following active medicine list: [${medicines.join(", ")}]
Patient known drug/food allergies: "${patientAllergies || "None"}"

Check for:
1. Drug-Drug Interactions (critical safety warnings).
2. Food/Alcohol Interactions.
3. Duplicate therapies or overlapping dosage classes.
4. Specific warnings related to the allergies.

You MUST respond ONLY with a JSON object following this exact schema:
{
  "safe": boolean,
  "alertsCount": number,
  "alerts": [
    {
      "severity": "CRITICAL" | "MODERATE" | "WARNING",
      "interaction": "E.g. Metformin + Alcohol or Ramipril + Ibuprofen",
      "risk": "Description of the physiological risk or adverse effect.",
      "advice": "Clear clinical advice on what action the patient should discuss with their provider."
    }
  ]
}
Return only the raw json, no backticks or extra text.`;

  if (aiService.isAvailable()) {
    try {
      const promptPayload = PromptBuilder.buildInteractionPrompt(medicines, patientAllergies, null);
      const responseText = await aiService.generateContent(promptPayload);
      const response = { text: responseText };
      res.json(JSON.parse(response.text || "{}"));
    } catch (err) {
      console.error("Gemini safety alert check error:", err);
      res.json(generateHeuristicInteractions(medicines));
    }
  } else {
    res.json(generateHeuristicInteractions(medicines));
  }
});

function generateHeuristicInteractions(medicines: string[]) {
  const meds = medicines.map(m => m.toLowerCase());
  const alerts = [];

  // Metformin + Alcohol interaction
  const hasMetformin = meds.some(m => m.includes("metformin"));
  const hasStatins = meds.some(m => m.includes("atorvastatin") || m.includes("statin"));
  const hasAntibiotic = meds.some(m => m.includes("amoxicillin") || m.includes("penicillin"));

  if (hasMetformin) {
    alerts.push({
      severity: "CRITICAL",
      interaction: "Metformin + Alcohol Intake",
      risk: "Concomitant use may significantly elevate the risk of lactic acidosis—a rare but potentially life-threatening emergency.",
      advice: "Do not consume alcohol while taking Metformin unless explicitly cleared by your physician."
    });
  }

  if (hasStatins) {
    alerts.push({
      severity: "WARNING",
      interaction: "Atorvastatin + Grapefruit Juice",
      risk: "Grapefruit inhibits CYP3A4 enzymes, leading to increased plasma concentrations of Atorvastatin, which can elevate risks of myopathy (muscle pain) or liver strain.",
      advice: "Avoid drinking grapefruit juice or eating grapefruit in large quantities while on this cholesterol therapy."
    });
  }

  if (hasAntibiotic && meds.some(m => m.includes("contraceptive") || m.includes("dairy"))) {
    alerts.push({
      severity: "MODERATE",
      interaction: "Amoxicillin + Calcium Rich Foods",
      risk: "Heavy calcium supplements can slightly slow absorption of certain oral antibiotics, reducing immediate peak effectiveness.",
      advice: "Take Amoxicillin at least 1 hour before or 2 hours after consuming calcium-fortified juices or dairy products."
    });
  }

  return {
    safe: alerts.length === 0,
    alertsCount: alerts.length,
    alerts: alerts.length > 0 ? alerts : [
      {
        severity: "WARNING",
        interaction: "General Precaution",
        risk: "No severe drug-drug interactions detected among the listed entries.",
        advice: "Always consult your physician before starting or altering any drug routine."
      }
    ]
  };
}

// AI Report Parsing & Explanation
app.post("/api/analyze-report", async (req, res) => {
  const { reportText, files } = req.body;

  if (!reportText && (!files || files.length === 0)) {
    return res.status(400).json({ error: "Report text or files are required for analysis." });
  }

  const prompt = `You are a Clinical Diagnostics Expert Agent.
Analyze the provided medical report documents and/or text parameters.

Explain the key biomarkers, highlight abnormal values, simplify the medical jargon for the patient, and recommend safe, logical next steps without offering a definitive medical diagnosis.

You MUST respond ONLY with a JSON object following this exact schema:
{
  "summary": "High-level patient-friendly summary of the report.",
  "findings": [
    { "marker": "Marker name", "value": "Value", "status": "High" | "Normal" | "Low", "description": "What this marker means." }
  ],
  "concerns": ["List of any key values of potential concern."],
  "nextSteps": ["Safe next actions e.g. consult Cardiologist, repeat test in 3 months"],
  "extractedText": "Optional full text extracted from the document via OCR"
}
Return only raw json, no markdown formatting.`;

  let parts = [];
  if (files && files.length > 0) {
    for (const f of files) {
      parts.push({
        inlineData: {
          data: f.data,
          mimeType: f.mimeType
        }
      });
    }
  }
  
  parts.push({ text: prompt });
  
  if (reportText) {
    parts.push({ text: "User provided parameters/text:\n" + reportText });
  }

  if (aiService.isAvailable()) {
    try {
      const previousReports = req.body.patientId ? db.medicalTimeline.filter(t => t.patientId === req.body.patientId) : [];
      const promptPayload = PromptBuilder.buildOCRPrompt(reportText, null, previousReports);
      const responseText = await aiService.generateContent(promptPayload);
      const response = { text: responseText };
      res.json(JSON.parse(response.text || "{}"));
    } catch (err) {
      console.error("Gemini report parsing error:", err);
      res.status(500).json({ error: "Unable to generate analysis. Please try again." });
    }
  } else {
    res.status(500).json({ error: "Unable to generate analysis. Please try again." });
  }
});

function generateHeuristicReport(reportText: string) {
  const text = reportText.toLowerCase();
  let summary = "We simplified your diagnostic parameters to make them readable.";
  let findings = [
    { marker: "Total Cholesterol", value: "220 mg/dL", status: "High", description: "Lipid transport count. Values above 200 suggest mild risk elevation." },
    { marker: "HDL (Good) Cholesterol", value: "48 mg/dL", status: "Normal", description: "Helps clear fatty build-ups from arterial channels." },
    { marker: "LDL (Bad) Cholesterol", value: "135 mg/dL", status: "High", description: "Contributes to plaque build-up in arteries." }
  ];
  let concerns = ["Total Cholesterol and LDL levels are elevated beyond optimum ranges."];
  let nextSteps = ["Adopt low-saturated-fat recovery diet", "Consult with a Cardiologist or General Physician", "Engage in 30 mins cardiovascular exercise daily"];

  if (text.includes("sugar") || text.includes("diabetes") || text.includes("hba1c") || text.includes("glucose")) {
    summary = "Your blood sugar parameters indicate insulin resistance levels.";
    findings = [
      { marker: "HbA1c", value: "7.1%", status: "High", description: "Average blood glucose level over the past 3 months. Normal is below 5.7%." },
      { marker: "Fasting Blood Glucose", value: "128 mg/dL", status: "High", description: "Glucose concentration after overnight fasting. Elevated above 126 is typically diabetic zone." }
    ];
    concerns = ["Both HbA1c and Fasting glucose exceed optimal standards, suggesting type-2 diabetes progression."];
    nextSteps = ["Consult General Physician or Endocrinologist for medication titration", "Follow the customized HealthTribe AI Diet Plan", "Schedule a follow-up test in 3 months"];
  }

  return {
    summary,
    findings,
    concerns,
    nextSteps
  };
}

// ---------------------------------------------------------
// VITE CLIENT DEVELOPMENT AND PRODUCTION ROUTING
// ---------------------------------------------------------

async function startServer() {
  // ==========================================
// AI COPILOT WORKSPACE API
// ==========================================

app.get("/api/ai-conversations", (req, res) => {
  const { sessionMode } = req.query; // 'patient' or 'doctor'
  const filter = sessionMode === 'doctor' ? (c => c.sessionMode === 'doctor') : (c => c.sessionMode !== 'doctor');
  const conversations = db.aiConversations.filter(filter).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  res.json(conversations);
});

app.post("/api/ai-conversations", (req, res) => {
  const { title, sessionMode, patientId } = req.body;
  const newConv = {
    id: "conv-" + Date.now(),
    title: title || "New Conversation",
    sessionMode: sessionMode || "patient",
    patientId: patientId || null,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.aiConversations.push(newConv);
  res.json(newConv);
});

app.get("/api/ai-conversations/:id", (req, res) => {
  const conv = db.aiConversations.find(c => c.id === req.params.id);
  if (!conv) return res.status(404).json({ error: "Not found" });
  res.json(conv);
});

app.put("/api/ai-conversations/:id", (req, res) => {
  const conv = db.aiConversations.find(c => c.id === req.params.id);
  if (!conv) return res.status(404).json({ error: "Not found" });
  if (req.body.title) conv.title = req.body.title;
  if (req.body.patientId !== undefined) conv.patientId = req.body.patientId;
  conv.updatedAt = new Date().toISOString();
  res.json(conv);
});

app.delete("/api/ai-conversations/:id", (req, res) => {
  db.aiConversations = db.aiConversations.filter(c => c.id !== req.params.id);
  res.json({ success: true });
});

app.post("/api/ai-conversations/:id/messages", async (req, res) => {
  const conv = db.aiConversations.find(c => c.id === req.params.id);
  if (!conv) return res.status(404).json({ error: "Not found" });

  const { text, sender, patientContext, language } = req.body;
  
  const userMsg = {
    id: "msg-" + Date.now(),
    sender: "user",
    text,
    timestamp: new Date().toISOString()
  };
  conv.messages.push(userMsg);
  
  // If title is "New Conversation", generate one
  if (conv.messages.length === 1 && conv.title === "New Conversation") {
    if (aiService.isAvailable()) {
      try {
        const titleResText = await aiService.generateContent({
           prompt: "Generate a very short title (max 5 words) for this medical query: " + text
        });
        const titleRes = { text: titleResText };
        if (titleRes.text) {
           conv.title = titleRes.text.replace(/["']/g, "").trim();
        }
      } catch(e) {}
    } else {
      conv.title = text.substring(0, 30) + "...";
    }
  }

  // Generate AI Response
  let aiText = "I am currently offline or AI is unavailable. Please try again later.";
  let widgetType = undefined;
  let widgetData = undefined;
  
  if (aiService.isAvailable()) {
    try {
      const history = Array.from(conv.messages.slice(0, -1));
      
      // Orchestration Phase
      const orchestrationPrompt = PromptBuilder.buildOrchestrationPrompt(text, history);
      const orchestrationResText = await aiService.generateContent(orchestrationPrompt);
      
      let orchestrationResult = { action: "NONE", specialty: null };
      try {
        orchestrationResult = JSON.parse(orchestrationResText.replace(/^[\s\S]*?```json/m, '').replace(/```[\s\S]*$/m, '').trim());
      } catch(e) {
        // sometimes LLMs just output JSON directly
        try { orchestrationResult = JSON.parse(orchestrationResText); } catch(e2) {}
      }
      
      let contextData = null;
      
      if (orchestrationResult.action === "FETCH_DOCTORS") {
        let docs = db.doctors || [];
        if (orchestrationResult.specialty) {
           docs = docs.filter(d => d.specialty.toLowerCase().includes(orchestrationResult.specialty.toLowerCase()));
           if (docs.length === 0) docs = db.doctors; // fallback to all
        }
        contextData = docs.slice(0, 3);
        widgetType = "doctors";
        widgetData = contextData;
      } else if (orchestrationResult.action === "FETCH_TIMELINE") {
        contextData = db.medicalTimeline || [];
        widgetType = "timeline";
        widgetData = contextData.slice(0, 5);
      } else if (orchestrationResult.action === "FETCH_MEDICATIONS") {
        contextData = db.medicineOrders || [];
      } else if (orchestrationResult.action === "FETCH_APPOINTMENTS") {
        contextData = db.appointments || [];
      }
      
      let promptPayload;
      if (conv.sessionMode === "doctor") {
        const doctorContext = {
          doctorName: "Dr. Supriya Kilari",
          specialty: "Cardiology",
          currentPatient: patientContext
        };
        promptPayload = PromptBuilder.buildDoctorPrompt(doctorContext, history, text, contextData || db.medicalTimeline);
      } else {
        promptPayload = PromptBuilder.buildPatientPrompt(patientContext, history, text, contextData);
      }

      // Prepend language formatting directive if a specific language is selected
      if (language === "hi") {
        promptPayload.systemInstruction += "\n\nCRITICAL LANGUAGE MANDATE: You MUST reply entirely in the Hindi (हिन्दी) language. Do not use English words or English alphabets for your response (except for specific brand/medical names where absolutely needed).";
      } else if (language === "te") {
        promptPayload.systemInstruction += "\n\nCRITICAL LANGUAGE MANDATE: You MUST reply entirely in the Telugu (తెలుగు) language. Do not use English words or English alphabets for your response (except for specific brand/medical names where absolutely needed).";
      } else if (language === "en") {
        promptPayload.systemInstruction += "\n\nCRITICAL LANGUAGE MANDATE: You MUST reply entirely in English.";
      } else {
        promptPayload.systemInstruction += "\n\nCRITICAL LANGUAGE MANDATE: If the user spoke or queried in Hindi, reply in Hindi. If in Telugu, reply in Telugu. Otherwise, default to English.";
      }

      const responseText = await aiService.generateContent(promptPayload);
      
      aiText = responseText || "No response generated.";
    } catch (err) {
      console.error("Gemini fallback triggered due to error:", err.message);
      aiText = "# Assessment\n\nBased on your query: **\"" + text + "\"**\n\n# Key Findings\n* Mild to moderate presentation of requested symptoms.\n* Vital parameters remain within standard deviation limits.\n\n# Next Steps\n1. Monitor for changes over the next 48 hours.\n2. Consult a specialist if condition worsens.\n\n*(Note: This is a heuristic fallback response due to temporary AI unavailability)*";
    }
  } else {
    aiText = `# Assessment\n\nBased on your query: **"${text}"**\n\n# Key Findings\n* Finding 1\n* Finding 2\n\n# Next Steps\n1. Please consult a specialist.\n2. Monitor your symptoms.\n`;
  }

  const aiMsg = {
    id: "msg-" + Date.now() + 1,
    sender: "ai",
    text: aiText,
    timestamp: new Date().toISOString(),
    ...(widgetType && { widget: widgetType, widgetData })
  };
  conv.messages.push(aiMsg);
  conv.updatedAt = new Date().toISOString();

  res.json({ userMessage: userMsg, aiMessage: aiMsg, title: conv.title });
});



  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  
app.listen(PORT, "0.0.0.0", () => {
    console.log(`HealthTribe AI Server successfully running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
