# Wrkr — Unhappy Paths & Error States

> **Living document** · Created: 2026-05-17
> **Use when:** designing UI flows, writing frontend logic, or evaluating whether an edge case is handled.
> **Scope:** Day 1 flows only. See [mvp-scope.md](mvp-scope.md) for what's in scope.
> **Related:** [user-task-flows.md](user-task-flows.md) — happy paths. [constraints.md](constraints.md) — hard rules that govern responses.

---

## Verification & Onboarding (Flow 1.1)

---

### E-01 · Email Domain Not Recognized

**Trigger:** Worker enters an email address whose domain has no workspace on Wrkr, or enters a personal email (gmail, icloud, etc.).

**User sees:** "We don't recognize that domain. Make sure you're using your work email. If your company isn't on Wrkr yet, ask a coworker to send you an invite link."

**System action:** No OTP sent. No domain logged.

**Recovery:** Worker re-enters with correct work email, or uses an invite link to join an existing workspace.

**Design note:** Do not confirm or deny whether a specific domain has a workspace — this would let an adversary enumerate which companies are on the platform. The message is the same regardless of whether the domain exists but the worker made a typo, or the company isn't on Wrkr at all.

---

### E-02 · OTP Code Expired

**Trigger:** Worker receives the OTP email but doesn't enter the code within the expiry window (5 minutes).

**User sees:** "That code has expired. Request a new one." — with a single CTA to resend.

**System action:** Previous code invalidated. New code generated and sent. Email address still not stored.

**Recovery:** Worker requests new code and completes verification promptly.

**Design note:** Show a visible countdown timer during the OTP entry step so workers know the clock is running. This prevents the expired-code error in most cases.

---

### E-03 · OTP Code Incorrect

**Trigger:** Worker enters wrong code (typo, copied wrong digits).

**User sees:** "That code isn't right. Try again." — remaining attempts indicated if rate limiting is near.

**System action:** Attempt logged against the session (not the email). After 5 failed attempts, the code is invalidated and the worker must request a new one.

**Recovery:** Worker re-enters correct code or requests a new one.

---

### E-04 · OTP Rate Limiting

**Trigger:** Worker requests too many OTP codes in a short window (default: 3 requests per 10 minutes per domain).

**User sees:** "Too many requests. Wait 10 minutes before trying again."

**System action:** Further OTP requests from this session are blocked for 10 minutes. Rate limit is per domain, not per IP, to avoid penalizing workers on shared networks.

**Recovery:** Worker waits and tries again.

**Design note:** Rate limiting is per domain to prevent OTP flooding used as a management infiltration technique (repeatedly requesting codes to consume the OTP quota and prevent real workers from verifying).

---

### E-05 · Token Loss — Worker on a New Device

**Trigger:** Worker verified on one device and tries to access Wrkr on a new device, or cleared their browser storage.

**User sees:** Welcome / verification screen with no session. No error message — the platform has no record of the previous session.

**System action:** None. The platform has no server-side token record to check against.

**What happens if they re-verify:**
- Worker re-verifies with their work email
- New anonymous token is generated — this is a new identity
- Previous commitment history is gone
- Workspace verified member count increases by 1 (the platform cannot know this is the same person)

**Recovery path:**
- If worker has their recovery phrase: present option to restore session from phrase on the verification screen
- If worker does not have their recovery phrase: they re-verify and start fresh. Their old commitments remain in the aggregate count but are now orphaned — they cannot withdraw them.

**Design note:** This is the most consequential error state in the system. The onboarding flow must treat recovery phrase storage as a primary step, not a footnote. Consider: blocking progression past onboarding until the worker has explicitly saved or copied their recovery phrase. Orphaned commitments (from lost tokens) are an acceptable aggregate distortion at small scale — at large scale, periodic workspace integrity reviews can identify anomalous member counts.

---

### E-06 · Duplicate Verification Attempt (Same Device)

**Trigger:** Worker who already has a valid token navigates to the verification screen (e.g., follows an old invite link).

**User sees:** Redirected to workspace home. No verification screen shown.

**System action:** Existing token detected in local storage — skip verification entirely.

---

### E-07 · No Workspace Exists for Domain

**Trigger:** Worker's domain is a real work email but no workspace has been created for their company yet.

**User sees:** "Your company isn't on Wrkr yet. To start a workspace, someone at your company needs to set it up. Share this link with a coworker who's ready to get started." — with a workspace creation CTA.

**System action:** No workspace created automatically. Workspace creation requires deliberate action (not accidental verification).

**Design note:** This triggers the workspace bootstrap flow (first verified member creates the workspace). This flow is not in scope for Day 1 detailed design but must exist — without it, organic growth is impossible.

---

## Proposal Creation (Flow 1.4)

---

### E-08 · PII Detected in Proposal Text

**Trigger:** Worker submits a proposal field containing what the PII screen identifies as a name, email address, phone number, or other personal identifier.

**User sees:** The flagged text is highlighted inline. Message: "We found something that might identify a person. Remove it before publishing — protecting everyone's identity includes the people you're writing about."

**System action:** Proposal is not saved or published. Worker is returned to the field with the flagged content highlighted.

**Recovery:** Worker edits the flagged text and resubmits. PII screen runs again on resubmission.

**Design note:** The PII screen will have false positives (e.g., a word that looks like a name but isn't). The message must not be accusatory — frame it as protective, not punitive. Do not offer a "publish anyway" bypass. No exceptions.

---

### E-09 · Threshold Set Implausibly Low (< 10% of Workspace)

**Trigger:** Worker sets a threshold below 10% of the current verified workspace member count.

**User sees:** Inline warning (not a blocker): "This threshold is very low — it may not carry enough weight to feel meaningful. Consider raising it."

**System action:** Proposal can still be published. Warning is advisory only.

**Recovery:** Worker adjusts threshold or proceeds despite warning.

**Design note:** Advisory only, not a hard block. Some legitimate use cases exist for low thresholds (very small workspaces, early signal-gathering). The warning is about legitimacy, not safety.

---

### E-10 · Threshold Set Implausibly High (> 90% of Workspace)

**Trigger:** Worker sets a threshold above 90% of verified members.

**User sees:** Inline warning: "This threshold is very high — it's unlikely to be reached. Most collective actions are considered legitimate at 60–70%."

**System action:** Advisory only. Proposal can be published.

**Recovery:** Worker adjusts or proceeds.

---

### E-11 · Workspace Too Small to Support a Threshold

**Trigger:** Worker tries to create a proposal but the workspace has fewer than 5 verified members.

**User sees:** "Your workspace needs at least 5 verified members before proposals can be published. Invite more coworkers first." — with the invite link generator.

**System action:** Proposal creation blocked. Draft can be saved locally (not to server).

**Recovery:** Worker invites more coworkers, waits for verification, then publishes.

**Design note:** 5 is the aggregate minimum (from [constraints.md](constraints.md)). Fewer than 5 members means threshold progress itself couldn't be safely displayed without individual exposure risk.

---

### E-12 · Proposal Submitted with Empty Required Field

**Trigger:** Worker attempts to publish without completing all required template fields.

**User sees:** Inline validation on the empty field(s). Publish button disabled until all fields are complete.

**System action:** No server call made. Client-side validation only.

---

## Commitment Actions (Flows 1.3, X.2)

---

### E-13 · Threshold Reached While Worker Is Mid-Commitment

**Trigger:** Worker is on the commitment confirmation screen and the threshold is reached by other workers before they confirm.

**User sees:** After confirming, they see the threshold-reached state immediately — "The threshold was just reached. Your commitment was counted." (If their commitment was the one that tipped it, show "You completed the threshold.")

**System action:** Commitment recorded. Threshold activation triggered normally. Worker receives the generated statement.

**Design note:** This is a positive surprise, not an error. Design the transition to feel momentous, not confusing.

---

### E-14 · Worker Tries to Commit to a Proposal They Already Committed To

**Trigger:** Worker navigates to a proposal they've already committed to and attempts to commit again (e.g., back button, duplicate tab).

**User sees:** The proposal shows their existing commitment state — "You've committed to this." — with the withdrawal option visible. No second commitment is possible.

**System action:** Duplicate commitment rejected client-side. No server call.

---

### E-15 · Worker Tries to Commit After Deadline

**Trigger:** Worker has the proposal open and the deadline passes while they're reading it.

**User sees:** Proposal transitions to "Closed — deadline passed" state. Commit button is replaced with the expiry message (final count, threshold not reached).

**System action:** No commitment accepted after deadline. Client refreshes proposal state on any interaction.

---

### E-16 · Worker Tries to Withdraw After Threshold Is Reached

**Trigger:** Worker tries to withdraw a commitment from a proposal that has already reached threshold.

**User sees:** "This proposal has reached its threshold — commitments are now locked." Withdrawal option is hidden or disabled.

**System action:** Withdrawal rejected. The collective action has activated; individual withdrawal is no longer available.

**Design note:** This must be communicated at commitment time, not only at withdrawal time. The commitment confirmation screen (Flow 1.3) should state: "Once the threshold is reached, your commitment is locked."

---

## Workspace & Session

---

### E-17 · Empty Workspace — No Proposals Yet

**Trigger:** Worker is the first to verify (or proposals exist but all are expired/closed), and the workspace has no active proposals.

**User sees:** Empty state — not an error message. Something like: "No active proposals yet. Start one, or share your invite link so more coworkers can join." — with CTAs for both.

**System action:** None.

**Design note:** This is the most common state for any new workspace and the first thing most workers will see. The empty state is a conversion moment — it must not feel like a dead end. The two actions (create a proposal, invite coworkers) are the correct next steps and should feel low-friction.

---

### E-18 · Network Failure Mid-Flow

**Trigger:** Worker loses connection during proposal creation, commitment confirmation, or verification.

**User sees:** Inline error — "Something went wrong. Check your connection and try again." — on the relevant action. No data is lost for inputs already typed.

**System action:** Failed request is not retried automatically (to avoid duplicate submissions). Worker must manually retry.

**Design note:** Proposal draft text should be preserved in local state so a network failure during creation doesn't lose the worker's work. Commitment confirmation is idempotent server-side — retrying a commitment that already succeeded should return the existing committed state, not an error.

---

### E-19 · Session Token Not Found (Corrupted or Cleared)

**Trigger:** Local storage was cleared (browser privacy mode, manual clear, browser update) and the token is gone but the worker has no recovery phrase.

**User sees:** Verification screen — identical to a first-time visit. No error message (the platform has no record to compare against).

**Behavior:** Same as E-05 (Token Loss). Worker re-verifies and receives a new anonymous identity.

---

## Threshold Activation Edge Cases (Flow 1.5)

---

### E-20 · Worker Offline When Threshold Is Reached

**Trigger:** Worker is not in the app when threshold activation occurs.

**User sees:** On next app open — threshold-reached notification in their feed. The generated statement is available for them to view.

**System action:** Notification queued. Statement generated and stored (server-side, against the anonymous commitment record — not against worker identity).

**Design note:** The generated statement must remain available for a reasonable period (minimum 30 days after threshold activation). Workers who were offline at activation must be able to retrieve it.

---

### E-21 · Generated Statement Retrieved After Long Delay

**Trigger:** Worker accesses their generated statement weeks after threshold activation.

**User sees:** Statement available in the closed proposals section, with the threshold attestation intact.

**System action:** Statement served from storage. No expiry at Day 1 — statements persist.

---

## Summary Table

| ID | Error | Severity | Blocker? |
|---|---|---|---|
| E-01 | Email domain not recognized | High | Yes — can't verify |
| E-02 | OTP expired | High | Yes — must resend |
| E-03 | OTP incorrect | Medium | Soft — retry allowed |
| E-04 | OTP rate limited | Medium | Temporary block |
| E-05 | Token loss / new device | Critical | Permanent data loss |
| E-06 | Duplicate verification | Low | No — silent redirect |
| E-07 | No workspace for domain | High | Yes — can't enter |
| E-08 | PII in proposal | High | Yes — must edit |
| E-09 | Threshold too low | Low | No — advisory |
| E-10 | Threshold too high | Low | No — advisory |
| E-11 | Workspace too small | Medium | Yes — can't publish |
| E-12 | Empty required field | Low | Yes — client-side |
| E-13 | Threshold reached mid-commit | Low | No — positive outcome |
| E-14 | Duplicate commitment attempt | Low | No — silent reject |
| E-15 | Commit after deadline | Medium | Yes — proposal closed |
| E-16 | Withdraw after threshold | Medium | Yes — locked |
| E-17 | Empty workspace | Medium | No — conversion moment |
| E-18 | Network failure | Medium | Temporary |
| E-19 | Token corrupted / cleared | Critical | Permanent data loss |
| E-20 | Offline at threshold activation | Low | No — queued |
| E-21 | Statement retrieved late | Low | No |
