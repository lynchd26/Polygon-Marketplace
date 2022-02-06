import { ethers } from "ethers"
import { useEffect, useState } from "react"
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  itemaddress, itemmarketaddress
} from '../config'

import Item from '../artifacts/contracts/Item.sol/Item.json'
import Market from '../artifacts/contracts/PolygonMarketplace.sol/PolygonMarketplace.json'

export default function Home() {
  const [items, setItems] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    loadItems()   // invokes the loadItems function when the page loads
  }, [])

  async function loadItems() {
    const provider = new ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(itemaddress, Item.abi, provider)
    const marketContract = new ethers.Contract(itemmarketaddress, Market.abi, provider)
    const data = await marketContract.fetchMarketItems()

    const items = await Promise.all(data.map(async i => {   // map over all unsold items pulled by fetchMarketItems
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)                // metadata pulled from tokenUri 
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        review: i.review,
        image: meta.data.image,
        name: meta.data.name,
        category: meta.data.category,
        desc: meta.data.desc,
      }
      return item 
    }))
    //setItems(items)
    //setLoadingState('loaded')

    const saleItems = items.filter(i => !i.review)
    setItems(saleItems)
    setLoadingState('loaded')
  }

  async function buyItem(item) {
    const web3modal = new Web3Modal()                               // checks for wallet
    const connection = await web3modal.connect()                    // connect to wallet
    const provider = new ethers.providers.Web3Provider(connection)  // that wallet address becomes the provider

    const signer = provider.getSigner()                             // need contract so sign/approve transaction
    const contract = new ethers.Contract(itemmarketaddress, Market.abi, signer)

    const price = ethers.utils.parseUnits(item.price.toString(), 'ether')

    const transaction = await contract.createMarketSale(itemaddress, item.tokenId, {
      value: price
    })
    await transaction.wait()
    loadItems()
  }

  // async function buyItem(item) {
  //   const web3modal = new Web3Modal()                               // checks for wallet
  //   const connection = await web3modal.connect()                    // connect to wallet
  //   const provider = new ethers.providers.Web3Provider(connection)  // that wallet address becomes the provider

  //   const signer = provider.getSigner()                             // need contract so sign/approve transaction
  //   const contract = new ethers.Contract(itemmarketaddress, Market.abi, signer)

  //   const price = ethers.utils.parseUnits('0', 'ether')

  //   const transaction = await contract.transactMarketReview(itemaddress, item.tokenId, {
  //     value: price
  //   })
  //   await transaction.wait()
  // }

  if (loadingState == 'loaded' && items.length <= 0) return (
    <h1 className="px-20 py-10 text-3xl">There are currently no items listed on the markteplace</h1>
  )

  return (
    <div className='flex justify-centre'>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            items.map((item, i) => (
              <div key={i} className="mx-6 bg-white text-center border border-violet shadow shadow-violet-400 rounded-2xl overflow-hidden">
                <img src={item.image} className="m-2"/>
                <div className="p-4">
                  <p className="my-2 text-2xl text-violet-400 font-semibold">{item.category}</p>
                  <p className="my-2 text-2xl text-violet-400 font-semibold">{item.name}</p>
                  <p className="my-2 text-2xl text-violet-400 font-semibold">{item.desc}</p>
                </div>
                <div className="mx-3 mb-3 text-center shadow rounded-2xl p-4 bg-violet-300">
                  <p className="text-2xl mb-4 font-bold text-slate-100">{item.price} MATIC</p>
                  <button className="w-2/3 bg-slate-400 font-bold py-2 px-12 rounded-2xl text-white hover:rounded-3xl hover:shadow transition-all duration-600" onClick={() => buyItem(item)}>Buy</button>
                </div> 
              </div>
            ))
          }
        </div>
    </div>
  )
}
