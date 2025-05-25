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
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Replace with your actual API endpoint
      const response = await axios.post('http://127.0.0.1:8000/create/clientsignup/', formData);
      
      console.log('API Response:', response.data);
      
      // Handle successful registration
      if (response.data.success) {
        // Redirect to login or dashboard after successful registration
        navigate('/login', { state: { registered: true } });
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || 'An error occurred during registration');
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
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h2 className="text-center mb-4 text-primary">Client Sign Up</h2>
                
                {/* Display error message if any */}
                {error && (
                  <div className="alert alert-danger mb-4">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Create a password"
                      minLength="6"
                    />
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
      `}</style>
    </>
  );
};

export default ClientView;