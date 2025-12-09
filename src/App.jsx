import './App.css'
import Landing from "./components/Landing";
import Dashboard from './components/Dashboard';
import Category from './components/category/Category';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from './components/Layout';
import Transaction from './components/transaction/Transaction';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transaction/>} />
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
