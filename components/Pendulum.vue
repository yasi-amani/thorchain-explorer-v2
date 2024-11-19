<template>
    <card>
    <div class="balance-container">
      <div class="scale">
        <div class="arm"></div>
        <div class="pivot"></div>
        <div class="side security">
          <div class="label">Active Nodes</div>
          <div class="value">{{
            activeNodes 
          }}</div>
        </div>
        <div class="side liquidity">
          <div class="label">Liquidity</div>
          <div class="value">{{standbyNodeCount}}</div>
        </div>
      </div>
      <div class="status">Overbonded</div>
      <div class="info">Liquidity earning 71.96% of rewards</div>
    </div>
</card>
  </template>
  
  <script>
  export default {
    name: "BalanceScale",
    data(){
        return{
        activeNodes:undefined,
        network: [],

        }
    },
  
  mounted(){
    this.$api.getNodes().then(({ data }) => {
      this.nodes = data
      this.activeNodes = this.nodes?.filter((n) => n.status === 'Active').length;
      this.uptodateNodes = this.activeNodes.filter(
        (n) => n.version === this.uptodateNodeVersion(this.activeNodes)
      )
    })
    this.$api.getNetwork().then(({ data }) => {
      this.network = data
      this.standbyNodeCount=this.network?.totalPooledRune 
    })
  }
};
  </script>
  
  <style scoped>
  .balance-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #fff;
    padding: 20px;
    border-radius: 8px;
  }
  
  .scale {
    width: 100%;
    max-width: 300px;
    height: 200px;
    position: relative;
    margin-bottom: 20px;
  }
  
  .arm {
    transform: translateX(-50%) rotate(-13.1334deg);
    width: calc(100% - 20px);
    max-width: 280px;
    height: 8px;
    background-color: var(--primary-color);
    position: absolute;
    top: 50px;
    left: 50%;
    transform-origin: center;
    transition: transform 0.3s ease;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .pivot {
    width: 8px;
    height: 140px;
    background-color: var(--primary-color);
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .side {
    position: absolute;
    width: 100px;
    height: 40px;
    background-color: #4a4a4a;
    border-radius: 0 0 40px 40px;
    position: absolute;
    top: 58px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    border: 1px solid #5a5a5a;
    color: white;
    transform: rotate(-13.1334deg);
  }
  
  .security {
    left: -50px;
    top: 7rem;
    display: flex;
    flex-direction: column;
  }    
  
  .liquidity {
    right: -50px;
    top: 3rem;
    display: flex;
    flex-direction: column;
  }
  
  .label {
    font-size: 10px;
    margin-bottom: 5px;
  }
  
  .value {
    font-size: 10px;
    font-weight: bold;
  }
  
  .status {
    font-size: 18px;
    font-weight: bold;
    color: var(--primary-color);
  }
  
  .info {
    font-size: 14px;
    color: #bbb;
  }
  </style>
  