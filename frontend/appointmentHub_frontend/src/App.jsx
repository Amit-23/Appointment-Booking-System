import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleSelection from './components/RoleSelection/RoleSelection';
import ClientView from './components/ClientView/ClientView';
import FreelancerView from './components/FreelancerView/FreelancerView';
import Login from './components/Login/Login';
import ClientDashboard from './components/ClientDashboard/ClientDashboard';
import FreelanceDashboard from './components/FreelancerDashboard/FreelanceDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/client" element={<ClientView />} />
        <Route path="/freelancer" element={<FreelancerView />} />
        <Route path="/login" element={<Login />} />
        <Route path='/clientdashboard' element={<ClientDashboard />} />
        <Route path='/freelancerdashboard' element={<FreelanceDashboard />} />

      </Routes>
    </Router>
  );
}

export default App;