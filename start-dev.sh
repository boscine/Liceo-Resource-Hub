#!/bin/bash

echo "Starting ADET Development Environment (macOS)..."

# Ensure Terminal is running to avoid osascript -600 errors
open -a Terminal
sleep 1

# 1. Start Backend (Hono)
echo "Starting Hono Backend (Memory Limit: 512MB)..."
osascript -e 'tell application "Terminal" to do script "cd \"'$PWD'/adet-be-bsit22\" && export NODE_OPTIONS=--max-old-space-size=512 && npm run dev"'

# 2. Start Frontend (Angular)
echo "Starting Angular Frontend (Memory Limit: 1536MB)..."
osascript -e 'tell application "Terminal" to do script "cd \"'$PWD'/adet-fe-bsit22\" && export NODE_OPTIONS=--max-old-space-size=1536 && npx ng serve --configuration=development --proxy-config proxy.conf.json --live-reload=false"'

echo "Development environment started in new terminal windows."
