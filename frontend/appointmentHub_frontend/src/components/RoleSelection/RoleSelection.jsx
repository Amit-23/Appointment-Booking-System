import React, { useState } from 'react';
import Header1 from '../Header1/Header1';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Login from '../Login/Login';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    
    if (selectedRole === 'client') {
      navigate('/client', { state: { role: selectedRole } });
    } else {
      navigate('/freelancer', { state: { role: selectedRole } });
    }
  };

  const getButtonText = () => {
    switch(selectedRole) {
      case 'client':
        return 'Hire a Freelancer';
      case 'freelancer':
        return 'Apply as a Freelancer';
      default:
        return 'Continue';
    }
  };

  return (
    <>
      <Header1 />
      <div className="container" style={{ marginTop: '6rem', maxWidth: '600px' }}>
        <h2 className="text-center mb-4">Join as a client or freelancer</h2>
        
        <div className="d-flex justify-content-between mb-4 gap-3">
          {/* Client Card */}
          <div 
            className={`card text-center p-4 cursor-pointer transition-all ${selectedRole === 'client' ? 'border-primary shadow glow' : ''}`}
            style={{ width: '48%' }}
            onClick={() => handleRoleSelect('client')}
          >
            <div className="card-body">
              <div className="d-flex justify-content-center mb-3">
                <div className={`radio-indicator ${selectedRole === 'client' ? 'active' : ''}`}>
                  {selectedRole === 'client' && <div className="radio-fill"></div>}
                </div>
              </div>
              <h5 className="card-title">I'm a client</h5>
              <p className="card-text text-muted">looking for a professional</p>
            </div>
          </div>

          {/* Freelancer Card */}
          <div 
            className={`card text-center p-4 cursor-pointer transition-all ${selectedRole === 'freelancer' ? 'border-primary shadow glow' : ''}`}
            style={{ width: '48%' }}
            onClick={() => handleRoleSelect('freelancer')}
          >
            <div className="card-body">
              <div className="d-flex justify-content-center mb-3">
                <div className={`radio-indicator ${selectedRole === 'freelancer' ? 'active' : ''}`}>
                  {selectedRole === 'freelancer' && <div className="radio-fill"></div>}
                </div>
              </div>
              <h5 className="card-title">I'm a freelancer</h5>
              <p className="card-text text-muted">looking for work</p>
            </div>
          </div>
        </div>

        <hr className="my-4" />

        <div className="text-center">
          <button 
            className="btn btn-primary mb-3 px-4 py-2"
            onClick={handleContinue}
            disabled={!selectedRole}
          >
            {getButtonText()}
          </button>
          <p className="text-muted">
            Already have an account? <Link to="/login" className="text-decoration-none">Log In</Link>
          </p>
        </div>

        <style jsx>{`
          .radio-indicator {
            width: 20px;
            height: 20px;
            border: 2px solid #dee2e6;
            border-radius: 50%;
            position: relative;
            transition: all 0.3s ease;
          }
          .radio-indicator.active {
            border-color: #0d6efd;
          }
          .radio-fill {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 12px;
            height: 12px;
            background: #0d6efd;
            border-radius: 50%;
          }
          .glow {
            animation: glow 0.5s ease-in-out;
          }
          @keyframes glow {
            0% { box-shadow: 0 0 0 rgba(13, 110, 253, 0); }
            50% { box-shadow: 0 0 10px rgba(13, 110, 253, 0.3); }
            100% { box-shadow: 0 0 0 rgba(13, 110, 253, 0); }
          }
          .transition-all {
            transition: all 0.3s ease;
          }
          .cursor-pointer {
            cursor: pointer;
          }
          .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </div>
    </>
  );
};

export default RoleSelection;