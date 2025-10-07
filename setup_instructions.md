# Cable Test Log System - Node.js Version

A simple Node.js application converted from Google Apps Script for managing cable testing logs.

## Features

- **Master Data Management** - Add and track test configurations
- **Auto Log Creation** - Create test logs from master data entries
- **Manual Test Entry** - Add test entries via UI
- **ESP32 Integration** - Webhook endpoint for automated test result logging
- **No Authentication** - Simple setup for local use

## Project Structure

```
cable-test-system/
├── server.js         # Backend API (Port 4010)
├── index.html        # Frontend UI (Port 4000)
├── package.json      # Dependencies
└── data.json         # Auto-generated data file
```

## Installation

1. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/

2. **Create project directory**
   ```bash
   mkdir cable-test-system
   cd cable-test-system
   ```

3. **Save the files**
   - Save `package.json`
   - Save `server.js`
   - Save `index.html`

4. **Install dependencies**
   ```bash
   npm install
   ```

## Running the Application

### Start Backend API (Port 4010)
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### Start Frontend UI (Port 4000)

**Option 1: Using Python 3**
```bash
python -m http.server 4000
```

**Option 2: Using Node.js http-server**
```bash
npx http-server -p 4000
```

**Option 3: Using VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"
- Change port to 4000 in settings if needed

## Usage

### 1. Add Master Data
- Go to "Master Data" tab
- Fill in Tester ID, Part Number, Batch Number, MO Number, and MO Qty
- Click "Add Entry"
- Click "Create Log" to generate a test log for that MO Number

### 2. Manual Test Entry
- Go to "Manual Entry" tab
- Select an MO Number from dropdown
- Enter Operator ID and Cable Assembly S.No
- Click "Add Test Entry"
- Entry will be marked as "READY" for testing

### 3. View Test Logs
- Go to "Test Logs" tab
- View all active test logs with their entries
- See test results (White, Black, Red values)
- Track unique tested count

### 4. ESP32 Integration
The ESP32 can send test results to the webhook endpoint:

**Endpoint:** `POST http://localhost:4010/api/log-result`

**Payload:**
```json
{
  "white": "PASS",
  "black": "PASS",
  "red": "FAIL"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OK - Logged in MO 12345",
  "moNumber": "12345"
}
```

The system automatically finds the first "READY" entry across all logs and updates it with the test results.

## API Endpoints

### Master Data
- `GET /api/master-data` - Get all master data entries
- `POST /api/master-data` - Add new master data entry
- `POST /api/create-log/:index` - Create test log from master data entry

### Test Logs
- `GET /api/test-logs` - Get all test logs
- `GET /api/test-log/:moNumber` - Get specific test log
- `DELETE /api/test-log/:moNumber` - Delete test log

### Test Entries
- `POST /api/test-entry/:moNumber` - Add manual test entry
- `POST /api/log-result` - ESP32 webhook to log test results

## Data Storage

Data is stored in `data.json` file with the following structure:

```json
{
  "masterData": [
    {
      "sno": 1,
      "testerId": "T001",
      "partNumber": "PN-12345",
      "batchNumber": "B001",
      "moNumber": "MO-001",
      "moQty": 100,
      "logged": true,
      "createdAt": "2025-10-07T10:00:00.000Z"
    }
  ],
  "testLogs": {
    "MO-001": {
      "testerId": "T001",
      "partNumber": "PN-12345",
      "batchNumber": "B001",
      "moNumber": "MO-001",
      "moQty": 100,
      "createdAt": "2025-10-07T10:00:00.000Z",
      "entries": [
        {
          "opId": "OP123",
          "dutSno": "DUT-001",
          "status": "COMPLETED",
          "createdAt": "2025-10-07T10:05:00.000Z",
          "testTime": "2025-10-07T10:10:00.000Z",
          "white": "PASS",
          "black": "PASS",
          "red": "PASS"
        }
      ]
    }
  }
}
```

## ESP32 Arduino Example Code

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://YOUR_SERVER_IP:4010/api/log-result";

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}

void sendTestResults(String white, String black, String red) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    String payload = "{";
    payload += "\"white\":\"" + white + "\",";
    payload += "\"black\":\"" + black + "\",";
    payload += "\"red\":\"" + red + "\"";
    payload += "}";
    
    int httpResponseCode = http.POST(payload);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error: " + String(httpResponseCode));
    }
    
    http.end();
  }
}

void loop() {
  // Your test logic here
  // Example: Send test results
  String whiteResult = "PASS";
  String blackResult = "PASS";
  String redResult = "FAIL";
  
  sendTestResults(whiteResult, blackResult, redResult);
  
  delay(10000); // Wait 10 seconds before next test
}
```

## Differences from Google Apps Script

| Feature | Google Apps Script | Node.js Version |
|---------|-------------------|-----------------|
| Storage | Google Sheets | JSON file (data.json) |
| UI | Google Sheets UI | Web-based HTML/CSS/JS |
| Triggers | onEdit, onOpen | REST API endpoints |
| Authentication | Google OAuth | None (local use) |
| Hosting | Google Cloud | Local/Self-hosted |
| Real-time sync | Automatic | Manual refresh needed |

## Key Conversions Made

1. **onEdit trigger** → `POST /api/create-log/:index` endpoint
2. **onOpen menu** → Web-based tab navigation
3. **testLogEntry() prompt** → Web form for manual entry
4. **doPost() webhook** → `POST /api/log-result` endpoint
5. **Sheet operations** → In-memory data with JSON persistence
6. **READY flag** → Status field in entry objects

## Production Considerations

For production use, consider adding:

- **Database**: Replace JSON file with MongoDB, PostgreSQL, or MySQL
- **Authentication**: Add JWT or session-based auth
- **Validation**: Enhanced input validation and sanitization
- **Error Handling**: More robust error handling and logging
- **Rate Limiting**: Prevent API abuse
- **HTTPS**: Use SSL/TLS certificates
- **Docker**: Containerize for easier deployment
- **Environment Variables**: Use .env for configuration
- **Backup**: Automated backup of data.json

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 4010 (Backend)
lsof -ti:4010 | xargs kill -9

# Kill process on port 4000 (Frontend)
lsof -ti:4000 | xargs kill -9
```

**CORS errors:**
- Ensure backend is running on port 4010
- Check that frontend is accessing correct API URL

**Data not persisting:**
- Check write permissions in project directory
- Verify data.json is being created

**ESP32 can't connect:**
- Ensure ESP32 and server are on same network
- Use server's local IP address (not localhost)
- Check firewall settings

## License

MIT License - Free to use and modify

## Support

For issues or questions, please check:
- API is running: `http://localhost:4010/api/master-data`
- Frontend is accessible: `http://localhost:4000`
- Data file exists: `data.json` in project root