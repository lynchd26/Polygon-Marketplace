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
    loadItems()
  }, [])

  async function loadItems() {
    const provider = new ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(itemaddress, Item.abi, provider)
    const marketContract = new ethers.Contract(itemmarketaddress, Market.abi, provider)
    const data = await marketContract.fetchMarketItems()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        category: meta.data.category,
        desc: meta.data.desc,
      }
      return item 
    }))
    setItems(items)
    setLoadingState('loaded')
  }

  async function buyItem(item) {
    const web3modal = new Web3Modal()
    const connection = await web3modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()
    const contract = new ethers.Contract(itemmarketaddress, Market.abi, signer)

    const price = ethers.utils.parseUnits(item.price.toString(), 'ether')

    const transaction = await contract.createMarketSale(itemaddress, item.tokenId, {
      value: price
    })
    await transaction.wait()
    loadItems()
  }

  if (loadingState == 'loaded' && items.length <= 0) return (
    <h1 className="px-20 py-10 text-3xl">There are currently no items listed on the markteplace</h1>
  )

  return (
    <div className='flex justify-centre'>
      <div className="px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            items.map((item, i) => (
              <div key={i} className="bg-indigo-200 text-center border shadow rounded-2xl overflow-hidden">
                <img src={item.image} class="contain" style={{height: '350px'}} />
                <div className="p-4">
                  <p style={{height: '64px'}} className="text-2xl text-blue-500 font-semibold">{item.category}</p>
                  <p style={{height: '64px'}} className="text-2xl text-blue-500 font-semibold">{item.name}</p>
                  <p style={{height: '64px'}} className="text-2xl text-blue-500 font-semibold">{item.desc}</p>
                </div>
                <div className="mx-3 mb-3 text-center shadow rounded-2xl p-4 bg-indigo-300">
                  <p className="text-2xl mb-4 font-bold text-blue-500">{item.price} MATIC</p>
                  <button className="w-2/3 bg-indigo-200 font-bold py-2 px-12 rounded-2xl text-blue-500 hover:rounded-3xl hover:shadow transition-all duration-600" onClick={() => buyItem(item)}>Buy</button>
                </div> 
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
