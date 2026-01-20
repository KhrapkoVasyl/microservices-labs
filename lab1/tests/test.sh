#!/bin/bash

set -e

echo "=== Lab1: Synchronous Communication Test ==="
echo ""

# Start docker-compose
echo "Starting services..."
docker-compose -f ../docker-compose.yml up -d --build

# Wait for services to be ready with health check
echo "Waiting for services to start..."

wait_for_service() {
  local url=$1
  local name=$2
  local max_attempts=4
  local attempt=1
  
  while [ $attempt -le $max_attempts ]; do
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|404"; then
      echo "$name is ready"
      return 0
    fi
    echo "Waiting for $name... (attempt $attempt/$max_attempts)"
    sleep 1
    attempt=$((attempt + 1))
  done
  
  echo "ERROR: $name failed to start"
  exit 1
}

wait_for_service "http://localhost:3001/health" "Provider Service"
wait_for_service "http://localhost:3000/health" "Consumer Service"
echo "All services are ready!"

echo ""
echo "=== Test 1: Single POW request ==="
echo "Request: POW [2, 3, 2]"
curl -s -X POST http://localhost:3000/compute \
  -H "Content-Type: application/json" \
  -d '{"taskType": "pow", "data": [2, 3, 2]}' | jq .
echo ""

echo "=== Test 2: 20 Fibonacci requests ==="
for i in $(seq 20 39); do
  echo "Request $i: FIB [$i]"
  curl -s -X POST http://localhost:3000/compute \
    -H "Content-Type: application/json" \
    -d "{\"taskType\": \"fib\", \"data\": [$i]}" | jq .
  echo ""
done

echo "=== All tests completed ==="
echo ""

# Show logs
echo "Service logs:"
docker-compose -f ../docker-compose.yml logs --tail=30

echo ""
echo "To stop services run: docker-compose -f ../docker-compose.yml down"
