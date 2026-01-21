#!/bin/bash

# Test script for lab3 microservices

BASE_URL_COMMAND="http://localhost:8000"
BASE_URL_QUERY="http://localhost:8001"

echo "=== Testing Lab3 Microservices ==="
echo ""

# Test health endpoints
echo "1. Testing health endpoints..."
echo "Command Service Health:"
curl -s "$BASE_URL_COMMAND/health" | jq .
echo ""
echo "Query Service Health:"
curl -s "$BASE_URL_QUERY/health" | jq .
echo ""

# Test sum operation
echo "2. Testing SUM operation..."
RESPONSE=$(curl -s -X POST "$BASE_URL_COMMAND/compute" \
  -H "Content-Type: application/json" \
  -d '{"taskType": "sum", "data": [1, 2, 3, 4, 5]}')
echo "Response: $RESPONSE"
TASK_ID=$(echo $RESPONSE | jq -r '.taskId')
echo "Task ID: $TASK_ID"
echo ""

# Wait for processing
echo "Waiting for task processing..."
sleep 2

# Get result
echo "3. Getting task result..."
curl -s "$BASE_URL_QUERY/compute/tasks/$TASK_ID" | jq .
echo ""

# Test pow operation
echo "4. Testing POW operation..."
RESPONSE=$(curl -s -X POST "$BASE_URL_COMMAND/compute" \
  -H "Content-Type: application/json" \
  -d '{"taskType": "pow", "data": [2, 10]}')
echo "Response: $RESPONSE"
TASK_ID=$(echo $RESPONSE | jq -r '.taskId')
echo ""

sleep 2

echo "5. Getting POW result..."
curl -s "$BASE_URL_QUERY/compute/tasks/$TASK_ID" | jq .
echo ""

# Test fib operation
echo "6. Testing FIB operation..."
RESPONSE=$(curl -s -X POST "$BASE_URL_COMMAND/compute" \
  -H "Content-Type: application/json" \
  -d '{"taskType": "fib", "data": [10]}')
echo "Response: $RESPONSE"
TASK_ID=$(echo $RESPONSE | jq -r '.taskId')
echo ""

sleep 2

echo "7. Getting FIB result..."
curl -s "$BASE_URL_QUERY/compute/tasks/$TASK_ID" | jq .
echo ""

# Get all tasks
echo "8. Getting all tasks..."
curl -s "$BASE_URL_QUERY/compute/tasks" | jq .
echo ""

echo "=== Tests completed ==="
