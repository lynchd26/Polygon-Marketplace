import { ethers } from "ethers"
import { useEffect, useState } from "react"
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from "next/router"
import Swal from 'sweetalert2'


import {
  itemaddress, itemmarketaddress
} from '../config'

import Item from '../artifacts/contracts/Item.sol/Item.json'
import Market from '../artifacts/contracts/PolygonMarketplace.sol/PolygonMarketplace.json'


export default function Home() {
  const [items, setItems] = useState([])
  const [_filter, setFilter] = useState()
  const [filteredItems, setFilteredItems] = useState([])

  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    loadItems()
  }, [])


  async function loadItems(__filter='') {
    const provider = new ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(itemaddress, Item.abi, provider)
    const marketContract = new ethers.Contract(itemmarketaddress, Market.abi, provider)
    const data = await marketContract.fetchMarketItems()

    setFilter(__filter)
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

  

    const saleItems = items.filter(i => !i.review)
    setItems(saleItems)

    // if (_filter == 'All') {
    //   setFilteredItems(saleItems)
    // } else {
      const filteredItems = saleItems.filter(i => i.category == __filter)
      setFilteredItems(filteredItems)
    //}

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

  async function sellerAdd(address) {
    navigator.clipboard.writeText(address)
    
    Swal.fire({
      title: 'Copied Seller Address to Clipboard!',
      text: 'Go to blockscan and paste the address to contact seller.\nOr paste this address in the reviews to see the sellers reviews.',
      footer: '<a href="https://chat.blockscan.com" target="_blank">Go to Blockscan...</a>'
    })
  }


  if (loadingState == 'loaded' && items.length <= 0) return (
    <div className="w-screen">
      <div className="w-[88%]">
        <title>Polygon Marketplace</title>
        <h1 className="text-center px-20 py-10 text-3xl">There are currently no items listed on the markteplace. Check back later!</h1>
      </div>
    </div>
  )

  if (loadingState == 'loaded' && filteredItems.length <= 0) return (
    <div className="w-screen">
      <div className="w-[88%]">      
        <title>Polygon Marketplace</title>
        <select
            className="mt-6 rounded-xl py-6 px-16 bg-violet-300 text-white text-xl font-bold"
            onChange={(e) => {
                loadItems(e.target.value);
              }}
        >
          <option value="Select Category.."selected>Select Category..</option>
          <option value="Cars">Cars</option>
          <option value="Clothing & Sneakers">Clothes</option>
          <option value="Electronics">Electronics</option>
          <option value="Sports & Leisure">Sports</option>
          <option value="Home & DIY">Home</option>
          <option value="Music & Education">Music</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="w-[88%]">      
        <h1 className="text-center text-violet-400 px-20 py-10 text-3xl">There are currently no items listed in this category. Check back later!</h1>
      </div>
      </div>
  )

  return (
    <div className='w-screen'>
        <title>Polygon Marketplace</title>
        {/* <div className="flex-center">
        <p className="ml-6 mt-4 text-3xl text-bold text-violet-500">All</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            items.map((item, i) => (
              <div key={i} className="mx-6 bg-white text-center border border-violet shadow shadow-violet-400 rounded-2xl overflow-hidden">
                <img src={item.image} className="m-2"/>
                <div className="p-2">
                  <button 
                    onClick={() =>  sellerAdd(item.seller)}
                  >
                    Copy Seller address
                  </button>
                  <p className="my-2 text-2xl text-violet-400 font-semibold">{item.category}</p>
                  <p className="my-2 text-2xl text-violet-400 font-semibold">{item.name}</p>
                  <p className="my-2 text-2xl text-violet-400 font-semibold">{item.desc}</p>
                </div>
                <div className="mx-3 mb-3 text-center shadow rounded-2xl p-4 bg-violet-300">
                  <p className="text-2xl mb-4 font-bold text-white">{item.price} MATIC</p>
                  <button className="w-2/3 bg-violet-400 font-bold py-2 px-12 rounded-2xl text-white hover:rounded-3xl hover:shadow transition-all duration-1000" onClick={() => buyItem(item)}>Buy</button>
                </div> 
              </div>
            ))
          }
        </div> */}
        <div className="w-[88%]">
        <select
            className="mt-6 mx-6 rounded-xl py-6 px-16 bg-violet-300 text-white text-xl font-bold"
            onChange={(e) => {
                loadItems(e.target.value);
              }}
        >
          <option value="Select Category.."selected>Select Category..</option>
          <option value="Cars">Cars</option>
          <option value="Clothing & Sneakers">Clothes</option>
          <option value="Electronics">Electronics</option>
          <option value="Sports & Leisure">Sports</option>
          <option value="Home & DIY">Home</option>
          <option value="Music & Education">Music</option>
          <option value="Other">Other</option>
        </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            filteredItems.map((item, i) => (
              <div key={i} className="mx-6 bg-white text-center border border-violet shadow shadow-violet-400 rounded-2xl overflow-hidden">
                <img src={item.image} className="m-2 object-contain h-48 w-96"/>
                <div className="p-4">
                  <button 
                    className="p-2 text-violet-400 text-xl font-semibold rounded-xl "
                    onClick={() =>  sellerAdd(item.seller)}
                  >
                    Copy Seller address
                  </button>
                  {/* <p className="my-2 text-2xl text-violet-400 font-semibold">{item.category}</p> */}
                  <p className="my-2 text-2xl text-violet-400 font-semibold">{item.name}</p>
                  <p className="my-2 text-2xl text-violet-400 font-semibold">{item.desc}</p>
                </div>
                <div className="mx-3 mb-3 text-center shadow rounded-2xl p-4 bg-violet-300">
                  <p className="text-2xl mb-4 font-bold text-white">{item.price} MATIC</p>
                  <button className="w-2/3 bg-violet-400 font-bold py-2 px-12 rounded-2xl text-white hover:rounded-3xl hover:shadow transition-all duration-1000" onClick={() => buyItem(item)}>Buy</button>
                </div> 
              </div>
            ))
          }
        </div>
        </div>
  )
}



