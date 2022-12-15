import {ethers} from "ethers";
import {BLUE_NFT_ADDRESS} from "./constants";
// @ts-ignore
import * as BLUE_NFT_ABI from "./abis/BLUE_NFT_ABI.json";

class BlueNftContract {
  _contract: ethers.Contract;

  constructor(provider: ethers.providers.JsonRpcProvider) {

    this._contract = new ethers.Contract(BLUE_NFT_ADDRESS, BLUE_NFT_ABI, provider);
  }
  async getURI(tokenId: number) {
    return await this._contract.tokenURI(tokenId)
  }
  subscribeEvent(eventName, callback) {
    this._contract.on(eventName, callback)
  }

  unSubscribeAllEvents() {
    this._contract.removeAllListeners()
  }
}

export default BlueNftContract;
