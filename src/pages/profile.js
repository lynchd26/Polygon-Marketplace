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

// export default function createReview(){
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({rating: '', details: ''})
    const router = useRouter()

    // async function onChange(e) {
    //   const file = e.target.files[0]
    //   try {
    //     const added = await client.add(file)
    //     const url = `https:ipfs.infura.io/ipfs/${added.path}`
    //     setFileUrl(url)
    //   } catch (e) {
    //     console.log(e)
    //   }
    // }

    async function onChange(e) {    // onChange is invoked by an event 'e'
      const file = e.target.files[0]
      try {
          const added = await client.add(file)
          const url = `https:ipfs.infura.io/ipfs/${added.path}`
          setFileUrl(url)
      } catch (e) {
          console.log(e)
      }
    }

    async function createMarketReview(e) {
      const { rating, details } = formInput
      if (!rating || !details || !fileUrl) return
      const data = JSON.stringify({
        rating, details, image: fileUrl
      }) 

      try {
        const added = await client.add(data)
        const url = `https:ipfs.infura.io/ipfs/${added.path}` // ipfs path which contains all the data
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
      let listingPrice = await contract.getListingPrice()
      listingPrice = listingPrice.toString()
      
      transaction = await contract.createMarketItem(
        itemaddress, tokenId, price, { value: listingPrice }
      )
      await transaction.wait()
      router.push('/profile')
    }


    // if (loadingState == 'loaded' && items.length <= 0) return (
    //   <h1 className="px-20 py-10 text-3xl">You do not have any listings</h1>
    // )
  
    return (
      <div className="">
        <div className="p-4">
          <p className="mt-4 text-3xl text-bold text-violet-500">My Purchases</p>
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
                    <div>
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
                      <input
                        type="file"
                        name="Item"
                        className="mt-2 rounded-2xl p-4"
                        onChange={onChange}
                      />
                      {
                          fileUrl && (
                              <img className="mx-auto rounded-2xl mt-4" width="128" src={fileUrl} />
                          )
                      }
                      <button
                          className="font-bold mt-4 bg-indigo-200 text-blue-500 rounded-xl hover:rounded-2xl duration-500 p-4 shadow-xl hover:bg-indigo-100"
                          onClick={ createMarketReview }
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
        </div>
      </div>
    )
  }