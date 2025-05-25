import React, { useState } from 'react';
import Header1 from '../Header1/Header1';
import { useLocation, Link } from 'react-router-dom';

const FreelancerView = () => {
  const location = useLocation();
  const { role } = location.state || {};
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profession: '',
    experience: '',
    bio: ''
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  return (
    <>
      <Header1 />
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white">
                <h3 className="text-center mb-0">Freelancer Sign Up</h3>
              </div>
              <div className="card-body p-4">
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