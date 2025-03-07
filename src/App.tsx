import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RoutesPage from './pages/Routes';
import Shipments from './pages/Shipments';
import Insights from './pages/Insights';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/insights" element={<Insights />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;