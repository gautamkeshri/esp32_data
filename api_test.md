# Cable Test System - API Testing Guide

Complete CURL commands for testing all API endpoints.

## Prerequisites

- Backend server running on `http://localhost:4010`
- CURL installed (comes with most systems)
- Optional: `jq` for pretty JSON output (`brew install jq` or `apt install jq`)

---

## 📊 Master Data Endpoints

### 1. Get All Master Data
**Endpoint:** `GET /api/master-data`

```bash
curl http://localhost:4010/api/master-data
```

**Expected Response:**
```json
[
  {
    "sno": 1,
    "testerId": "T001",
    "partNumber": "PN-12345",
    "batchNumber": "B001",
    "moNumber": "MO-001",
    "moQty": 100,
    "logged": false,
    "createdAt": "2025-10-07T10:00:00.000Z"
  }
]
```

---

### 2. Add New Master Data Entry
**Endpoint:** `POST /api/master-data`

```bash
curl -X POST http://localhost:4010/api/master-data \
  -H "Content-Type: application/json" \
  -d '{
    "testerId": "T001",
    "partNumber": "PN-12345",
    "batchNumber": "B001",
    "moNumber": "MO-001",
    "moQty": 100
  }'
```

**Windows (CMD):**
```cmd
curl -X POST http://localhost:4010/api/master-data -H "Content-Type: application/json" -d "{\"testerId\":\"T001\",\"partNumber\":\"PN-12345\",\"batchNumber\":\"B001\",\"moNumber\":\"MO-001\",\"moQty\":100}"
```

**PowerShell:**
```powershell
curl -Method POST -Uri http://localhost:4010/api/master-data -Headers @{"Content-Type"="application/json"} -Body '{"testerId":"T001","partNumber":"PN-12345","batchNumber":"B001","moNumber":"MO-001","moQty":100}'
```

**Expected Response:**
```json
{
  "sno": 1,
  "testerId": "T001",
  "partNumber": "PN-12345",
  "batchNumber": "B001",
  "moNumber": "MO-001",
  "moQty": 100,
  "logged": false,
  "createdAt": "2025-10-07T10:00:00.000Z"
}
```

**Error Response (Missing Fields):**
```json
{
  "error": "All fields are required"
}
```

---

### 3. Create Test Log from Master Data
**Endpoint:** `POST /api/create-log/:index`

```bash
# Create log from first master data entry (index 0)
curl -X POST http://localhost:4010/api/create-log/0
```

```bash
# Create log from second entry (index 1)
curl -X POST http://localhost:4010/api/create-log/1
```

**Expected Response:**
```json
{
  "success": true,
  "moNumber": "MO-001"
}
```

**Error Response (Already Exists):**
```json
{
  "error": "Log already exists",
  "message": "This MO Number was already logged. Do you want to create a copy?"
}
```

**Error Response (Invalid Index):**
```json
{
  "error": "Entry not found"
}
```

---

## 📋 Test Log Endpoints

### 4. Get All Test Logs
**Endpoint:** `GET /api/test-logs`

```bash
curl http://localhost:4010/api/test-logs
```

**With Pretty Print:**
```bash
curl http://localhost:4010/api/test-logs | jq
```

**Expected Response:**
```json
{
  "MO-001": {
    "testerId": "T001",
    "partNumber": "PN-12345",
    "batchNumber": "B001",
    "moNumber": "MO-001",
    "moQty": 100,
    "createdAt": "2025-10-07T10:00:00.000Z",
    "entries": []
  }
}
```

---

### 5. Get Specific Test Log
**Endpoint:** `GET /api/test-log/:moNumber`

```bash
curl http://localhost:4010/api/test-log/MO-001
```

**Expected Response:**
```json
{
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
      "status": "READY",
      "createdAt": "2025-10-07T10:05:00.000Z",
      "testTime": null,
      "white": null,
      "black": null,
      "red": null
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "Test log not found"
}
```

---

### 6. Delete Test Log
**Endpoint:** `DELETE /api/test-log/:moNumber`

```bash
curl -X DELETE http://localhost:4010/api/test-log/MO-001
```

**Expected Response:**
```json
{
  "success": true
}
```

---

## 🔧 Test Entry Endpoints

### 7. Add Manual Test Entry
**Endpoint:** `POST /api/test-entry/:moNumber`

```bash
curl -X POST http://localhost:4010/api/test-entry/MO-001 \
  -H "Content-Type: application/json" \
  -d '{
    "opId": "OP123",
    "dutSno": "DUT-001"
  }'
```

**Windows (CMD):**
```cmd
curl -X POST http://localhost:4010/api/test-entry/MO-001 -H "Content-Type: application/json" -d "{\"opId\":\"OP123\",\"dutSno\":\"DUT-001\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "entry": {
    "opId": "OP123",
    "dutSno": "DUT-001",
    "status": "READY",
    "createdAt": "2025-10-07T10:05:00.000Z",
    "testTime": null,
    "white": null,
    "black": null,
    "red": null
  }
}
```

**Error Response (Missing Fields):**
```json
{
  "error": "OP ID and Cable Assembly S.No are required"
}
```

**Error Response (Log Not Found):**
```json
{
  "error": "Test log not found"
}
```

---

## 🤖 ESP32 Webhook Endpoint

### 8. Log Test Results (ESP32 Integration)
**Endpoint:** `POST /api/log-result`

```bash
curl -X POST http://localhost:4010/api/log-result \
  -H "Content-Type: application/json" \
  -d '{
    "white": "PASS",
    "black": "PASS",
    "red": "PASS"
  }'
```

**With Different Results:**
```bash
# All Pass
curl -X POST http://localhost:4010/api/log-result \
  -H "Content-Type: application/json" \
  -d '{"white": "PASS", "black": "PASS", "red": "PASS"}'

# One Failure
curl -X POST http://localhost:4010/api/log-result \
  -H "Content-Type: application/json" \
  -d '{"white": "PASS", "black": "FAIL", "red": "PASS"}'

# Multiple Failures
curl -X POST http://localhost:4010/api/log-result \
  -H "Content-Type: application/json" \
  -d '{"white": "FAIL", "black": "FAIL", "red": "PASS"}'

# Numeric Values
curl -X POST http://localhost:4010/api/log-result \
  -H "Content-Type: application/json" \
  -d '{"white": "3.45V", "black": "3.42V", "red": "0.01V"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OK - Logged in MO MO-001",
  "moNumber": "MO-001"
}
```

**Error Response (No Ready Entry):**
```json
{
  "error": "No DUT S.No. ready for test"
}
```

---

## 🎬 Complete Workflow Test

### Scenario 1: Basic Workflow

```bash
# Step 1: Add master data
echo "Step 1: Adding master data..."
curl -X POST http://localhost:4010/api/master-data \
  -H "Content-Type: application/json" \
  -d '{
    "testerId": "T001",
    "partNumber": "PN-12345",
    "batchNumber": "B001",
    "moNumber": "MO-001",
    "moQty": 100
  }'

echo -e "\n\nStep 2: Creating test log..."
# Step 2: Create test log
curl -X POST http://localhost:4010/api/create-log/0

echo -e "\n\nStep 3: Adding test entry..."
# Step 3: Add test entry
curl -X POST http://localhost:4010/api/test-entry/MO-001 \
  -H "Content-Type: application/json" \
  -d '{
    "opId": "OP123",
    "dutSno": "DUT-001"
  }'

echo -e "\n\nStep 4: Logging test results..."
# Step 4: Log test results
curl -X POST http://localhost:4010/api/log-result \
  -H "Content-Type: application/json" \
  -d '{
    "white": "PASS",
    "black": "PASS",
    "red": "PASS"
  }'

echo -e "\n\nStep 5: Viewing results..."
# Step 5: View results
curl http://localhost:4010/api/test-log/MO-001 | jq
```

---

### Scenario 2: Multiple Test Entries

```bash
# Create multiple test entries
echo "Adding test entry 1..."
curl -X POST http://localhost:4010/api/test-entry/MO-001 \
  -H "Content-Type: application/json" \
  -d '{"opId": "OP123", "dutSno": "DUT-001"}'

echo -e "\n\nAdding test entry 2..."
curl -X POST http://localhost:4010/api/test-entry/MO-001 \
  -H "Content-Type: application/json" \
  -d '{"opId": "OP124", "dutSno": "DUT-002"}'

echo -e "\n\nAdding test entry 3..."
curl -X POST http://localhost:4010/api/test-entry/MO-001 \
  -H "Content-Type: application/json" \
  -d '{"opId": "OP125", "dutSno": "DUT-003"}'

# Log results for each
echo -e "\n\nLogging result 1..."
curl -X POST http://localhost:4010/api/log-result \
  -H "Content-Type: application/json" \
  -d '{"white": "PASS", "black": "PASS", "red": "PASS"}'

echo -e "\n\nLogging result 2..."
curl -X POST http://localhost:4010/api/log-result \
  -H "Content-Type: application/json" \
  -d '{"white": "PASS", "black": "FAIL", "red": "PASS"}'

echo -e "\n\nLogging result 3..."
curl -X POST http://localhost:4010/api/log-result \
  -H "Content-Type: application/json" \
  -d '{"white": "FAIL", "black": "PASS", "red": "PASS"}'

# View final results
echo -e "\n\nFinal results:"
curl http://localhost:4010/api/test-log/MO-001 | jq
```

---

### Scenario 3: Multiple MO Numbers

```bash
# Add multiple master data entries
echo "Adding MO-001..."
curl -X POST http://localhost:4010/api/master-data \
  -H "Content-Type: application/json" \
  -d '{"testerId":"T001","partNumber":"PN-001","batchNumber":"B001","moNumber":"MO-001","moQty":50}'

echo -e "\n\nAdding MO-002..."
curl -X POST http://localhost:4010/api/master-data \
  -H "Content-Type: application/json" \
  -d '{"testerId":"T002","partNumber":"PN-002","batchNumber":"B002","moNumber":"MO-002","moQty":75}'

echo -e "\n\nAdding MO-003..."
curl -X POST http://localhost:4010/api/master-data \
  -H "Content-Type: application/json" \
  -d '{"testerId":"T003","partNumber":"PN-003","batchNumber":"B003","moNumber":"MO-003","moQty":100}'

# Create logs
echo -e "\n\nCreating logs..."
curl -X POST http://localhost:4010/api/create-log/0
curl -X POST http://localhost:4010/api/create-log/1
curl -X POST http://localhost:4010/api/create-log/2

# Add test entries to each
echo -e "\n\nAdding test entries..."
curl -X POST http://localhost:4010/api/test-entry/MO-001 \
  -H "Content-Type: application/json" \
  -d '{"opId":"OP123","dutSno":"DUT-001"}'

curl -X POST http://localhost:4010/api/test-entry/MO-002 \
  -H "Content-Type: application/json" \
  -d '{"opId":"OP124","dutSno":"DUT-002"}'

curl -X POST http://localhost:4010/api/test-entry/MO-003 \
  -H "Content-Type: application/json" \
  -d '{"opId":"OP125","dutSno":"DUT-003"}'

# View all logs
echo -e "\n\nAll test logs:"
curl http://localhost:4010/api/test-logs | jq
```

---

## 🔍 Advanced Testing

### Check API Health
```bash
# Quick health check
curl -I http://localhost:4010/api/master-data
```

### Verbose Output (Debugging)
```bash
curl -v -X POST http://localhost:4010/api/log-result \
  -H "Content-Type: application/json" \
  -d '{"white":"PASS","black":"PASS","red":"PASS"}'
```

### Save Response to File
```bash
# Save all test logs
curl http://localhost:4010/api/test-logs > test-logs.json

# Save specific log
curl http://localhost:4010/api/test-log/MO-001 > mo-001.json
```

### Test Response Time
```bash
# Measure response time
curl -w "\nTime: %{time_total}s\n" http://localhost:4010/api/test-logs
```

### Loop Test (Stress Testing)
```bash
# Add 10 test entries
for i in {1..10}; do
  curl -X POST http://localhost:4010/api/test-entry/MO-001 \
    -H "Content-Type: application/json" \
    -d "{\"opId\":\"OP$i\",\"dutSno\":\"DUT-00$i\"}"
  echo "Entry $i added"
  sleep 1
done
```

---

## 📝 Testing Checklist

- [ ] Add master data entry
- [ ] Create test log
- [ ] Add manual test entry
- [ ] Log test results via webhook
- [ ] View specific test log
- [ ] View all test logs
- [ ] Delete test log
- [ ] Test error handling (missing fields)
- [ ] Test duplicate MO number handling
- [ ] Test with multiple entries
- [ ] Verify data persistence (restart server)

---

## 🐛 Common Issues

### Connection Refused
```bash
curl: (7) Failed to connect to localhost port 4010: Connection refused
```
**Solution:** Ensure backend server is running with `npm start`

### JSON Parse Error
```bash
{"error": "Unexpected token..."}
```
**Solution:** Check JSON syntax, ensure proper escaping in Windows CMD

### 404 Not Found
```bash
{"error": "Test log not found"}
```
**Solution:** Verify the MO number exists by checking `/api/test-logs`

### Empty Response
**Solution:** Check `data.json` file in project directory for data

---

## 💡 Tips

1. **Pretty Print JSON:** Pipe output to `jq` for readable JSON
2. **Windows Users:** Use Git Bash or WSL for better CURL support
3. **Save Scripts:** Save common workflows as `.sh` files
4. **Check Logs:** Monitor server console for errors
5. **Backup Data:** Copy `data.json` before testing destructive operations

---

## 📚 Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/master-data` | GET | Get all master data |
| `/api/master-data` | POST | Add master data |
| `/api/create-log/:index` | POST | Create test log |
| `/api/test-logs` | GET | Get all logs |
| `/api/test-log/:moNumber` | GET | Get specific log |
| `/api/test-log/:moNumber` | DELETE | Delete log |
| `/api/test-entry/:moNumber` | POST | Add test entry |
| `/api/log-result` | POST | ESP32 webhook |

---

**Last Updated:** October 2025  
**API Version:** 1.0.0  
**Base URL:** `http://localhost:4010/api`