# docs/01-problem.md — Stage 1: Problem Definition

**Product:** PhishGuard AI (TrustLens)  
**Track:** Problem Statement 5 — Digital Scam & Phishing Detection System  
**Framework:** 11-Stage Vibecoding Workflow (ReportSaathi Specification)  
**Status:** Approved & Locked for MVP Implementation  

---

## 1. Problem Framing Table

| Dimension | Specification |
| :--- | :--- |
| **Primary User** | Everyday smartphone users, digital payment (UPI / net banking) customers, students, elderly family members, and small business employees who regularly receive digital communications. |
| **User Pain** | Inability to distinguish legitimate service alerts from deceptive phishing links; psychological vulnerability to false urgency and panic; confusion caused by opaque, jargon-heavy browser warnings. |
| **Frequency** | Daily to weekly across SMS, WhatsApp, Telegram, email channels, and physical QR codes (parking, flyers, bills). |
| **Current Workarounds** | Forwarding screenshots to informal family WhatsApp groups, conducting fragmented Google searches, relying on static telco spam filters (which miss zero-day links), or clicking blindly out of panic. |
| **Cost of Failure** | Direct financial theft, compromised bank/UPI accounts, identity extortion, severe anxiety, and security warning fatigue leading users to ignore future alerts. |
| **Two-Sentence Problem Statement** | Everyday users are inundated with increasingly sophisticated scam messages, spoofed brand domains, and malicious QR codes that exploit psychological panic to steal credentials and financial assets. Existing security solutions either rely on static blacklists that fail against zero-day infrastructure or provide opaque warnings that leave non-technical users confused about how to respond safely. |

---

## 2. Evaluation of Three Solution Options

| Option | Architecture & Approach | Riskiest Assumption | Primary Risks & Failure Modes |
| :--- | :--- | :--- | :--- |
| **Option A (Physical / Low-Tech)** | Static educational flyers, bank infographics, and printed verification checklists distributed to users. | Users will remember, carry, and manually cross-check complex domain strings during high-stress moments. | Zero real-time protection; completely bypassed by homoglyph character spoofing; high human error rate during panic. |
| **Option B (PhishGuard MVP)** | Lightweight multi-modal web/mobile assistant combining deterministic offline domain heuristics with free-tier LLM psychological manipulation analysis. | Users will take 5–10 seconds to paste or upload a suspicious message/screenshot before clicking an unknown link. | Potential false negatives if attackers evade both offline heuristics and prompt guidelines (mitigated by strict fail-safe threat scoring). |
| **Option C (Intrusive Daemon)** | System-wide VPN proxy and background SMS listener daemon intercepting all device traffic at the OS level. | Users and app stores will permit high-privilege access (SMS read, network packet sniffing, accessibility permissions) to a new app. | Severe privacy invasion liability, operating system security blocks (especially iOS), battery drain, and high server infrastructure costs. |

---

## 3. Decision & Done-When Criteria
* **Decision:** **Proceed with Option B (PhishGuard AI)**. Option B delivers instant, real-time protection and plain-English explainability on a 100% free stack without compromising user privacy or requiring invasive system privileges.
* **Done When Check:**
  - [x] Problem stated in exactly two sentences without describing a product feature.
  - [x] Three distinct solution options analyzed, including a low-software option.
  - [x] Primary assumptions, failure modes, and user risks documented for each option.
