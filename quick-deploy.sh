#!/bin/bash

echo "========================================"
echo "Quick Deploy to GitHub (Auto-deploy to Vercel)"
echo "========================================"
echo ""

# Add all changes
echo "Adding all changes..."
git add .

# Commit with timestamp
echo "Committing changes..."
timestamp=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "Update: $timestamp"

# Push to GitHub
echo "Pushing to GitHub..."
git push origin main

echo ""
echo "========================================"
echo "Done! Vercel will auto-deploy shortly."
echo "========================================"
