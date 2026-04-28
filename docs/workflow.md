
## Git Workflow Guide

This document establishes our team's Git workflow conventions to ensure smooth collaboration and code quality throughout the Defend London project.

---

### Branch Strategy

We follow a **feature branch workflow** with three branch types:

```
main (production-ready)
│
├── develop (integration branch)
│   │
│   ├── feature/tower-system
│   ├── feature/enemy-pathfinding
│   ├── feature/ui-hud
│   ├── fix/grid-alignment-bug
│   └── ...
```

| Branch Type | Naming Convention | Purpose | Merges To |
|-------------|-------------------|---------|-----------|
| `main` | `main` | Stable, deployable code | — |
| `develop` | `develop` | Integration and testing | `main` |
| `feature/*` | `feature/[feature-name]` | New functionality | `develop` |
| `fix/*` | `fix/[bug-description]` | Bug fixes | `develop` |

**Examples:**
- `feature/tower-upgrade-system`
- `feature/enemy-special-abilities`
- `fix/wave-spawn-timing`
- `fix/gold-calculation-error`

---

### Commit Message Conventions

Use clear, descriptive commit messages following this format:

```
[type]: Short description (max 50 chars)

Optional longer description explaining what and why
```

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add frost tower slow effect` |
| `fix` | Bug fix | `fix: correct enemy pathfinding at corners` |
| `refactor` | Code restructuring | `refactor: extract tower targeting logic` |
| `style` | Formatting, no logic change | `style: format ENEMY_STATS config` |
| `docs` | Documentation | `docs: update README with setup instructions` |
| `test` | Adding tests | `test: add unit tests for Economy module` |
| `asset` | Art/audio assets | `asset: add level 2 background image` |


### Development Workflow

#### Starting New Work

```bash
# 1. Switch to develop and pull latest changes
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Work on your feature...
```

#### During Development

```bash
# Commit frequently with meaningful messages
git add .
git commit -m "feat: add enemy spawn animation"

# Push to remote regularly
git push origin feature/your-feature-name
```

#### Completing Work

```bash
# 1. Pull latest develop changes
git checkout develop
git pull origin develop

# 2. Merge develop into your feature branch
git checkout feature/your-feature-name
git merge develop

# 3. Resolve any conflicts, then push
git push origin feature/your-feature-name

# 4. Create Pull Request on GitHub
```

---

### Pull Request Process

#### Before Creating PR

- [ ] Code runs without errors
- [ ] Feature works as intended
- [ ] No console warnings or errors
- [ ] Merged latest `develop` and resolved conflicts


## Changes
- Added X feature
- Modified Y behavior
- Fixed Z bug


## Screenshots (if UI changes)
[Add screenshots or GIFs]
```

#### Review Guidelines

| Reviewer Checks | Description |
|-----------------|-------------|
| **Functionality** | Does the feature work correctly? |
| **Code Quality** | Is the code readable and maintainable? |
| **Conflicts** | Any issues with existing systems? |
| **Performance** | Any potential performance concerns? |

**Approval Required:** At least **1 team member** must approve before merging.

---

### Merge Rules

| Merge Type | When to Use |
|------------|-------------|
| **Squash and Merge** | Feature branches with many small commits |
| **Merge Commit** | Larger features where history matters |
| **Rebase** | Avoid on shared branches |

After merge, **delete the feature branch** to keep repository clean.

---

### Conflict Resolution

When conflicts occur:

```bash
# 1. Identify conflicting files
git status

# 2. Open conflicting file and look for markers
<<<<<<< HEAD
  // Your current code
=======
  // Incoming code
>>>>>>> feature/other-branch

# 3. Manually resolve by keeping correct code
# 4. Remove conflict markers
# 5. Stage and commit
git add .
git commit -m "resolve: merge conflicts with develop"
```

**Golden Rule:** When unsure, communicate with the team member whose code conflicts with yours.

---

### Quick Reference

```bash
# Daily workflow
git checkout develop && git pull          # Start fresh
git checkout -b feature/my-feature        # New branch
git add . && git commit -m "feat: ..."    # Commit work
git push origin feature/my-feature        # Push to remote

# Before PR
git checkout develop && git pull          # Get latest
git checkout feature/my-feature           # Back to feature
git merge develop                         # Merge develop in
git push origin feature/my-feature        # Push, create PR

# After PR approved
# Merge via GitHub UI, then delete branch
```

---

### Emergency Hotfix Process

For critical bugs in `main`:

```bash
git checkout main
git pull origin main
git checkout -b fix/critical-bug-name

# Fix the bug...

git push origin fix/critical-bug-name
# Create PR directly to main (requires 2 approvals)
# After merge, also merge main back to develop
```

---

### Team Communication

| Situation | Action |
|-----------|--------|
| Starting major feature | Notify team in group chat |
| Potential conflict area | Coordinate with affected team member |
| PR ready for review | Tag reviewers on GitHub |
| Blocked by another feature | Communicate and prioritize |

---

**Last Updated:** April 2026
**Maintained by:** Defend London Development Team (Group 14)