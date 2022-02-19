import { ethers } from "ethers"
import { useEffect, useState } from "react"
import axios from 'axios'
import Web3Modal from 'web3modal'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from "next/router"

import {
  itemaddress, itemmarketaddress
} from '../config'

import Item from '../artifacts/contracts/Item.sol/Item.json'
import Market from '../artifacts/contracts/PolygonMarketplace.sol/PolygonMarketplace.json'
import { formatUnits } from "ethers/lib/utils"

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')


export default function myItems() {
    const [items, setItems] = useState([])
    const [sold, setSold] = useState([])
    const [review, setReview] = useState([])

    const [_filter, setFilter] = useState('all')
    const [filteredItems, setFilteredItems] = useState([])
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
          review: i.review,
          addr: meta.data.addr,
          reviewName: meta.data.reviewName,
          rating: meta.data.rating,
          details: meta.data.details,
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
          review: i.review,
          addr: meta.data.addr,
          reviewName: meta.data.reviewName,
          rating: meta.data.rating,
          details: meta.data.details,
          image: meta.data.image,
          name: meta.data.name,
          descrption: meta.data.descrption,
        }
        return item
      }))
      const soldItems = solditems.filter(i => i.sold && !i.review)
      setSold(soldItems)


      const __data = await marketContract.fetchMarketItems()

      const reviewItems = await Promise.all(__data.map(async i => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          review: i.review,
          addr: meta.data.addr,
          reviewName: meta.data.reviewName,
          rating: meta.data.rating,
          details: meta.data.details,
          image: meta.data.image,
          name: meta.data.name,
          descrption: meta.data.descrption,
        }
        return item
      }))
      const isReview = reviewItems.filter(i => i.review)


      async function searchReviews(query) {
        setReviewFilter(query)
        loadItems()
      }

      if (reviewFilter == '') {
        setReview(isReview)
      } else {
        const filteredReview = solditems.filter(i => i.review && i.addr == reviewFilter)
        setReview(filteredReview)
      }


      setLoadingState('loaded')
    }

    const [formInput, updateFormInput] = useState({rating: '', details: ''})
    const [reviewFilter, setReviewFilter] = useState('')
    const router = useRouter()

    async function createMarketReview(addr, reviewName, fileUrl) {
      const { rating, details } = formInput
      if (!rating || !details || !addr || !reviewName || !fileUrl) return
      const data = JSON.stringify({
        rating, details, addr, reviewName, image: fileUrl
      }) 

      try {
        const added = await client.add(data)
        const url = `https:ipfs.infura.io/ipfs/${added.path}`
        submitReview(url)
      } catch (error) {
        console.log('Error uploading file: ', error)
      }
    }

    async function submitReview(url) {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()

      let contract = new ethers.Contract(itemaddress, Item.abi, signer)
      let transaction = await contract.createToken(url)                  
      let tx = await transaction.wait()                                   

      let event = tx.events[0]
      let value = event.args[2]
      let tokenId = value.toNumber()

      const price = ethers.utils.parseUnits('0', 'ether')

      contract = new ethers.Contract(itemmarketaddress, Market.abi, signer)
      let listingPrice = await contract.getReviewListingPrice()
      listingPrice = listingPrice.toString()
      
      transaction = await contract.createReview(
        itemaddress, tokenId, price, { value: listingPrice }
      )
      await transaction.wait()
      loadItems()
    }
  
  
    return (
      <div className="">
        <div className="p-4">
          <p className="mt-4 text-3xl text-bold text-violet-500">My Purchases</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              items.map((item, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden">
                  <img src={item.image} className="rounded" />
                  <p className="text-xl my-2 text-center font-bold text-violet-300">Purchase price:<br></br>{item.price} MATIC</p>
                  <div className="mx-3 mb-3 text-center shadow rounded-2xl p-4 bg-violet-400">
                    <p className="text-xl my-auto font-bold text-white">Leave Review</p>
                    <div className="content-center">
                      <input
                        placeholder="Rating"
                        className="mt-2 shadow-inner border rounded-2xl p-4"
                        onChange={e => updateFormInput({ ...formInput, rating: e.target.value })}
                      />
                      <input
                        placeholder="Additional Details"
                        className="mt-2 shadow-inner border rounded-2xl p-4"
                        onChange={e => updateFormInput({ ...formInput, details: e.target.value })}
                      />
                      <button
                          className="font-bold mt-4 bg-violet-200 text-violet-400 rounded-xl hover:rounded-2xl duration-500 p-4 shadow-xl hover:bg-white"
                          onClick={() => createMarketReview(item.seller, item.name, item.image)}
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        <div className="p-4">
          <p className="mt-4 text-3xl text-bold text-violet-500">My Sales</p>
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
                    <div>
                      <input
                        placeholder="Rating"
                        className="mt-2 shadow-inner border rounded-2xl p-4"
                      />
                      <input
                        placeholder="Additional Details"
                        className="mt-2 shadow-inner border rounded-2xl p-4"
                      />
                      <button
                          className="font-bold mt-4 bg-indigo-200 text-blue-500 rounded-xl hover:rounded-2xl duration-500 p-4 shadow-xl hover:bg-indigo-100"
                      >
                        Post Review
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        <div className="p-4">
          <p className="mt-4 text-3xl text-bold text-violet-500">My Reviews</p>
            <input
              placeholder="Search an address.."
              className="mt-2 shadow-inner border rounded-2xl p-4"
              onChange={e => setReviewFilter(e.target.value)}
            />
            <button
              onClick={() => loadItems()}
            >
              Search
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {
                review.map((item, i) => (
                  <div key={i} className="mx-6 bg-white text-center border border-violet shadow shadow-violet-400 rounded-2xl overflow-hidden">
                    <div className="mb-3 text-center shadow rounded-xl py-4 bg-violet-400">
                      <p className="my-2 text-white">Seller: {item.addr}</p>
                    </div>
                    <img src={item.image} className="rounded" />
                    <div className="mx-3 mb-3 text-center shadow rounded-2xl p-4 bg-violet-400">
                      <p className="my-2 text-xl text-white font-semibold">Name: {item.reviewName}</p>
                      <p className="my-2 text-xl text-white font-semibold">Rating: {item.rating}</p>
                      <p className="my-2 text-xl text-white font-semibold">Additional Details: {item.details}</p>
                    </div>
                  </div>
              ))
            }
            </div>
        </div>
      </div>
    )
  }