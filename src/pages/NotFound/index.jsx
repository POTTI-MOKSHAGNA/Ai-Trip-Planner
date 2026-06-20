import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <h1 className="not-found-code">404</h1>

        <h2 className="not-found-text">
          Page not found
        </h2>

        <p className="not-found-desc">
          The page you are looking for does not exist or has been moved.
        </p>

        <Link to="/" className="btn-back">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;