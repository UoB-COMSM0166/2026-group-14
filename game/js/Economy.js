// Economy - Gold economy system

class Economy {
    // initialGold: initial gold amount
    constructor(initialGold) {
      this.gold = initialGold;
    }
  
    // Get current gold amount.
    getGold() {
      return this.gold;
    }
  
    // Return true if current gold covers cost.
    canAfford(cost) {
      return this.gold >= cost;
    }
  
    // Spend gold for purchase/upgrade if affordable.
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
  
    // Add reward gold.
    addGold(amount) {
      this.gold += amount;
      console.log(`[Game] Gained ${amount} gold, total: ${this.gold}`);
    }
  
    // Reset gold when restarting level.
    reset(initialGold) {
      this.gold = initialGold;
    }
  }
  