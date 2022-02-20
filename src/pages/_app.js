import '../styles/globals.css'
import Link from 'next/link'


function MyApp({ Component, pageProps }) {
  return (
    <div class="relative min-h-screen md:flex">

      {/* mobile menu bar */}
      <div class="bg-gray-800 text-gray-100 flex justify-between md:hidden">
      {/* logo */}
        <a href="/" class="block p-4 text-white font-bold">Polygon Marketplace</a>
      {/* mobile menu button */}
      <button class="mobile-menu-button p-4 focus:outline-none focus:bg-gray-700">
      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      </button>

      </div>
      {/* <!-- sidebar --> */}
      <div class="sidebar bg-violet-800 text-violet-100 w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
        {/* <!-- logo --> */}
        <a href="/" class="text-white flex items-centre space-x-2 px-4">

          <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
          <span class="text-2x1 font-extrabold">Polygon Marketplace</span>
        </a>
       
        {/* <!-- nav --> */}
        <nav>
          <a href="/" class="block py-2.5 px-4 rounded transition duration-200 hover:text-white hover:bg-pink-500">
            Home
          </a>
          <a href="/sell" class="block py-2.5 px-4 rounded transition duration-200 hover:text-white hover:bg-pink-500">
            Sell
          </a>
          <a href="/profile" class="block py-2.5 px-4 rounded transition duration-200 hover:text-white hover:bg-pink-500">
            Profile
          </a>
          
         
        </nav> 
        
      
      </div>
    
      {/* <!-- content --> */}
    
      <Component {...pageProps} />
    
    </div>


  )
}

// grab everything needed
//const btn = document.querySelector('.mobile-menu-button');
//const sidebar = document.querySelector('.sidebar')

// add event listener for the click
//btn.addEventListener('click', () => {
  //sidebar.classList.toggle("-translate-x-full");
//});

export default MyApp