#!/bin/bash

echo "Installing Tailwind CSS v4 PostCSS plugin..."
npm install @tailwindcss/postcss@^4.1.4 --legacy-peer-deps

echo "Testing build..."
npm run build

echo "Build completed successfully!"
