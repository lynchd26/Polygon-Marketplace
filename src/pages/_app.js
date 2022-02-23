import '../styles/globals.css'
import Link from 'next/link'




function MyApp({ Component, pageProps }) {
  return (
    <div className='relative min-h-screen md:flex text-center'>
      <div className="bg-violet-800 text-violet-100 pt-6 px-2 w-[12%]">

        <nav>
          <a href="/" className="text-white flex items-centre space-x-2 px-4 text-2xl font-extrabold">
            {/* <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" viewBox="0 10 20 20" fill="currentColor">
              <path d="M13 7H7v6h6V7z" />
              <path fill-rule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clip-rule="evenodd" />
            </svg> */}
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