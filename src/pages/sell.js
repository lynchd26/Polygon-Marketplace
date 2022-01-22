import { ethers } from "ethers"
import { useEffect, useState } from "react"
import Web3Modal from 'web3modal'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from "next/router"

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
    itemaddress, itemmarketaddress
} from '../config'

import Item from '../artifacts/contracts/Item.sol/Item.json'
import Market from '../artifacts/contracts/PolygonMarketplace.sol/PolygonMarketplace.json'

export default function CreateItem () {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
    const router = useRouter()

    async function onChange(e) {
        const file = e.target.files[0]
        try {
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )
            const url = `https:ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
        } catch (e) {
            console.log(e)
        }
    }

    // creates the items and saves to ipfs
    async function createMarket(e) {
        const { name, description, price } = formInput
        if (!name || !description || !price || !fileUrl) return // listing must contain all of these, otherwise return
        const data = JSON.stringify({
            name, description, image: fileUrl
        })

        // save listing to IPFS
        try {
            const added = await client.add(data)
            const url = `https:ipfs.infura.io/ipfs/${added.path}` // ipfs path which contains all the data
            createSale(url) // now call function below to save this ipfs file to polygon
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }
    async function createSale(url) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        let contract = new ethers.Contract(itemaddress, Item.abi, signer)
        let transaction = await contract.createToken(url)
        let tx = await transaction.wait()

        // parse return value from tx
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()

        const price = ethers.utils.parseUnits(formInput.price, 'ether')

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
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <input
                    placeholder="Name"
                    className="mt-8 shadow-inner border rounded-2xl p-4 focus:border-blue-500"
                    onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                />
                <textarea
                    placeholder="Description"
                    className="mt-2 shadow-inner border rounded-2xl p-4"
                    onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                />
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
                        <img className="rounded-2xl mt-4" width="350" src={fileUrl} />
                    )
                }
                <button
                    onClick={createMarket}
                    className="font-bold mt-4 bg-indigo-200 text-blue-500 rounded-2xl p-4 shadow-xl hover:bg-indigo-300"
                    >
                    Create listing
                </button>
            </div>
        </div>
    )

}