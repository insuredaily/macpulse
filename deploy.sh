#!/usr/bin/env bash

# MacPulse Automatic Deployment Script
# This script automates pushing your codebase to a new GitHub repository.

set -e

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}     MacPulse GitHub Pages Deployment Helper    ${NC}"
echo -e "${BLUE}===============================================${NC}"

# 1. Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed on your system. Please install it first.${NC}"
    exit 1
fi

# 2. Ask for GitHub Username
read -p "Enter your GitHub username: " GH_USERNAME
if [ -z "$GH_USERNAME" ]; then
    echo -e "${RED}Error: GitHub username cannot be empty.${NC}"
    exit 1
fi

# 3. Ask for Repository Name
read -p "Enter your target GitHub repository name (e.g. macpulse): " GH_REPO
if [ -z "$GH_REPO" ]; then
    echo -e "${RED}Error: Repository name cannot be empty.${NC}"
    exit 1
fi

echo -e "\n${BLUE}[1/4] Initializing local Git repository...${NC}"
if [ ! -d ".git" ]; then
    git init
    git branch -M main
    echo -e "${GREEN}Git repository initialized with branch 'main'.${NC}"
else
    echo -e "Git is already initialized in this directory."
fi

# Configure git to ignore node_modules
if [ ! -f ".gitignore" ]; then
    echo "node_modules/" > .gitignore
    echo -e "${GREEN}.gitignore created to ignore node_modules/.${NC}"
fi

echo -e "\n${BLUE}[2/4] Staging and committing files...${NC}"
git add .
# Check if there is anything to commit
if git diff-index --quiet HEAD --; then
    echo "No modifications to commit."
else
    git commit -m "Initial commit for MacPulse"
    echo -e "${GREEN}Staged files committed successfully.${NC}"
fi

echo -e "\n${BLUE}[3/4] Linking local repo to GitHub...${NC}"
# Remove remote origin if it already exists to avoid errors, then add the new one
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/${GH_USERNAME}/${GH_REPO}.git"
echo -e "${GREEN}Linked to: https://github.com/${GH_USERNAME}/${GH_REPO}.git${NC}"

echo -e "\n${BLUE}[4/4] Pushing code to GitHub...${NC}"
echo -e "Note: If prompted, enter your GitHub username and Personal Access Token (PAT) as the password."
echo -e "----------------------------------------------------------------------------------"
git push -u origin main

echo -e "\n${GREEN}===============================================${NC}"
echo -e "${GREEN}🚀 Code successfully pushed to GitHub!${NC}"
echo -e "${GREEN}===============================================${NC}"
echo -e "\nTo complete the deployment, perform these 2 quick configurations in your browser:"
echo -e "1. ${BLUE}Enable Write Permissions (Crucial for Scraper Cron):${NC}"
echo -e "   Go to: https://github.com/${GH_USERNAME}/${GH_REPO}/settings/actions"
echo -e "   Scroll to 'Workflow permissions', select 'Read and write permissions', and click Save."
echo -e "2. ${BLUE}Turn on GitHub Pages:${NC}"
echo -e "   Go to: https://github.com/${GH_USERNAME}/${GH_REPO}/settings/pages"
echo -e "   Set Build and deployment Source to 'Deploy from a branch', choose 'main' and root '/', and click Save."
echo -e "\nYour site will be live shortly after at: ${BLUE}https://${GH_USERNAME}.github.io/${GH_REPO}/${NC}"
