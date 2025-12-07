import './App.css'
import Landing from "./Landing";
import Dashboard from './Dashboard';
import Category from './Category';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from './Layout';

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

      {/* <Landing />
      <Dashboard /> */}
      {/* <Category/> */}
    </>
  )
}

export default App
