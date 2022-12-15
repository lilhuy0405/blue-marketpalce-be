import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import NFT from "./entity/NFT";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: false,
    entities: [User, NFT],
    migrations: [],
    subscribers: [],
})
