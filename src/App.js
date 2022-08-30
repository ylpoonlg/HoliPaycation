import { BrowserRouter as Router, Routes, Route, useHistory } from 'react-router-dom';
import PayForm from './components/PayForm/PayForm';
import PayFormSubmitted from './components/PayForm/PayFormSubmitted';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/'>
          <Route path='' element={<h1>Home Page</h1>} />
          <Route path=':tripId'>
            <Route path='' element={<PayForm />} />
            <Route path='records' element={<h1>Records</h1>} />
            <Route path='submitted' element={<PayFormSubmitted />} />
          </Route>
          <Route path='*' element={<h1>404 Page Not Found</h1>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
