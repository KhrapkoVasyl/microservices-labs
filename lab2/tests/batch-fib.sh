#!/bin/bash

START=${1:-10}
END=${2:-39}

get_time_ms() {
  python3 -c 'import time; print(int(time.time()*1000))'
}

echo "=== Batch Fibonacci Test (from $START to $END) ==="
echo ""

for i in $(seq $START $END); do
  echo "FIB [$i]:"
  e2e_start=$(get_time_ms)
  response=$(curl -s -X POST http://localhost:3000/compute \
    -H "Content-Type: application/json" \
    -d "{\"taskType\": \"fib\", \"data\": [$i]}")
  e2e_end=$(get_time_ms)
  e2e_time=$((e2e_end - e2e_start))
  echo "$response" | jq --arg e2e "$e2e_time" '. + {e2eTimeMs: ($e2e | tonumber)}'
  echo ""
done

echo "=== Batch completed ==="
