// src/components/ClientSummary.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function ClientSummary() {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState("");
  const [table, setTable] = useState({ headers: [], rows: [] });
  const [details, setDetails] = useState({ headers: [], rows: [] });
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
    if (selected) {
      fetchSummary(selected);
      if (showDetails) fetchDetails(selected);
    }
  }, [selected]);

  async function fetchSummary(client) {
    setLoadingTable(true);
    try {
      const res = await axios.get(`${API_BASE}/client-summary`, { params: { client } });
      if (res.data.headers && res.data.rows) {
        setTable({ headers: res.data.headers, rows: res.data.rows });
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

  async function fetchDetails(client) {
    setLoadingDetails(true);
    try {
      const res = await axios.get(`${API_BASE}/client-details`, { params: { client } });
      if (res.data.headers && res.data.rows) {
        setDetails({ headers: res.data.headers, rows: res.data.rows });
      } else {
        setDetails({ headers: [], rows: [] });
      }
    } catch (err) {
      console.error(err);
      setDetails({ headers: [], rows: [] });
    } finally {
      setLoadingDetails(false);
    }
  }

  function toggleDetails() {
    if (!showDetails) {
      fetchDetails(selected);
    }
    setShowDetails(!showDetails);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-start justify-center">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Client Summary</h1>
          <div className="flex gap-2">
            <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded">Home</Link>
          </div>
        </div>

        <div className="bg-white shadow rounded p-4 mb-6">
          <label className="block mb-2 font-medium">Select Client</label>
          {loadingClients ? (
            <p>Loading clients...</p>
          ) : (
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full border rounded p-2 mb-4"
            >
              {clients.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          {loadingTable ? (
            <p>Loading summary...</p>
          ) : table.rows.length ? (
            <div className="overflow-x-auto mb-4">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr>
                    {table.headers.map((h, i) => (
                      <th key={i} className="border px-3 py-2 bg-gray-200 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((r, ri) => (
                    <tr key={ri}>
                      {r.map((cell, ci) => (
                        <td key={ci} className="border px-3 py-2">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No records for this client.</p>
          )}

          <button
            onClick={toggleDetails}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            {showDetails ? "Hide Detailed Client Entries" : "Show Detailed Client Entries"}
          </button>

            {showDetails && (
            <div className="mt-4">
                {loadingDetails ? (
                <p>Loading detailed entries...</p>
                ) : details.rows.length ? (
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr>
                        <th className="border px-3 py-2 bg-gray-200 text-left">TimeStamp</th>
                        <th className="border px-3 py-2 bg-gray-200 text-left">Client</th>
                        <th className="border px-3 py-2 bg-gray-200 text-left">Date</th>
                        <th className="border px-3 py-2 bg-gray-200 text-left">Status</th>
                        <th className="border px-3 py-2 bg-gray-200 text-left">Model</th>
                        <th className="border px-3 py-2 bg-gray-200 text-left">Batch</th>
                        <th className="border px-3 py-2 bg-gray-200 text-left">Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {details.rows.map((r, ri) => (
                        <tr key={ri}>
                            <td className="border px-3 py-2">{r[0]}</td> {/* TimeStamp */}
                            <td className="border px-3 py-2">{selected}</td> {/* Client */}
                            <td className="border px-3 py-2">{r[1]}</td> {/* Date */}
                            <td className="border px-3 py-2">{r[5]}</td> {/* Status */}
                            <td className="border px-3 py-2">{r[2]}</td> {/* Model */}
                            <td className="border px-3 py-2">{r[3]}</td> {/* Batch */}
                            <td className="border px-3 py-2">{r[4]}</td> {/* Qty */}
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                ) : (
                <p>No detailed records for this client.</p>
                )}
            </div>
            )}


        </div>
      </div>
    </div>
  );
}
