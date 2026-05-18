# Wrkr — Threat Model

> **Living document** · Updated: 2026-05-17
> **Use when:** making architecture decisions, evaluating a new feature for re-identification risk, assessing a security concern, or preparing for a legal/compliance review.
> **Related:** [constraints.md](constraints.md) — the hard rules derived from this threat model. [glossary.md](glossary.md) — term definitions.

---

## Threat Actors

| Actor | Motivation | Capability |
|---|---|---|
| **Employer / Management** | Identify which workers are organizing; suppress collective action | High access to company systems, worker devices, and HR data. May have legal resources. |
| **External attacker** | Data breach for sale or leverage | Variable. Assume competent adversary with standard web attack toolkit. |
| **Malicious worker** | Identify coordinating coworkers for personal or political reasons | Verified workspace member — has the same access as any worker. |
| **Platform insider (Wrkr employee)** | Could be compelled, bribed, or act unilaterally | Has database access. The highest-trust actor and therefore the highest-risk insider. |
| **Legal / government process** | Obtain worker identity data via subpoena, court order, or NLRB investigation | Can compel production of stored data. Cannot compel data that doesn't exist. |

---

## Threat Inventory

### T-01 · Verification Data Breach or Compulsion
**Description:** Employer or adversary obtains worker email addresses from the verification system — via a data breach, insider access, or legal compulsion (subpoena).

**Severity:** Critical

**Scenario:** Platform stores work email addresses in a database during or after verification. A breach or court order exposes the list. Employer cross-references with their employee directory and identifies every worker who registered.

**Mitigation:**
- Email address is destroyed immediately after anonymous token generation — not stored, not hashed, not logged. There is no database record to breach or compel.
- Deletion event is logged (timestamp + outcome), not the email itself.
- The verification handler is open-sourced and independently auditable.

**Residual risk:** Low. A sufficiently motivated adversary could attempt to intercept the OTP email in transit (requires access to email infrastructure). Mitigated by: short OTP expiry (5 minutes), rate limiting, and single-use codes.

---

### T-02 · Re-identification via Behavioral Pattern Analysis
**Description:** An adversary (employer with network access, or external attacker) correlates platform access timing with internal network traffic to identify which workers are using Wrkr.

**Severity:** High

**Scenario:** A worker accesses Wrkr from their corporate laptop on the company network. The employer's IT team logs HTTPS traffic to wrkr.com (or whatever the domain is) and cross-references with employee network logs. Even without content, the access pattern reveals participation.

**Mitigations:**
- Workers are advised to access Wrkr from personal devices on personal networks. This is the primary mitigation — architectural mitigations are secondary.
- The platform does not expose metadata that narrows a visit to a specific proposal or action (e.g., URL path should not indicate which company workspace is being accessed).
- Company workspaces should not be accessible at predictable, enumerable URLs (e.g., `wrkr.com/company/acme` is bad; workspace routing should be non-enumerable).
- Consider: a single-page app architecture where all routes resolve to the same server path, making traffic analysis reveal only "this device accessed Wrkr" not "this device accessed this workspace."

**Residual risk:** Medium. Workers accessing from corporate networks or devices remain exposed to corporate traffic analysis. This cannot be fully mitigated by platform architecture — it requires worker education.

---

### T-03 · Workspace Infiltration by Management
**Description:** Employer creates fake worker accounts to gain visibility into workspace activity or to identify coordinating workers by their in-workspace behavior.

**Severity:** High

**Scenario:** A manager uses a work email address to verify into the worker workspace. They can see all proposals, threshold progress, and any pseudonymous organizer identities. If they submit false commitments, they inflate threshold progress and waste worker effort.

**Mitigations:**
- Verification proves email domain membership — it does not distinguish between workers and managers. This is an inherent limitation of domain-based verification.
- **Mitigation A:** Invite-chain verification as an alternative — worker must receive an invite from an existing verified member. Managers are less likely to have a trusted worker willing to invite them.
- **Mitigation B:** Workspace integrity concern reporting (Flow X.3) allows workers to flag anomalous membership patterns for platform review.
- **Mitigation C:** Proposals should be designed so that a manager participating provides no useful intelligence. Threshold progress is an aggregate count — a manager who can see "47 of 60 committed" learns nothing actionable about individuals.

**Residual risk:** Medium. Full elimination of infiltration risk requires invite-chain verification, which adds friction and slows workspace growth. Recommend: OTP verification at MVP (faster adoption) with invite-chain as an option for workspaces that want higher integrity guarantees.

---

### T-04 · Anonymous Token Theft
**Description:** A worker's anonymous session token is stolen, allowing an adversary to participate in the workspace on their behalf or to observe their participation history.

**Severity:** Medium

**Attack vectors:**
- XSS attack extracts token from localStorage
- Device theft or shared-device scenario
- Phishing — worker is tricked into entering their token on a fake site
- Malware with localStorage access

**Mitigations:**
- Standard XSS prevention (Content Security Policy headers, output encoding, no `eval`)
- Token stored in localStorage with clear user warning: "This token is tied to your participation. Do not share it."
- Token is not transmitted in URLs (prevents referrer leakage)
- Consider: `HttpOnly` flag for any session cookies (though the token architecture avoids cookies)
- Consider: token binding to a device fingerprint (adds friction; not recommended for MVP)
- Worker education: do not use Wrkr on shared devices; do not screenshot or share your recovery phrase

**Residual risk:** Low-Medium. An attacker who steals a token gains access to an anonymous workspace participant's activity — but that activity is already anonymized, so the damage is limited. The greater risk is a worker being impersonated.

---

### T-05 · Timing Correlation Attack
**Description:** An adversary correlates the timing of a proposal appearing with the specific moment a suspected worker accessed the platform, narrowing down who created it.

**Severity:** Medium

**Scenario:** A manager suspects a specific worker of organizing. They observe that a proposal appeared in the workspace at 2:47pm. They check that worker's corporate VPN/badge logs and see they logged in at 2:45pm. The correlation is suggestive.

**Mitigations:**
- Proposal creation timestamps should not be exposed at minute-level granularity. Show day or hour — not exact time.
- Encourage workers to draft proposals at different times and publish later (async draft → publish workflow)
- The platform should introduce deliberate, random micro-delays between proposal submission and publication (e.g., 0–30 minutes) to break timing correlation

**Residual risk:** Low-Medium. Timing correlation requires the adversary to already suspect a specific individual and have access to granular access logs. It is a targeted attack, not a mass surveillance risk.

---

### T-06 · Collusion / Voluntary Self-Disclosure Attack
**Description:** A group of workers voluntarily reveal their own participation to each other (outside the platform), allowing them to triangulate the identity of other participants.

**Severity:** Low-Medium

**Scenario:** Five workers in a 20-person workspace each tell each other that they committed to a proposal. The threshold was 15. They now know that the remaining 10 commitments came from the other 15 workspace members, narrowing the field significantly.

**Mitigations:**
- This is partially unavoidable — the platform cannot prevent workers from talking to each other.
- The aggregate minimum (≥ 5 before data surfaces) helps at the data layer but not at the social layer.
- Workspace sizes should be large enough that voluntary disclosure gives minimal information. This is an adoption concern as much as a security concern.
- Workers should be educated that sharing their own participation off-platform can unintentionally expose others.

**Residual risk:** Low. This attack requires active coordination among workers to self-disclose, which is unusual. It is also self-limiting: workers who want to maintain each other's anonymity will not do this.

---

### T-07 · Platform Insider Threat
**Description:** A Wrkr employee with database access queries data to identify workers, sells data to an employer, or is compelled by a third party.

**Severity:** High (by consequence) — Medium (by likelihood)

**Scenario:** A Wrkr employee queries the database under pressure (legal, financial, social). Or: Wrkr is acquired and the acquiring entity has different values. Or: a Wrkr employee is approached by an employer offering money for worker identity data.

**Mitigations:**
- The primary mitigation is the data architecture: if no PII is stored, no insider can retrieve it. This is the critical dependency — the zero-knowledge design means insider access is limited to anonymous token hashes and aggregate counts.
- Principle of least privilege: engineers should not have access to production data unless required for a specific, logged, and approved task.
- Audit logs for all database access in production.
- Wrkr's legal terms should explicitly prohibit sale or disclosure of any worker participation data.
- Consider: a canary token system — synthetic data entries that, if exposed, reveal the source of the breach.

**Residual risk:** Low-Medium. The data architecture is the primary defense. If PII is never stored, there is nothing for an insider to retrieve. Residual risk is limited to: anonymous token counts (which reveal participation level but not identity), and operational metadata (IP addresses in server logs, which should be truncated).

---

### T-08 · Legal Compulsion (Subpoena / Court Order)
**Description:** A court, government agency, or employer's legal team compels Wrkr to produce data about specific workers or workspaces.

**Severity:** High (if data exists) — Low (if data architecture is correct)

**Scenario:** An employer sues several workers for tortious interference or conspiracy. Their attorneys subpoena Wrkr for all data related to those workers. Or: an NLRB investigation requests workspace activity data.

**Mitigations:**
- Cannot produce data that doesn't exist. The zero-knowledge / immediate-deletion architecture means Wrkr has no PII to produce.
- What Wrkr *does* have: anonymous token hashes, aggregate counts, proposal content (which workers submitted), IP addresses (in server logs, if not truncated).
- IP addresses in server logs should be truncated to /24 subnet (removes individual device identification). This is standard GDPR practice.
- Wrkr should maintain a transparency report policy: if compelled to produce data, notify the affected workspace (if legally permitted) and report in aggregate in a transparency report.
- Retain legal counsel experienced in labor law and platform liability.
- Consider: jurisdiction selection for data storage (some jurisdictions have stronger protections against compelled disclosure).

**Residual risk:** Low. If the data architecture is implemented correctly, compelled production yields: anonymous tokens (no identity), aggregate counts, proposal content (publicly visible within workspace anyway), and truncated IP logs. None of this identifies individual workers.

---

### T-09 · Proposal Content Leakage
**Description:** Proposal content (framing text) is obtained by management and used to infer who wrote it based on writing style, specific knowledge, or details only certain workers would know.

**Severity:** Medium

**Scenario:** A proposal mentions a specific incident from a team meeting that only 3 people attended. Management reads the proposal and narrows the author to those 3 people. Or: management recognizes the writing style of a specific worker.

**Mitigations:**
- Structured templates reduce — but don't eliminate — stylistic fingerprinting. Templates constrain vocabulary and structure.
- Workers should be educated: do not include specific details that narrow the author pool.
- Consider: a "generalization" pass in the proposal builder that suggests rewording specifics (e.g., "a recent team meeting" instead of naming the meeting).
- Proposals should not be accessible outside the verified workspace. Org-facing dashboards show topic clusters, not proposal text.

**Residual risk:** Medium. Stylometric attacks are real but require significant effort and a specific target. The greater risk is incidental detail rather than deliberate stylometric analysis.

---

### T-10 · Fake Threshold Inflation
**Description:** An adversary creates multiple fake verified-member accounts to artificially inflate or suppress threshold progress.

**Severity:** Medium

**Scenario A (inflation):** An employer-aligned actor creates fake accounts to push a proposal to threshold prematurely, forcing an action before genuine majority support exists.

**Scenario B (suppression):** An adversary commits and then withdraws repeatedly to create misleading threshold progress signals.

**Mitigations:**
- OTP verification limits fake account creation to: actors who control multiple email addresses at the company's domain. This is non-trivial for most adversaries.
- Rate limiting on account creation per domain (e.g., no more than 5 new accounts per domain per 24 hours).
- Workspace integrity reporting (Flow X.3) — workers who notice anomalous member count growth can flag it.
- Threshold percentages (rather than fixed counts) automatically adjust to the verified member count, limiting the impact of adding a few fake accounts.

**Residual risk:** Low-Medium. Invite-chain verification (an option noted in T-03) would largely eliminate this threat at the cost of slower workspace growth.

---

## Architecture Decisions Derived from This Threat Model

| Decision | Driven by |
|---|---|
| Email address destroyed immediately post-verification | T-01, T-08 |
| No individual behavioral data collected | T-02 |
| Workspace URLs are non-enumerable | T-02 |
| Proposal publication introduces random micro-delay (0–30 min) | T-05 |
| Proposal timestamps shown at day/hour granularity only, not minute | T-05 |
| Server logs truncate IP to /24 subnet | T-08 |
| Aggregate minimum of 5 before any data surfaces | T-03, T-06 |
| PII screen on all free-form text fields | T-09 |
| Structured proposal templates (not free-form) | T-09 |
| Rate limiting on workspace account creation per domain | T-10 |
| Principle of least privilege for Wrkr database access | T-07 |
| Invite-chain verification available as high-integrity option | T-03, T-10 |
| Open-source the verification deletion handler | T-01, T-07 |

---

## What This Threat Model Does Not Cover

- **Physical coercion** — employer physically demands a worker unlock their device. Outside platform scope.
- **Social engineering at scale** — employer pressures workers individually to reveal participation. A social and HR problem, not a platform problem.
- **Supply chain attacks** — compromise of Wrkr's dependencies or infrastructure. Addressed by standard secure software development practices, not this threat model.
- **Regulatory classification risk** — whether the platform constitutes a union or securities product. This is a legal question, not a threat model question. See legal review action item.
