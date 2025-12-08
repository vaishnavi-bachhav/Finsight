import './App.css'
import Landing from "./components/Landing";
import Dashboard from './components/Dashboard';
import Category from './components/Category';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from './components/Layout';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" />
            <Route path="category" element={<Category />} />
          </Route>
        </Routes>
      </Router>

<Landing/>
      {/* <Landing />
      <Dashboard /> */}
      {/* <Category/> */}
    </>
  )
}

export default App
