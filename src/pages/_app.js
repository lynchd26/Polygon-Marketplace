import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="flex items-center flex-wrap border-blue-500 p-6 bg-indigo-200">
        <div>
          <Link href="/">
            <a className="nline-flex text-4xl font-bold text-blue-500">
              Polygon Marketplace
            </a>
          </Link>
        </div>
        <div className="lg:ml-auto lg:items-centre">
          <Link href="/">
            <a className="ml-12 mr-6 text-xl text-blue-500 p-2 rounded-2xl hover:bg-indigo-100">
              Home
            </a>
          </Link>
          <Link href="/sell">
            <a className="mr-6 text-xl text-blue-500 p-2 rounded-2xl hover:bg-indigo-100">
              Sell
            </a>
          </Link>
          <Link href="/profile">
            <a className="mr-6 text-xl text-blue-500 p-2 rounded-2xl hover:bg-indigo-100">
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