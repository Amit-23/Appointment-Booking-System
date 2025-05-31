import React, { useState } from 'react';
import Header1 from '../Header1/Header1';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ClientView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = location.state || {};
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when typing
    if (error?.errors?.[name]) {
      setError(prev => {
        const newErrors = {...prev.errors};
        delete newErrors[name];
        return {...prev, errors: newErrors};
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/create/usersignup/', 
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (response.data.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', password: '' });
        setTimeout(() => navigate('/login', { state: { registered: true } }), 3000);
      }
    } catch (err) {
      if (err.response) {
        // Backend returned an error response
        const backendError = err.response.data;
        
        if (backendError.errors) {
          // Field-specific errors
          setError({
            message: 'Please fix the errors below',
            errors: backendError.errors
          });
        } else {
          // General error
          const errorMessages = {
            'Invalid data format': 'Please enter valid data',
            'Server error': 'Something went wrong on our end',
            'Method not allowed': 'Invalid request method'
          };
          
          setError({
            message: errorMessages[backendError.error] || backendError.error || 'Registration failed'
          });
        }
      } else if (err.request) {
        setError({ message: 'Network error - please check your connection' });
      } else {
        setError({ message: 'An unexpected error occurred' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header1 />
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            {/* Success Alert */}
            {success && (
              <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                <strong>Success!</strong> Account created successfully. Redirecting to login...
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSuccess(false)}
                  aria-label="Close"
                ></button>
              </div>
            )}
            
            {/* General Error Alert */}
            {error?.message && !error?.errors && (
              <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                <strong>Error!</strong> {error.message}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setError(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}
            
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h2 className="text-center mb-4 text-primary">Client Sign Up</h2>
                
                {error?.message && error?.errors && (
                  <div className="alert alert-warning mb-4">
                    <strong>Notice:</strong> {error.message}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${error?.errors?.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                    {error?.errors?.name && (
                      <div className="invalid-feedback">
                        {error.errors.name}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      className={`form-control form-control-lg ${error?.errors?.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                    />
                    {error?.errors?.email && (
                      <div className="invalid-feedback">
                        {error.errors.email}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className={`form-control form-control-lg ${error?.errors?.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Create a password"
                      minLength="6"
                    />
                    {error?.errors?.password && (
                      <div className="invalid-feedback">
                        {error.errors.password}
                      </div>
                    )}
                  </div>

                  <div className="d-grid mb-3">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg py-2 fw-bold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>

                  <div className="text-center mt-3">
                    <p className="text-muted">
                      Already have an account?{' '}
                      <Link to="/login" className="text-decoration-none fw-bold">
                        Log In
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.1);
        }
        .form-control {
          border-radius: 8px;
          border: 1px solid #dee2e6;
          padding: 12px 16px;
        }
        .form-control:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1);
        }
        .btn-primary {
          background-color: #0d6efd;
          border: none;
          letter-spacing: 0.5px;
        }
        .btn-primary:hover {
          background-color: #0b5ed7;
        }
        .alert-success {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .is-invalid {
          border-color: #dc3545;
        }
        .invalid-feedback {
          color: #dc3545;
          font-size: 0.875em;
          margin-top: 0.25rem;
        }
      `}</style>
    </>
  );
};

export default ClientView;