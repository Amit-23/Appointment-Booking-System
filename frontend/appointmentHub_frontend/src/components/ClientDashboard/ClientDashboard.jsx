import React, { useState, useEffect } from 'react';
import {
  FaBars,
  FaSearch,
  FaCalendarAlt,
  FaUserCog,
  FaTachometerAlt,
} from 'react-icons/fa';
import axios from 'axios';

const ClientDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableFreelancers, setAvailableFreelancers] = useState([]);

  // Load available categories (professions)
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/auth/getfreelencers/')
      .then(response => {
        if (response.data.success) {
          setCategories(response.data.professions);
        }
      })
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  // Handle search click
  const handleSearch = () => {
    if (!selectedDate) return alert("Please select a date");

    axios.get('http://127.0.0.1:8000/auth/available-freelancers/', {
      params: {
        date: selectedDate,
        category: selectedCategory
      }
    })
      .then(res => {
        console.log("API response:", res.data);
        if (res.data.success) {
          setAvailableFreelancers(res.data.freelancers);
        }
      })
      .catch(err => console.error("Error fetching available freelancers:", err));
  };

  return (
    <div className="container-fluid" style={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <style>{`
        .sidebar {
          background-color: #ffffff;
          border-right: 1px solid #e0e0e0;
          height: 100vh;
          transition: width 0.3s ease;
        }

        .sidebar.collapsed {
          width: 60px;
        }

        .sidebar.expanded {
          width: 250px;
        }

        .sidebar .nav-link {
          font-weight: 500;
          color: #333;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sidebar .nav-link.active {
          color: #0d6efd;
          font-weight: bold;
        }

        .sidebar .nav-label {
          transition: opacity 0.3s ease;
        }

        .sidebar.collapsed .nav-label {
          opacity: 0;
        }

        .sidebar-toggle {
          cursor: pointer;
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }

        .icon-hover:hover {
          transform: scale(1.1);
          transition: transform 0.3s ease;
        }

        .stat-card {
          width: 200px;
          background-color: #f0f4ff;
          border: none;
        }

        .main-content {
          transition: margin-left 0.3s ease;
        }

        .main-content.collapsed {
          margin-left: 60px;
        }

        .main-content.expanded {
          margin-left: 250px;
        }
      `}</style>

      <div className="d-flex">
        {/* Sidebar */}
        <div className={`sidebar ${collapsed ? 'collapsed' : 'expanded'} p-3 position-fixed`}>
          <div className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            <FaBars className="icon-hover" />
          </div>
          <ul className="nav flex-column">
            <li className="nav-item mb-3">
              <a className="nav-link active" href="#">
                <FaTachometerAlt className="icon-hover" />
                <span className="nav-label">Dashboard</span>
              </a>
            </li>
            <li className="nav-item mb-3">
              <a className="nav-link" href="#">
                <FaSearch className="icon-hover" />
                <span className="nav-label">Search & Book</span>
              </a>
            </li>
            <li className="nav-item mb-3">
              <a className="nav-link" href="#">
                <FaCalendarAlt className="icon-hover" />
                <span className="nav-label">My Appointments</span>
              </a>
            </li>
            <li className="nav-item mb-3">
              <a className="nav-link" href="#">
                <FaUserCog className="icon-hover" />
                <span className="nav-label">Profile Settings</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className={`main-content ${collapsed ? 'collapsed' : 'expanded'} p-4`} style={{ flex: 1 }}>
          <h4>Welcome, John Doe</h4>

          {/* Summary Cards */}
          <div className="d-flex gap-3 mt-3 flex-wrap">
            <div className="card stat-card">
              <div className="card-body text-center">
                <h6>Total Appointments</h6>
                <h4>5</h4>
              </div>
            </div>
            <div className="card stat-card">
              <div className="card-body text-center">
                <h6>Upcoming Appointments</h6>
                <h4>2</h4>
              </div>
            </div>
          </div>

          {/* Notification */}
          <div className="alert alert-info mt-3">
            You have an appointment tomorrow at 4:00 PM
          </div>

          {/* Search & Book */}
          <div className="mt-4">
            <h5>Search & Book Appointments</h5>
            <div className="row g-2 align-items-end">
              <div className="col-md-3">
                <label>Category</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Select</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label>Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <button className="btn btn-primary w-100" onClick={handleSearch}>
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Available Freelancers */}
          <div className="mt-4">
            <h5>Available Freelancers</h5>
            {availableFreelancers.length === 0 ? (
              <p>No freelancers available for selected date and category.</p>
            ) : (
              availableFreelancers.map((f, idx) => (
                <div key={idx} className="card p-3 mb-2">
                  <h6>{f.name} ({f.profession})</h6>
                  <p>Email: {f.email}</p>
                  <p>Available from {f.start_time} to {f.end_time}</p>
                  <button className="btn btn-sm btn-success">Book Appointment</button>
                </div>
              ))
            )}
          </div>

          {/* Feedback Section (optional static content) */}
          <div className="mt-5">
            <h5>Review & Feedback</h5>
            <p>Ms. Johnson — ★★★★☆</p>
            <a href="#">Write Review</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
