import '../styles/globals.css'
import Link from 'next/link'




function MyApp({ Component, pageProps }) {
  return (
    <div className='relative min-h-screen md:flex text-center'>
      <div className="bg-violet-800 text-violet-100 pt-6 pr-2 min-w-[12%]">

        <nav>
          <a href="/" className="text-white flex items-centre space-x-2 px-4 text-2xl font-extrabold">
            Polygon Marketplace
          </a>
          <a href="/" className="block mt-6 py-2.5 px-4 rounded transition duration-200 hover:text-white hover:bg-pink-500">
            Home
          </a>
          <a href="/sell" className="block py-2.5 px-4 rounded transition duration-200 hover:text-white hover:bg-pink-500">
            Sell
          </a>
          <a href="/profile" className="block py-2.5 px-4 rounded transition duration-200 hover:text-white hover:bg-pink-500">
            Profile
          </a>
          <a href="/review" className="block py-2.5 px-4 rounded transition duration-200 hover:text-white hover:bg-pink-500">
            Reviews
          </a>
        </nav> 
      </div>

      <div>
        <Component {...pageProps} />
      </div>    

    
    </div>


  )
}

export default MyApp