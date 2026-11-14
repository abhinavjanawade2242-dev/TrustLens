# Stage 11: Feedback Log & Future Roadmap — PhishGuard AI

**File:** `docs/10-feedback.md`  
**Problem Statement:** Problem 5 — Digital Scam & Phishing Detection System  
**Post-Demo Retrospective**  

---

## 1. Judge & User Feedback Log Template

| Feedback ID | Stakeholder / Judge | Observation / Comment | Priority | Target Phase |
| :---: | :--- | :--- | :---: | :---: |
| **FB-01** | Cyber Judge 1 | Commended that deterministic heuristics run offline without LLM hallucination risk. | High | Maintained |
| **FB-02** | Fintech Judge 2 | Inquired about regional vernacular smishing support across local languages. | High | Phase 2 |
| **FB-03** | User Tester | Appreciated the 1-click warning share button; suggested adding a messaging forwarding bot. | Medium | Phase 2 |
| **FB-04** | Mentor | Recommended caching scanned domains in memory to avoid re-evaluating identical URLs. | Medium | Phase 2 |

---

## 2. Phase 2 Future Roadmap

1. **Regional Language NLP Expansion:** Prompting Gemini with multilingual datasets to detect vernacular banking fraud across regional languages.
2. **Messaging Native Bots:** Allowing users to forward suspicious messages directly to a messaging bot rather than opening a web browser.
3. **Crowdsourced Threat Feed:** Integrating lightweight cloud database persistence to create an active, community-reported scam database where users can verify active local fraud campaigns.
4. **Lightweight Browser Extension:** Building a Manifest V3 browser extension to highlight spoofed lookalike links directly inside webmail interfaces.
