# Acceptance Criteria Format

AC must be **short and scannable**. One bullet = one testable statement.
If a line takes more than one breath to read aloud, split it.

Omit sections that genuinely don't apply — never leave one blank or write "N/A".

---

## Structure

Stories that span multiple screens are broken out **screen by screen**.
Each screen gets its own Functional Specs and Error Handling block.
Shared concerns (Non-Functional Specs, Out of Scope, Permissions, Analytics,
Definition of Done, Dependencies) appear **once at the end**.

---

## Screen [N] — [Screen Name]

### Functional Specs

- Screen displays: [exact title, subtitle, buttons, labels, and UI copy visible on load]
- [User action]: [what happens — navigation, state change, data fetch]
- [User action]: [outcome]

*Rules:*
- One bullet per observable behaviour
- Navigation bullets name the exact destination: "navigates to Screen 2" not "goes to next"
- Display bullets list every visible element using exact copy from the designs
- Back arrow behaviour always stated explicitly

### Error Handling

- [Condition]: [action taken] and show "[exact error message]"
- [API failure]: show "[exact message]" with a retry option
- [Zero results]: show "[exact message with dynamic value if applicable]"

*Rules:*
- Every API call must have a failure bullet
- Every empty / zero-result state must have a bullet
- Error messages quoted verbatim — no paraphrasing

---

*(Repeat the Screen block for each screen in the flow)*

---

## Non-Functional Specs

- [Feature]: [measurable threshold] on [connection / device condition]
- [Feature]: [measurable threshold]

*Concrete numbers only — no "fast", "responsive", or "smooth".*

---

## Out of Scope

- [Thing that could be assumed in scope but isn't — be specific]
- [Feature deferred to a later story — name it if known]

---

## Permissions *(omit if no access control applies)*

- [Role]: can [action]
- [Role]: cannot [action]; [what they see instead]

---

## Analytics *(omit if no trackable actions)*

Missing instrumentation is expensive to retrofit — always specify it.

- Event: `[event_name]` — fires when [trigger]
  - Properties: `[property]`: [type], `[property]`: [type]

---

## Definition of Done

- [ ] All functional and non-functional AC passed
- [ ] Unit and integration tests written and passing
- [ ] Code reviewed and merged
- [ ] Tested in staging environment
- [ ] No known defects outstanding
- [ ] No new accessibility violations (WCAG 2.1 AA)
- [ ] Feature flag configured (if applicable)

---

## Dependencies

- [System or service name]: [link or description]

---

## Example (from a real story)

```
## Screen 1 — Business Score Entry

### Functional Specs
- Screen displays: title "Business Score", subtitle "Get your Experian-backed
  business credit score in minutes.", primary "Create new account" button,
  secondary "I already have an account" link, and info note "Soft credit check
  only. No impact on your business credit score. Data sourced via Experian
  Business Credit Bureau."
- Tapping "Create new account" navigates to the Find Your Company screen.
- Tapping "I already have an account" navigates to the Authentication sign-in
  flow (BBS-37).
- Tapping the back arrow navigates to the previous home screen.

---

## Screen 2 — Find Your Company

### Functional Specs
- Screen displays: title "Find your company", subtitle "Search the Companies
  House register", and a search field with a search icon.
- Once input reaches the minimum character threshold, the system queries the
  Companies House register in real time with debouncing.
- Each result row shows: company name (bold), registration number prefixed
  with # and registered address.
- Tapping a company row shows a loading indicator on the row, fetches
  registered directors, then navigates to Screen 3.
- Tapping the back arrow returns to Screen 1.
- Leading/trailing whitespace is trimmed from the search input before querying.
- Clearing the search field clears the results list; no error is shown.

### Error Handling
- Companies House API unavailable: dismiss results list and show "We're having
  trouble searching right now. Please try again." with a retry option.
- Zero results returned: show "No companies found for '[query]'. Try a
  different name or company number."
- Director fetch fails after company tap: show "We couldn't load the directors
  for this company. Please try again." and keep user on Screen 2.

---

## Screen 3 — Confirm Your Identity

### Functional Specs
- Screen displays: title "Confirm your identity", subtitle "Select your name
  from the registered director of [Company Name]."
- Company summary card shows: company name, registered number and address.
- Each director row shows: Full Name.
- Tapping a director row records the selection and proceeds to the next
  onboarding step.
- Tapping "Not listed? Search a different company" returns to Screen 2 with
  the search field empty.
- Tapping the back arrow returns to Screen 2.
- Single director: list displays one row; no empty state shown.

---

## Non-Functional Specs
- Companies House search results appear within 1s of the debounce threshold
  firing on a 4G connection.
- Director list loads within 1s of company tap.

---

## Out of Scope
- Email / password creation — handled in the next onboarding story.
- Director identity verification beyond name selection.

---

## Definition of Done
- [ ] All functional and non-functional AC passed
- [ ] Unit and integration tests written and passing
- [ ] Code reviewed and merged
- [ ] Tested in staging environment
- [ ] No known defects outstanding

---

## Dependencies
- Companies House API: https://lookups.intelligentlending.co.uk/swagger/index.html#operations-tag-CompaniesHouse
```