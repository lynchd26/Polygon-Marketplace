import { ethers } from "ethers"
import { useEffect, useState } from "react"
import Web3Modal from 'web3modal'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from "next/router"

import {
    itemaddress, itemmarketaddress
} from '../config'

import Item from '../artifacts/contracts/Item.sol/Item.json'
import Market from '../artifacts/contracts/PolygonMarketplace.sol/PolygonMarketplace.json'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')


export default function CreateItem () {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '', name: '', desc: '' })
    const [selectedCategory, setCategory] = useState({category: "other"});
    const router = useRouter()

    // uploads file to IPFS and creates URL
    async function onChange(e) {    // onChange is invoked by an event 'e'
        const file = e.target.files[0]
        try {
            const added = await client.add(file)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
        } catch (e) {
            console.log(e)
        }      
    }


    // creates the items and saves to ipfs
    async function createMarket(e) {
        // create the listing
        const { name, desc, price } = formInput
        const category = selectedCategory
        if (!name || !desc || !price || !fileUrl || !category || category=="Select Category..") return // listing must contain all of these, otherwise return
        const data = JSON.stringify({
            name, desc, category, image: fileUrl
        })

        // save listing to IPFS
        try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}` // ipfs path which contains all the data
            createSale(url) // now call function below to save this ipfs file to polygon
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    // creating the token and listing it for sale
    async function createSale(url) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        let contract = new ethers.Contract(itemaddress, Item.abi, signer)
        let transaction = await contract.createToken(url)                   // creates token
        let tx = await transaction.wait()                                   // wait for token to be created

        // parse return value from tx
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()

        const price = ethers.utils.parseUnits(formInput.price, 'ether')

        // now put the listing on the marketplace
        contract = new ethers.Contract(itemmarketaddress, Market.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()

        transaction = await contract.createMarketItem(
            itemaddress, tokenId, price, { value: listingPrice }
        )
        await transaction.wait()
        router.push('/')
    }

    return(
        <div className="flex justify-center content-center mt-32 w-screen">
            <title>List an item</title>
            <div className="w-1/2">      
                <div className="flex flex-col pb-12">
                    <input
                        placeholder="Name"
                        className="mt-8 shadow-inner border rounded-2xl p-4 focus:border-blue-500"
                        onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                    />
                    <input
                        placeholder="Description"
                        className="mt-2 shadow-inner border rounded-2xl p-4"
                        onChange={e => updateFormInput({ ...formInput, desc: e.target.value })}
                    />
                    <select
                        className="mt-2 p-2 rounded-2xl"
                        value={selectedCategory}
                        onChange={(e) => {
                            setCategory(e.target.value);
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
                    <input
                        placeholder="Price (Matic)"
                        className="mt-2 shadow-inner border rounded-2xl p-4"
                        onChange={e => updateFormInput({ ... formInput, price: e.target.value })}
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
                        className="font-bold mt-4 bg-violet-300 text-white rounded-2xl p-4 shadow-xl hover:bg-violet-400 transition-all duration-1000"
                        onClick={createMarket}
                        >
                        Create listing
                    </button>
                </div>
            </div>
        </div>
    )

}