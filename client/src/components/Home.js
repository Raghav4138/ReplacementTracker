import React from "react";
import { Link } from "react-router-dom";

const GOOGLE_SHEET_LINK = 'https://docs.google.com/spreadsheets/d/1UcjRyoDTBkbXzJOgkGb1gCtLSUk98oHxmEYxv10kwFs/edit?usp=sharing';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md text-center">
        <img src="/icon.png" alt="Replacement Tracker" className="w-24 h-24 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Replacement Tracker</h1>
          <div className="space-y-3">

          <Link to="/entry" className="block bg-gray-200 text-gray-1000 px-6 py-3 rounded-lg hover:bg-gray-300">
            Submit an Entry
          </Link>

          <Link to="/client-summary" className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            View Client Summary
          </Link>
          
          <Link to="/overall-summary" className="block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
            Overall Summary
          </Link>

        <a href={GOOGLE_SHEET_LINK} target="_blank" rel="noreferrer"
             className="block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
            Open Google Sheet
          </a>

        </div>
      </div>
    </div>
  );
}
