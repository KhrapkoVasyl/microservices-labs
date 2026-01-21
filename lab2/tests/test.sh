#!/bin/bash

set -e

echo "=== Lab2: Sync vs Async Communication Test ==="
echo ""

# Start docker-compose
echo "Starting services (including RabbitMQ)..."
docker-compose -f ../docker-compose.yml up -d --build

# Wait for services to be ready with health check
echo "Waiting for services to start..."

wait_for_service() {
  local url=$1
  local name=$2
  local max_attempts=10
  local attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|404"; then
      echo "$name is ready"
      return 0
    fi
    echo "Waiting for $name... (attempt $attempt/$max_attempts)"
    sleep 2
    attempt=$((attempt + 1))
  done
  
  echo "ERROR: $name failed to start"
  exit 1
}

wait_for_service "http://localhost:3000/health" "Consumer Service"
echo "All services are ready!"

get_time_ms() {
  python3 -c 'import time; print(int(time.time()*1000))'
}

echo ""
echo "=========================================="
echo "=== SYNC Communication Tests (HTTP) ==="
echo "=========================================="
echo ""

echo "=== Sync Test 1: Single POW request ==="
echo "Request: POW [2, 3, 2]"
e2e_start=$(get_time_ms)
response=$(curl -s -X POST http://localhost:3000/compute \
  -H "Content-Type: application/json" \
  -d '{"taskType": "pow", "data": [2, 3, 2]}')
e2e_end=$(get_time_ms)
e2e_time=$((e2e_end - e2e_start))
echo "$response" | jq --arg e2e "$e2e_time" '. + {e2eTimeMs: ($e2e | tonumber)}'
echo ""

echo "=== Sync Test 2: Fibonacci requests (30-34) ==="
for i in $(seq 30 34); do
  echo "SYNC Request: FIB [$i]"
  e2e_start=$(get_time_ms)
  response=$(curl -s -X POST http://localhost:3000/compute \
    -H "Content-Type: application/json" \
    -d "{\"taskType\": \"fib\", \"data\": [$i]}")
  e2e_end=$(get_time_ms)
  e2e_time=$((e2e_end - e2e_start))
  echo "$response" | jq --arg e2e "$e2e_time" '. + {e2eTimeMs: ($e2e | tonumber)}'
  echo ""
done

echo ""
echo "=============================================="
echo "=== ASYNC Communication Tests (RabbitMQ) ==="
echo "=============================================="
echo ""

echo "=== Async Test 1: Single POW request ==="
echo "Request: POW [2, 3, 2]"
e2e_start=$(get_time_ms)
response=$(curl -s -X POST http://localhost:3000/async/compute \
  -H "Content-Type: application/json" \
  -d '{"taskType": "pow", "data": [2, 3, 2]}')
e2e_end=$(get_time_ms)
e2e_time=$((e2e_end - e2e_start))
echo "$response" | jq --arg e2e "$e2e_time" '. + {e2eTimeMs: ($e2e | tonumber)}'
echo ""

echo "=== Async Test 2: Fibonacci requests (30-34) ==="
for i in $(seq 30 34); do
  echo "ASYNC Request: FIB [$i]"
  e2e_start=$(get_time_ms)
  response=$(curl -s -X POST http://localhost:3000/async/compute \
    -H "Content-Type: application/json" \
    -d "{\"taskType\": \"fib\", \"data\": [$i]}")
  e2e_end=$(get_time_ms)
  e2e_time=$((e2e_end - e2e_start))
  echo "$response" | jq --arg e2e "$e2e_time" '. + {e2eTimeMs: ($e2e | tonumber)}'
  echo ""
done

echo "=== All tests completed ==="
echo ""

# Show logs
echo "Service logs:"
docker-compose -f ../docker-compose.yml logs --tail=50

echo ""
echo "To stop services run: docker-compose -f ../docker-compose.yml down"
