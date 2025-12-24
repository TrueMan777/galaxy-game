# Step-by-Step Guide: Adding Galaxy Game to Private GitHub Repository

## Step 1: Create a Private Repository on GitHub

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `galaxy-game` (or your preferred name)
   - **Description**: "A galaxy-themed survival game built with vanilla JavaScript"
   - **Visibility**: Select **"Private"**
   - **DO NOT** initialize with README, .gitignore, or license (we already have files)
5. Click **"Create repository"**

## Step 2: Copy the Repository URL

After creating the repository, GitHub will show you a page with setup instructions. Copy the **HTTPS** URL (it will look like: `https://github.com/yourusername/galaxy-game.git`)

## Step 3: Initialize Git in Your Local Directory

Open your terminal and navigate to the galaxy-game directory, then run:

```bash
cd /Users/val-tumi/dev/vt_utils/javascript/galaxy-game
git init
```

## Step 4: Add All Files to Git

```bash
git add .
```

This will add all files:
- `index.html`
- `game.js`
- `style.css`
- `README.md`
- `GAME.prd`

## Step 5: Create Your First Commit

```bash
git commit -m "Initial commit: Galaxy game with shooting, upgrades, and boss battles"
```

## Step 6: Connect to Your GitHub Repository

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

## Step 7: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

You'll be prompted for your GitHub credentials:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your regular password)
  - If you don't have one, create it at: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Give it `repo` permissions

## Step 8: Verify

Go back to your GitHub repository page and refresh. You should see all your files there!

---

## Quick Command Summary

If you prefer to do it all at once (after creating the repo on GitHub):

```bash
cd /Users/val-tumi/dev/vt_utils/javascript/galaxy-game
git init
git add .
git commit -m "Initial commit: Galaxy game with shooting, upgrades, and boss battles"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Troubleshooting

- **"Repository not found"**: Check that the repository URL is correct and that it exists
- **"Authentication failed"**: Make sure you're using a Personal Access Token, not your password
- **"Remote origin already exists"**: Run `git remote remove origin` first, then add it again

