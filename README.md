# Git Grid

A visual tool for designing and generating Git commit patterns for your GitHub contribution graph.

## Overview

Git Grid allows you to visually design patterns for your GitHub contribution graph and generates the necessary Git commands to create those patterns. This tool helps you plan and visualize how your contribution graph will look before making any actual commits.

## Features

- **Visual Grid Editor**: Click on cells to set contribution levels (0-4)
- **Numeric Mode**: Edit contribution levels using numbers
- **Brush Tool**: Paint multiple cells at once by clicking and dragging
- **Year Selection**: Choose which year to generate commits for
- **Import/Export**: Save and load grid patterns as JSON arrays
- **Commit Generation**: Automatically generate Git commands with appropriate dates and messages
- **Commit Import**: Visualize existing commit patterns by importing commit commands
- **Deletion Guidance**: Get instructions for removing unwanted commits from your history

## How to Use

1. **Design Your Pattern**:
   - Use the visual editor to click on cells and set contribution levels
   - Toggle between pointer and brush tools for different editing styles
   - Switch to numeric mode for precise control

2. **Generate Commands**:
   - Click the "Generate" button to create Git commands for your pattern
   - Copy the commands to your clipboard
   - Run these commands in your Git repository to create the commit pattern

3. **Import/Export**:
   - Save your designs by exporting them as JSON arrays
   - Import previously saved designs or share them with others

## Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/git-grid.git

# Navigate to the project directory
cd git-grid

# Install dependencies
npm install

# Start the development server
npm run dev
```
