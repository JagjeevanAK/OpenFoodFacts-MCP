#!/bin/bash

export PORT=28375

cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

if [ ! -d "dist" ]; then
  echo "Building the MCP server..."
  npm run build
fi

echo "Starting the Open Food Facts MCP Server in SSE transport mode on port $PORT..."
npm start