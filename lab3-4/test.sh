#!/bin/bash

# Test script for lab3-4 Event Sourcing microservices

BASE_URL_COMMAND="http://localhost:8000"
BASE_URL_QUERY="http://localhost:8001"

echo "=============================================="
echo "=== Lab3-4 Event Sourcing Demo & Testing ==="
echo "=============================================="
echo ""

# Step 1: Start system
echo "=== STEP 1: Starting the system ==="
echo "Running: docker compose up -d"
# docker compose up -d
echo ""
# echo "Waiting 30 seconds for services to start..."
# sleep 30
echo ""

# Step 2: Check infrastructure
echo "=== STEP 2: Checking infrastructure ==="
echo ""
echo "--- MongoDB Replica Set Status ---"
docker exec mongo1 mongosh --quiet --eval "rs.status().members.map(m => ({name: m.name, state: m.stateStr}))"
echo ""

echo "--- Kafka Topic (compute-events) ---"
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --describe --topic compute-events
echo ""

echo "--- Container Status ---"
docker ps --format "table {{.Names}}\t{{.Status}}"
echo ""

# Step 3: Test Event Flow
echo "=== STEP 3: Testing Event Flow ==="
echo ""

# Test health endpoints
echo "--- Testing health endpoints ---"
echo "Command Service Health:"
curl -s "$BASE_URL_COMMAND/health" | jq .
echo ""
echo "Query Service Health:"
curl -s "$BASE_URL_QUERY/health" | jq .
echo ""

# Test sum operation
echo "--- Testing SUM operation ---"
RESPONSE=$(curl -s -X POST "$BASE_URL_COMMAND/compute" \
  -H "Content-Type: application/json" \
  -d '{"taskType": "sum", "data": [1, 2, 3, 4, 5]}')
echo "Response: $RESPONSE"
TASK_ID_SUM=$(echo $RESPONSE | jq -r '.taskId')
echo "Task ID: $TASK_ID_SUM"
echo ""

# Test pow operation
echo "--- Testing POW operation ---"
RESPONSE=$(curl -s -X POST "$BASE_URL_COMMAND/compute" \
  -H "Content-Type: application/json" \
  -d '{"taskType": "pow", "data": [2, 10]}')
echo "Response: $RESPONSE"
TASK_ID_POW=$(echo $RESPONSE | jq -r '.taskId')
echo "Task ID: $TASK_ID_POW"
echo ""

# Test fib operation
echo "--- Testing FIB operation ---"
RESPONSE=$(curl -s -X POST "$BASE_URL_COMMAND/compute" \
  -H "Content-Type: application/json" \
  -d '{"taskType": "fib", "data": [20]}')
echo "Response: $RESPONSE"
TASK_ID_FIB=$(echo $RESPONSE | jq -r '.taskId')
echo "Task ID: $TASK_ID_FIB"
echo ""

# Wait for processing
echo "Waiting 5 seconds for task processing..."
sleep 5
echo ""

# Get results
echo "--- Getting task results ---"
echo "SUM result:"
curl -s "$BASE_URL_QUERY/compute/tasks/$TASK_ID_SUM" | jq .
echo ""
echo "POW result:"
curl -s "$BASE_URL_QUERY/compute/tasks/$TASK_ID_POW" | jq .
echo ""
echo "FIB result:"
curl -s "$BASE_URL_QUERY/compute/tasks/$TASK_ID_FIB" | jq .
echo ""

# Get all tasks
echo "--- All tasks in database ---"
curl -s "$BASE_URL_QUERY/compute/tasks" | jq .
echo ""

# Step 4: Parallel processing demo
echo "=== STEP 4: Parallel Processing Demo (3 compute workers) ==="
echo ""
echo "Sending 9 FIB(30) tasks in parallel..."
for i in {1..9}; do
  curl -s -X POST "$BASE_URL_COMMAND/compute" \
    -H "Content-Type: application/json" \
    -d '{"taskType": "fib", "data": [30]}' &
done
wait
echo ""
echo "All tasks sent!"
echo ""

echo "Waiting 10 seconds for parallel processing..."
sleep 10
echo ""

echo "--- Compute Worker Logs (last 5 lines each) ---"
echo ""
echo "Worker 1:"
docker logs lab3-4-compute-service-1 --tail 5 2>/dev/null || echo "Worker 1 not running"
echo ""
echo "Worker 2:"
docker logs lab3-4-compute-service-2 --tail 5 2>/dev/null || echo "Worker 2 not running"
echo ""
echo "Worker 3:"
docker logs lab3-4-compute-service-3 --tail 5 2>/dev/null || echo "Worker 3 not running"
echo ""

echo "--- Final task count ---"
TASK_COUNT=$(curl -s "$BASE_URL_QUERY/compute/tasks" | jq '. | length')
echo "Total tasks in database: $TASK_COUNT"
echo ""

echo "=============================================="
echo "=== Demo & Tests Completed Successfully! ==="
echo "=============================================="
echo ""
echo "Additional resources:"
echo "  - Kafka UI: http://localhost:8080 (user/password)"
echo "  - MongoDB Compass: mongodb://localhost:27017/?directConnection=true"
echo ""
