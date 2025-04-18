#!/bin/bash

# This script installs Supabase CLI inside the Docker container

# Update package lists
apt-get update

# Install required dependencies
apt-get install -y curl

# Install Supabase CLI
npm install -g supabase

# Verify installation
supabase --version

echo "Supabase CLI installed successfully" 