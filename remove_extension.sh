#!/bin/bash

# Script to remove the first file extension from files with double extensions
# Example: 1761971311407-vm64u0ngv9.jpg.webp -> 1761971311407-vm64u0ngv9.webp

# Function to rename a single file
rename_file() {
    local file="$1"
    
    # Check if file exists
    if [ ! -f "$file" ]; then
        echo "Error: File '$file' does not exist" >&2
        return 1
    fi
    
    # Get the directory and filename
    local dir=$(dirname "$file")
    local filename=$(basename "$file")
    
    # Check if filename ends with .webp
    if [[ ! "$filename" =~ \.webp$ ]]; then
        echo "Warning: '$filename' does not end with .webp, skipping" >&2
        return 1
    fi
    
    # Remove .webp extension temporarily
    local base="${filename%.webp}"
    
    # Remove the first extension (everything after the last dot before .webp)
    local new_base="${base%.*}"
    
    # Construct new filename
    local new_filename="${new_base}.webp"
    
    # If the filename hasn't changed, skip
    if [ "$filename" == "$new_filename" ]; then
        echo "No change needed for '$filename'"
        return 0
    fi
    
    # Construct full paths
    local old_path="$file"
    local new_path="$dir/$new_filename"
    
    # Check if target file already exists
    if [ -f "$new_path" ]; then
        echo "Warning: Target file '$new_path' already exists, skipping" >&2
        return 1
    fi
    
    # Rename the file
    mv "$old_path" "$new_path"
    echo "Renamed: '$filename' -> '$new_filename'"
}

# Main execution
if [ $# -eq 0 ]; then
    echo "Usage: $0 <file1> [file2] [file3] ..."
    echo "   or: $0 *.jpg.webp"
    echo ""
    echo "Removes the first extension from files with double extensions."
    echo "Example: 1761971311407-vm64u0ngv9.jpg.webp -> 1761971311407-vm64u0ngv9.webp"
    exit 1
fi

# Process each file argument
for file in "$@"; do
    rename_file "$file"
done

