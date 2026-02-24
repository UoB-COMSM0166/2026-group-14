# Stakeholders and User Stories

---

## Stakeholders

- **Development Team:** The group of students responsible for game design, coding, testing, and deployment.
- **Course Instructor:** Evaluates project outcomes, provides guidance, and feedback.
- **Classmates:** Act as playtesters and potential players, offering feedback on gameplay and usability.
- **End Players:** The target audience who will play and experience the game, influencing design decisions.

---

## Epics for Course Instructors

> As a course instructor, I want my students to learn more programming knowledge, become proficient in team collaboration, and master a structured development process, so that they can grow into competent and collaborative software developers.

### User Stories for Course Instructors

#### 1. Learn More Programming Knowledge

**User Story 1: Apply New Programming Concepts**

- **Given** the game project is complete,
- **When** I review the codebase,
- **Then** I can identify and verify the implementation of a new programming concept, with comments explaining its purpose and usage.

**User Story 2: Write Clean, Maintainable Code**

- **Given** I review the code,
- **When** I check for code quality,
- **Then** the code follows consistent naming conventions, includes meaningful comments, and is organized into logical modules/functions.

#### 2. Become Proficient in Team Collaboration

**User Story 3: Practice Clear and Regular Communication**

- **Given** the project is underway,
- **When** I check the team's communication records (e.g., chat logs, meeting notes),
- **Then** there is evidence of daily/weekly check-ins, clear task updates, and constructive feedback between team members.

**User Story 4: Share Responsibilities and Accountability**

- **Given** I review the project backlog and contribution logs,
- **When** I assess task distribution,
- **Then** all team members have completed a balanced set of tasks, and there is a clear record of who did what.

#### 3. Master a Structured Development Process

**User Story 5: Follow a Defined Development Workflow**

- **Given** the project is complete,
- **When** I review the Git history and sprint plans,
- **Then** I can see a clear history of incremental development, with features delivered in sprints and code managed through a branching strategy (e.g., feature branches).

**User Story 6: Conduct Testing and Iteration**

- **Given** the game is in development,
- **When** I check the test reports and iteration history,
- **Then** there is evidence of user testing, bug fixes, and design improvements based on feedback throughout the project lifecycle.

---

## Epics for End Players

> As a player, I want to experience fun and strategic tower defense gameplay so that I can challenge myself and enjoy the game. I also want a clear and easy-to-understand game interface so that I can play smoothly without confusion. In addition, I want to progress through multiple levels with increasing difficulty so that I feel a strong sense of progress and achievement.

### User Stories for End Players

#### 1. Experience Strategic and Engaging Tower Defense Gameplay

**User Story 1: Deploy Diverse Defense Towers**

- **Given** I am in an active game level with available tower slots and sufficient in-game currency,
- **When** I select a tower type (e.g., attack, slow, area-damage) from the build menu and click a valid placement spot,
- **Then** the tower is successfully placed on the map, the corresponding currency is deducted, and the tower is ready to engage enemies within its range.

**User Story 2: Upgrade Towers for Enhanced Combat Power**

- **Given** I have placed a tower on the map, accumulated enough in-game currency, and the tower is not at maximum level,
- **When** I select the placed tower and click the "Upgrade" button in the tower info panel,
- **Then** the tower's stats (damage, range, fire rate, or special effects) are permanently increased, the currency is deducted, and a visual/audio cue confirms the upgrade.

#### 2. Have Clear and Smooth Game Interface

**User Story 3: Start and Load Levels Seamlessly**

- **Given** I am on the game's main menu or level selection screen,
- **When** I select an unlocked level and confirm the start,
- **Then** the game loads the level map, initial resources, base health, and wave counter within a reasonable time, with no crashes or visual glitches.

**User Story 4: Access Real-Time Game Status Updates**

- **Given** I am actively playing a level,
- **When** I perform actions (placing towers, starting waves, defeating enemies) or game state changes (enemy waves spawn, base takes damage),
- **Then** the UI clearly displays current base health, remaining in-game currency, current wave number, and upcoming wave preview (if applicable) in a non-intrusive location.

#### 3. Experience Progressive and Rewarding Game Levels

**User Story 5: Defend Against Structured Enemy Waves**

- **Given** I have started a level and clicked the "Start Wave" button,
- **When** the wave timer ends,
- **Then** enemies spawn in a predetermined sequence (matching wave difficulty), follow the designated path toward the base, and towers automatically target and attack enemies within their effective range.

**User Story 6: Receive Clear Win/Loss Feedback and Progression Options**

- **Given** I have defeated all enemy waves in the level,
- **When** the last enemy is eliminated,
- **Then** a "Success" screen appears, displaying rewards (e.g., currency, unlocked towers/levels) and options to replay the level or proceed to the next one.
