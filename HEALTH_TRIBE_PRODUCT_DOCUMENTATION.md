# HEALTHTRIBE: PRODUCT REQUIREMENTS & TECHNICAL SPECIFICATIONS DOCUMENT
## The Unified AI-First Federated Patient Identity & Collaborative Clinical Care Ecosystem
### *Comprehensive Product Documentation & System Source of Truth*

---

## 1. Executive Summary

### What is HealthTribe?
**HealthTribe** is an AI-first, federated health identity and collaborative clinic orchestration ecosystem designed to resolve the multi-layered fragmentation of modern healthcare. Positioned as an intelligent gateway for both patients and healthcare providers, HealthTribe bridges the gap between patient self-care and professional clinical workflows. 

At its core, HealthTribe integrates the **Ayushman Bharat Digital Mission (ABDM)** frameworks—specifically the **Ayushman Bharat Health Account (ABHA)** federated identity system—with advanced large language model (LLM) orchestration. This integration translates raw, complex medical timelines, laboratory biomarkers, and historical doctor consultations into actionable, plain-language insights for patients, while simultaneously drafting production-grade clinical notes (SOAP), patient summaries, and diagnostic differentials for clinicians.

### What Problem Does It Solve?
Healthcare globally, and specifically in rapidly expanding digital economies like India, suffers from critical structural failures:
*   **Hyper-Fragmented Health Records:** Patients’ historical reports exist in isolated silos across multiple hospitals, diagnostic labs, and physical folders, resulting in blind spots during emergency consultations.
*   **Severe Language Barriers:** Medical documentation and patient-provider interactions are predominantly in English, creating a steep understanding gap for patients who speak vernacular languages like Hindi or Telugu.
*   **Clinician Administrative Overload:** Doctors spend up to 40% of their consultation time typing clinical summaries, drafting SOAP notes, and searching through historical PDF reports instead of engaging in patient care.
*   **Appointment Booking Friction & Incoherence:** The process of discovering verified specialists, matching them to symptoms, and reserving slots is entirely disconnected from the patient's active medical records.

### Target Users
1.  **Patients (Individuals & Families):** Users who require a centralized, secure vault to manage their health history, understand their lab reports, order medicines, check for drug-drug interactions, and consult doctors.
2.  **Clinicians & Practitioners (Doctors like Dr. Supriya Kilari):** Senior specialists and general physicians who need high-density clinical dashboards, automated SOAP drafting, instant patient summaries, and AI-driven clinical decision support.
3.  **Healthcare Providers & Clinics:** Small to medium clinic networks seeking to modernize their operations, manage active patient queues, coordinate telehealth channels, and integrate ABHA standards.

### Vision of the Product
The vision of HealthTribe is to establish a secure, continuous, and frictionless digital health thread. By combining the statutory trust of the ABHA federated ecosystem with the real-time reasoning of modern AI, HealthTribe aims to democratize healthcare comprehension. Our goal is to transform the medical record from a dusty stack of physical paper into a dynamic, bilingual, conversational clinical companion that works tirelessly for both the patient at home and the doctor in the clinic.

---

## 2. Problem Statement

### Fragmented Health Records & Isolated Silos
In the current healthcare paradigm, patient medical history is rarely continuous. When a patient switches doctors or visits a new specialist, their historical records—ranging from lipid panels to cardiology summaries—are missing or inaccessible. Clinicians are forced to make high-stakes decisions based on incomplete verbal histories, repeating expensive diagnostic tests and increasing the risk of adverse clinical outcomes.

### Vernacular Exclusion & Language Barriers
The vocabulary of clinical medicine is intentionally complex, written in specialized Latinate English. For a majority of Indian patients, this creates a massive comprehension barrier. Important recommendations regarding warning signs, repeat testing intervals, and dietary restrictions are lost in translation, directly resulting in poor medication adherence and delayed emergency care.

### Clinic Administration & Document Fatigue
Doctors are drowning in administrative data entry. When a patient presents a stack of previous lab results, the clinician must manually read, extract, and compare historical numbers (e.g., comparing current serum creatinine levels with reports from 2024). This document fatigue reduces the cognitive bandwidth available for diagnostic reasoning and active patient listening.

### Disconnected Family Care Structures
Healthcare decisions are rarely individual; they are managed by family guardians. Current patient portals do not support integrated family vaults where a single guardian can manage their elderly parents’ cardiology records, track their children's pediatric charts, and coordinate multi-member clinical bookings from a single unified interface.

### The Problem Breakdown: A Comparative View
| Dimension | Existing System Failures | HealthTribe Targeted Solution |
| :--- | :--- | :--- |
| **Data Interoperability** | Disconnected PDFs, physical papers, missing hospital transfer records. | Federated ABHA/ABDM care context linking and secure digital record import. |
| **Language & Access** | Reports and consultation notes generated exclusively in technical English. | Dynamic bilingual Voice AI & text explanations in Hindi (हिन्दी) and Telugu (తెలుగు). |
| **Clinical Documentation** | Manual transcription of SOAP notes, slow administrative inputs. | Background AI-drafted SOAP notes, instant clinical briefings, and diagnostic suggestions. |
| **Family Management** | Isolated accounts per individual, making guardian oversight impossible. | Unified Family Vault with shared records, distinct patient profiles, and rapid switches. |

---

## 3. Solution Overview

HealthTribe bridges these structural failures by introducing a bidirectional, closed-loop clinical orchestration system. 

```
   [ Patient Portal ]                                  [ Doctor Portal ]
   - Family Vault                                      - Clinical Dashboard
   - Voice AI & Text Assistants                        - Active Patient Queue
   - Appointment & Lab Bookings                        - AI Diagnostic Decider
          │                                                   ▲
          ▼                                                   │
  ┌───────────────────────────────────────────────────────────┴────────────────┐
  │                                HEALTHTRIBE PLATFORM                        │
  │                                                                            │
  │  ┌────────────────────────┐  ┌────────────────────────┐  ┌──────────────┐  │
  │  │   ABHA IDENTITY GATE   │  │  MED TIMELINE SERVICE  │  │ CLINICAL AI  │  │
  │  │  Verify OTP / Consents │  │  Multi-Year Records    │  │ Gemini/Groq  │  │
  │  └────────────────────────┘  └────────────────────────┘  └──────────────┘  │
  └─────────────────────────────────────────┬──────────────────────────────────┘
                                            ▼
                              [ Unified Health Ecosystem ]
                              - ABDM Health Records
                              - Verified Local Clinics
                              - Automated OCR & Pharmacy
```

### The End-to-End Core Workflow
1.  **Federated Identity Linking:** The patient logs into HealthTribe and verifies their **ABHA (Ayushman Bharat Health Account)** profile using secure statutory OTP flows. This creates a secure, verifiable identity mapping.
2.  **Federated Record Import:** Through ABDM consent managers, HealthTribe queries connected Health Information Providers (HIPs) like AIMS Hospital. The patient grants consent, and historical medical records (prescriptions, diagnostic reports, discharge summaries) are securely imported.
3.  **Unified Timeline Compilation:** The imported health data is aggregated with the patient's local HealthTribe activity and compiled into an interactive, multi-year chronological **Medical Timeline**. 
4.  **AI Clinical Structuring & Summary:** The timeline is passed to the HealthTribe AI Orchestration layer, which extracts abnormal biomarkers, identifies clinical risks (High/Moderate/Low), and writes a patient-friendly summary, alongside a high-density medical briefing for the doctor.
5.  **Bilingual Interactive Dialog:** Patients can talk or type to the **Voice AI Assistant** in English, Hindi, or Telugu to ask about their timeline, look up drug interactions, or receive personalized diet recommendations.
6.  **Frictionless Clinical Handoff:** When a patient books an appointment, the clinician (e.g., Dr. Supriya Kilari) instantly receives the patient’s clinical briefing, historical timeline, and analyzed OCR reports. During the consultation, the AI drafts the SOAP notes in real-time, completing the care loop.

---

## 4. Product Features

### 4.1. Patient Portal
*   **Purpose:** Provide individuals with an elegant, centralized dashboard to monitor their health, manage family medical records, and access primary care services.
*   **How It Works:** Built on an Apple Health-inspired cards layout, the Patient Portal aggregates the user's active health parameters, upcoming appointments, medicine orders, and recent timeline records.
*   **Benefits:** Elevates the user from a passive recipient of medical documents to an active participant with complete history ownership.
*   **User Flow:** Patient logs in -> Views overall health stats -> Checks active prescriptions -> Launches bilingual AI Assistant or reviews family files.
*   **Components:** Frontend: `App.tsx` (Patient Home View), `ProfilePage.tsx`. Backend: `/api/family`, `/api/timeline`.
*   **Current Status:** **Fully Implemented.** Supports real-time profile configuration, dynamic statistics, and interactive navigation to specialized services.

### 4.2. Doctor Portal
*   **Purpose:** Empower practitioners with a high-density, low-friction clinical interface to manage active consultation queues, analyze patient history, and generate SOAP notes.
*   **How It Works:** When toggled to Doctor Mode, the interface switches from a personal health view to a multi-column Clinical Workspace. It includes an active Patient Queue, Practice Insights charts, and a dedicated AI Clinical Assistant workspace.
*   **Benefits:** Dramatically reduces doctor administration times, prevents patient record search delays, and provides smart clinical insights at the point of care.
*   **User Flow:** Practitioner toggles to Doctor Mode -> Reviews morning schedule and queue -> Selects active patient -> Views AI-generated patient history brief -> Conducts consultation -> Autogenerates and reviews SOAP notes.
*   **Components:** Frontend: `App.tsx` (Doctor Dashboard, Patient Queue components), `DoctorChatbot.tsx`. Backend: `/api/doctors`, `/api/appointments`, `/api/doctor-chat`.
*   **Current Status:** **Fully Implemented.** Supports real-time active patient selection, live consultation state trackers, and integrated SOAP editors.

### 4.3. AI Symptom Triage
*   **Purpose:** Provide rapid, safe, and structured assessment of patient symptoms before they book a clinical consultation.
*   **How It Works:** Patients input their current symptoms. The AI Triage Engine analyzes the severity, calculates an urgency level (RED, ORANGE, YELLOW, GREEN, BLUE), recommends specific specialist categories, details emergency warning signs, and suggests nearby hospitals.
*   **Benefits:** Prevents emergency room overcrowding for low-urgency conditions, while ensuring high-risk patients (e.g., presenting with chest pain) are immediately directed to cardiac emergency hubs.
*   **User Flow:** Patient clicks "Symptom Triage" -> Inputs symptoms -> System prompts with follow-up clinical questions -> AI calculates risk level -> Recommends verified doctors and immediate next steps.
*   **Components:** Frontend: `AICopilotWorkspace.tsx` (Triage sub-pane). Backend: `/api/triage`, `/api/triage/conversations`.
*   **Current Status:** **Fully Implemented.** Integrates structured JSON outputs from Gemini/Groq directly into responsive UI widgets (urgency badges, warning indicators, and doctor shortcut buttons).

### 4.4. Family Vault
*   **Purpose:** Centralize the management of multi-generational health records under a single master guardian account.
*   **How It Works:** Guardians can add family profiles (e.g., spouse, parents, children) with individual attributes such as age, blood group, allergies, chronic conditions, active medications, and unique ABHA numbers.
*   **Benefits:** Enables mothers and fathers to maintain continuous pediatric histories for their children, and adult children to oversee elderly parents' chronic medication cards.
*   **User Flow:** Guardian opens Family Tab -> Clicks "Add Member" -> Configures profile -> Selects member to instantly switch active dashboard context (updating timeline, ABHA status, and booking records).
*   **Components:** Frontend: `App.tsx` (Family Management pane), `ProfilePage.tsx`. Backend: `/api/family` (GET/POST operations).
*   **Current Status:** **Fully Implemented.** Supports seamless contextual swapping across the entire app workspace.

### 4.5. Appointment Booking & Doctor Discovery
*   **Purpose:** Connect patients to verified, specialty-matched medical professionals with transparent booking controls.
*   **How It Works:** An interactive doctor discovery board lists practitioners categorized by specialties (Cardiology, Neurology, Pediatrics, etc.). Users can filter by experience, patient ratings, hospital networks, pricing, and active daily availability.
*   **Benefits:** Removes the booking friction and ensures patients find matched practitioners immediately after an AI Symptom Triage assessment.
*   **User Flow:** User selects specialty or clicks AI referral -> Views matching clinician profiles -> Reviews biographies, experience, and fee structures -> Selects available time slot -> Confirms booking with interactive Coupon/Reschedule systems.
*   **Components:** Frontend: `App.tsx` (Doctor Discovery and Booking Modals). Backend: `/api/doctors`, `/api/appointments`.
*   **Current Status:** **Fully Implemented.** Supports dynamic slots, reschedule systems, cancel workflows, and real-time validation of doctor availability.

### 4.6. OCR Medical Report Parser
*   **Purpose:** Automatically digitize and extract clinical biomarker metrics from uploaded medical report files (PDFs, images).
*   **How It Works:** Patients upload lab files. The system processes the files through an AI-OCR pipeline, extracting marker parameters, raw values, and standard reference ranges, then classifies the result status (High, Normal, Low) and writes a holistic clinical overview.
*   **Benefits:** Eliminates manual data entry of historical blood charts and instantly flags critical biochemical anomalies.
*   **User Flow:** User navigates to Timeline -> Clicks "Upload Diagnostic Report" -> Uploads file -> System runs real-time parsing -> Displays extracted interactive findings table -> Appends parsed record directly into the Medical Timeline.
*   **Components:** Frontend: `App.tsx` (File Dropzone & Analysis Viewer). Backend: `/api/analyze-report`, `PromptBuilder.ts` (`buildOCRPrompt`).
*   **Current Status:** **Fully Implemented.** Features full structural rendering of biomarkers, highlighting abnormal ranges with detailed "Why It Matters" clinical cards.

### 4.7. Voice AI Assistant (Bilingual Conversations)
*   **Purpose:** Allow hands-free, natural language interaction for patients with low digital literacy or vision impairments.
*   **How It Works:** Powered by high-speed Web Speech Recognition and Web Speech Synthesis APIs, users can click the microphone to have continuous, bilingual conversations. The backend dynamically intercepts commands (e.g., "Switch to doctor view") or routes queries to LLMs, translating results back into high-fidelity speech.
*   **Benefits:** Makes complex health record interaction accessible to patients who prefer speaking in their regional mother tongues.
*   **User Flow:** User clicks "Start Conversation" -> Speaks a query in Hindi/Telugu -> Assistant automatically detects the language -> System responds via text and audio in the matching vernacular.
*   **Components:** Frontend: `AICopilotWorkspace.tsx` (Voice HUD, Waveform, Speech controllers). Backend: `/api/ai-conversations/:id/messages` (Language directive injections).
*   **Current Status:** **Fully Implemented.** Includes a simulated real-time voice HUD, animated waveform reactive to microphone inputs, and full pause/resume/stop/replay speech synthesis controllers.

### 4.8. Medication Tracking & Drug Interaction Checker
*   **Purpose:** Prevent adverse drug events and track active pharmacological regimens.
*   **How It Works:** Patients enter their list of active medications. The system runs an AI pharmacological assessment, checking for dangerous drug-drug interactions or drug-disease contradictions against the patient's recorded allergies.
*   **Benefits:** Drastically reduces preventable pharmacological accidents, offering clear guidelines on when and how to consume medications safely.
*   **User Flow:** Patient adds medications -> System runs automatic interaction check -> Returns risk badges (High, Moderate, Low), warnings, and scientific rationales.
*   **Components:** Frontend: `App.tsx` (Medicine & Health Stores). Backend: `/api/interaction-check`, `PromptBuilder.ts` (`buildInteractionPrompt`).
*   **Current Status:** **Fully Implemented.** Features clean, color-coded severity cards (High, Moderate, Warnings) to guide pharmacological usage.

### 4.9. Post-Consultation Diet Plan Generator
*   **Purpose:** Generate precise nutritional guidelines tailored to a patient's diagnosis and medical conditions.
*   **How It Works:** Based on the doctor's diagnosis, active medications, and food preferences, the AI compiles a balanced dietary chart, listing scientific rationales, foods to avoid, and safe meal timelines.
*   **Benefits:** Integrates post-care nutritional support directly into the patient's daily recovery routine.
*   **User Flow:** User inputs diagnosis and active meds -> AI computes metabolic demands -> Outputs structured Breakfast/Lunch/Dinner dietary plans.
*   **Components:** Frontend: `App.tsx` (Diet workspace). Backend: `/api/diet`, `PromptBuilder.ts` (`buildDietPrompt`).
*   **Current Status:** **Fully Implemented.** Renders detailed meal plans with specific dietary restrictions and scientific rationales.

---

## 5. AI System Architecture

HealthTribe utilizes an AI-first, LLM-agnostic orchestration layer that coordinates clinical models, context databases, and user inputs into structured clinical outputs.

```
                  ┌──────────────────────────────┐
                  │    User / Practitioner Query │
                  └──────────────┬───────────────┘
                                 ▼
                  ┌──────────────────────────────┐
                  │      AI Orchestrator         │
                  │   (Is Context Required?)     │
                  └──────────────┬───────────────┘
                     /                       \
        YES (Fetch App Data)             NO (Direct Chat)
                 /                             \
                ▼                               ▼
    ┌──────────────────────┐         ┌──────────────────────┐
    │  Fetch From Database │         │  Initialize System   │
    │  Timeline / Doctors /│         │  Instruction &       │
    │  Medications / Labs  │         │  Global Prompts      │
    └──────────┬───────────┘         └──────────┬───────────┘
                \                              /
                 ▼                            ▼
              ┌──────────────────────────────────┐
              │      Unified Prompt Builder      │
              │  - Injects Patient Context       │
              │  - Injects App Data & History    │
              │  - Appends Language Directives   │
              └────────────────┬─────────────────┘
                               ▼
              ┌──────────────────────────────────┐
              │       AIService Manager          │
              │  Checks Provider (Gemini/Groq)   │
              │  Applies Exponential Backoff     │
              └────────────────┬─────────────────┘
                               ▼
                    [ Selected AI Engine ]
                  - Gemini-3.5-Flash (Default)
                  - Llama-3.3-70B-Versatile (Groq)
```

### 5.1. The AI Abstraction Layer
The application implements `AIProvider.ts` to expose a generic interface for generative text operations:
```typescript
export interface GenerateContentParams {
  prompt?: string | any[];
  messages?: any[];
  systemInstruction?: string;
  responseMimeType?: string;
}
```
Two native implementations are integrated:
1.  **GeminiProvider (`GeminiProvider.ts`):** Utilizing the modern SDK `@google/genai` with `gemini-3.5-flash` for high-speed, multimodal, and cost-efficient extraction.
2.  **GroqProvider (`GroqProvider.ts`):** Utilizing `groq-sdk` with `llama-3.3-70b-versatile` for high-density clinical reasoning and low-latency JSON completions.

### 5.2. Context Injection & Prompt Building
Before any query is sent to the LLM, the `PromptBuilder` aggregates the patient's primary profile attributes (Age, Gender, Blood Group, Allergies, Chronic Conditions, and current medications) via `buildPatientContext` and appends them to the system instruction.

*   **Patient Context Assembly:** Ensures the AI is perpetually aware of active allergies, preventing the system from suggesting drugs or foods that could cause anaphylaxis.
*   **Application Data Context:** Injects active records (e.g., upcoming appointments, timeline logs) so the AI can answer contextual queries like *"When is my next cardiologist appointment?"* or *"Summarize my last laboratory test."*

### 5.3. Conversation Memory Management
HealthTribe implements an in-memory conversation storage framework. Conversations are tracked via distinct sessions containing an array of structured chat messages:
```typescript
export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}
```
The AI Orchestrator parses the last three rounds of dialogue history to understand pronoun references (e.g., *"How is it?"* referring to a lab test mentioned previously) and maintain therapeutic coherence.

---

## 6. ABHA & ABDM Integration

### What is ABHA?
The **Ayushman Bharat Health Account (ABHA)** is a foundational component of the **Ayushman Bharat Digital Mission (ABDM)**, an initiative by the National Health Authority (NHA) of India. ABHA establishes a unique 14-digit number and a clinical handle (e.g., `supriya@abdm`) that acts as a federated patient identity across the entire healthcare grid.

### What is ABDM?
The **Ayushman Bharat Digital Mission (ABDM)** is a national digital health ecosystem that enables interoperability of health data. It connects:
*   **Health Information Providers (HIPs):** Hospitals, diagnostic labs, and clinics that generate clinical records.
*   **Health Information Users (HIUs):** Applications like HealthTribe that request access to patient records for clinical tracking and AI aggregation.
*   **Consent Managers:** Unified statutory services that allow patients to securely grant, deny, or revoke clinical access consents to HIUs.

```
  [ HIP: AIMS Hospital ]                    [ HIU: HealthTribe App ]
  (Generates Blood Report)                  (Requests Patient Sync)
          │                                           ▲
          ▼                                           │
  ┌───────────────────────────────────────────────────────────┐
  │                   ABDM CONSENT MANAGER                    │
  │           Patient approves / grants access OTP            │
  └─────────────────────────────┬─────────────────────────────┘
                                ▼
                   (Secures Decryption Keys)
                                │
                                ▼
         [ Interoperable Care Context Imported to Timeline ]
```

### How HealthTribe Integrates with ABDM
HealthTribe serves as a fully functional, simulated ABDM **Health Information User (HIU)** client application, exposing end-to-end statutory workflows:

#### 1. Federated Patient Authentication & Linking
*   **The Workflow:** The patient links their HealthTribe profile to the national registry by providing their ABHA Number or ABHA Address. The system triggers a national verification request, generating a mock security transaction with an OTP hint. Once verified, an `ABHAIdentity` is registered, updating the patient profile to "ABHA-Verified."
*   **Backend Endpoint:** `POST /api/v1/abha/generate-otp` and `POST /api/v1/abha/verify-otp`.

#### 2. Dynamic Consent Management
*   **The Workflow:** To import historical records from external HIPs (such as AIMS Hospital or Max Diagnostic Lab), HealthTribe generates an ABDM Consent Request. This consent outlines the purpose ("Diagnostic Consolidation"), the specific data types requested (Prescriptions, Diagnostic Reports, Discharge Summaries), and an expiration date.
*   **Backend Endpoint:** `POST /api/v1/consent/request` and `POST /api/v1/consent/action`.
*   **Current State:** **Fully Implemented.** Supports real-time status transitions (GRANTED, REVOKED, EXPIRED, REQUESTED).

#### 3. Secure Interoperable Record Import Pipeline
*   **The Workflow:** Once consent is marked as GRANTED, HealthTribe initiates the Record Import Pipeline. This multi-stage process simulates secure network handshakes, decryption key exchange, FHIR data compilation, and biomarker parsing:
    1.  `PENDING`: Handshake initialized.
    2.  `AUTHENTICATING`: Exchanging secure cryptographic tokens.
    3.  `FETCHING_METADATA`: Querying care context indices.
    4.  `DECRYPTING`: Executing secure AES decryption of clinical payloads.
    5.  `PARSING`: Compiling HL7 / FHIR medical entries.
    6.  `COMPLETED`: Writing imported records directly to the patient's active HealthTribe timeline.
*   **Backend Endpoint:** `POST /api/v1/abha/import/:patientId` and `GET /api/v1/abha/import/session/:sessionId`.

### Multi-Stakeholder Benefits of HealthTribe ABDM Gateway
*   **For Patients:** Complete portability of lifelong clinical history. Users can walk into any clinic in India without carrying thick folders of historical physical papers.
*   **For Doctors:** Instantly view verified historical records and lab values from other providers, enabling accurate diagnostic reasoning and preventing fatal medication cross-reactions.
*   **For Hospitals:** Drastically reduced administrative expenses in transferring medical histories, and unified verification protocols for arriving patients.
*   **For the Healthcare Ecosystem:** Seamless, standard-compliant digital data flow, accelerating public health reporting and clinical response times.

---

## 7. Medical Timeline Architecture

The **Medical Timeline** acts as the clinical core of the HealthTribe application, structuring heterogeneous healthcare inputs into a clean, chronological history.

### The Timeline Data Structure
A single medical event is defined by the `TimelineRecord` interface:
```typescript
export interface TimelineRecord {
  id: string;
  patientId: string;
  date: string;
  title: string;
  type?: string;        // e.g., Consultation, Lab Report, Prescription
  category?: string;    // e.g., Cardiology, Neurology
  doctorName?: string;
  hospital?: string;
  details: string;      // The primary clinical text
  source?: "HealthTribe" | "ABHA";
  highlights?: string[]; // Automated key summary bullet points
  riskLevel?: string;   // "High", "Moderate", "Low"
  reportAnalysis?: any; // Deep structured findings from OCR
}
```

### Hierarchical Multi-Year Rendering
The front-end `HealthHistoryTimeline.tsx` organizes records in a top-down, multi-year hierarchy:
*   **Yearly Grouping:** Events are grouped dynamically into collapsible calendar blocks (e.g., *"Calendar Year 2026"*).
*   **Visual Classification Bullets:** The left margin contains color-coded vertical timelines and interactive bullets. AI Summaries pulsate in purple, ABHA-synced records glow in emerald, and local clinic appointments are marked in sky blue.
*   **Adaptive Category Icons:** Automatically matches icons (Stethoscopes, Activities, FileTexts, or AlertCircles) to the event type.

### Smart Filtering & AI Summarization
Users can filter the timeline by Source (All, ABHA, HealthTribe) or Search queries (e.g., searching "Vitamin" to view all bone panels). 
*   **ABHA Scientific Summary:** When records are synced from ABDM, the patient can trigger an "ABHA AI Summary." The backend aggregates all imported logs and uses the `buildABHAPrompt` to generate a high-density, 4-sentence clinical synopsis detailing active conditions, risks, and follow-up investigations.

---

## 8. OCR Diagnostic Report Parser

HealthTribe's **OCR Diagnostic Report Parser** transforms flat, unreadable lab report texts or document uploads into structured, interactive databases of metabolic biomarkers.

```
  [ Upload Diagnostic Report ]
              │
              ▼
  ┌────────────────────────────────────────────────────────┐
  │            AI-OCR Raw Biomarker Extraction             │
  │     Identify: Marker Name, Value, Reference Range      │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │             Clinical Status Classification             │
  │          Maps status to "High", "Low", "Normal"        │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                 Historical Trend Match                 │
  │     Compare against past values in Medical Timeline    │
  └───────────────────────────┬────────────────────────────┘
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │               Interactive Biomarker Card               │
  │  Highlights abnormal metrics, explanation, & follow-up │
  └────────────────────────────────────────────────────────┘
```

### The OCR Pipeline Workflow
1.  **File Input:** The user drops a report file (image or text parameters) into the dropzone interface on the Timeline tab.
2.  **Multimodal Raw Extraction:** The backend processes the document data. If a file is uploaded, Gemini’s multimodal extraction parses the raw layout directly.
3.  **Structured AI Mapping:** Using the `buildOCRPrompt` in `PromptBuilder.ts`, the system executes a strict clinical redesign of the laboratory results:
    *   **Overview Generation:** Calculates report type, test date, AI extraction confidence, and overall clinical risk.
    *   **Finding Normalization:** Maps each biomarker to a highly structured JSON array containing `marker`, `value`, `referenceRange`, `status` (Normal, High, Low), and `severity`.
    *   **Clinical Explanation:** Explains *why* an abnormal biomarker is high or low in patient-friendly terms, avoiding complex medical jargon.
    *   **Timeline Insertion:** Creates a synchronized timeline card, appending the full structured analysis directly to the patient's continuous health thread.

---

## 9. Doctor Workflow & Clinical Decision Support

HealthTribe provides a streamlined digital workplace for clinicians, designed to optimize time-to-treatment.

```
  Practice Stats Dashboard  ──▶  Active Patient Queue  ──▶  AI Clinical Summary
                                                                  │
                                                                  ▼
  Clinical Decision Support ◀──    SOAP Notes Auto-Draft   ◀── Telehealth Window
```

### 1. Practice Stats & Overview
The landing dashboard of the Doctor Portal offers key metrics for the clinic, tracking overall billing revenue, active scheduled appointments, pending lab test requests, and historical clinic logs.

### 2. Active Patient Queue
Clinicians are presented with an interactive, chronological sidebar containing the daily patient schedule. Selecting a patient instantly opens their medical workspace:
*   **The Live Consultation Workspace:** Tracks the consultation state through interactive steps (Patient Overview -> Historical Review -> Active Diagnosis -> Treatment -> Checkout).
*   **Automatic Context Binding:** Instantly pulls the selected patient's age, allergies, active medication list, and historical timeline events.

### 3. AI-Drafted SOAP Notes
During or immediately after the consultation, the doctor can launch the **AI SOAP Note Generator**:
*   **Subjective:** Integrates user-reported symptoms and chief complaints.
*   **Objective:** Pulls recent laboratory biomarkers, vital metrics, and previous findings.
*   **Assessment:** Formulates clinical diagnostics, potential differential assessments, and risks.
*   **Plan:** Drafts pharmaceutical instructions, diagnostic referrals, dietary restrictions, and follow-up schedules.

### 4. Telehealth Integration
For remote consultations, the system includes an integrated **Telehealth Console**:
*   Features simulated real-time patient-provider video feeds.
*   Maintains a persistent sidebar containing the patient's medical timeline, allowing the doctor to reference historical records during active consultations.

---

## 10. Patient Workflow & Health Lifecycle

```
  Google / OTP Login  ──▶  Family Member Setup  ──▶  ABHA Verification
                                                               │
                                                               ▼
  Doctor Discovery   ◀──  AI Symptom Triage  ──▶  Voice/Text Assistant
         │
         ▼
  Appointment Booking ──▶  Lab & Medicine Store ──▶  Timeline Sync
```

### 1. Patient Onboarding & Family Profiles
*   **Registration:** Supports dual authentication paths: instant Google Onboarding or simple verification codes. During onboarding, patients complete basic biometric profiling (Name, Age, Height, Weight, Blood Group).
*   **Unified Account Setup:** Patients set up profiles for family dependents inside their Family Vault, defining relations (e.g., Mother, Son) and configuring distinct medical records for each.

### 2. Symptom Triage & Conversational Copilot
*   **Smart Triage Assessment:** When experiencing symptoms, the patient launches the AI Symptom Triage assistant to calculate urgency risk levels and identify appropriate specialties.
*   **Vernacular Voice Assistant:** Patients can speak to the assistant in Hindi or Telugu to understand their conditions or review past records.

### 3. Clinic Connections & Continuity
*   **Clinician Booking:** Patients browse matched doctor schedules, reserve video or in-person slots, apply digital vouchers, and receive automatic notifications.
*   **Continuous Record Aggregation:** Following an appointment, diagnostic tests are scheduled, medicine orders are submitted to regional pharmacies, and new laboratory results are uploaded and parsed, closing the care loop.

---

## 11. Technical Architecture & Systems Map

### 11.1. High-Level Architecture
HealthTribe is built on a modern full-stack Single Page Application (SPA) architecture, utilizing a customized Express and Vite server wrapper.

*   **Frontend Client:** React 18+ framework, styled with utility-first Tailwind CSS. Dynamic interactive layers utilize `motion` (by Framer) and Recharts for practice overview diagnostics.
*   **Backend Server:** Node.js Express server running TypeScript type stripping via `tsx` during development, and compiled via `esbuild` into a standalone, optimized CommonJS bundle (`dist/server.cjs`) for production.
*   **Data Persistence:** An in-memory, pre-seeded database state `db` that mimics relational tables (Appointments, Family Members, Timeline, ABHA, Consents, etc.), ensuring high performance and real-time state mutations.

### 11.2. Major Systems Folder Structure
```
├── /server                 # Backend Services & AI Core
│   └── /ai
│       ├── AIProvider.ts       # Unified Generative Provider Interface
│       ├── AIService.ts        # Service Layer featuring Retry & Backoff
│       ├── GeminiProvider.ts   # Google Gemini 3.5 Flash Integration
│       ├── GroqProvider.ts     # Groq Llama-3.3-70B Versatile Integration
│       └── PromptBuilder.ts    # Centralized System Instruction Repository
│
├── /src                    # Frontend Client Application
│   ├── /components
│   │   ├── ABHAGateway.tsx          # ABDM Statutory Gateway UI & Workflows
│   │   ├── AICopilotWorkspace.tsx   # Conversational AI & Voice Assistant HUD
│   │   ├── DoctorChatbot.tsx        # Floating Practitioner Sidebar chatbot
│   │   ├── HealthHistoryTimeline.tsx# Interactive Multi-Year Timeline Card Renderers
│   │   ├── AddressModal.tsx         # Delivery addresses controls
│   │   ├── ConfirmationModal.tsx    # Appointment action alerts
│   │   └── ProfilePage.tsx          # Dynamic biometrics and preferences
│   │
│   ├── App.tsx             # Main Application routing, dashboards, and views
│   ├── index.css           # Global typography, Tailwind, and custom themes
│   ├── translations.ts     # Bilingual localization strings (EN, HI, TE)
│   └── types.ts            # Global TypeScript data schemas and definitions
│
├── server.ts               # Express Entry point & REST API router
└── metadata.json           # Application platform configuration
```

### 11.3. Key Architecture Module Mapping
*   **Language Synchronization:** Localization configurations are managed in `src/translations.ts`, exposing structured mappings for navigation tags, billing details, and clinical notices across English, Hindi, and Telugu.
*   **System Resiliency:** `AIService.ts` implements a custom `retryWithBackoff` engine. When encountering rate limits (HTTP 429) or network hiccups (ECONNRESET) on upstream LLM providers, it automatically executes exponential backoff retries, ensuring continuous availability in critical clinical contexts.

---

## 12. UI / UX Design Philosophy

```
  [ Minimalist White / Slate Base ] ──▶ [ High Contrast Emerald Accents ]
                                                   │
                                                   ▼
  [ 44px Mobile Touch Targets ]     ◀── [ Custom "Space Grotesk" Typography ]
```

### 1. Design Language
HealthTribe rejects standard, generic templates in favor of a distinctive, premium design language. It utilizes generous negative space, high contrast, and clean layout cards inspired by Swiss editorial layouts and Apple Health.
*   **Light Theme (Default):** Soft off-whites, neutral slate frames, and deep charcoal text for maximum legibility.
*   **Dark Theme:** Immersive deep navy and charcoal layers with crisp, luminous green accents.
*   **Color Codes:** Active elements use **Emerald Green** (representing health, statutory trust, and recovery) and **Sky Blue** (representing diagnostic accuracy and precision).

### 2. Typography pairing
*   **Primary Display Headings:** Uses **Space Grotesk** or premium sans-serif typography with tracking-tight letters for striking, modern section headers.
*   **General UI Text:** Uses **Inter** (sans-serif) for high legibility across a wide range of devices.
*   **Clinical Code & Biomarkers:** Uses **JetBrains Mono** for quantitative laboratory metrics, ensuring aligned columns in biomarker grids.

### 3. Components & Accessibility
*   **Micro-Animations:** Interactive components utilize spring transitions on hover and focus to guide user attention.
*   **Touch Targets:** Buttons and interactive cards maintain a minimum touch target size of 44x44 pixels, ensuring ease of use for elderly patients or individuals with manual motor limitations.
*   **High Contrast:** Every diagnostic state (High, Normal, Low) is mapped to accessible, high-contrast background badges to ensure readability.

---

## 13. Competitive Innovation & Product Positioning

HealthTribe occupies a unique position in the healthcare ecosystem, combining federated health registries with advanced AI capabilities.

| Dimension | Practo | Apple Health | Google Health / Epic | HealthTribe Ecosystem |
| :--- | :--- | :--- | :--- | :--- |
| **Identity Standard** | Custom proprietary logins. | Individual device profile. | Enterprise enterprise portals. | **Statutory ABDM ABHA Federated Identity.** |
| **Bilingual Voice AI**| None. Text-only booking. | None. Simple Siri reminders. | None. Manual typing. | **Real-time Voice HUD (Hindi, Telugu, English).** |
| **Lab Parsing** | Flat PDF upload. | Structured health records. | Complex laboratory sheets. | **Automatic AI-OCR Biomarker Structuring.** |
| **Clinical Notes** | Basic text boxes. | None. | Manual template typing. | **AI-Drafted SOAP & Patient Summaries.** |
| **Family Vault** | Multi-account links. | Disconnected profiles. | Isolated logins. | **Single-Guardian Consolidated Vault.** |

### Key Architectural Innovations
1.  **Federated Interoperability:** By mapping ABHA identity context directly to AI query payloads, HealthTribe is the first system to ensure that ABDM-imported records automatically inform local conversational AI dialogs.
2.  **Context-Driven Vernacular Routing:** The AI system dynamically appends language mandates to prompts, allowing patients to speak in Telugu or Hindi while the underlying AI performs complex clinical lookups in standard English, translating responses back into clear, reassuring vernacular.

---

## 14. Security & Privacy Blueprint

Healthcare applications process highly sensitive, protected health information (PHI). HealthTribe implements rigorous security structures to protect patient data:

### 1. Federated Data Boundaries
*   HealthTribe does not permanently cache ABHA identity records if a patient requests an account unlink.
*   **Account Unlinking:** Clicking "Unlink Account" in `ABHAGateway.tsx` completely clears statutory sessions and blocks future synchronization requests, preserving the patient's privacy.

### 2. Sandbox Access Logs
The Doctor Portal features a secure **Security Audit Log** that tracks every clinical access event. Whenever a doctor reviews a patient’s timeline, imports records, or modifies a patient's health file, a permanent log is generated:
```typescript
export interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  ip: string;
  details: string;
}
```
This logging architecture ensures full accountability and provides clear visibility into record access history.

---

## 15. Future Product Roadmap

### 1. Wearable IoT Integration
Integrate real-time stream data from smart wearable devices (Apple Watch, Fitbit) to feed active cardiovascular parameters directly into the AI Symptom Triage engine, enabling real-time heart health monitoring.

### 2. Native HL7 / FHIR Integration
Transition the current simulated ABDM import pipeline into a production-grade gateway that processes native HL7 FHIR (Fast Healthcare Interoperability Resources) XML/JSON documents, ensuring complete global interoperability.

### 3. Live AI Patient-Doctor Companion
Create a real-time ambient audio clinical assistant that listens to the voice consultation between a patient and doctor (with explicit consent), automatically drafting the clinical SOAP notes in the background.

---

## 16. Complete End-to-End User Journeys

### 1. The Patient Health Journey
```
1. Onboarding  ──▶ 2. Enter Allergies ──▶ 3. Speak Symptoms ──▶ 4. Review Diet Plan
   (Biometrics)      (e.g. Penicillin)      (Hindi / Telugu)     (Scientific Rationale)
```

### 2. The Patient-Practitioner Consultation Loop
```
1. Book Consult ──▶ 2. Arrive at Clinic ──▶ 3. Doctor Reviews ──▶ 4. System Drafts
   (Dynamic Slots)    (Patient Queue)        (AI Briefing)        (SOAP Note Draft)
```

### 3. The ABHA Record Import Journey
```
1. Input ABHA ID ──▶ 2. Verify OTP ──▶ 3. HIP Consent Grant ──▶ 4. Import Pipeline
   (e.g., abha@abdm)    (Secure Trans)     (Diagnostic Report)    (Decrypt & Parse)
```

---

## 17. Technology Stack

*   **Frontend UI Framework:** React 18 with Vite, designed for fast client-side loading.
*   **Styling Engine:** Tailwind CSS featuring custom `@theme` typography extensions.
*   **Animation System:** `motion` (Framer) for fluid screen transitions and responsive Voice HUD ripples.
*   **AI Engine SDKs:** `@google/genai` (for Gemini 3.5-Flash) and `groq-sdk` (for Llama-3.3-70B-Versatile).
*   **Server Runtime:** Node.js Express server running TypeScript with lightweight `tsx` compilers.
*   **Visual Data Charts:** Recharts and Lucide React vector icons.

---

## 18. Complete REST API Specifications

### 1. `POST /api/v1/abha/generate-otp`
*   **Purpose:** Initiate federated ABHA identity verification by generating a secure login transaction.
*   **Input (JSON):** `{ "abhaNumber": "12-3456-7890-12", "abhaAddress": "patient@abdm", "patientId": "P01" }`
*   **Output (JSON):** `{ "success": true, "transactionId": "tx-12345", "otpHint": "Mock verification code is 123456" }`

### 2. `POST /api/v1/abha/verify-otp`
*   **Purpose:** Complete statutory ABHA linking, verifying the transaction code and flagging the profile as linked.
*   **Input (JSON):** `{ "transactionId": "tx-12345", "otp": "123456", "patientId": "P01" }`
*   **Output (JSON):** `{ "success": true, "identity": { "abhaNumber": "12-3456-7890", "verified": true } }`

### 3. `POST /api/v1/consent/request`
*   **Purpose:** Create a new ABDM clinical record consent request for a diagnostic provider.
*   **Input (JSON):** `{ "patientId": "P01", "abhaAddress": "p@abdm", "hipId": "H01", "hipName": "Max Labs" }`
*   **Output (JSON):** `{ "success": true, "consent": { "id": "con-1", "status": "GRANTED" } }`

### 4. `POST /api/v1/abha/import/:patientId`
*   **Purpose:** Trigger the asynchronous multi-stage import pipeline for external care records.
*   **Input (JSON):** `{ "consentId": "con-1" }`
*   **Output (JSON):** `{ "success": true, "sessionId": "sess-882", "status": "PENDING" }`

### 5. `POST /api/v1/analyze-report`
*   **Purpose:** Parse unstructured OCR report texts and extract structured biomarker databases.
*   **Input (JSON):** `{ "reportText": "Hemoglobin 11.2 (12-16 Low)", "patientId": "P01" }`
*   **Output (JSON):** `{ "summary": "Anemia indicated.", "findings": [{ "marker": "Hemoglobin", "value": "11.2", "status": "Low" }] }`

### 6. `POST /api/triage`
*   **Purpose:** Run AI-driven triage on raw clinical symptoms.
*   **Input (JSON):** `{ "symptoms": "Tightness in chest, left arm pain", "patientId": "P01" }`
*   **Output (JSON):** `{ "urgency": "RED", "specialtySuggestion": "Cardiology", "emergencyWarnings": ["Go to ER immediately"] }`

---

## 19. System Folder Hierarchy

*   **`/server/ai`:** Manages generative AI services, credential controls, and prompt builders.
*   **`/src/components`:** Houses self-contained interactive views, modularized to optimize code load.
*   **`server.ts`:** Serves as the central API routing hub and orchestrates simulated backend database operations.
*   **`package.json`:** Declares full-stack dependencies, including `@google/genai` and `groq-sdk`.

---

## 20. Conclusion

HealthTribe represents a significant shift in digital health management. By integrating statutory health accounts with responsive, bilingual AI assistants, it moves beyond the limitations of traditional medical portals. HealthTribe makes healthcare intuitive and accessible: transforming raw medical timelines into clear vernacular explanations for patients, while helping clinicians deliver efficient, data-driven care. This combination of federated identity and clinical intelligence provides a solid foundation for a modern, connected healthcare ecosystem.
