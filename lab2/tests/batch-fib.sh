#!/bin/bash

START=${1:-30}
END=${2:-35}
MODE=${3:-both}  # sync, async, or both

get_time_ms() {
  python3 -c 'import time; print(int(time.time()*1000))'
}

echo "=== Batch Fibonacci Test (from $START to $END) ==="
echo "Mode: $MODE"
echo ""

if [ "$MODE" = "sync" ] || [ "$MODE" = "both" ]; then
  echo "=========================================="
  echo "=== SYNC Fibonacci (HTTP) ==="
  echo "=========================================="
  echo ""
  
  for i in $(seq $START $END); do
    echo "SYNC FIB [$i]:"
    e2e_start=$(get_time_ms)
    response=$(curl -s -X POST http://localhost:3000/compute \
      -H "Content-Type: application/json" \
      -d "{\"taskType\": \"fib\", \"data\": [$i]}")
    e2e_end=$(get_time_ms)
    e2e_time=$((e2e_end - e2e_start))
    echo "$response" | jq --arg e2e "$e2e_time" '. + {e2eTimeMs: ($e2e | tonumber)}'
    echo ""
  done
fi

if [ "$MODE" = "async" ] || [ "$MODE" = "both" ]; then
  echo "=========================================="
  echo "=== ASYNC Fibonacci (RabbitMQ) ==="
  echo "=========================================="
  echo ""
  
  for i in $(seq $START $END); do
    echo "ASYNC FIB [$i]:"
    e2e_start=$(get_time_ms)
    response=$(curl -s -X POST http://localhost:3000/async/compute \
      -H "Content-Type: application/json" \
      -d "{\"taskType\": \"fib\", \"data\": [$i]}")
    e2e_end=$(get_time_ms)
    e2e_time=$((e2e_end - e2e_start))
    echo "$response" | jq --arg e2e "$e2e_time" '. + {e2eTimeMs: ($e2e | tonumber)}'
    echo ""
  done
fi

echo "=== Batch completed ==="
echo ""
echo "Usage: ./batch-fib.sh [START] [END] [MODE]"
echo "  MODE: sync, async, or both (default: both)"
