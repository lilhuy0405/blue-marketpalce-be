import {Column, Entity, ManyToOne, PrimaryColumn} from "typeorm";
import {User} from "./User";

@Entity()
export default class NFT {

  @PrimaryColumn()
  tokenId: number

  @Column()
  tokenURI: string

  @ManyToOne(() => User, user => user.NFTs)
  owner: User

}

