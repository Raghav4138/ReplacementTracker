import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

function OverallSummary() {
  const [modelData, setModelData] = useState([]);
  const [batchData, setBatchData] = useState([]);
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both summary tables from backend
        const res = await axios.get(`${API_BASE}/overall-summary`);
        setModelData(res.data.modelSummary);
        setBatchData(res.data.batchSummary);
      } catch (err) {
        console.error("Error fetching summary:", err);
      }
    };
    fetchData();
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

return (
  <div className="min-h-screen bg-gray-100 p-6 flex items-start justify-center">
    <div className="w-full max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Overall Summary</h1>
        <div className="flex gap-2">
          <Link to="/" className="px-4 py-2 bg-gray-200 rounded">Home</Link>
          {/* <Link to="/entry" className="px-4 py-2 bg-green-600 text-white rounded">Submit Entry</Link> */}
        </div>
      </div>

      <div className="bg-white shadow rounded p-6">
        {/* Model Summary Table */}
        <h2 className="text-lg font-semibold mb-2">By Model No</h2>
        <table className="w-full border mb-8">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border p-2">Model No</th>
              <th className="border p-2">IN</th>
              <th className="border p-2">OUT</th>
              <th className="border p-2">Pending</th>
            </tr>
          </thead>
          <tbody>
            {modelData.map((row, idx) => (
              <tr key={idx}>
                <td className="border p-2">{row.modelNo}</td>
                <td className="border p-2">{row.in}</td>
                <td className="border p-2">{row.out}</td>
                <td className="border p-2">{row.pending}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Batch Summary Table */}
        <h2 className="text-lg font-semibold mb-2">By Batch No</h2>
        <table className="w-full border mb-8">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border p-2">Batch No</th>
              <th className="border p-2">IN</th>
              <th className="border p-2">OUT</th>
              <th className="border p-2">Pending</th>
            </tr>
          </thead>
          <tbody>
            {batchData.map((row, idx) => (
              <tr key={idx}>
                <td className="border p-2">{row.batchNo}</td>
                <td className="border p-2">{row.in}</td>
                <td className="border p-2">{row.out}</td>
                <td className="border p-2">{row.pending}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* chart 1 */}
          <div className="h-96">
            <h2 className="text-lg font-semibold mb-2 text-center">Model No vs Incoming</h2>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={modelData}
                  dataKey="in"
                  nameKey="modelNo"
                  outerRadius={120}
                  fill="#8884d8"
                  label
                >
                  {modelData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* chart 2 */}
          <div className="h-96">
            <h2 className="text-lg font-semibold mb-2 text-center">Batch No vs Incoming</h2>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={batchData}
                  dataKey="in"
                  nameKey="batchNo"
                  outerRadius={120}
                  fill="#82ca9d"
                  label
                >
                  {batchData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* White space below charts */}
        <div className="h-32"></div>
    
      </div>
    </div>
  </div>
);
}

export default OverallSummary;
