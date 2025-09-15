const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Authenticate with Google Sheets
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'service-account.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const SHEET_ID = process.env.SHEET_ID;

// Route: Append rows
app.post('/submit', async (req, res) => {
  try {
    const { clientName, date, incoming, outgoing } = req.body;

    const timestamp = new Date().toISOString();
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
