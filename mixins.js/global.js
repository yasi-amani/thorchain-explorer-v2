import { assetFromString } from '@xchainjs/xchain-util';
import { AssetImage } from '~/classes/assetImage';

export default {
  methods: {
    assetImage(assetStr) {
      try {
        return AssetImage(assetStr) ?? require('~/assets/images/unknown.png');
      } catch (error) {
        return require('~/assets/images/unknown.png');
      }
    },
    gotoAddr(address) {
      this.$router.push({ path: `/address/${address}` })
    },
    gotoNode(signer) {
      this.$router.push({path: `/node/${signer}`});
    },
    gotoPool(pool) {
      this.$router.push({ path: `/pool/${pool}`});
    },
    copy(address) {
      navigator.clipboard.writeText(address).then(() => {
        this.copyText = 'Copied';
        setTimeout(() => {
          this.copyText = 'Copy'
        }, 2000);
      }, (err) => {
        console.error('Could not copy text: ', err);
      });
    },
    numberFormat(number) {
      return number? this.$options.filters.number(number, '0,0.0000'):'-'
    },
    showAsset(assetStr) {
      const asset = assetFromString(assetStr);
      return asset.chain + '.' + asset.ticker;
    }
  }
}