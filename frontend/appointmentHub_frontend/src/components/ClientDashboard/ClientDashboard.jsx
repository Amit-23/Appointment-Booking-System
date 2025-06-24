import React, { useState, useEffect } from 'react';
import {
  FaBars,
  FaSearch,
  FaCalendarAlt,
  FaUserCog,
  FaTachometerAlt,
  FaSignOutAlt,
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableFreelancers, setAvailableFreelancers] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [loadingFreelancers, setLoadingFreelancers] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const tokens = JSON.parse(localStorage.getItem('tokens'));
      if (!user || !tokens?.access) {
        navigate('/login');
        return;
      }
      setClientName(user.name || 'Client');
      axios
        .get('http://127.0.0.1:8000/auth/verify-token/', {
          headers: { Authorization: `Bearer ${tokens.access}` },
        })
        .catch(() => {
          localStorage.removeItem('user');
          localStorage.removeItem('tokens');
          navigate('/login');
        });
      if (user.role !== 'client') navigate('/login');
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchAppointments = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'client') return;
      setLoadingAppointments(true);
      axios
        .get('http://127.0.0.1:8000/auth/client-appointments/', {
          params: { client_id: user.id },
        })
        .then((res) => {
          if (res.data.success) setMyAppointments(res.data.appointments);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoadingAppointments(false));
    };
    fetchAppointments();
  }, []);

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/auth/getfreelencers/')
      .then((res) => {
        if (res.data.success) setCategories(res.data.professions);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = () => {
    if (!selectedDate) return alert('Please select a date');
    setLoadingFreelancers(true);
    axios
      .get('http://127.0.0.1:8000/auth/available-freelancers/', {
        params: { date: selectedDate, category: selectedCategory },
      })
      .then((res) => {
        if (res.data.success) setAvailableFreelancers(res.data.freelancers);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingFreelancers(false));
  };

  const handleBookAppointment = (f) => {
    const user = JSON.parse(localStorage.getItem('user'));
    axios
      .post('http://127.0.0.1:8000/auth/book-appointment/', {
        client_id: user.id,
        freelancer_id: f.id,
        date: selectedDate,
        start_time: f.start_time,
      })
      .then((res) => alert(res.data.success ? 'Booked!' : res.data.message || 'Error'))
      .catch((err) => alert('Failed: ' + err.message));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    window.location.href = '/login';
  };

  return (
    <div className="container-fluid p-0 m-0">
      <style>{`
        body, html { height: 100%; margin: 0; font-family: Arial, sans-serif; }
        .sidebar { background: #fff; border-right: 1px solid #ddd; position: fixed;
          top: 0; bottom: 0; transition: width .3s; overflow: hidden; z-index: 1000; }
        .sidebar.collapsed { width: 60px; }
        .sidebar.expanded { width: 220px; }
        .sidebar .nav-link { display: flex; align-items: center; gap: 12px;
          padding: 12px 16px; font-size: 14px; color: #333; }
        .sidebar .nav-link.active,
        .sidebar .nav-link:hover { background: #f0f8ff; color: #0056b3; }
        .sidebar .nav-label { transition: opacity .2s; }
        .sidebar.collapsed .nav-label { opacity: 0; }
        .topbar { background: #007bff; color: white; padding: 12px 20px;
          display: flex; justify-content: space-between; align-items: center; }
        .topbar h4 { margin: 0; font-size: 18px; }
        .main { margin-left: 220px; padding: 20px; transition: margin-left .3s; }
        .main.collapsed { margin-left: 60px; }
        .card.stat-card { background: #e9f5ff; border: none; border-radius: 8px;
          padding: 16px; flex: 1; min-width: 160px; }
        .freelancer-card { background: #fff; border-radius: 8px; border: 1px solid #eee;
          padding: 16px; transition: transform .2s, box-shadow .2s; }
        .freelancer-card:hover { transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center; z-index: 2000; }
        .modal-content { background: white; border-radius: 8px; padding: 24px;
          width: 320px; max-width: 90%; text-align: center; }
      `}</style>

      {/* Sidebar */}
      <div className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}>
        <div className="d-flex align-items-center justify-content-between p-3">
          <FaBars onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer' }} />
          {!collapsed && <span style={{ fontWeight: 'bold' }}>Menu</span>}
        </div>
        <nav className="nav flex-column">
          {[
            {icon: <FaTachometerAlt />, label: 'Dashboard'},
            {icon: <FaSearch />, label: 'Search & Book'},
            // {icon: <FaCalendarAlt />, label: 'My Appointments'},
            // {icon: <FaUserCog />, label: 'Profile Settings'},
          ].map((item, i) => (
            <a key={i} href="#" className="nav-link">
              {item.icon}
              <span className="nav-label">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Topbar */}
      <div className="topbar">
        <h4 style={{ marginLeft: 50, fontWeight: 300 }}>Welcome, {clientName}</h4>

        <button className="btn btn-light" onClick={() => setShowLogoutModal(true)}>
          <FaSignOutAlt style={{ marginRight: '6px' }} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className={`main ${collapsed ? 'collapsed' : ''}`}>
       

        <div className="mb-4 p-4 bg-white rounded shadow-sm">
          <h5>Search & Book</h5>
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label>Category</label>
              <select className="form-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="">Select</option>
                {categories.map((c, i) => <option key={i}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label>Date</label>
              <input type="date" className="form-control" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary w-100" onClick={handleSearch}>
                {loadingFreelancers ? <span className="spinner-border spinner-border-sm"></span> : <FaSearch />} Search
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <h5>Available Freelancers</h5>
          {loadingFreelancers ? (
            <div className="text-center"><div className="spinner-border"></div></div>
          ) : availableFreelancers.length === 0 ? (
            <p>No freelancers found for this search.</p>
          ) : (
            <div className="row">
              {availableFreelancers.map((f, i) => (
                <div className="col-md-4 mb-3" key={i}>
                  <div className="freelancer-card">
                    <h6>{f.name} <small className="text-muted">({f.profession})</small></h6>
                    <p>Email: {f.email}</p>
                    <p>Time: {f.start_time} - {f.end_time}</p>
                    <button
                      className="btn btn-success"
                      onClick={() => handleBookAppointment(f)}
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-5">
          <h5>My Appointments</h5>
          {loadingAppointments ? (
            <div className="text-center"><div className="spinner-border"></div></div>
          ) : (
            <table className="table table-hover rounded shadow-sm">
              <thead className="table-light">
                <tr>
                  <th>Freelancer</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myAppointments.length === 0 ? (
                  <tr><td colSpan="4" className="text-center">No appointments yet</td></tr>
                ) : myAppointments.map((a, i) => (
                  <tr key={i}>
                    <td>{a.freelancer_name}</td>
                    <td>{a.date}</td>
                    <td>{a.start_time}</td>
                    <td>
                      <span className={`badge ${
                        a.status === 'pending' ? 'bg-warning text-dark' :
                        a.status === 'accepted' ? 'bg-success' :
                        a.status === 'rejected' ? 'bg-danger' :
                        a.status === 'cancelled' ? 'bg-secondary' :
                        a.status === 'completed' ? 'bg-info' : 'bg-light'
                      }`}>
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Confirm Logout</h5>
            <p>Are you sure you want to log out?</p>
            <div className="d-flex justify-content-around mt-4">
              <button className="btn btn-secondary px-4" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger px-4" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
