const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4010;

app.use(cors());
app.use(express.json());

// In-memory data store (replace with database in production)
let masterData = [];
let testLogs = {}; // key: moNumber, value: array of test entries

// Load data from file if exists
const DATA_FILE = path.join(__dirname, 'data.json');
const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      masterData = data.masterData || [];
      testLogs = data.testLogs || {};
    }
  } catch (err) {
    console.error('Error loading data:', err);
  }
};

const saveData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ masterData, testLogs }, null, 2));
  } catch (err) {
    console.error('Error saving data:', err);
  }
};

loadData();

// Get all master data entries
app.get('/api/master-data', (req, res) => {
  res.json(masterData);
});

// Add new master data entry
app.post('/api/master-data', (req, res) => {
  const { testerId, partNumber, batchNumber, moNumber, moQty } = req.body;
  
  if (!testerId || !partNumber || !batchNumber || !moNumber || !moQty) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const entry = {
    sno: masterData.length + 1,
    testerId,
    partNumber,
    batchNumber,
    moNumber,
    moQty,
    logged: false,
    createdAt: new Date().toISOString()
  };

  masterData.push(entry);
  saveData();
  res.json(entry);
});

// Create test log from master data
app.post('/api/create-log/:index', (req, res) => {
  const index = parseInt(req.params.index);
  
  if (index < 0 || index >= masterData.length) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  const entry = masterData[index];
  const moNumber = entry.moNumber;

  // Check if log already exists
  if (testLogs[moNumber]) {
    return res.status(409).json({ 
      error: 'Log already exists',
      message: 'This MO Number was already logged. Do you want to create a copy?'
    });
  }

  // Create new test log
  testLogs[moNumber] = {
    testerId: entry.testerId,
    partNumber: entry.partNumber,
    batchNumber: entry.batchNumber,
    moNumber: entry.moNumber,
    moQty: entry.moQty,
    createdAt: new Date().toISOString(),
    entries: []
  };

  entry.logged = true;
  saveData();
  res.json({ success: true, moNumber });
});

// Get all test logs
app.get('/api/test-logs', (req, res) => {
  res.json(testLogs);
});

// Get specific test log
app.get('/api/test-log/:moNumber', (req, res) => {
  const moNumber = req.params.moNumber;
  
  if (!testLogs[moNumber]) {
    return res.status(404).json({ error: 'Test log not found' });
  }

  res.json(testLogs[moNumber]);
});

// Add manual test entry
app.post('/api/test-entry/:moNumber', (req, res) => {
  const moNumber = req.params.moNumber;
  const { opId, dutSno } = req.body;

  if (!opId || !dutSno) {
    return res.status(400).json({ error: 'OP ID and Cable Assembly S.No are required' });
  }

  if (!testLogs[moNumber]) {
    return res.status(404).json({ error: 'Test log not found' });
  }

  const entry = {
    opId,
    dutSno,
    status: 'READY',
    createdAt: new Date().toISOString(),
    testTime: null,
    white: null,
    black: null,
    red: null
  };

  testLogs[moNumber].entries.push(entry);
  saveData();
  res.json({ success: true, entry });
});

// ESP32 webhook - Log test results
app.post('/api/log-result', (req, res) => {
  const { white, black, red } = req.body;

  // Find first READY entry across all logs
  let foundLog = null;
  let foundEntry = null;

  for (const moNumber in testLogs) {
    const log = testLogs[moNumber];
    const readyEntry = log.entries.find(e => e.status === 'READY');
    
    if (readyEntry) {
      foundLog = moNumber;
      foundEntry = readyEntry;
      break;
    }
  }

  if (!foundEntry) {
    return res.status(404).json({ error: 'No DUT S.No. ready for test' });
  }

  // Update entry with test results
  foundEntry.testTime = new Date().toISOString();
  foundEntry.white = white || '';
  foundEntry.black = black || '';
  foundEntry.red = red || '';
  foundEntry.status = 'COMPLETED';

  saveData();
  res.json({ 
    success: true, 
    message: `OK - Logged in MO ${foundLog}`,
    moNumber: foundLog
  });
});

// Delete test log
app.delete('/api/test-log/:moNumber', (req, res) => {
  const moNumber = req.params.moNumber;
  
  if (!testLogs[moNumber]) {
    return res.status(404).json({ error: 'Test log not found' });
  }

  delete testLogs[moNumber];
  saveData();
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Cable Test API running on http://localhost:${PORT}`);
});