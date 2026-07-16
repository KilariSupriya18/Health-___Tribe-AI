export interface UserAddress {
  id: string;
  fullName: string;
  mobile: string;
  house: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Specialty {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  specialtyId: string;
  experience: number;
  rating: number;
  reviewsCount: number;
  hospital: string;
  languages: string[];
  fee: number;
  availableToday: boolean;
  avatar: string;
  bio: string;
  education: string;
  availabilitySlots: string[];
}

export interface Hospital {
  id: string;
  name: string;
  distance: string;
  rating: number;
  specialties: string[];
  emergency: boolean;
  address: string;
  govBenefits: boolean;
  image: string;
}

export interface FamilyMember {
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

export interface TimelineRecord {
  id: string;
  patientId: string;
  date: string;
  title: string;
  type?: string;
  category?: string;
  doctorName?: string;
  hospital?: string;
  details: string;
  source?: "HealthTribe" | "ABHA";
  highlights?: string[];
  riskLevel?: string;
  reportAnalysis?: any;
}

export interface Medicine {
  id: string;
  name: string;
  strength: string;
  manufacturer: string;
  mrp: number;
  discount: number;
  rxRequired: boolean;
  category: string;
}

export interface LabTest {
  id: string;
  name: string;
  description: string;
  preparation: string;
  price: number;
  originalPrice: number;
  tags: string[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  patientName: string;
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  type: "In-Person" | "Video" | "Voice";
  fee: number;
  notes?: string;
}

export interface TriageResult {
  assessment: string;
  urgency: "RED" | "ORANGE" | "YELLOW" | "GREEN" | "BLUE";
  clinicalCategories: string[];
  followUpQuestions: string[];
  recommendations: string[];
  specialist: string;
  emergencyWarnings: string[];
  nearbyHospitalRecommendation: string;
  aiDoctorResponse: string;
}

export interface DietPlan {
  scientificRationale: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

export interface InteractionAlert {
  severity: "CRITICAL" | "MODERATE" | "WARNING";
  interaction: string;
  risk: string;
  advice: string;
}

export interface InteractionResponse {
  safe: boolean;
  alertsCount: number;
  alerts: InteractionAlert[];
}

export interface ReportAnalysis {
  overview?: {
    reportType: string;
    date: string;
    confidence: string;
    overallStatus: string;
  };
  clinicalInterpretation?: string;
  findings: Array<{
    marker: string;
    value: string;
    referenceRange?: string;
    status: "High" | "Normal" | "Low" | "Abnormal" | string;
    severity?: string;
    whyItMatters?: string;
    possibleCauses?: string;
    suggestedFollowUp?: string;
    trend?: "Improving" | "Worsening" | "Stable" | "New" | string;
  }>;
  recommendations?: {
    physicianReview?: string;
    repeatTesting?: string;
    lifestyleChanges?: string[];
    dietaryAdvice?: string[];
    medicationsToDiscuss?: string[];
    emergencyWarningSigns?: string[];
  };
  timelineEvent?: {
    date: string;
    category: string;
    details: string;
    highlights?: string[];
    riskLevel?: "High" | "Moderate" | "Low" | string;
  };
  extractedText?: string;
  summary?: string;
  concerns?: string[];
  nextSteps?: string[];
}

export interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  ip: string;
  details: string;
}

export interface AdminStats {
  usersCount: number;
  doctorsCount: number;
  hospitalsCount: number;
  appointmentsCount: number;
  medicineOrdersCount: number;
  labBookingsCount: number;
  totalRevenue: number;
  auditLogs: AuditLog[];
  appointments: Appointment[];
  familyMembers: FamilyMember[];
  medicalTimeline: TimelineRecord[];
}

export interface ABHAIdentity {
  id: string;
  patientId: string;
  abhaNumber: string;
  abhaAddress: string;
  mobile: string;
  linkedAt: string;
  verified: boolean;
  status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
}

export interface ConsentRecord {
  id: string;
  patientId: string;
  abhaAddress: string;
  hiuId: string;
  hipId: string;
  hipName: string;
  purpose: string;
  consentExpiry: string;
  status: "GRANTED" | "REVOKED" | "EXPIRED" | "REQUESTED";
  dataTypes: string[];
  createdAt: string;
  grantedAt?: string;
}

export interface ImportSession {
  id: string;
  patientId: string;
  consentId: string;
  hipId: string;
  hipName: string;
  status: "PENDING" | "AUTHENTICATING" | "FETCHING_METADATA" | "DECRYPTING" | "PARSING" | "COMPLETED" | "FAILED";
  progress: number;
  error?: string;
  createdAt: string;
}

export interface ImportedHealthRecord {
  id: string;
  patientId: string;
  hipId: string;
  hipName: string;
  recordType: string;
  title: string;
  date: string;
  doctorName: string;
  details: string;
  careContextRef: string;
  fhirData?: string;
}

