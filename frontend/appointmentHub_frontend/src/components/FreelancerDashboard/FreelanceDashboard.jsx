import React, { useState } from 'react';
import {
  FaBars,
  FaUser,
  FaCalendarAlt,
  FaUserCog,
  FaTachometerAlt,
  FaStar
} from 'react-icons/fa';
import axios from 'axios';

const FreelancerDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleAddAvailability = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'freelancer') {
      alert('User not authenticated or not a freelancer');
      return;
    }

    axios.post('http://127.0.0.1:8000/auth/addavailability/', {
      freelancer_id: user.id,
      date,
      start_time: startTime,
      end_time: endTime
    })
    .then(res => {
      if (res.data.success) {
        alert('Availability added successfully');
        setDate('');
        setStartTime('');
        setEndTime('');
        setShowAvailabilityForm(false);
      }
    })
    .catch(err => {
      console.error(err);
      alert('Error adding availability');
    });
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
        .sidebar.collapsed { width: 60px; }
        .sidebar.expanded { width: 250px; }
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
        .sidebar .nav-label { transition: opacity 0.3s ease; }
        .sidebar.collapsed .nav-label { opacity: 0; }
        .sidebar-toggle {
          cursor: pointer;
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }
        .main-content.collapsed { margin-left: 60px; }
        .main-content.expanded { margin-left: 250px; }
      `}</style>

      <div className="d-flex">
        {/* Sidebar */}
        <div className={`sidebar ${collapsed ? 'collapsed' : 'expanded'} p-3 position-fixed`}>
          <div className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            <FaBars />
          </div>
          <ul className="nav flex-column">
            <li className="nav-item mb-3">
              <a className="nav-link active" href="#">
                <FaTachometerAlt />
                <span className="nav-label">Dashboard</span>
              </a>
            </li>
            <li className="nav-item mb-3">
              <a className="nav-link" href="#">
                <FaUser />
                <span className="nav-label">My Profile</span>
              </a>
            </li>
            <li className="nav-item mb-3">
              <a className="nav-link" href="#">
                <FaCalendarAlt />
                <span className="nav-label">Manage Availability</span>
              </a>
            </li>
            <li className="nav-item mb-3">
              <a className="nav-link" href="#">
                <FaCalendarAlt />
                <span className="nav-label">Appointments</span>
              </a>
            </li>
            <li className="nav-item mb-3">
              <a className="nav-link" href="#">
                <FaStar />
                <span className="nav-label">Client Reviews</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className={`main-content ${collapsed ? 'collapsed' : 'expanded'} p-4`} style={{ flex: 1 }}>
          <h4>Welcome, Jane Doe</h4>

          <div className="row mt-4">
            <div className="col-md-6">
              <div className="card p-3 mb-3">
                <h6>Profile Approval</h6>
                <div className="d-flex align-items-center gap-2">
                  <img src="https://via.placeholder.com/40" alt="Profile" className="rounded-circle" />
                  <div>
                    <p className="mb-0">Jane Doe</p>
                    <small className="text-success">Approved</small>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-primary mt-2">Edit Profile</button>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card p-3 mb-3">
                <h6>This Week</h6>
                <p className="mb-1">Appointments: <strong>8</strong></p>
                <p className="mb-0">Rating: <strong>4.5 ★</strong></p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h5>Manage Availability</h5>
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={() => setShowAvailabilityForm(!showAvailabilityForm)}>Add Availability</button>
              <button className="btn btn-outline-secondary">Edit / Unavailable</button>
            </div>
            {showAvailabilityForm && (
              <div className="card p-3 mt-3">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label>Date</label>
                    <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label>Start Time</label>
                    <input type="time" className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label>End Time</label>
                    <input type="time" className="form-control" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </div>
                </div>
                <button className="btn btn-success mt-3" onClick={handleAddAvailability}>Submit Availability</button>
              </div>
            )}
          </div>

          <div className="mt-4">
            <h5>Appointments</h5>
            <table className="table mt-3">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>John Doe</td>
                  <td>Apr 23, 2024</td>
                  <td>Pending</td>
                  <td><button className="btn btn-sm btn-success">Accept</button> <button className="btn btn-sm btn-danger">Reject</button></td>
                </tr>
                <tr>
                  <td>Emily Smith</td>
                  <td>Apr 24, 2024</td>
                  <td>Confirmed</td>
                  <td><button className="btn btn-sm btn-secondary">Mark as Completed</button></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <h5>Client Reviews</h5>
            <table className="table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>John Doe</td>
                  <td>April 30, 2024</td>
                  <td>Very helpful</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
