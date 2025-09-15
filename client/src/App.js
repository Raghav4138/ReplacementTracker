import React, { useState } from "react";
import axios from "axios";

function App() {
  // Client info
  const [clientName, setClientName] = useState("");
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

    try {
      await axios.post("http://localhost:5000/submit", payload);
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

          {/* Client Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-1 font-medium">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
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
          {incoming.map((row, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 mb-2 items-center">
              <input
                type="text"
                placeholder="Model No"
                value={row.modelNo}
                onChange={(e) => handleChange("in", index, "modelNo", e.target.value)}
                className="border rounded-lg p-2"
              />
              <input
                type="text"
                placeholder="Batch No"
                value={row.batchNo}
                onChange={(e) => handleChange("in", index, "batchNo", e.target.value)}
                className="border rounded-lg p-2"
              />
              <input
                type="number"
                placeholder="Qty"
                value={row.qty}
                onChange={(e) => handleChange("in", index, "qty", e.target.value)}
                className="border rounded-lg p-2"
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
          {outgoing.map((row, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 mb-2 items-center">
              <input
                type="text"
                placeholder="Model No"
                value={row.modelNo}
                onChange={(e) => handleChange("out", index, "modelNo", e.target.value)}
                className="border rounded-lg p-2"
              />
              <input
                type="text"
                placeholder="Batch No"
                value={row.batchNo}
                onChange={(e) => handleChange("out", index, "batchNo", e.target.value)}
                className="border rounded-lg p-2"
              />
              <input
                type="number"
                placeholder="Qty"
                value={row.qty}
                onChange={(e) => handleChange("out", index, "qty", e.target.value)}
                className="border rounded-lg p-2"
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
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            onClick={() => setSubmitted(false)}
          >
            Go Back
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
