// src/components/ClientSummary.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function ClientSummary() {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState("");
  const [table, setTable] = useState({ headers: [], rows: [] });
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);

  useEffect(() => { fetchClients(); }, []);

  async function fetchClients() {
    try {
      const res = await axios.get(`${API_BASE}/clients`);
      const list = res.data.clients || res.data || [];
      setClients(list);
      if (list.length) setSelected(list[0]);
    } catch (err) {
      console.error(err);
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  }

  useEffect(() => {
    if (selected) fetchSummary(selected);
  }, [selected]);

  async function fetchSummary(client) {
    setLoadingTable(true);
    try {
      const res = await axios.get(`${API_BASE}/summary`, { params: { client } });
      // expected: { headers: [...], rows: [[model,in,out], ...] }
      if (res.data.headers && res.data.rows) {
        setTable({ headers: res.data.headers, rows: res.data.rows });
      } else if (Array.isArray(res.data)) {
        // fallback if backend returns a plain 2D array
        const [headers, ...rows] = res.data;
        setTable({ headers: headers || [], rows: rows || [] });
      } else {
        setTable({ headers: [], rows: [] });
      }
    } catch (err) {
      console.error(err);
      setTable({ headers: [], rows: [] });
    } finally {
      setLoadingTable(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-start justify-center">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Client Summary</h1>
          <div className="flex gap-2">
            <Link to="/" className="px-4 py-2 bg-gray-200 rounded">Home</Link>
            <Link to="/entry" className="px-4 py-2 bg-green-600 text-white rounded">Submit Entry</Link>
          </div>
        </div>

        <div className="bg-white shadow rounded p-4">
          <label className="block mb-2 font-medium">Select Client</label>
          {loadingClients ? (
            <p>Loading clients...</p>
          ) : (
            <select value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full border rounded p-2 mb-4">
              {clients.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          {loadingTable ? (
            <p>Loading summary...</p>
          ) : table.rows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr>
                    {table.headers.map((h, i) => <th key={i} className="border px-3 py-2 text-left">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((r, ri) => (
                    <tr key={ri}>
                      {r.map((cell, ci) => <td key={ci} className="border px-3 py-2">{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No records for this client.</p>
          )}
        </div>
      </div>
    </div>
  );
}
