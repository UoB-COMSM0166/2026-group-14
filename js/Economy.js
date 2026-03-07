// ========================================
// 💰 Economy — 金币经济系统
// ========================================

class Economy {
    /**
     * 创建一个新的经济系统
     * @param {number} initialGold - 初始金币数量
     */
    constructor(initialGold) {
      this.gold = initialGold;
    }
  
    /**
     * 获取当前金币数量
     * 就像看一眼钱包里有多少钱
     */
    getGold() {
      return this.gold;
    }
  
    /**
     * 检查是否买得起某样东西
     * @param {number} cost - 需要花费的金币
     * @returns {boolean} true = 买得起，false = 买不起
     * 
     * 就像去超市，先看看钱包里的钱够不够
     */
    canAfford(cost) {
      return this.gold >= cost;
    }
  
    /**
     * 花费金币（买塔、升级）
     * @param {number} cost - 花费数量
     * @returns {boolean} 是否花费成功
     * 
     * 就像付款：钱够就扣掉，钱不够就告诉你"余额不足"
     */
    spendGold(cost) {
      if (this.canAfford(cost)) {
        this.gold -= cost;
        console.log(`💰 花费 ${cost} 金币，剩余 ${this.gold}`);
        return true;   // 花费成功
      } else {
        console.log(`❌ 金币不足！需要 ${cost}，只有 ${this.gold}`);
        return false;  // 花费失败
      }
    }
  
    /**
     * 获得金币（击杀怪物的奖励）
     * @param {number} amount - 获得数量
     * 
     * 就像捡到钱，放进钱包
     */
    addGold(amount) {
      this.gold += amount;
      console.log(`💰 获得 ${amount} 金币，当前 ${this.gold}`);
    }
  
    /**
     * 重置金币（重新开始关卡时用）
     */
    reset(initialGold) {
      this.gold = initialGold;
    }
  }
  