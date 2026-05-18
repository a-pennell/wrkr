# Wrkr — Constraints & Settled Decisions

> **Living document** · Updated: 2026-05-17
> **Use when:** evaluating a feature, making an architectural decision, or assessing whether a proposal is in bounds. These are non-negotiable rules and closed decisions — do not re-open without explicit product owner decision.
> **Related:** [glossary.md](glossary.md) · [strategy.md](strategy.md) · [phase-rollout.md](phase-rollout.md)

---

## Hard Constraints (Architectural Invariants)

These cannot be relaxed to ship faster, close a deal, or satisfy a technical convenience. Violating any of these would compromise the trust architecture the product depends on.

| # | Constraint | Rationale |
|---|---|---|
| C-01 | **No PII stored post-verification.** Email address and SSO identity are destroyed immediately after generating the anonymous membership token. | Re-identification risk. If a breach occurs, there is nothing to leak. |
| C-02 | **Anonymous token is worker-controlled.** The token lives on the worker's device. Wrkr servers never hold it. No server-side account recovery is possible. | Server-side token storage creates a target for legal discovery, government requests, and breach. |
| C-03 | **No individual behavioral data collected.** The platform does not track which proposals a worker viewed, how long they spent, their click patterns, or navigation history. | Behavioral data creates a behavioral fingerprint that can re-identify workers even without explicit identity. |
| C-04 | **Aggregate minimum enforced before any data surfaces.** No aggregate signal is shown until a minimum group size is met (default: 5). | Small groups can be reverse-engineered to identify individuals even from aggregate data. |
| C-05 | **Org-side access requires active worker majority consent.** There is no admin override, no legacy access, no management bypass. | The consent gate is the product differentiator. Bypassing it destroys the trust model and the business model simultaneously. |
| C-06 | **Threshold must be met before any commitment activates.** Partial commitment states are never disclosed, acted upon, or made visible in a way that identifies participants. | Partial disclosure is the most dangerous state for individual workers — it reveals who is willing to act before collective protection exists. |
| C-07 | **Free-form text fields run PII screening before saving or surfacing.** Any field where workers can type freely must be screened for names, emails, and identifying information. | Workers may inadvertently identify themselves or others in proposal text. |
| C-08 | **Decision records are immutable.** Governance outcomes and threshold activation records cannot be edited, deleted, or retroactively modified. | Legitimacy depends on the record being trustworthy. A mutable record is not a legitimate record. |
| C-09 | **Workers can always trigger a consent revocation vote.** No time lock, no minimum waiting period, no management approval required. | Consent that cannot be revoked is not consent. |

---

## Settled Decisions

These were explicitly decided and the alternatives considered. Do not re-open without new information that changes the analysis.

---

**SD-01 · Threshold coordination model vs. petition model**

*Decision:* Threshold coordination (conditional commitments that activate simultaneously) rather than a petition (cumulative signatures that become public).

*Rejected because:* A petition creates a public list of signers that grows over time. Early signers are exposed before the group is large enough to offer collective protection. The first-mover disadvantage is the core problem being solved — a petition replicates it.

*Threshold model advantage:* No one is exposed until the group is large enough to act together. Activation is simultaneous, not incremental.

---

**SD-02 · Structured templates only for proposals (no free-form at MVP)**

*Decision:* Proposals are created from structured templates, not free-form text.

*Rejected because:* Free-form proposals (a) create inconsistent framing that makes collective support harder to form, (b) increase PII risk dramatically (workers will name names), and (c) risk turning the platform into an anonymous venting channel with no coordination mechanism.

*Template advantage:* Forces proposals into actionable, bounded framing. The platform coordinates action, not sentiment.

---

**SD-03 · Worker consent gate for org-side data access**

*Decision:* Org-facing dashboards require an active worker majority consent vote — not an employer purchase, not a platform default, not an opt-out.

*Rejected because:* Opt-out models (org access by default, workers can revoke) would replicate the power dynamic where the employer controls the channel. Workers would distrust data they didn't actively consent to share. The product value (honest aggregate signal) depends on worker trust.

*Consent gate advantage:* Workers who voted to share data are unlikely to game the data they consented to share. The signal is more honest.

---

**SD-04 · Phase 1 excludes org accounts entirely**

*Decision:* No employer accounts, no org-facing features, and no revenue model requiring employer access in Phase 1.

*Rejected because:* Launching org-side access at MVP — even with a consent gate — creates a perception problem. Workers need to experience the platform as purely theirs before they will trust a consent vote to be meaningful. The consent vote is only trusted if the baseline experience is trusted.

*Sequencing advantage:* By the time workers see a consent vote in Phase 2, they've already experienced the platform as anonymous and safe. The vote feels real.

---

**SD-05 · Anonymous verification (email destroyed) vs. pseudonymous verification (email hashed)**

*Decision:* Email address is destroyed immediately after generating the membership token. No hash, no one-way mapping, no recovery path.

*Rejected because:* A hash is reversible with sufficient compute or a known email list. Hashing creates a false sense of anonymity. If Wrkr can prove membership from an email address, so can an adversary with the hash and a list of known employee emails.

*Destruction advantage:* If there is nothing to hash, there is nothing to reverse. Zero knowledge means zero knowledge.

---

**SD-06 · Cohort-based launch vs. open sign-up**

*Decision:* Phase 1 launches with 3–5 pre-seeded workspaces via worker champions. No public sign-up.

*Rejected because:* Open sign-up creates sparse workspaces where workers have no one to coordinate with. A single worker in a workspace is a bad experience and a bad signal. Network effects require density within a workspace, not breadth across workspaces.

*Cohort advantage:* Pre-seeded workspaces can reach meaningful quorums immediately. Threshold reach rates are the core success metric — they require density.

---

**SD-07 · Platform does not submit collective actions on workers' behalf**

*Decision:* When a threshold is reached and a formal request is the committed action, the platform generates the document and a threshold attestation — but workers decide how and whether to submit it.

*Rejected because:* Automatically submitting on behalf of workers could be interpreted as platform-coordinated labor action, which has different legal implications in various jurisdictions. More importantly, workers should retain agency over the final step.

*Non-submission advantage:* Workers retain full control. The platform provides legitimacy infrastructure, not legal representation.

---

## Things That Are Not Constraints (Common Misconceptions)

| Misconception | Reality |
|---|---|
| "Workers should be able to see who else committed once the threshold is met" | No. Anonymity persists after activation. The count is public; the identities are not. |
| "Management should be notified when a proposal reaches threshold" | No. Threshold activation notifies committed workers only. What workers do with the outcome is their choice. |
| "The platform should recommend a threshold value for proposals" | Maybe useful as a UX hint, but the organizer controls this. The platform warns if a threshold is implausibly high or low; it does not prescribe. |
| "We can offer a paid tier that gives workers individual-level data about their own workspace" | No. Individual-level data (even self-reported participation history visible only to the individual) creates re-identification risk when combined with other signals. Aggregate only. |
| "Org accounts should have a read-only view even without a consent vote" | No. There is no org-side access without consent vote — not even read-only, not even for aggregate data. The consent gate has no exceptions. |
