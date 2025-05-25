import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleSelection from './components/RoleSelection/RoleSelection';
import ClientView from './components/ClientView/ClientView';
import FreelancerView from './components/FreelancerView/FreelancerView';
import Login from './components/Login/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/client" element={<ClientView />} />
        <Route path="/freelancer" element={<FreelancerView />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;