# Paper Prototype — Player Feedback

#### Challenge 1: New players “don’t know what to do in the first step / unclear rule boundaries”
**Typical manifestations:**
- Not knowing whether to place towers first or engage monsters first
- Unclear which tower monsters attack
- Unclear win/loss conditions
- Unclear “how diamonds are awarded”

#### Challenge 2: Operation and information entry points are not intuitive enough, leading to “unable to execute strategies”
**Typical manifestations:**
- Unclear differences in tower functions / what the price means
- Unclear placement rules (can it be withdrawn? how to place?)
- Unclear path, attack range, and damage feedback

---

#### Design improvements (no new mechanisms; only clearer display of existing rules)

#### A. Solving Challenge 1: Create a “30-second easy-to-understand” beginner tutorial
**Goal:** Players should be able to complete the first round of key actions without asking anyone upon first entry.

#### 1) Opening Screen: One-line Objective + Win/Loss Conditions
- **Objective:** Defend the (target tower/base) from being destroyed; defeat monsters to gain gold; clear the level to unlock the next level.
- **Failure:** Tower health reaches zero / tower collapses.
- **Success:** Defeat all monsters in the level / level completion.

#### 2) First-Step Hint (Strong Guidance): “Buy a tower with gold and place it next to the path.”
- Use **arrows/highlights** to point to:
  - **Shop/Tower button**
  - **Recommended placement slots**

#### 3) Explain Key Concepts Only When They First Appear (Immediate Explanation)
- First time receiving gold: Pop-up says **“Gold = used to buy towers.”**
- First time receiving diamonds: Pop-up says **“Diamonds = (your defined use) / or level reward.”**
- First time seeing a “Crown”: On the map page, state **“Crown = obtained by clearing all levels.”**

---

#### B. Solving Challenge 2: Make strategic information visible and actionable
**Goal:** Players should be able to answer: **“What can I do now?”** and **“Why buy this tower?”**

#### 1) Tower Information Cards (Viewable Before Purchase)
- Each tower has a small card: **function keywords + gold cost**
  - e.g., **single target / area / slow / high damage**
- Use **icons or short text** to eliminate guesswork.

#### 2) Placement Rules at a Glance
- Placement points/grids are **clearly drawn**; prohibited areas are marked with **gray/diagonal lines**.
- If **“cannot be withdrawn/cannot be moved,”** provide a brief explanation the first time a player places a tower to avoid new players feeling cheated.

#### 3) Visualize Path and Attack Relationships
- Monster routes are marked with **thick lines**; target tower locations are **clearly marked**.
- Damage feedback: Place a **“damaged”** sticker/indicator on the tower.
- Kill feedback: A **“+Gold”** message/indicator pops up when a monster is killed.

#### 4) Rhythm Cue: Preparation Phase vs. Combat Phase (Even if it’s just text/icons)
- No complex system required—just communicate **“now is the time to buy towers / monsters are coming,”** increasing the player’s sense of control.

---

#### Is there a twist?

#### Player A: Feels there’s a twist, but the information wasn’t there
> “I think there’s a turning point where the pressure suddenly increases in the mid-to-late game (monsters are denser/faster/harder to kill). This is a change, but my immediate feeling was more like ‘suddenly I couldn’t hold on anymore,’ because I didn’t know in advance which type of tower to prepare. If I had a little hint beforehand, I would feel this twist makes more sense.”

#### Player B: Feels the twist is good and it drives strategy
> “When the last wave came out, I clearly needed to change my thinking, which I really liked: I wasn’t mindlessly stacking towers, but thinking about ‘how I should spend my gold this wave.’ It made me feel that strategy really came in handy.”
