import {AppDataSource} from "./data-source";
import {ethers} from "ethers";
import BlueNftContract from "./contractPort/BlueNftContract";
import MarketService from "./service/MarketService";
import NFT from "./entity/NFT";
import {User} from "./entity/User";


const main = async () => {
  const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
  const blueNftContract = new BlueNftContract(provider);
  const marketService = new MarketService(provider);

  const handleNFTTransfer = async (from: string, to: string, tokenId: ethers.BigNumber) => {
    console.log('handleNFTTransfer: ', from, to, tokenId);
    const tokenIdNumber = tokenId.toNumber();
    let nft = await marketService.findNFTById(tokenIdNumber);
    if (!nft) {
      //get nft url
      const nftUrl = await blueNftContract.getURI(tokenIdNumber);
      //save nft
      const newNft = new NFT();
      newNft.tokenId = tokenIdNumber;
      newNft.tokenURI = nftUrl;
      nft = await marketService.saveNFT(newNft);
    }
    //get user
    let user = await marketService.getUserByAddress(to);
    if (!user) {
      user = new User();
      user.address = to;
      user = await marketService.saveUser(user);
    }
    //change owner
    nft.owner = user;
    const savedNFT = await marketService.saveNFT(nft);
    console.log('savedNFT: ', savedNFT);
  }

  blueNftContract.subscribeEvent('Transfer', handleNFTTransfer);

  console.log()
}


AppDataSource
  .initialize()
  .then(main)
  .catch((err) => {
    console.error("Error during Data Source initialization:", err)
  })
