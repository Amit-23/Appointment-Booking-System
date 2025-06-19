import React, { useState, useEffect } from 'react';
import {
  FaBars,
  FaUser,
  FaCalendarAlt,
  FaUserCog,
  FaTachometerAlt,
  FaStar,
  FaClock,
  FaMoneyBillWave
} from 'react-icons/fa';
import axios from 'axios';

const FreelancerDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'freelancer') return;

    // Fetch appointments
    axios
      .get('http://127.0.0.1:8000/auth/freelancer-appointments/', {
        params: { freelancer_id: user.id },
      })
      .then((res) => {
        if (res.data.success) {
          setAppointments(res.data.appointments);
          // Calculate earnings from completed appointments
          const completedEarnings = res.data.appointments
            .filter(a => a.status === 'completed')
            .reduce((sum, appt) => sum + (appt.price || 0), 0);
          setEarnings(completedEarnings);
        }
      })
      .catch((err) => console.error('Failed to fetch appointments:', err));

    // Fetch availabilities
    fetchAvailabilities(user.id);
  }, []);

  const fetchAvailabilities = (freelancerId) => {
    axios
      .get('http://127.0.0.1:8000/auth/freelancer-availabilities/', {
        params: { freelancer_id: freelancerId },
      })
      .then((res) => {
        if (res.data.success) {
          setAvailabilities(res.data.availabilities);
        }
      })
      .catch((err) => console.error('Failed to fetch availabilities:', err));
  };

  const handleAddAvailability = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'freelancer') {
      alert('User not authenticated or not a freelancer');
      return;
    }

    axios
      .post('http://127.0.0.1:8000/auth/addavailability/', {
        freelancer_id: user.id,
        date,
        start_time: startTime,
        end_time: endTime,
      })
      .then((res) => {
        if (res.data.success) {
          alert('Availability added successfully');
          setDate('');
          setStartTime('');
          setEndTime('');
          setShowAvailabilityForm(false);
          fetchAvailabilities(user.id);
        }
      })
      .catch((err) => {
        console.error(err);
        alert('Error adding availability');
      });
  };

  const handleChangeStatus = (appointmentId, newStatus) => {
    axios
      .post('http://127.0.0.1:8000/auth/update-appointment-status/', {
        appointment_id: appointmentId,
        status: newStatus,
      })
      .then((res) => {
        if (res.data.success) {
          setAppointments((prev) =>
            prev.map((a) =>
              a.appointment_id === appointmentId
                ? { ...a, status: newStatus }
                : a
            )
          );
          // Update earnings if status changed to/from completed
          if (newStatus === 'completed' || res.data.previous_status === 'completed') {
            const user = JSON.parse(localStorage.getItem('user'));
            axios
              .get('http://127.0.0.1:8000/auth/freelancer-appointments/', {
                params: { freelancer_id: user.id },
              })
              .then((res) => {
                if (res.data.success) {
                  const completedEarnings = res.data.appointments
                    .filter(a => a.status === 'completed')
                    .reduce((sum, appt) => sum + (appt.price || 0), 0);
                  setEarnings(completedEarnings);
                }
              });
          }
        } else {
          alert(res.data.error || 'Could not update status');
        }
      })
      .catch((err) => {
        console.error(err);
        alert('Error updating status');
      });
  };

  // Calculate appointment statistics
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
  const rejectedAppointments = appointments.filter(a => a.status === 'rejected').length;
  const acceptedAppointments = appointments.filter(a => a.status === 'accepted').length;

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
          cursor: pointer;
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
              <a className={`nav-link ${selectedSection === 'dashboard' ? 'active' : ''}`} onClick={() => setSelectedSection('dashboard')}>
                <FaTachometerAlt />
                <span className="nav-label">Dashboard</span>
              </a>
            </li>
            <li className="nav-item mb-3">
              <a className={`nav-link ${selectedSection === 'profile' ? 'active' : ''}`} onClick={() => setSelectedSection('profile')}>
                <FaUser />
                <span className="nav-label">My Profile</span>
              </a>
            </li>
            <li className="nav-item mb-3">
              <a className={`nav-link ${selectedSection === 'availability' ? 'active' : ''}`} onClick={() => setSelectedSection('availability')}>
                <FaCalendarAlt />
                <span className="nav-label">Manage Availability</span>
              </a>
            </li>
            <li className="nav-item mb-3">
              <a className={`nav-link ${selectedSection === 'appointments' ? 'active' : ''}`} onClick={() => setSelectedSection('appointments')}>
                <FaCalendarAlt />
                <span className="nav-label">Appointments</span>
              </a>
            </li>
            <li className="nav-item mb-3">
              <a className={`nav-link ${selectedSection === 'reviews' ? 'active' : ''}`} onClick={() => setSelectedSection('reviews')}>
                <FaStar />
                <span className="nav-label">Client Reviews</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className={`main-content ${collapsed ? 'collapsed' : 'expanded'} p-4`} style={{ flex: 1 }}>
          <h4>Welcome, {JSON.parse(localStorage.getItem('user'))?.name || 'Freelancer'}</h4>

          {selectedSection === 'dashboard' && (
            <>
              {/* Summary Statistics */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-primary text-white p-3">
                    <h6>Total Appointments</h6>
                    <h3>{totalAppointments}</h3>
                    <small>All time appointments</small>
                  </div>
                </div>
                
                <div className="col-md-3">
                  <div className="card bg-warning text-dark p-3">
                    <h6>Pending</h6>
                    <h3>{pendingAppointments}</h3>
                    <small>Awaiting your response</small>
                  </div>
                </div>
                
              </div>

              {/* Additional Stats Row */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-secondary text-white p-3">
                    <h6>Accepted</h6>
                    <h3>{acceptedAppointments}</h3>
                    <small>Upcoming sessions</small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-danger text-white p-3">
                    <h6>Rejected</h6>
                    <h3>{rejectedAppointments}</h3>
                    <small>Declined appointments</small>
                  </div>
                </div>
                
               
              </div>

            
              {/* Upcoming Appointments */}
              <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Upcoming Appointments</h5>
                  <button className="btn btn-sm btn-outline-primary">View All</button>
                </div>
                <div className="card-body">
                  {appointments
                    .filter(a => a.status === 'accepted')
                    .slice(0, 3)
                    .map((appt, idx) => (
                      <div key={idx} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                        <div>
                          <h6 className="mb-1">{appt.client_name}</h6>
                          <small className="text-muted">
                            {appt.date} at {appt.start_time}
                          </small>
                        </div>
                        <span className="badge bg-success">
                          Accepted
                        </span>
                      </div>
                    ))}
                  {appointments.filter(a => a.status === 'accepted').length === 0 && (
                    <div className="text-center py-3 text-muted">
                      No upcoming appointments
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">Recent Reviews</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-start mb-3">
                    <img src="https://via.placeholder.com/40" alt="Client" className="rounded-circle me-3" />
                    <div>
                      <div className="d-flex align-items-center mb-1">
                        <h6 className="mb-0 me-2">John Smith</h6>
                        <div className="text-warning">
                          <FaStar />
                          <FaStar />
                          <FaStar />
                          <FaStar />
                          <FaStar className="text-muted" />
                        </div>
                      </div>
                      <p className="mb-0">"Great service! Very professional and knowledgeable."</p>
                      <small className="text-muted">2 days ago</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-start">
                    <img src="https://via.placeholder.com/40" alt="Client" className="rounded-circle me-3" />
                    <div>
                      <div className="d-flex align-items-center mb-1">
                        <h6 className="mb-0 me-2">Sarah Johnson</h6>
                        <div className="text-warning">
                          <FaStar />
                          <FaStar />
                          <FaStar />
                          <FaStar />
                          <FaStar />
                        </div>
                      </div>
                      <p className="mb-0">"Excellent service! Will definitely book again."</p>
                      <small className="text-muted">1 week ago</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Quick Actions</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <button 
                        className="btn btn-outline-primary w-100 d-flex flex-column align-items-center py-3"
                        onClick={() => setSelectedSection('availability')}
                      >
                        <FaCalendarAlt size={24} className="mb-2" />
                        <span>Add Availability</span>
                      </button>
                    </div>
                    <div className="col-md-4 mb-3">
                      <button 
                        className="btn btn-outline-success w-100 d-flex flex-column align-items-center py-3"
                        onClick={() => setSelectedSection('profile')}
                      >
                        <FaUser size={24} className="mb-2" />
                        <span>Update Profile</span>
                      </button>
                    </div>
                    <div className="col-md-4 mb-3">
                      <button className="btn btn-outline-info w-100 d-flex flex-column align-items-center py-3">
                        <FaUserCog size={24} className="mb-2" />
                        <span>Settings</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Rest of your component remains the same */}
          {selectedSection === 'availability' && (
            <div className="mt-4">
              <h5>Manage Availability</h5>
              <div className="d-flex gap-2 mb-3">
                <button className="btn btn-primary" onClick={() => setShowAvailabilityForm(!showAvailabilityForm)}>
                  {showAvailabilityForm ? 'Cancel' : 'Add Availability'}
                </button>
                <button className="btn btn-outline-secondary" onClick={() => {
                  const user = JSON.parse(localStorage.getItem('user'));
                  fetchAvailabilities(user.id);
                }}>
                  Refresh List
                </button>
              </div>

              {showAvailabilityForm && (
                <div className="card p-3 mt-3 mb-4">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label>Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label>Start Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label>End Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button className="btn btn-success mt-3" onClick={handleAddAvailability}>
                    Submit Availability
                  </button>
                </div>
              )}

              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">My Availabilities</h5>
                </div>
                <div className="card-body">
                  {availabilities.length === 0 ? (
                    <div className="text-center py-3 text-muted">
                      No availabilities found. Add your available time slots above.
                    </div>
                  ) : (
                    <table className="table table-bordered table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Start Time</th>
                          <th>End Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availabilities.map((avail, idx) => (
                          <tr key={idx}>
                            <td>{avail.date}</td>
                            <td>{avail.start_time}</td>
                            <td>{avail.end_time}</td>
                            <td>
                              <span className={`badge ${
                                avail.status === 'available' ? 'bg-success' :
                                avail.status === 'booked' ? 'bg-primary' :
                                'bg-secondary'
                              }`}>
                                {avail.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedSection === 'appointments' && (
            <div className="mt-4">
              <h5>Appointments</h5>
              <table className="table table-bordered table-hover mt-3">
                <thead className="table-light">
                  <tr>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">No appointments found</td>
                    </tr>
                  ) : (
                    appointments.map((appt, idx) => (
                      <tr key={idx}>
                        <td>{appt.client_name}</td>
                        <td>{appt.date}</td>
                        <td>{appt.start_time}</td>
                        <td>
                          <span className={`badge ${
                            appt.status === 'pending'   ? 'bg-warning text-dark' :
                            appt.status === 'accepted'  ? 'bg-success' :
                            appt.status === 'rejected'  ? 'bg-danger' :
                            appt.status === 'cancelled' ? 'bg-secondary' :
                            appt.status === 'completed' ? 'bg-info'    :
                            'bg-light'
                          }`}>
                            {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {appt.status === 'pending' ? (
                            <>
                              <button className="btn btn-sm btn-success me-2" onClick={() => handleChangeStatus(appt.appointment_id, 'accepted')}>Accept</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleChangeStatus(appt.appointment_id, 'rejected')}>Reject</button>
                            </>
                          ) : (
                            <span className="text-muted">No actions</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {selectedSection === 'reviews' && (
            <div className="mt-4">
              <h5>Client Reviews</h5>
              <table className="table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Comment</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>John Smith</td>
                    <td>June 15, 2023</td>
                    <td>"Excellent service, very professional!"</td>
                    <td>
                      <div className="text-warning">
                        <FaStar />
                        <FaStar />
                        <FaStar />
                        <FaStar />
                        <FaStar />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Sarah Johnson</td>
                    <td>June 10, 2023</td>
                    <td>"Great work, would recommend!"</td>
                    <td>
                      <div className="text-warning">
                        <FaStar />
                        <FaStar />
                        <FaStar />
                        <FaStar />
                        <FaStar className="text-muted" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;