import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="flex bg-white items-center flex-wrap my-4 p-2 border-b-4 border-violet-600">
        <div className='mb-4'>
          <Link href="/">
            <a className="inline-flex ml-4 text-3xl font-bold text-violet-400">
              Polygon Marketplace
            </a>
          </Link>
        </div>
        <div className="inline-flex mb-4 lg:ml-auto lg:items-centre">
          <Link href="/">
            <a className="flex ml-12 mr-6 text-xl text-slate-400 p-2 rounded-2xl hover:bg-violet-200">
              Home
            </a>
          </Link>
          <Link href="/sell">
            <a className="mr-6 text-xl text-slate-400 p-2 rounded-2xl hover:bg-violet-200">
              Sell
            </a>
          </Link>
          <Link href="/profile">
            <a className="mr-6 text-xl text-slate-400 p-2 rounded-2xl hover:bg-violet-200">
              Profile
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp