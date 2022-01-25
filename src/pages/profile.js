import { ethers } from "ethers"
import { useEffect, useState } from "react"
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  itemaddress, itemmarketaddress
} from '../config'

import Item from '../artifacts/contracts/Item.sol/Item.json'
import Market from '../artifacts/contracts/PolygonMarketplace.sol/PolygonMarketplace.json'

export default function myItems() {
    const [items, setItems] = useState([])
    const [sold, setSold] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
  
    useEffect(() => {
      loadItems()
    }, [])
  
    async function loadItems() {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()

      const tokenContract = new ethers.Contract(itemaddress, Item.abi, provider)
      const marketContract = new ethers.Contract(itemmarketaddress, Market.abi, signer)
      const data = await marketContract.fetchMyItems()
  
      const myitems = await Promise.all(data.map(async i => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          image: meta.data.image,
          name: meta.data.name,
          descrption: meta.data.descrption,
        }
        return item 
      }))
      setItems(myitems)

      const _data = await marketContract.fetchItemsCreated()

      const solditems = await Promise.all(_data.map(async i => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          image: meta.data.image,
        }
        return item
      }))

      const soldItems = solditems.filter(i => i.sold)
      setSold(soldItems)
      setLoadingState('loaded')
    }

    // if (loadingState == 'loaded' && items.length <= 0) return (
    //   <h1 className="px-20 py-10 text-3xl">You do not have any listings</h1>
    // )
  
    return (
      <div className="flex justify-center">
        <div className="p-4">
          <p className="mt-4 text-3xl text-bold text-blue-500">My Purchases</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              items.map((item, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden">
                  <img src={item.image} className="rounded" />
                  <div className="mx-3 mb-3 text-center shadow rounded-2xl p-4 bg-indigo-300">
                    <p className="text-xl my-auto font-bold text-blue-500">Purchase price:<br></br>{item.price} MATIC</p>
                  </div>
                  <div className="mx-3 mb-3 text-center shadow rounded-2xl p-4 bg-indigo-300">
                    <p className="text-xl my-auto font-bold text-blue-500">Leave Review</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        <div className="p-4">
          <p className="mt-4 text-3xl text-bold text-blue-500">My Sales</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              sold.map((item, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden">
                  <img src={item.image} className="rounded" />
                  <div className="mx-3 mb-3 text-center shadow rounded-2xl p-4 bg-indigo-300">
                    <p className="text-xl my-auto font-bold text-blue-500">Sale price:<br></br>{item.price} MATIC</p>
                  </div>
                  <div className="mx-3 mb-3 text-center shadow rounded-2xl p-4 bg-indigo-300">
                    <p className="text-xl my-auto font-bold text-blue-500">Leave Review</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    )
  }