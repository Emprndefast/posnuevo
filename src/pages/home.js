import React from 'react';
import { Link } from 'react-router-dom';
const Home = () => (
  <div>
    <h2>Welcome to Repair POS</h2>
    <Link to='/new'>New Repair</Link>
    <br/>
    <Link to='/list'>Repair List</Link>
  </div>
);
export default Home;