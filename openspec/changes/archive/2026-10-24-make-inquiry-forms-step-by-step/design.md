## Context

The current client inquiry form renders every semantic fieldset at once and keeps a fixed submit action above the phone navigation. Although responsive, long material and injection requests still require extensive scanning and the fixed action appears before the customer has reviewed later sections. The form already uses uncontrolled native controls and a single Server Action, so step guidance can remain a frontend-only presentation concern without changing submitted data or security boundaries.

## Goals / Non-Goals

**Goals:**

- Present one existing semantic form section at a time with clear Persian RTL progress.
- Keep control values mounted and preserved while moving backward and forward.
- Validate required controls in the active step before allowing forward navigation.
- Make previous/next actions predictable and show submit only on the final step.
- Preserve native final validation, Server Action behavior, pending/error feedback, and all field names.
- Restore normal document-flow actions instead of a permanently fixed submit control.

**Non-Goals:**

- Save incomplete drafts, persist the current step across reloads, or submit partial inquiries.
- Change backend validation, API contracts, database schema, authentication, ownership, or statuses.
- Add ecommerce, pricing, inventory, payment, quotation, or delivery commitments.

## Decisions

1. **Keep all step controls mounted and hide inactive fieldsets.** The wizard will toggle the `hidden` state of existing fieldsets rather than conditionally mounting them. This preserves uncontrolled input values and guarantees the final `FormData` contains the same approved fields. Reconstructing state for every control was rejected because it duplicates browser behavior and increases contract-drift risk.
2. **Derive steps from existing semantic sections.** Product requests have three steps, injection and material requests have four, and contact has its single meaningful step. No synthetic review or confirmation step is added because it would duplicate content without an approved business requirement.
3. **Use native constraint validation at step boundaries.** The next action checks required controls inside the active fieldset and calls native validity reporting on the first invalid control. Final submission continues to use browser validation plus the existing Server Action/backend validation. Custom validation rules are not introduced.
4. **Keep navigation local to the form.** A compact progress header announces the current step and total. Previous and next are `type="button"`; only the final action is `type="submit"`. Form submission attempted before the last step advances locally instead of invoking the Server Action.
5. **Manage focus after step changes.** After navigation, focus moves to the active step legend so keyboard and assistive-technology users receive immediate context without changing the page route.
6. **Return actions to document flow.** Removing the fixed submit bar avoids competition with the portal bottom navigation. On phones the action row remains visible after the shorter active step and uses full-width touch targets.

## Risks / Trade-offs

- [Risk] Hidden required controls could surprise final native validation if a step was bypassed. → Future steps cannot be opened through the next action until the current required controls pass native validation; final submission still validates the complete form.
- [Risk] Browser back navigation could be confused with wizard back. → Step changes do not alter URL or history; explicit Persian previous/next controls remain inside the form.
- [Risk] Server submission errors appear after the last step only. → Submission is only available on the last step, and errors remain adjacent to that action.
- [Risk] Contact inquiries have only one step. → Render concise 1-of-1 progress and the final submit action without artificial empty steps.

## Migration Plan

Deploy as a frontend-only change. Existing requests and backend contracts require no migration. Rollback restores the all-sections presentation while leaving submitted data unaffected.

## Open Questions

None.
