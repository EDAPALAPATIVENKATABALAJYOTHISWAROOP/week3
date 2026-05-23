# 🚀 AgriPredict AI — Deployment Guide

This guide explains how to deploy your **AgriPredict AI** Flask application so that anyone can access it online for free.

Since your application uses Python, Flask, and Scikit-Learn `.sav` models, you must host it on a platform that supports a Python runtime environment. Below are the **three best free methods** to deploy your interface.

---

## 📌 Preparation: Upload Code to GitHub
Regardless of which hosting platform you choose, you should first upload your code to a **GitHub repository**.

1.  Initialize git in the `week3/` directory:
    ```bash
    git init
    ```
2.  Add your files and make your first commit (your new `.gitignore` file will ensure `venv/` and cache files are not uploaded):
    ```bash
    git add .
    git commit -m "Initial commit of AgriPredict AI app"
    ```
3.  Create a new repository on [GitHub](https://github.com/), copy the remote URL, and run:
    ```bash
    git remote add origin <your-github-repo-url>
    git branch -M main
    git push -u origin main
    ```

---

## 1️⃣ Method 1: Deploy on **Render** (Recommended ⭐)
Render is a modern Cloud Application Hosting platform. It has a completely free tier and connects directly to GitHub. It will automatically rebuild your app whenever you push updates to GitHub.

### Step 1: Install Gunicorn
For production deployment, Flask's built-in server is not recommended. You should use a production WSGI server like `gunicorn`.
Open your terminal and run:
```bash
pip install gunicorn
```
Then, update your `requirements.txt` to include `gunicorn`:
```bash
pip freeze > requirements.txt
```
*(Or simply add `gunicorn>=21.0.0` at the end of your existing `requirements.txt` file)*

### Step 2: Create a Render Account
1.  Go to [Render.com](https://render.com/) and sign up.
2.  Connect your Render account with your GitHub account.

### Step 3: Configure a Web Service
1.  On the Render Dashboard, click the **New** button and select **Web Service**.
2.  Select your `AgriPredict AI` repository from the connected GitHub list.
3.  Fill in the configuration details:
    *   **Name**: `agripredict-ai` (or any unique name)
    *   **Region**: Select the region closest to your target users.
    *   **Branch**: `main`
    *   **Runtime**: `Python`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `gunicorn app:app` (This points to the `app` object in `app.py`)
4.  Choose the **Free** instance type.
5.  Click **Create Web Service**.

Render will now build your application and launch it. Once the build finishes, you will see a public URL like `https://agripredict-ai.onrender.com`.

---

## 2️⃣ Method 2: Deploy on **Hugging Face Spaces**
Hugging Face Spaces is designed specifically for hosting Machine Learning apps. It is completely free, highly stable, and offers free CPU hardware.

### Step 1: Create a Space
1.  Sign in to [Hugging Face](https://huggingface.co/).
2.  Go to **Spaces** and click **Create new Space**.
3.  Fill in the details:
    *   **Space Name**: `agripredict-ai`
    *   **SDK**: Select **Docker** (This is the most reliable way to run Flask on Hugging Face).
    *   **Choose a template**: Select **Blank**.
    *   **Space Hardware**: Choose the free `CPU Basic` hardware.
    *   **Privacy**: **Public** (so anyone can view your interface).
4.  Click **Create Space**.

### Step 2: Add a `Dockerfile`
To run Flask inside the Hugging Face Docker Space, create a file named `Dockerfile` in your repository root with this exact content:

```dockerfile
# Use official Python runtime
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy requirement files first
COPY requirements.txt /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy all repository files to container
COPY . /app/

# Expose the default port for Hugging Face (7860)
EXPOSE 7860

# Command to run gunicorn on Hugging Face default port
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "app:app"]
```

### Step 3: Push Your Code
Connect your local code to the Hugging Face Space repository (it uses standard git) and push it, or drag-and-drop the files (`app.py`, `templates/`, `static/`, models, scalers, `requirements.txt`, and `Dockerfile`) directly onto the Hugging Face web interface.

Once uploaded, Hugging Face will build the Docker container and host your beautiful web app!

---

## 3️⃣ Method 3: Deploy on **PythonAnywhere**
PythonAnywhere is a dedicated Python hosting environment. It is free, stable, and highly suited for traditional WSGI Flask applications.

### Step 1: Sign Up and Create a Web App
1.  Go to [PythonAnywhere](https://www.pythonanywhere.com/) and register for a free account.
2.  From your dashboard, go to the **Web** tab.
3.  Click **Add a new web app**.
4.  Specify your domain (e.g., `yourusername.pythonanywhere.com`).
5.  Select **Manual Configuration** (do *not* select the pre-packaged Flask configuration, as manual is better for custom folders and environments) and choose **Python 3.10** or **3.11**.

### Step 2: Upload Files
1.  Open the **Consoles** tab and start a new **Bash console**.
2.  Clone your GitHub repository:
    ```bash
    git clone https://github.com/yourusername/your-repo-name.git
    ```
    *(Alternatively, you can upload files manually through the **Files** tab on the dashboard)*

### Step 3: Create Virtual Environment and Install Dependencies
In the Bash console, run:
```bash
cd your-repo-name
virtualenv --python=python3.10 myenv
source myenv/bin/activate
pip install -r requirements.txt
```

### Step 4: Configure WSGI File
1.  Go back to the **Web** tab on the PythonAnywhere dashboard.
2.  Scroll down to the **Code** section and click the link next to **WSGI configuration file** (it looks like `/var/www/yourusername_pythonanywhere_com_wsgi.py`).
3.  Delete everything in that file and paste this custom Flask WSGI code:
    ```python
    import sys
    import os

    # Path to your web app directory
    path = '/home/yourusername/your-repo-name'
    if path not in sys.path:
        sys.path.insert(0, path)

    # Set working directory
    os.chdir(path)

    # Import the app object from app.py
    from app import app as application
    ```
    *(Remember to replace `yourusername` and `your-repo-name` with your actual username and folder path)*
4.  Save the file.

### Step 5: Specify Virtual Environment Path
1.  Go back to the **Web** tab.
2.  Scroll down to the **Virtualenv** section.
3.  Enter the path to your newly created virtualenv: `/home/yourusername/your-repo-name/myenv`
4.  Scroll to the top and click the green **Reload** button.

Your web page will be live at `http://yourusername.pythonanywhere.com/`!
