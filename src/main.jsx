// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import AdminDashboard from './AdminDashboard.jsx'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <AdminDashboard />
//   </React.StrictMode>,
// )


// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import './index.css'

// Check if your browser URL ends with '#manage-content'
const isSecretAdminRoute = window.location.hash === '#manage-content';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isSecretAdminRoute ? <AdminDashboard /> : <App />}
  </React.StrictMode>,
)

