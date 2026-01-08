# Plan: Interactive Maria Thun Sowing Calendar

This plan outlines the phases and tasks required to develop and integrate the interactive Maria Thun sowing calendar feature.

---

## Phase 1: Foundational Setup & Data Modeling [checkpoint: f5c69c7]

### Tasks
- [x] Task: Research and source the Maria Thun calendar data for the current year. Convert this data into a structured JSON format. 650c7f0
- [x] Task: Conductor - User Manual Verification 'Foundational Setup & Data Modeling' (Protocol in workflow.md)

---

## Phase 2: Component Development

### Tasks
- [~] Task: Write tests for the core calendar component, ensuring it renders correctly and handles data as expected.
- [x] Task: Implement the main calendar UI component (`Calendar.tsx`), including the monthly grid display.
- [ ] Task: Write tests for the daily view component, including tooltip interactions.
- [x] Task: Implement the `Day.tsx` component to display individual day information and handle user interactions (hover/click for tooltips).
- [ ] Task: Conductor - User Manual Verification 'Component Development' (Protocol in workflow.md)

---

## Phase 3: Integration & Finalization

### Tasks
- [ ] Task: Write tests for the state management and navigation logic (month/year switching).
- [ ] Task: Implement the state management and navigation logic to allow users to switch between different months and years.
- [x] Task: Integrate the calendar feature into a new page/route within the application.
- [x] Task: Add the new calendar page to the main navigation bar.
- [ ] Task: Perform end-to-end testing of the complete feature on different devices and browsers.
- [ ] Task: Conductor - User Manual Verification 'Integration & Finalization' (Protocol in workflow.md)
