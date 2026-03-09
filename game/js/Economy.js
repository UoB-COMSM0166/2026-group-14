// Economy - Gold economy system

class Economy {
    /**
     * @param {number} initialGold - Initial gold amount
     */
    constructor(initialGold) {
      this.gold = initialGold;
    }
  
    /**
     * Get current gold amount
     */
    getGold() {
      return this.gold;
    }
  
    /**
     * Check if can afford cost
     * @param {number} cost - Gold required
     * @returns {boolean}
     */
    canAfford(cost) {
      return this.gold >= cost;
    }
  
    /**
     * Spend gold (tower purchase, upgrade)
     * @param {number} cost - Amount to spend
     * @returns {boolean}
     */
    spendGold(cost) {
      if (this.canAfford(cost)) {
        this.gold -= cost;
        console.log(`[Game] Spent ${cost} gold, remaining: ${this.gold}`);
        return true;
      } else {
        console.log(`[Game] Not enough gold: need ${cost}, have ${this.gold}`);
        return false;
      }
    }
  
    /**
     * Add gold (enemy kill reward)
     * @param {number} amount - Amount to add
     */
    addGold(amount) {
      this.gold += amount;
      console.log(`[Game] Gained ${amount} gold, total: ${this.gold}`);
    }
  
    /**
     * Reset gold (when restarting level)
     */
    reset(initialGold) {
      this.gold = initialGold;
    }
  }
  