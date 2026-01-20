<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GBC Child Protection Test

This is a simple web application for the Germiston Baptist Church to administer a child protection test to its staff and volunteers.

## Run Locally

**Prerequisites:**

*   Node.js
*   Firebase Project

**Steps:**

1.  **Install dependencies:**
    `npm install`
2.  **Set up your Firebase project:**
    *   Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   In your Firebase project, go to **Project settings** > **General**.
    *   Under **Your apps**, click on the **Web** icon (`</>`).
    *   Give your app a nickname and click **Register app**.
    *   Copy the `firebaseConfig` object.
3.  **Create a `.env.local` file:**
    *   In the root of the project, create a new file called `.env.local`.
    *   Copy the contents of `.env.example` into `.env.local`.
    *   Replace the placeholder values with your actual Firebase project configuration keys.
4.  **Run the app:**
    `npm run dev`
