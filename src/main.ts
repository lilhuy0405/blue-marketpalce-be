import "reflect-metadata"
import {AppDataSource} from "./data-source";
import {Express} from "express";
import * as cors from 'cors';
import {ethers} from "ethers";
import BlueNftContract from "./contractPort/BlueNftContract";
import MarketService from "./service/MarketService";
import {User} from "./entity/User";

const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
const blueNftContract = new BlueNftContract(provider);
const marketService = new MarketService(provider);

AppDataSource
  .initialize()
  .then(() => {
    console.log("Data Source has been initialized!")
    console.log("Subscribing to Transfer event...")
    marketService.subscribeNFTTransfer();
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err)
  })


const express = require('express')
const app: Express = express()
//enable cors
app.use(cors());
const port = 3002

app.get('/api/nfts/:address', async (req, res) => {
  try {
    const address = req.params.address;
    if (!address) {
      return res.status(400).send({
        message: 'Address is required'
      })
    }
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).send({
        message: 'Invalid address'
      })
    }
    const user = await marketService.getUserByAddress(address.toLowerCase());
    if (!user) {
      const newUser = new User();
      newUser.address = address;
      await marketService.saveUser(newUser);
      return res.json({
        data: []
      });
    }
    const nft = user.NFTs;
    const dto = nft.map(n => {
      return {
        tokenId: n.tokenId,
        tokenURI: n.tokenURI
      }
    })
    return res.json({
      data: dto
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: 'Internal server error'
    });
  }
})

app.listen(port, () => {
  console.log(`App listening on: http://localhost:${port}`);
})
