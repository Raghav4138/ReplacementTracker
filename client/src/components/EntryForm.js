// src/components/EntryForm.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

export default function EntryForm() {
  const navigate = useNavigate();

  const modelOptions = ['HF32C', 'CH2025', 'CH12032', 'CH22032', 'CH2038', 'AL2025', 'A1028', 'A1032', 'EF35A', 'DA100', 'HF32A', 'HF35A'];
  const batchOptions = ['2024', '2025', '2026'];
  const GOOGLE_SHEET_LINK = 'https://docs.google.com/spreadsheets/d/1UcjRyoDTBkbXzJOgkGb1gCtLSUk98oHxmEYxv10kwFs/edit?usp=sharing';

  // Client info
  const [clientName, setClientName] = useState("");
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allClients, setAllClients] = useState([]);
  const inputRef = useRef(null);

  const [date, setDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  // Product lines
  const [incoming, setIncoming] = useState([{ modelNo: "", batchNo: "", qty: "" }]);
  const [outgoing, setOutgoing] = useState([{ modelNo: "", batchNo: "", qty: "" }]);

  // Submission state for success screen
  const [submitted, setSubmitted] = useState(false);

  // Fetch client names on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
    try {
      const res = await axios.get(`${API_BASE}/clients`);
      const clientList = res.data.clients || res.data || [];
      setAllClients(clientList);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setAllClients([]);
    }
  };

  // Handle client name input changes
  const handleClientNameChange = (e) => {
    const value = e.target.value;
    setClientName(value);
    
    if (value.trim()) {
      const filtered = allClients.filter(client =>
        client.toLowerCase().includes(value.toLowerCase())
      );
      setClientSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion) => {
    setClientName(suggestion);
    setShowSuggestions(false);
    setClientSuggestions([]);
    // Small delay to ensure state updates before focusing
    setTimeout(() => {
      inputRef.current?.blur();
    }, 10);
  };

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.parentNode.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add new row
  const handleAddRow = (type) => {
    if (type === "in") {
      setIncoming([...incoming, { modelNo: "", batchNo: "", qty: "" }]);
    } else {
      setOutgoing([...outgoing, { modelNo: "", batchNo: "", qty: "" }]);
    }
  };

  // Change row values
  const handleChange = (type, index, field, value) => {
    const updated = type === "in" ? [...incoming] : [...outgoing];
    updated[index][field] = value;
    type === "in" ? setIncoming(updated) : setOutgoing(updated);
  };

  // Delete row
  const removeRow = (type, index) => {
    if (type === "in") {
      setIncoming(incoming.filter((_, i) => i !== index));
    } else {
      setOutgoing(outgoing.filter((_, i) => i !== index));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Keep only completely filled rows
    const validIncoming = incoming.filter(
      (item) => item.modelNo && item.batchNo && item.qty
    );
    const validOutgoing = outgoing.filter(
      (item) => item.modelNo && item.batchNo && item.qty
    );

    // Validation: at least one line
    if (validIncoming.length === 0 && validOutgoing.length === 0) {
      alert("Please fill at least one Incoming or Outgoing product line.");
      return;
    }

    const payload = {
      clientName,
      date,
      incoming: validIncoming,
      outgoing: validOutgoing,
    };

    const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

    try {
      await axios.post(`${API_BASE}/submit`, payload);
      setSubmitted(true); // show success page
      // Optional: reset form fields if needed
      setClientName("");
      setDate(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      });
      setIncoming([{ modelNo: "", batchNo: "", qty: "" }]);
      setOutgoing([{ modelNo: "", batchNo: "", qty: "" }]);
    } catch (err) {
      console.error(err);
      alert("Error submitting data!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      {!submitted ? (
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 w-full max-w-3xl">
          <div className="text-center mb-6">
            <img 
              src="/icon.png" 
              alt="Replacement Tracker Icon" 
              className="w-32 h-32 mx-auto mb-3"
            />
            <h1 className="text-2xl font-bold">Replacement Tracker</h1>
          </div>

          {/* Client Info - Stacked Layout */}
          <div className="mb-6">
            <div className="mb-4 relative">
              <label className="block mb-1 font-medium">Client Name</label>
              <input
                ref={inputRef}
                type="text"
                value={clientName}
                onChange={handleClientNameChange}
                onFocus={() => {
                  if (clientName.trim() && clientSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                className="w-full border rounded-lg p-2"
                placeholder="Type client name..."
                autoComplete="off"
              />
              
              {/* Suggestions dropdown */}
              {showSuggestions && clientSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {clientSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          {/* Incoming Products */}
          <h2 className="text-lg font-semibold mb-2">Incoming Products</h2>
          {incoming.length === 0 && (
            <p className="text-sm text-gray-500 mb-2">No incoming lines. Add one if needed.</p>
          )}
          
          {/* Headers for incoming products */}
          {incoming.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-2">
              <div className="text-sm font-medium text-gray-600">Model No</div>
              <div className="text-sm font-medium text-gray-600">Batch No</div>
              <div className="text-sm font-medium text-gray-600">Qty</div>
              <div></div>
            </div>
          )}
          
          {incoming.map((row, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 mb-2 items-center">
              <select
                value={row.modelNo}
                onChange={(e) => handleChange("in", index, "modelNo", e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="">Select Model</option>
                {modelOptions.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              <select
                value={row.batchNo}
                onChange={(e) => handleChange("in", index, "batchNo", e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="">Select Batch</option>
                {batchOptions.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Qty"
                value={row.qty}
                onChange={(e) => handleChange("in", index, "qty", e.target.value)}
                className="w-full border rounded-lg p-2"
              />
              <button
                type="button"
                onClick={() => removeRow("in", index)}
                className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200"
                aria-label={`Remove incoming line ${index + 1}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button type="button" onClick={() => handleAddRow("in")} className="text-blue-600 mb-6">
            + Add Incoming Line
          </button>

          {/* Outgoing Products */}
          <h2 className="text-lg font-semibold mb-2">Outgoing Products</h2>
          {outgoing.length === 0 && (
            <p className="text-sm text-gray-500 mb-2">No outgoing lines. Add one if needed.</p>
          )}
          
          {/* Headers for outgoing products */}
          {outgoing.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-2">
              <div className="text-sm font-medium text-gray-600">Model No</div>
              <div className="text-sm font-medium text-gray-600">Batch No</div>
              <div className="text-sm font-medium text-gray-600">Qty</div>
              <div></div>
            </div>
          )}
          
          {outgoing.map((row, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 mb-2 items-center">
              <select
                value={row.modelNo}
                onChange={(e) => handleChange("out", index, "modelNo", e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="">Select Model</option>
                {modelOptions.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              <select
                value={row.batchNo}
                onChange={(e) => handleChange("out", index, "batchNo", e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="">Select Batch</option>
                {batchOptions.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Qty"
                value={row.qty}
                onChange={(e) => handleChange("out", index, "qty", e.target.value)}
                className="w-full border rounded-lg p-2"
              />
              <button
                type="button"
                onClick={() => removeRow("out", index)}
                className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200"
                aria-label={`Remove outgoing line ${index + 1}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button type="button" onClick={() => handleAddRow("out")} className="text-blue-600 mb-6">
            + Add Outgoing Line
          </button>

          {/* Submit */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg w-full hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      ) : (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md text-center">
          <svg
            className="mx-auto h-24 w-24 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <h2 className="text-2xl font-bold mt-4 mb-6">Form Submitted</h2>
          <div className="space-y-3">
            <button
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg w-full hover:bg-gray-300"
                onClick={() => navigate('/')}
            >
                Go to Home Screen
            </button>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg w-full hover:bg-blue-700"
              onClick={() => setSubmitted(false)}
            >
              Submit Another Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}