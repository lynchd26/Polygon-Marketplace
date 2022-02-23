import { ethers } from "ethers"
import { useEffect, useState } from "react"
import axios from 'axios'
import Web3Modal from 'web3modal'


import {
  itemaddress, itemmarketaddress
} from '../config'

import Item from '../artifacts/contracts/Item.sol/Item.json'
import Market from '../artifacts/contracts/PolygonMarketplace.sol/PolygonMarketplace.json'


export default function reviews() {
    const [review, setReview] = useState([])
    const [reviewFilter, setReviewFilter] = useState('')
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

        if (reviewFilter == '') {
        setReview(isReview)
        } else {
        const filteredReview = reviewItems.filter(i => i.review && i.addr == reviewFilter)
        setReview(filteredReview)
        }

        setLoadingState('loaded')

    }

    if (loadingState == 'loaded' && !reviewFilter == '' && review.length <= 0) return (
        <div className="w-screen">
            <title>Marketplace Reviews</title>
            <div className="w-[88%]">
                <div className="flex justify-center">
                        <p className="mt-4 text-3xl font-bold text-violet-400">Reviews</p>
                </div>
                <div className="my-4 flex justify-center">
                    <input
                        placeholder="Search an address.."
                        className="mt-2 shadow-inner border rounded-2xl p-4"
                        onChange={e => setReviewFilter(e.target.value)}
                    />
                    <button
                        className="ml-2 p-4 text-violet-400 text-xl font-bold"
                        onClick={() => loadItems()}
                    >
                        Search
                    </button>
                </div>
                <h1 className="text-center text-violet-400 px-20 py-10 text-3xl">There are currently no reviews to this address. Clear your query to see all reviews.</h1>
            </div>
        </div>
      )

      if (loadingState == 'loaded' && reviewFilter == '' && review.length <= 0) return (
        <div className="w-screen">
            <title>Marketplace Reviews</title>
            <div className="w-[88%]">
                <div className="flex justify-center">
                        <p className="mt-4 text-3xl font-bold text-violet-400">Reviews</p>
                </div>
                <div className="my-4 flex justify-center">
                    <input
                        placeholder="Search an address.."
                        className="mt-2 shadow-inner border rounded-2xl p-4"
                        onChange={e => setReviewFilter(e.target.value)}
                    />
                    <button
                        className="ml-2 p-4 text-violet-400 text-xl font-bold"
                        onClick={() => loadItems()}
                    >
                        Search
                    </button>
                </div>
            </div>
        </div>
      )

    return (
        <div className="w-screen">
            <title>Marketplace Reviews</title>
            <div className="w-[88%]">
                <div className="flex justify-center">
                    <p className="mt-4 text-3xl font-bold text-violet-400">Reviews</p>
                </div>
                <div className="my-4 flex justify-center">
                    <input
                        placeholder="Search an address.."
                        className="mt-2 shadow-inner border rounded-2xl p-4"
                        onChange={e => setReviewFilter(e.target.value)}
                    />
                    <button
                        className="ml-2 p-4 text-violet-400 text-xl font-bold"
                        onClick={() => loadItems()}
                    >
                        Search
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                    review.map((item, i) => (
                        <div key={i} className="mx-6 bg-white text-center border border-violet shadow shadow-violet-400 rounded-2xl overflow-hidden">
                            <p className="my-2 text-violet-400">{item.addr}</p>
                            <img src={item.image} className="mx-3 mb-4 object-contain h-48 w-96"/>
                            <p className="my-2 text-xl text-violet-400 font-semibold">Name:  {item.reviewName}</p>
                            <p className="my-2 text-xl text-violet-400 font-semibold">Rating:  {item.rating}</p>
                            <p className="my-2 text-xl text-violet-400 font-semibold">Additional Details:  {item.details}</p>
                        </div>
                    ))
                }
                </div>
            </div>
        </div>
    )
}

