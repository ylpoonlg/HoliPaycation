import { BrowserRouter as Router, Routes, Route, useHistory } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import PayForm from './components/PayForm/PayForm';
import PayFormSubmitted from './components/PayForm/PayFormSubmitted';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/'>
          <Route path='' element={<HomePage />} />
          <Route path=':tripId'>
            <Route path='' element={<PayForm />} />
            <Route path='records' element={<h1>Records</h1>} />
            <Route path='payments' element={<h1>Payments</h1>} />
            <Route path='submitted' element={<PayFormSubmitted />} />
          </Route>
          <Route path='*' element={<h1>404 Page Not Found</h1>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
