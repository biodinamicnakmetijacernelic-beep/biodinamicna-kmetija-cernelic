# Spec: Interactive Maria Thun Sowing Calendar

## 1. Overview
This feature will provide users with an interactive, digital version of the Maria Thun sowing calendar, a key tool in biodynamic farming. It will display daily information regarding the best times for planting, cultivating, and harvesting based on celestial positions.

## 2. Functional Requirements
- **FR1: Calendar Display:** The system shall display a monthly calendar view.
- **FR2: Daily Information:** For each day, the calendar shall display the corresponding plant part (Root, Leaf, Flower, Fruit) and any special periods (e.g., "no-plant" days).
- **FR3: Interactive Tooltips:** On hovering or clicking a day, the system shall show a tooltip with a more detailed explanation of the day's activities and recommendations.
- **FR4: Data Source:** The calendar data will be sourced from a reliable, up-to-date source for the Maria Thun calendar. For the initial implementation, this may be a static JSON file that can be updated annually.
- **FR5: Navigation:** Users shall be able to navigate between months and years.
- **FR6: Integration:** The calendar will be integrated as a new page or section within the existing React application, accessible from the main navigation.

## 3. Non-Functional Requirements
- **NFR1: Performance:** The calendar should load quickly and respond smoothly to user interactions.
- **NFR2: Usability:** The calendar must be intuitive and easy to understand for users, regardless of their familiarity with the biodynamic calendar.
- **NFR3: Responsiveness:** The feature must be fully responsive and usable on all screen sizes, from mobile devices to desktops.
- **NFR4: Maintainability:** The code should be well-structured, commented, and follow the project's style guides to allow for easy updates and future enhancements.

## 4. Out of Scope
- User-specific customizations or personal gardening journals.
- Integration with external calendar applications (e.g., Google Calendar).
- Automated notifications or alerts.
