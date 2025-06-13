import React, { useState } from 'react';
import {
  FaBars,
  FaSearch,
  FaCalendarAlt,
  FaUserCog,
  FaTachometerAlt,
} from 'react-icons/fa';

const ClientDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);

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
                <select className="form-select">
                  <option>Select</option>
                </select>
              </div>
              <div className="col-md-3">
                <label>Date</label>
                <input type="date" className="form-control" />
              </div>
              <div className="col-md-3">
                <label>Time</label>
                <input type="time" className="form-control" />
              </div>
              <div className="col-md-3">
                <button className="btn btn-primary w-100">Search</button>
              </div>
            </div>
          </div>

          {/* Appointments */}
          <div className="mt-5">
            <h5>My Appointments</h5>
            <table className="table mt-3">
              <thead>
                <tr>
                  <th>Professional</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Dr. Smith (Doctor)</td>
                  <td>April 25, 2024 – 5:00 PM</td>
                  <td><span className="badge bg-success">Confirmed</span></td>
                </tr>
                <tr>
                  <td>Ms. Johnson (Tutor)</td>
                  <td>April 20, 2024 – 3:00 PM</td>
                  <td><span className="badge bg-secondary">Completed</span></td>
                </tr>
                <tr>
                  <td>Mr. Brown (Lawyer)</td>
                  <td>April 13, 2024 – 2:00 PM</td>
                  <td><span className="badge bg-danger">Cancelled</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Feedback */}
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
