import { Link } from 'react-router-dom';
import React from 'react'

const NotFound  = () => {
  return (
     <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>404</h1>
      <p>Page Not Found</p>
      <Link to="/">Go Back to Login</Link>
    </div>
  )
}

export default NotFound 