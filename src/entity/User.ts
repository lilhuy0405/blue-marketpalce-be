import {Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, OneToMany} from "typeorm"
import NFT from "./NFT";

@Entity()
export class User {

    @PrimaryColumn()
    address: string

    @OneToMany(() => NFT, nft => nft.owner)
    NFTs: NFT[]


}
