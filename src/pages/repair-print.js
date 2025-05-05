import React from 'react';
import { useParams } from 'react-router-dom';
const PrintLabel = () => {
  const { id } = useParams();
  return <div><h2>Print Label for ID: {id}</h2></div>;
};
export default PrintLabel;