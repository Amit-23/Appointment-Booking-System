

// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from "./components/Register/Register"
import RoleSelection from './components/RoleSelection/RoleSelection';
import ClientView from './components/ClientView/ClientView';
import FreelancerView from './components/FreelancerView/FreelancerView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/client" element={<ClientView />} />
        <Route path="/freelancer" element={<FreelancerView />} />
      </Routes>
    </Router>
  );
}

export default App;