# Stage 4: Design Specification — PhishGuard AI (TrustLens)

**File:** `docs/04-design.md`  
**Problem Statement:** Problem 5 — Digital Scam & Phishing Detection System  
**Hackathon Target:** 8–12 Hour Sprint (100% Free / Open-Source Stack)  
**Methodology:** ReportSaathi 11-Stage Vibecoding Workflow  
**Dependencies:** Grounded in `docs/03-scope.md`  

---

## 1. Design Reference Inspiration

To prevent the coding harness from falling back on a generic, visually cluttered antivirus dashboard, PhishGuard borrows UX patterns from accessible consumer products:

| Reference Type | What to Borrow | What to Avoid |
| :--- | :--- | :--- |
| **Banking & Payment Apps** (UPI, Google Pay) | Large, high-visibility status icons; unmistakable transaction badges; concise reassurance copy. | Deep nested settings menus, hidden tabs, small fine print. |
| **Consumer Messaging Apps** (WhatsApp, Telegram) | Familiar card-based message bubble layout; clean quote previews; intuitive drag-and-drop sharing. | Endless unconstrained scrolling chat feeds that bury the critical warning. |
| **Modern Dev / Security Dashboards** (Cloudflare) | Crisp severity badges; progressive disclosure for technical details (collapsible domain breakdown). | Intimidating red-screen lockouts with opaque hex error codes or raw server stack traces. |

---

## 2. Screen State Matrix (Core User Journey)

Every screen in the core flow defined in `docs/03-scope.md` must implement these four explicit states:

| Screen Name | Default State | Empty State | Loading / Scanning State | Error State |
| :--- | :--- | :--- | :--- | :--- |
| **1. Universal Input Screen** | Tabbed interface (Text Area, URL Bar, File Dropzone) with 4 quick "Load Sample Scam" buttons. | Friendly placeholder text with clear guidance ("Paste suspicious message, SMS, or link here..."). | Submit button shows spinner with disabled inputs to prevent double submission. | Inline red warning banner: "Please enter text, a valid URL, or an image file under 10 MB." |
| **2. Scanning & Radar Screen** | Not shown initially; transitions smoothly when user taps "Analyze Threat". | N/A | Pulsing radar sweep animation with rotating sub-step labels: *"Deconstructing URL..."* → *"Checking 50+ brand typosquats..."* → *"Analyzing psychological urgency..."* | Scanner halts with fallback badge: *"External API slow. Displaying deterministic offline heuristics."* |
| **3. Threat Verdict Card** | Top-level severity card: Large 0–100 gauge, distinct Color + Text badge (SAFE / SUSPICIOUS / CRITICAL), plain-English summary. | Prompt: "Run a scan to view detailed threat evaluation." | Skeleton loading blocks mimicking badge, gauge, and summary card layout. | Graceful fallback card: renders deterministic flags with alert: *"Detailed AI commentary temporarily unavailable."* |
| **4. Red-Flag Quote Inspector** | Original text displayed in card container with suspicious sentences highlighted in soft crimson background. | Hidden if input was a bare URL with no body text. | Light pulsing shimmer over text block. | Displays plain extracted text without highlights if substring matching fails. |
| **5. Action Checklist & Share** | Numbered safe next steps with interactive checkboxes, 1-click WhatsApp warning link (`wa.me`), and Cybercrime helpline call button. | Neutral baseline advice ("Always verify unexpected payment requests directly with the sender"). | Grayed-out action buttons until scan completes. | Fallback alert: "Could not generate custom next steps. General Rule: Never share OTPs or passwords." |

---

## 3. Design Direction & Visual Guardrails

### A. Layout & Hierarchy
* **Mobile-First Single Column:** Designed primarily for a 360px–420px mobile viewport, auto-centering on desktop screens with a max-width of 640px.
* **Touch Target Sizing:** All primary interactive elements (tabs, analyze button, share link) maintain a minimum touch target of **48 × 48 px** to accommodate elderly users and motor-impaired individuals.
* **One Primary Action per View:** The screen guides the user through exactly one focal decision at a time: Input → Scan → Evaluate Verdict → Take Safe Action.

### B. Typography & Visual Accessibility
* **Font Family:** Clean, legible sans-serif typeface (`Inter`, `system-ui`, or `-apple-system`) with broad Unicode support for regional scripts.
* **Minimum Type Scale:** 
  * Body Text: Minimum **16 px** (1rem) with 1.5 line height for readability.
  * Headings & Scores: **24 px to 32 px** bold for immediate comprehension.
  * Captions & Disclaimers: Minimum **13 px** with high contrast against dark backgrounds.

### C. Color Palette & Semantic Rules
* **Strict Color + Text Pairing:** High-risk indicators must NEVER rely on color alone. Every colored badge must pair with a bold textual verdict:
  * 🟢 **SAFE:** Emerald Green (`#059669`) + Label *"SAFE — No Threats Detected"* (Score: 0–39)
  * 🟡 **SUSPICIOUS:** Amber Gold (`#d97706`) + Label *"SUSPICIOUS — Exercise Caution"* (Score: 40–69)
  * 🔴 **CRITICAL:** Crimson Red (`#dc2626`) + Label *"CRITICAL SCAM DETECTED"* (Score: 70–100)
* **Backgrounds:** Slate Navy (`#0f172a`) for dashboard background, elevated Card Slate (`#1e293b`) for content panels, and Off-White (`#f8fafc`) for primary text.

### D. Tone of Voice & Language
* **Calm, Objective, and Non-Judgmental:** Avoid shaming language (*"You clicked a bad link"*). Use supportive phrasing (*"This message uses high-urgency language designed to rush your decision"*).
* **Non-Technical Plain Language:** Translate domain anomalies into human terms. Instead of *"Levenshtein distance: 1 on paypa1.com"*, display *"This link uses 'paypa1.com' with the number '1' to impersonate 'paypal.com'"*.
* **Mandatory Universal Footer Disclaimer:** Every screen and shared card must display the fixed guardrail line:
  > *"PhishGuard provides automated risk analysis and educational guidance. It does not replace official banking verification or professional cybersecurity advice."*

---

## 4. Stage 4 Exit Criteria (Done-When Check)
- [x] Every step in the single core flow from `docs/03-scope.md` maps to a concrete screen.
- [x] All 5 core screens define default, empty, loading, and error states.
- [x] Clear design references with concrete "borrow" and "avoid" rules are documented.
- [x] Color-alone status indications are strictly banned in favor of Color + Text pairing.
- [x] Layout constraints (mobile-first, 48px touch targets, 16px body text) are specified for Member 1.
