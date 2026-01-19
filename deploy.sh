#!/bin/bash

# Cloudflare Pages deployment script
ACCOUNT_ID="26254429a5ae1b1f70af4bb167880..."
PROJECT_NAME="policybridgeai-web"
DIST_DIR="./dist"
API_TOKEN="LiPP3C0f-xwXCiCyX-Dtm8TvjZsIVMCY40AyIqyb"

# Upload all files from dist directory
cd "$DIST_DIR"

for file in $(find . -type f); do
    FILE_PATH="${file:2}"  # Remove leading ./
    echo "Uploading: $FILE_PATH"
    
    curl -X POST \
        "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments/rollback" \
        -H "Authorization: Bearer $API_TOKEN" \
        -F "files=@$file"
done

cd ..
