import React, { useState, useEffect, useRef } from 'react';
import {
  FaBars,
  FaUser,
  FaCalendarAlt,
  FaUserCog,
  FaTachometerAlt,
  FaStar,
  FaClock,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaComments
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


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
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    profession: '',
    experience: '',
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentChatAppointment, setCurrentChatAppointment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const tokens = JSON.parse(localStorage.getItem('tokens'));

      if (!user || !tokens?.access) {
        navigate('/login');
        return;
      }

      axios.get('http://127.0.0.1:8000/auth/verify-token/', {
        headers: {
          'Authorization': `Bearer ${tokens.access}`
        }
      }).catch(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('tokens');
        navigate('/login');
      });

      if (user.role !== 'freelancer') {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  // Load initial data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'freelancer') return;

    setProfileData({
      name: user.name,
      email: user.email,
      profession: user.profession || '',
      experience: user.experience || '',
      bio: user.bio || ''
    });

    fetchAppointments(user.id);
    fetchAvailabilities(user.id);
  }, []);

  // WebSocket connection management
 useEffect(() => {
  if (selectedSection === 'chat' && currentChatAppointment) {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/chat/${currentChatAppointment.appointment_id}/`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      console.log('WebSocket connected');
      fetchChatMessages(currentChatAppointment.appointment_id);
    };

    newSocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages(prev => [...prev, data]);
      scrollToBottom();
    };

    newSocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(newSocket);

    return () => {
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }
}, [selectedSection, currentChatAppointment]);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchAppointments = (freelancerId) => {
    axios
      .get('http://127.0.0.1:8000/auth/freelancer-appointments/', {
        params: { freelancer_id: freelancerId },
      })
      .then((res) => {
        if (res.data.success) {
          setAppointments(res.data.appointments);
          const completedEarnings = res.data.appointments
            .filter(a => a.status === 'completed')
            .reduce((sum, appt) => sum + (appt.price || 0), 0);
          setEarnings(completedEarnings);
        }
      })
      .catch((err) => console.error('Failed to fetch appointments:', err));
  };

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

  const fetchChatMessages = (appointmentId) => {
    axios
      .get(`http://127.0.0.1:8000/chat/messages/?appointment_id=${appointmentId}`)
      .then((res) => {
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      })
      .catch((err) => console.error('Failed to fetch messages:', err));
  };

  const handleLogout = () => {
    if (socket) socket.close();
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    window.location.href = '/login';
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

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'freelancer') {
      alert('User not authenticated or not a freelancer');
      return;
    }

    axios
      .post('http://127.0.0.1:8000/auth/update-profile/', {
        user_id: user.id,
        profession: profileData.profession,
        experience: profileData.experience,
        bio: profileData.bio
      })
      .then((res) => {
        if (res.data.success) {
          alert('Profile updated successfully');
          setIsEditing(false);
          const updatedUser = {
            ...user,
            profession: profileData.profession,
            experience: profileData.experience,
            bio: profileData.bio
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      })
      .catch((err) => {
        console.error(err);
        alert('Error updating profile');
      });
  };

  const sendMessage = () => {
  if (socket && socket.readyState === WebSocket.OPEN && newMessage.trim()) {
    socket.send(JSON.stringify({
      message: newMessage.trim(),
      sender: profileData.name,
      timestamp: new Date().toISOString()
    }));
    setNewMessage('');
  }
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const startChat = (appointment) => {
    if (appointment.status === 'accepted') {
      setCurrentChatAppointment(appointment);
      setSelectedSection('chat');
    } else {
      alert('You can only chat with clients for accepted appointments');
    }
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
        .logout-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }
        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 400px;
          width: 100%;
        }
        .chat-message-container {
          height: 400px;
          overflow-y: auto;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 15px;
        }
        .message-bubble {
          max-width: 70%;
          padding: 8px 12px;
          border-radius: 18px;
          margin-bottom: 8px;
          word-wrap: break-word;
        }
        .sent-message {
          background-color: #0d6efd;
          color: white;
          margin-left: auto;
          border-bottom-right-radius: 4px;
        }
        .received-message {
          background-color: #e9ecef;
          color: #212529;
          margin-right: auto;
          border-bottom-left-radius: 4px;
        }
        .message-sender {
          font-size: 0.8rem;
          font-weight: bold;
          margin-bottom: 2px;
        }
        .message-time {
          font-size: 0.7rem;
          color: #6c757d;
          text-align: right;
        }
      `}</style>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Confirm Logout</h5>
            <p>Are you sure you want to logout?</p>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <button 
        className="logout-btn btn btn-danger d-flex align-items-center gap-2"
        onClick={() => setShowLogoutModal(true)}
      >
        <FaSignOutAlt /> Logout
      </button>

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
              <a className={`nav-link ${selectedSection === 'chat' ? 'active' : ''}`} onClick={() => {
                if (currentChatAppointment) {
                  setSelectedSection('chat');
                } else {
                  alert('Please select an accepted appointment to chat');
                }
              }}>
                <FaComments />
                <span className="nav-label">Chat</span>
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
                
                <div className="col-md-3">
                  <div className="card bg-secondary text-white p-3">
                    <h6>Accepted</h6>
                    <h3>{acceptedAppointments}</h3>
                    <small>Upcoming sessions</small>
                  </div>
                </div>
                
                <div className="col-md-3">
                  <div className="card bg-success text-white p-3">
                    <h6>Earnings</h6>
                    <h3>${earnings}</h3>
                    <small>Total earned</small>
                  </div>
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Upcoming Appointments</h5>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedSection('appointments')}>
                    View All
                  </button>
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
                        <div>
                          <span className="badge bg-success me-2">
                            Accepted
                          </span>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => startChat(appt)}
                          >
                            Chat
                          </button>
                        </div>
                      </div>
                    ))}
                  {appointments.filter(a => a.status === 'accepted').length === 0 && (
                    <div className="text-center py-3 text-muted">
                      No upcoming appointments
                    </div>
                  )}
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
                      <button 
                        className="btn btn-outline-info w-100 d-flex flex-column align-items-center py-3"
                        onClick={() => setSelectedSection('chat')}
                      >
                        <FaComments size={24} className="mb-2" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedSection === 'profile' && (
            <div className="mt-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">My Profile</h5>
                  {isEditing ? (
                    <div>
                      <button className="btn btn-sm btn-success me-2" onClick={handleProfileUpdate}>
                        Save Changes
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => setIsEditing(false)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-sm btn-primary" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </button>
                  )}
                </div>
                <div className="card-body">
                  <div className="row mb-4">
                    <div className="col-md-2">
                      <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" 
                           style={{ width: '100px', height: '100px', fontSize: '2rem' }}>
                        {profileData.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="col-md-10">
                      <h3>{profileData.name}</h3>
                      <p className="text-muted">{profileData.email}</p>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Profession</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-control"
                            name="profession"
                            value={profileData.profession}
                            onChange={handleProfileChange}
                          />
                        ) : (
                          <p>{profileData.profession || 'Not specified'}</p>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Experience</label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-control"
                            name="experience"
                            value={profileData.experience}
                            onChange={handleProfileChange}
                          />
                        ) : (
                          <p>{profileData.experience || 'Not specified'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Bio</label>
                    {isEditing ? (
                      <textarea
                        className="form-control"
                        rows="5"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                      />
                    ) : (
                      <p>{profileData.bio || 'No bio provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

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
                    <th>Actions</th>
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
                          ) : appt.status === 'accepted' ? (
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => startChat(appt)}
                            >
                              Chat
                            </button>
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

          {selectedSection === 'chat' && (
            <div className="mt-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    {currentChatAppointment ? 
                      `Chat with ${currentChatAppointment.client_name}` : 
                      'Select an appointment to chat'}
                  </h5>
                  {currentChatAppointment && (
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setSelectedSection('appointments')}
                    >
                      Back to Appointments
                    </button>
                  )}
                </div>
                
                {currentChatAppointment ? (
                  <>
                    <div className="card-body">
                      <div className="chat-message-container">
                        {messages.length === 0 ? (
                          <p className="text-center text-muted">No messages yet. Start the conversation!</p>
                        ) : (
                          messages.map((msg, idx) => (
                            <div 
                              key={idx} 
                              className={`message-bubble ${
                                msg.sender === profileData.name ? 'sent-message' : 'received-message'
                              }`}
                            >
                              <div className="message-sender">
                                {msg.sender === profileData.name ? 'You' : msg.sender}
                              </div>
                              <div>{msg.message}</div>
                              <div className="message-time">
                                {msg.timestamp}
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type your message..."
                        />
                        <button 
                          className="btn btn-primary" 
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="card-body text-center">
                    <p>Please select an accepted appointment from the Appointments section to start chatting.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setSelectedSection('appointments')}
                    >
                      Go to Appointments
                    </button>
                  </div>
                )}
              </div>
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