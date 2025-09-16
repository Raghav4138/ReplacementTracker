const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const SHEET_ID = process.env.SHEET_ID;
app.use(cors());
app.use(bodyParser.json());

// Authenticate with Google Sheets
// const auth = new google.auth.GoogleAuth({
//   keyFile: path.join(__dirname, 'service-account.json'),
//   scopes: ['https://www.googleapis.com/auth/spreadsheets'],
// });

// Authenticate with Google Sheets using environment variables
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// GET /clients  -> returns unique client names
app.get('/clients', async (req, res) => {
  try {
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!B2:B' // column with client names
    });
    const values = resp.data.values || [];
    const names = values.flat().filter(Boolean);
    const unique = Array.from(new Set(names)).sort();
    res.json({ clients: unique });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /summary?client=NAME -> returns { headers: [...], rows: [...] }
app.get('/client-summary', async (req, res) => {
  const client = req.query.client;
  if (!client) return res.status(400).json({ error: 'client query param required' });

  try {
    // fetch B:G (Client, Date, Status, Model, Batch, Qty)
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!B2:G' // read from row 2 to skip headers
    });
    const rows = resp.data.values || []; // each row: [client, date, status, model, batch, qty]
    // aggregate per model
    const map = {};
    rows.forEach((r) => {
      const [clientName, , status, model, , qtyRaw] = r;
      const qty = Number(qtyRaw) || 0;
      if (!clientName || clientName !== client) return;
      if (!model) return;
      if (!map[model]) map[model] = { IN: 0, OUT: 0 };
      if (status === 'IN') map[model].IN += qty;
      else if (status === 'OUT') map[model].OUT += qty;
    });

    const headers = ['Model No', 'IN', 'OUT'];
    const resultRows = Object.keys(map).sort().map(model => [model, map[model].IN || 0, map[model].OUT || 0]);
    res.json({ headers, rows: resultRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /client-details?client=NAME -> returns detailed rows for that client
app.get('/client-details', async (req, res) => {
  const client = req.query.client;
  if (!client) return res.status(400).json({ error: 'client query param required' });

  try {
    // fetch full range including timestamp
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A2:G', // Timestamp | Client Name | Date | Status | Model No | Batch No | Qty
    });

    const rows = resp.data.values || [];

    // filter only this client's rows
    const filtered = rows.filter(r => r[1] === client);

    // map into structured format
    const resultRows = filtered.map(r => {
      const [timestamp, , date, status, model, batch, qty] = r;
      return [timestamp, date, model, batch, qty, status];
    });

    const headers = ['TimeStamp', 'Date', 'Model', 'Batch', 'Qty', 'Status'];
    res.json({ headers, rows: resultRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// fetches OverallSummary from the google sheets 
app.get("/overall-summary", async (req, res) => {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    const modelRange = "Summary Dashboard!A2:D13";
    const batchRange = "Summary Dashboard!A16:D18";

    const [modelRes, batchRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: modelRange,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: batchRange,
      }),
    ]);

    const modelData = modelRes.data.values.map((row) => ({
      modelNo: row[0],
      in: Number(row[1] || 0),
      out: Number(row[2] || 0),
      pending: Number(row[3] || 0),
    }));

    const batchData = batchRes.data.values.map((row) => ({
      batchNo: row[0],
      in: Number(row[1] || 0),
      out: Number(row[2] || 0),
      pending: Number(row[3] || 0),
    }));

    res.json({ modelSummary: modelData, batchSummary: batchData });
  } catch (err) {
    console.error("Error fetching summary:", err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});


// Route: Append rows
app.post('/submit', async (req, res) => {
  try {
    const { clientName, date, incoming, outgoing } = req.body;

    // const timestamp = new Date().toISOString();
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'numeric', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    }).replace(',', '');
    const rows = [];

    // Process incoming lines
    if (Array.isArray(incoming)) {
      incoming.forEach(item => {
        if (item.modelNo && item.batchNo && item.qty) {
          rows.push([
            timestamp,
            clientName,
            date,
            'IN',
            item.modelNo,
            item.batchNo,
            item.qty
          ]);
        }
      });
    }

    // Process outgoing lines
    if (Array.isArray(outgoing)) {
      outgoing.forEach(item => {
        if (item.modelNo && item.batchNo && item.qty) {
          rows.push([
            timestamp,
            clientName,
            date,
            'OUT',
            item.modelNo,
            item.batchNo,
            item.qty
          ]);
        }
      });
    }

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No valid rows to insert' });
    }

    // Append rows to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:G', // adjust range if your sheet name differs
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rows,
      },
    });

    res.json({ success: true, inserted: rows.length });
    } catch (err) {
    console.error('Error appending to sheet:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to append to sheet', details: err.message });
    }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on ${port}`));
