#!/bin/bash

# Define the paths to the header and bundle files
header=$1
bundle=$2

echo "insert header file: $header target: $bundle";

# Make the bundle file writable
chmod +w "$bundle"

# Create a temporary file for the updated bundle
tmpfile=$(mktemp)

# Prepend the header to the bundle
cat "$header" "$bundle" > "$tmpfile"

# Replace the original bundle with the updated version
mv "$tmpfile" "$bundle"
