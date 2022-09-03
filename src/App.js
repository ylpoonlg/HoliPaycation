import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import CreateTripPage from './components/CreateTripPage/CreateTripPage';
import PayForm from './components/PayForm/PayForm';
import PayFormSubmitted from './components/PayForm/PayFormSubmitted';
import RecordsPage from './components/RecordsPage/RecordsPage';
import PaymentsPage from './components/PaymentsPage/PaymentsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/'>
          <Route path='' element={<HomePage />} />
          <Route path='create-trip' element={<CreateTripPage />} />
          <Route path=':tripId'>
            <Route path='' element={<PayForm />} />
            <Route path='records' element={<RecordsPage />} />
            <Route path='payments' element={<PaymentsPage />} />
            <Route path='submitted' element={<PayFormSubmitted />} />
          </Route>
          <Route path='*' element={<h1>404 Page Not Found</h1>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
