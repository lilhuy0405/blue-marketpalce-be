import {Repository} from "typeorm";
import {User} from "../entity/User";
import NFT from "../entity/NFT";
import {AppDataSource} from "../data-source";
import {ethers} from "ethers";
import BlueNftContract from "../contractPort/BlueNftContract";

export default class MarketService {
  private readonly userRepository: Repository<User>;
  private readonly nftRepository: Repository<NFT>;
  private readonly blueNftContract: BlueNftContract;

  constructor(provider: ethers.providers.JsonRpcProvider) {
    this.userRepository = AppDataSource.getRepository(User);
    this.nftRepository = AppDataSource.getRepository(NFT);
    this.blueNftContract = new BlueNftContract(provider);

  }

  public async getUserByAddress(address: string): Promise<User> {
    return this.userRepository.findOne({
      relations: {
        NFTs: true
      },
      where: {
        address
      }
    });
  }

  saveNFT(nft: NFT): Promise<NFT> {
    return this.nftRepository.save(nft);
  }

  findNFTById(id: number): Promise<NFT> {
    return this.nftRepository.findOne({
      where: {
        tokenId: id
      }
    });
  }

  saveUser(user: User): Promise<User> {
    user.address = user.address.toLowerCase();
    return this.userRepository.save(user);
  }


  private async handleNFTTransfer(from: string, to: string, tokenId: ethers.BigNumber) {
    try {
      console.log('handleNFTTransfer: ', from, to, tokenId);
      const tokenIdNumber = tokenId.toNumber();
      let nft = await this.findNFTById(tokenIdNumber);
      if (!nft) {
        //get nft url
        const nftUrl = await this.blueNftContract.getURI(tokenIdNumber);
        //save nft
        const newNft = new NFT();
        newNft.tokenId = tokenIdNumber;
        newNft.tokenURI = nftUrl;
        nft = await this.saveNFT(newNft);
      }

      //get user
      let user = await this.getUserByAddress(to);

      if (!user) {
        user = new User();
        user.address = to;
        user = await this.saveUser(user);
      }
      nft.owner = user;
      const savedNFT = await this.saveNFT(nft);
      console.log('savedNFT: ', savedNFT);
    } catch (err) {
      console.log('Handle transfer err: ', err);
    }
  }

  subscribeNFTTransfer() {
    this.blueNftContract.subscribeEvent('Transfer', this.handleNFTTransfer.bind(this));
  }
}
