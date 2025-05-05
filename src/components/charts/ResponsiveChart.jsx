import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const ResponsiveChart = ({ data, type = 'bar' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={!isMobile}
              label={!isMobile ? ({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)` : null}
              outerRadius={isMobile ? 80 : 120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || theme.palette.primary.main} />
              ))}
            </Pie>
            <Tooltip />
            {!isMobile && <Legend />}
          </PieChart>
        );
      
      case 'bar':
      default:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              height={isMobile ? 80 : 60}
            />
            <YAxis />
            <Tooltip />
            {!isMobile && <Legend />}
            <Bar dataKey="value" fill={theme.palette.primary.main} />
          </BarChart>
        );
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {renderChart()}
    </ResponsiveContainer>
  );
}; 