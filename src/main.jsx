import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import InvoicePage from './InvoicePage.jsx'
import './index.css'

// Which page to show, based on the end of the web address:
//   (nothing / #work / #contact ...)  -> your portfolio
//   #manage-content                   -> your admin panel
//   #invoice=<secret-code>            -> a client's invoice page
function getRoute() {
  const hash = window.location.hash

  if (hash === '#manage-content') {
    return { name: 'admin', token: '' }
  }

  if (hash.startsWith('#invoice=')) {
    return { name: 'invoice', token: hash.slice('#invoice='.length) }
  }

  return { name: 'home', token: '' }
}

function Root() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    function handleHashChange() {
      const next = getRoute()
      // Keep the same object when nothing changed, so clicking menu links
      // like #work does not re-render anything unnecessarily.
      setRoute((prev) =>
        prev.name === next.name && prev.token === next.token ? prev : next
      )
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  if (route.name === 'admin') return <AdminDashboard />
  if (route.name === 'invoice') return <InvoicePage token={route.token} />
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}