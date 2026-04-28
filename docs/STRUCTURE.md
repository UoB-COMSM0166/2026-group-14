# Repository layout

Top-level layout for **2026-group-14** (Defend London).

| Path | Purpose |
|------|---------|
| [`game/`](../game/) | Playable game: `index.html`, `js/`, `assets/`, `soundtrack/`, `libraries/`. GitHub Pages entry: `game/index.html`. |
| [`docs/`](../docs/) | Project report, design notes, images, demos, and weekly submissions. |
| [`tests/`](../tests/) | Automated tests (if present). |
| [`.vscode/`](../.vscode/) | Editor settings for the team. |

## Under `docs/`

| Path | Purpose |
|------|---------|
| [`README.md`](README.md) | Main module report (introduction, evaluation, conclusions). |
| [`STRUCTURE.md`](STRUCTURE.md) | This file — how folders are organised. |
| [`process/`](process/) | Workflow, evaluation process, implementation report. |
| [`design/`](design/) | Game/design specs: enemies, towers, stakeholders, diagrams, meeting log, paper-prototype notes, inspiration. |
| [`demo/`](demo/) | Demo and prototype **videos** (`demo.mp4`, `paper-prototype*.mp4`). |
| [`images/`](images/) | Figures for the report: maps, diagrams, dev phases, evaluation charts, cover art. |
| [`feedback/`](feedback/) | Consolidated prototype feedback. |
| [`meeting_notes/`](meeting_notes/) | Pointer to the shared meeting log in `design/`. |
| [`weekly_progress/`](weekly_progress/) | Per-week submission folders; each may contain a `README.md` linking to canonical artifacts elsewhere. |

## Conventions

- **Single source of truth:** Stakeholder stories, class/sequence diagrams, group photo, and paper-prototype markdown live under `design/` or `images/` (or `demo/` for video). Weekly folders link there instead of copying.
- **Asset licences:** Third-party art/audio credits are in [`game/assets/license.txt`](../game/assets/license.txt).
