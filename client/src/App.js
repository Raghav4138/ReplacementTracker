// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import EntryForm from "./components/EntryForm";
import ClientSummary from "./components/ClientSummary";
import OverallSummary from "./components/OverallSummary";




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/entry" element={<EntryForm />} />
        <Route path="/client-summary" element={<ClientSummary />} />
        <Route path="/overall-summary" element={<OverallSummary />} />
      </Routes>
    </Router>
  );
}

export default App;
