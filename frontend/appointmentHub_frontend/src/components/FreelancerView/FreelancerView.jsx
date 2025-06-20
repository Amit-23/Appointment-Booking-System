import React, { useState } from 'react';
import Header1 from '../Header1/Header1';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FreelancerView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = location.state || {};

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profession: '',
    experience: '',
    bio: '',
    role: 'freelancer'
  });

  const [errorMessages, setErrorMessages] = useState({});
  const [generalError, setGeneralError] = useState('');
 
  const professions = [
    'Software Developer',
    'Web Designer',
    'Graphic Designer',
    'Painter',
    'Writer',
    'Photographer',
    'Marketing Specialist',
    'Consultant'
  ];

  const experienceLevels = [
    '0-2 years',
    '2-5 years',
    '5-10 years',
    '10+ years'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessages({});
    setGeneralError('');
  
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/auth/usersignup/',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
  
      if (response.data.success) {
        toast.success(response.data.message || 'Signup successful!', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
  
        // Clear form after successful submission
        setFormData({
          name: '',
          email: '',
          password: '',
          profession: '',
          experience: '',
          bio: '',
          role: 'freelancer'
        });
  
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      if (error.response) {
        // Handle email already exists case
        if (error.response.data?.errors?.email) {
          toast.error(error.response.data.errors.email, {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
        // Handle other field errors
        else if (error.response.data?.errors) {
          setErrorMessages(error.response.data.errors);
          toast.error('Please fix the errors in the form', {
            position: 'top-center',
            autoClose: 5000,
          });
        }
        // Handle general error messages
        else if (error.response.data?.message) {
          toast.error(error.response.data.message, {
            position: 'top-center',
            autoClose: 5000,
          });
        }
      } else {
        toast.error('Network error. Please try again later.', {
          position: 'top-center',
          autoClose: 5000,
        });
      }
    }
  };

  return (
    <>
      <Header1 />
      <ToastContainer />
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white">
                <h3 className="text-center mb-0">Freelancer Sign Up</h3>
              </div>
              <div className="card-body p-4">
                {generalError && (
                  <div className="alert alert-danger">{generalError}</div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      {errorMessages.name && <div className="text-danger">{errorMessages.name}</div>}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      {errorMessages.email && <div className="text-danger">{errorMessages.email}</div>}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      {errorMessages.password && <div className="text-danger">{errorMessages.password}</div>}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="profession" className="form-label">Profession</label>
                      <select
                        className="form-select"
                        id="profession"
                        name="profession"
                        value={formData.profession}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select your profession</option>
                        {professions.map((profession, index) => (
                          <option key={index} value={profession}>{profession}</option>
                        ))}
                      </select>
                      {errorMessages.profession && <div className="text-danger">{errorMessages.profession}</div>}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="experience" className="form-label">Years of Experience</label>
                      <select
                        className="form-select"
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select your experience level</option>
                        {experienceLevels.map((level, index) => (
                          <option key={index} value={level}>{level}</option>
                        ))}
                      </select>
                      {errorMessages.experience && <div className="text-danger">{errorMessages.experience}</div>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="bio" className="form-label">Bio/Description</label>
                    <textarea
                      className="form-control"
                      id="bio"
                      name="bio"
                      rows="3"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about your skills and experience"
                    ></textarea>
                    {errorMessages.bio && <div className="text-danger">{errorMessages.bio}</div>}
                  </div>

                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary btn-lg">
                      Complete Sign Up
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="text-center mt-3">
              <p className="text-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-decoration-none fw-bold">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          border-radius: 15px;
          border: none;
        }
        .card-header {
          border-radius: 15px 15px 0 0 !important;
        }
        .form-control, .form-select {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #ced4da;
        }
        .form-control:focus, .form-select:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
        .btn-primary {
          background-color: #0d6efd;
          border: none;
          padding: 12px;
          font-weight: 500;
        }
        .btn-primary:hover {
          background-color: #0b5ed7;
        }
      `}</style>
    </>
  );
};

export default FreelancerView;
