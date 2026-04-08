// Enemy — Path-following enemy unit


class Enemy {
  /**
   * @param {Path}   path   - The path this enemy will follow
   * @param {Object} config - { type, hp, speed }
   *                          Any missing field falls back to ENEMY_STATS preset.
   */
  constructor(path, config = {}, sound = null) {
    this.path = path;
    this.sound = sound;
    let type = config.type || 'basic';
    let preset = ENEMY_STATS[type] || ENEMY_STATS.basic;

    this.type = type;
    this.maxHp = (config.hp !== undefined) ? config.hp : preset.hp;
    this.hp = this.maxHp;
    this.speed = (config.speed !== undefined) ? config.speed : preset.speed;
    this.baseSpeed = this.speed;
    this.reward = preset.reward;
    this.slowTimer = 0;
    this.isSlowed = false;

    // Ability init
    this.ability = preset.ability || null;
    this.chargeSpeedMultiplier = preset.chargeSpeedMultiplier || 1;
    this.chargeThreshold = preset.chargeThreshold || 0;
    this.chargeDuration = preset.chargeDuration || 0;
    this.isCharging = false;
    this.chargeTimer = 0;
    this.hasCharged = false;
    this.dodgeChance = preset.dodgeChance || 0;
    this.dodgeEffectTimer = 0;
    this.leapCooldown = preset.leapCooldown || 0;
    this.leapDistance = preset.leapDistance || 0;
    this.leapTimer = 0;
    this.leapEffectTimer = 0;

    // Goblin Bomber - death explosion
    this.explodeRadius = preset.explodeRadius || 0;
    this.disableDuration = preset.disableDuration || 0;

    // Diving Lizard - dive
    this.diveCooldown = preset.diveCooldown || 0;
    this.diveDuration = preset.diveDuration || 0;
    this.diveTimer = 0;
    this.isDiving = false;
    this.diveEffectTimer = 0;

    // Treant Mage - heal
    this.healRadius = preset.healRadius || 0;
    this.healPercent = preset.healPercent || 0;
    this.healCooldown = preset.healCooldown || 0;
    this.healTimer = 0;

    // Boss - multi-phase
    this.phase = 1;
    this.phase2Threshold = preset.phase2Threshold || 0;
    this.phase3Threshold = preset.phase3Threshold || 0;
    this.summonCooldown = preset.summonCooldown || 0;
    this.summonTimer = 0;
    this.tauntCooldown = preset.tauntCooldown || 0;
    this.tauntTimer = 0;

    // Alchemist debuffs
    this.poisonDamage = 0;
    this.poisonTimer = 0;
    this.weakened = false;
    this.weakenTimer = 0;
    this.weakenBonus = 0;

    const SIZES = { basic: 20, fast: 16, tank: 28, boss: 34, knight: 22, archer: 18, giant: 32, goblinBomber: 24, divingLizard: 22, treantMage: 26, gentlemanBug: 36 };
    this.bodySize = SIZES[type] || 20;

    let start = path.getWaypoint(0);
    this.x = start.x;
    this.y = start.y;
    this.currentWaypointIndex = 1;
    this._alive = true;
    this._reachedEnd = false;
  }

  update() {
    if (!this._alive || this._reachedEnd) return;

    this.updateAbilities();

    // Poison damage
    if (this.poisonTimer > 0) {
      this.hp -= this.poisonDamage;
      this.poisonTimer--;
      if (this.hp <= 0) {
        this.hp = 0;
        this._alive = false;
      }
    }

    // Weaken debuff timer
    if (this.weakenTimer > 0) this.weakenTimer--;

    let actualSpeed = this.speed;
    if (this.slowTimer > 0) {
      this.slowTimer--;
      if (this.slowTimer <= 0) {
        this.speed = this.baseSpeed;
        this.isSlowed = false;
      }
    }

    if (this.isCharging) {
      actualSpeed *= this.chargeSpeedMultiplier;
      this.chargeTimer--;
      if (this.chargeTimer <= 0) this.isCharging = false;
    }

    if (this.currentWaypointIndex >= this.path.count()) {
      this._reachedEnd = true;
      return;
    }

    let target = this.path.getWaypoint(this.currentWaypointIndex);
    let dx = target.x - this.x;
    let dy = target.y - this.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= actualSpeed) {
      this.x = target.x;
      this.y = target.y;
      this.currentWaypointIndex++;
      if (this.currentWaypointIndex >= this.path.count()) {
        this._reachedEnd = true;
      }
    } else {
      this.x += (dx / dist) * actualSpeed;
      this.y += (dy / dist) * actualSpeed;
    }
  }

  updateAbilities() {
    if (this.ability === 'charge' && !this.hasCharged && this.hp / this.maxHp <= this.chargeThreshold) {
      this.isCharging = true;
      this.chargeTimer = this.chargeDuration;
      this.hasCharged = true;
    }

    if (this.ability === 'leap') {
      this.leapTimer++;
      if (this.leapTimer >= this.leapCooldown) {
        this.performLeap();
        this.leapTimer = 0;
      }
    }

    // Diving Lizard: dive
    if (this.ability === 'dive') {
      this.diveTimer++;
      if (!this.isDiving && this.diveTimer >= this.diveCooldown) {
        this.isDiving = true;
        this.diveEffectTimer = this.diveDuration;
        this.diveTimer = 0;
        console.log('[Combat] Diving Lizard submerged');
      }
      if (this.isDiving) {
        this.diveEffectTimer--;
        if (this.diveEffectTimer <= 0) {
          this.isDiving = false;
          console.log('[Combat] Diving Lizard emerged');
        }
      }
    }

    // Treant Mage: heal (handled in GameManager)
    if (this.ability === 'heal') {
      this.healTimer++;
      if (this.healTimer >= this.healCooldown) {
        this.healTimer = 0;
        this.shouldHeal = true;
      }
    }

    // Boss: phase transition
    if (this.ability === 'boss') {
      let hpPercent = this.hp / this.maxHp;
      if (this.phase === 1 && hpPercent <= this.phase2Threshold) {
        this.phase = 2;
        console.log('[Combat] Gentleman Bug phase 2 - Shield active');
      }
      if (this.phase === 2 && hpPercent <= this.phase3Threshold) {
        this.phase = 3;
        this.speed = this.baseSpeed * 2;
        console.log('[Combat] Gentleman Bug phase 3 - Enraged');
      }

      this.summonTimer++;
      if (this.summonTimer >= this.summonCooldown) {
        this.summonTimer = 0;
        this.shouldSummon = true;
      }

      this.tauntTimer++;
      if (this.tauntTimer >= this.tauntCooldown) {
        this.tauntTimer = 0;
        this.shouldTaunt = true;
      }
    }

    if (this.dodgeEffectTimer > 0) this.dodgeEffectTimer--;
    if (this.leapEffectTimer > 0) this.leapEffectTimer--;
  }

  performLeap() {
    let landingIndex = this.currentWaypointIndex + this.leapDistance;
    if (landingIndex < this.path.count()) {
      let wp = this.path.getWaypoint(landingIndex);
      this.x = wp.x;
      this.y = wp.y;
      this.currentWaypointIndex = landingIndex + 1;
      this.leapEffectTimer = 30;
      if (this.currentWaypointIndex >= this.path.count()) this._reachedEnd = true;
    }
  }

  takeDamage(amount) {
    // Diving Lizard immune when submerged
    if (this.isDiving) {
      console.log('[Combat] Attack passed through submerged Diving Lizard');
      return false;
    }

    // Boss phase 2: 50% damage reduction
    if (this.ability === 'boss' && this.phase === 2) {
      amount = amount * 0.5;
    }

    // Weaken debuff: take extra damage
    if (this.weakened && this.weakenTimer > 0) {
      amount = amount * (1 + this.weakenBonus);
    }

    // Dodge check (Archer)
    if (this.ability === 'dodge' && Math.random() < this.dodgeChance) {
      this.dodgeEffectTimer = 20;
      return false;
    }
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this._alive = false;
      if (this.sound) {
        this.sound.play("death");
      }
    }
    return true;
  }

  isDead() {
    return !this._alive;
  }

  reachedEnd() {
    return this._reachedEnd;
  }

  applySlow(slowEffect, duration) {
    // Boss phase 3: immune to slow
    if (this.ability === 'boss' && this.phase === 3) {
      return;
    }
    if (this.isSlowed || this._reachedEnd || !this._alive) return;
    this.speed = this.baseSpeed * slowEffect;
    this.slowTimer = duration;
    this.isSlowed = true;
  }

  draw() {
    push();

    let imgs = (typeof gameImages !== 'undefined') ? gameImages : {};
    let spriteMap = {
      basic: { img: imgs.enemyGuard, w: 70, h: 90 },
      fast: { img: imgs.enemyPigeon, w: 60, h: 60 },
      tank: { img: imgs.enemyHedgehog, w: 80, h: 80 },
      knight: { img: imgs.monster1, w: 70, h: 85 },
      archer: { img: imgs.monster2, w: 60, h: 75 },
      giant: { img: imgs.monster3, w: 90, h: 100 },
      boss: { img: imgs.monster4 || imgs.monster3, w: 90, h: 100 },
      goblinBomber: { img: imgs.goblinBomber, w: 70, h: 80 },
      divingLizard: { img: imgs.divingLizard, w: 75, h: 60 },
      treantMage: { img: imgs.treantMage, w: 70, h: 90 },
      gentlemanBug: { img: imgs.gentlemanBug, w: 100, h: 130 }
    };
    let entry = spriteMap[this.type] || spriteMap.basic;
    let useSprite = entry.img && entry.img.width > 0;

    let movingLeft = false;
    if (this.currentWaypointIndex < this.path.count()) {
      let target = this.path.getWaypoint(this.currentWaypointIndex);
      movingLeft = (target.x - this.x) < 0;
    }

    // Dive effect (transparent + ripple)
    if (this.isDiving) {
      tint(255, 255, 255, 80);
      if (entry.img && entry.img.width > 0) {
        imageMode(CENTER);
        image(entry.img, this.x, this.y, entry.w, entry.h);
      }
      noTint();

      noFill();
      stroke(100, 200, 255, 100);
      strokeWeight(2);
      let rippleSize = (this.diveDuration - this.diveEffectTimer) * 0.5;
      ellipse(this.x, this.y + 20, 60 + rippleSize, 30 + rippleSize / 2);

      // HP bar and ability icon still needed
      let halfH = entry.h / 2;
      let barW = Math.max(entry.w, 30);
      let barH = 5;
      let barX = this.x - barW / 2;
      let barY = this.y - halfH - 8;
      let ratio = this.hp / this.maxHp;
      noStroke();
      fill(50, 50, 50, 180);
      rect(barX, barY, barW, barH, 2);
      if (ratio > 0.6) fill(50, 210, 50);
      else if (ratio > 0.3) fill(240, 200, 0);
      else fill(230, 50, 50);
      rect(barX, barY, barW * ratio, barH, 2);
      this.drawAbilityIcon(barX, barY);
      pop();
      return;
    }

    if (this.isCharging) {
      noFill();
      stroke(255, 50, 50, 150);
      strokeWeight(3);
      ellipse(this.x, this.y, (useSprite ? entry.w : this.bodySize) + 20, (useSprite ? entry.h : this.bodySize) + 20);
      stroke(255, 100, 100, 100);
      strokeWeight(2);
      for (let i = 0; i < 3; i++) {
        let offsetY = (i - 1) * 15;
        line(this.x - 40, this.y + offsetY, this.x - 60, this.y + offsetY);
      }
    }

    if (this.dodgeEffectTimer > 0) {
      tint(255, 255, 255, 100);
      if (useSprite) {
        imageMode(CENTER);
        image(entry.img, this.x - 20, this.y, entry.w * 0.8, entry.h * 0.8);
        image(entry.img, this.x + 20, this.y, entry.w * 0.8, entry.h * 0.8);
      }
      noTint();
      fill(100, 255, 255);
      noStroke();
      textSize(14);
      textAlign(CENTER, BOTTOM);
      text('DODGE!', this.x, this.y - (useSprite ? entry.h : this.bodySize) / 2 - 5);
    }

    if (this.leapEffectTimer > 0) {
      noFill();
      stroke(255, 200, 50, 200);
      strokeWeight(3);
      arc(this.x, this.y, 80, 60, PI, TWO_PI);
      fill(255, 200, 50);
      noStroke();
      textSize(14);
      textAlign(CENTER, BOTTOM);
      text('LEAP!', this.x, this.y - (useSprite ? entry.h : this.bodySize) / 2 - 5);
    }

    if (this.isSlowed) {
      noStroke();
      fill(130, 210, 255, 90);
      let glowR = useSprite ? Math.max(entry.w, entry.h) / 2 + 8 : this.bodySize / 2 + 6;
      ellipse(this.x, this.y, glowR * 2, glowR * 2);
    }

    // Treant heal effect
    if (this.ability === 'heal' && this.healTimer >= this.healCooldown - 30) {
      noFill();
      stroke(100, 255, 100, 150);
      strokeWeight(3);
      ellipse(this.x, this.y, this.healRadius * 2, this.healRadius * 2);

      fill(100, 255, 100, 200);
      noStroke();
      for (let i = 0; i < 5; i++) {
        let angle = frameCount * 0.05 + i * TWO_PI / 5;
        let px = this.x + cos(angle) * 40;
        let py = this.y + sin(angle) * 40 - 20;
        ellipse(px, py, 8, 8);
      }
    }

    // Boss shield effect (phase 2)
    if (this.ability === 'boss' && this.phase === 2) {
      noFill();
      stroke(150, 100, 200, 150);
      strokeWeight(4);
      ellipse(this.x, this.y, 120, 140);
    }

    // Boss enrage effect (phase 3)
    if (this.ability === 'boss' && this.phase === 3) {
      noFill();
      stroke(255, 50, 50, 100 + sin(frameCount * 0.2) * 50);
      strokeWeight(3);
      ellipse(this.x, this.y, 130, 150);
    }

    let yOffset = this.leapEffectTimer > 0 ? -sin(this.leapEffectTimer * 0.3) * 20 : 0;

    if (useSprite) {
      imageMode(CENTER);
      if (movingLeft) {
        push();
        translate(this.x, this.y + yOffset);
        scale(-1, 1);
        image(entry.img, 0, 0, entry.w, entry.h);
        pop();
      } else {
        image(entry.img, this.x, this.y + yOffset, entry.w, entry.h);
      }
    } else {
      noStroke();
      let bodyColor = this._bodyColor();
      fill(bodyColor.r, bodyColor.g, bodyColor.b);
      ellipse(this.x, this.y + yOffset, this.bodySize, this.bodySize);
    }

    let halfH = useSprite ? entry.h / 2 : this.bodySize / 2;
    let barW = useSprite ? Math.max(entry.w, 30) : this.bodySize + 10;
    let barH = 5;
    let barX = this.x - barW / 2;
    let barY = this.y - halfH - 8 - (yOffset > 0 ? yOffset : 0);
    let ratio = this.hp / this.maxHp;

    noStroke();
    fill(50, 50, 50, 180);
    rect(barX, barY, barW, barH, 2);
    if (ratio > 0.6) fill(50, 210, 50);
    else if (ratio > 0.3) fill(240, 200, 0);
    else fill(230, 50, 50);
    rect(barX, barY, barW * ratio, barH, 2);

    this.drawAbilityIcon(barX, barY);

    pop();
  }

  drawAbilityIcon(barX, barY) {
    let iconX = this.x + 35;
    let iconY = this.y - 45;
    textSize(12);
    textAlign(CENTER, CENTER);
    if (this.ability === 'charge') {
      if (this.isCharging) {
        fill(255, 50, 50);
        text('!', iconX, iconY);
      } else if (!this.hasCharged && this.hp / this.maxHp <= 0.5) {
        fill(255, 150, 50);
        text('!', iconX, iconY);
      }
    } else if (this.ability === 'dodge') {
      fill(100, 200, 255);
      text('~', iconX, iconY);
    } else if (this.ability === 'leap' && this.leapTimer / this.leapCooldown > 0.8) {
      fill(255, 200, 50);
      text('^', iconX, iconY);
    }
  }

  _bodyColor() {
    switch (this.type) {
      case 'fast': return { r: 255, g: 140, b: 0 };
      case 'tank': return { r: 80, g: 80, b: 180 };
      case 'boss': return { r: 140, g: 0, b: 200 };
      case 'knight': return { r: 150, g: 100, b: 50 };
      case 'archer': return { r: 50, g: 150, b: 50 };
      case 'giant': return { r: 100, g: 50, b: 150 };
      case 'goblinBomber': return { r: 180, g: 80, b: 40 };
      case 'divingLizard': return { r: 60, g: 140, b: 120 };
      case 'treantMage': return { r: 80, g: 140, b: 60 };
      case 'gentlemanBug': return { r: 120, g: 80, b: 100 };
      default: return { r: 210, g: 50, b: 50 };
    }
  }
}
