# Week 9 · Evaluation, Quality and Testing

## Objectives

During Week 9 we focused on evaluation and quality assurance, with the goal of turning feedback into practical improvements. The main tasks were:

- analyse user testing and heuristic evaluation results
- address usability and interface issues
- document testing activities clearly for the project report

## Evaluation summary

This week our team reviewed Think Aloud observations and heuristic feedback. We found that the core gameplay was functional, but several user-facing issues still needed attention:

- the HUD and tower/enemy information were difficult to read during active play
- volume and brightness controls were incomplete and inconsistent
- some enemy sprites and map tiles showed rendering or alignment problems
- wave preview information was not always clear enough for planning strategy

These findings showed that the game is structurally sound, while the remaining work is mainly focused on usability and presentation.

## Quality improvements

The following improvements were implemented in response to the evaluation:

- improved text contrast and spacing in the HUD
- clarified invalid tower placement warnings
- aligned the settings interface across different screens
- reviewed buildable-grid logic and corrected placement ambiguity on map edges

## Testing process

### Playtesting

We conducted two additional play sessions, paying attention to the following points:

- where players hesitated or became confused
- which controls were not immediately clear
- whether the difficulty felt balanced across waves

The results were used to prioritise fixes and update our bug list.

### Heuristic review

The team also performed a heuristic evaluation using principles such as:

- consistency of interface elements
- prevention of common errors
- clarity of player control and feedback

This review highlighted issues beyond the initial playtest observations, particularly in menu layout and shop information.

### Technical validation

Technical checks included:

- verifying enemy spawn waves and pathing in all current levels
- validating tower targeting after adjustments to range and cooldown
- confirming that the debug grid overlay matched the visual buildable areas

### Testing documentation

Two separate test documents were combined to provide a full record of our quality activities. The final test coverage includes:

- functional testing
- combat and balancing testing
- UI and UX testing
- boundary and robustness testing
- compatibility and performance testing

#### Functional testing

| Test Case ID | Test Item | Summary | Expected Result |
| --- | --- | --- | --- |
| FT-001 | Click on grass tile | Click a grass tile in a level | Build menu opens normally |
| FT-002 | Blocked tile click | Click a path or obstacle tile | Build menu does not open |
| FT-003 | Insufficient gold | Open build menu with low gold | Build option is disabled and no gold is spent |
| FT-004 | Tower overlap | Place a tower then attempt a second tower on the same tile | Second tower placement is blocked |
| FT-005 | Wave progression | Clear one wave in Level 1 | Next wave countdown begins automatically |
| FT-006 | Final wave | Clear the final wave in Level 1 | Victory screen appears |

#### Combat and balancing testing

| Test Case ID | Test Item | Summary | Expected Result |
| --- | --- | --- | --- |
| CB-001 | Target locking | Allow multiple enemies into a tower’s range | Tower attacks the correct target |
| CB-002 | Target switching | Remove a current target from range | Tower switches to the next valid target |
| CB-003 | Slow effect | Attack an enemy with a slow tower | Enemy speed slows for the expected duration |
| CB-004 | Splash damage | Use splash tower on grouped enemies | All enemies in area take damage |
| CB-005 | Special abilities | Test charge and dodge enemies | Charge enemies accelerate; dodge enemies evade damage sometimes |
| CB-006 | Balance check | Use different tower combinations | No tower is overwhelmingly dominant; all enemies remain defeatable |

#### UI and UX testing

| Test Case ID | Test Item | Summary | Expected Result |
| --- | --- | --- | --- |
| UI-001 | Main menu buttons | Test Start, Settings, Exit | Each button goes to the correct screen |
| UI-002 | Level unlock | Check level selection after progress | Locked and unlocked levels behave correctly |
| UI-003 | Volume slider | Adjust volume in settings | Audio volume updates immediately |
| UI-004 | Brightness slider | Adjust brightness | Overlay transparency changes correctly |
| UI-005 | Save system | Log in, progress, refresh, log in again | Player progress is preserved |
| UI-006 | Level unlock flow | Clear Level 1 and return to select screen | Level 2 becomes available |

#### Boundary and robustness testing

| Test Case ID | Test Item | Summary | Expected Result |
| --- | --- | --- | --- |
| BR-001 | Edge building | Attempt placement on the map edge or landmark | Building is blocked without errors |
| BR-002 | Rapid clicks | Rapidly click build actions | No duplicate towers or incorrect gold deductions |
| BR-003 | HP zero | Let landmark HP reach zero | Game over condition triggers correctly |
| BR-004 | Kill at destination | Kill enemy exactly at the end point | Enemy counts as killed, not leaked |

#### Compatibility and performance testing

| Test Case ID | Test Item | Summary | Expected Result |
| --- | --- | --- | --- |
| CP-001 | Browser compatibility | Run the game in Chrome, Edge, Firefox | Game functions normally in all browsers; save/load works |
| CP-002 | Performance | Play a late wave with many towers and enemies | Frame rate remains stable and no obvious lag occurs |

## Outcomes and next steps

### Completed this week

- consolidated evaluation feedback into a clear report section
- fixed several usability and interface issues
- documented our testing process for future project review

### Next steps

- implement volume controls and persistent settings
- add a more detailed wave preview panel
- continue playtesting with new users to confirm polish improvements
- finalise the project report and integrate evaluation/process sections fully
