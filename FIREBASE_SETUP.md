# Firebase Firestore Setup Guide

This guide will walk you through the process of setting up Firestore in your Firebase project. This is a critical step to ensure that your application can store and retrieve data correctly.

## Step 1: Access Your Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select the project you are using for this application.

## Step 2: Navigate to Firestore Database

1.  In the left-hand menu, click on **Build** to expand the menu.
2.  Click on **Firestore Database**.

![Firestore Navigation](https://i.imgur.com/8f9b9M8.png)

## Step 3: Create a New Database

1.  Click the **Create database** button.

![Create Database](https://i.imgur.com/8f9b9M8.png)

2.  A dialog box will appear asking you to choose between **Production mode** and **Test mode**. Select **Start in production mode**. This is to ensure that your data is secure by default. Click **Next**.

![Production Mode](https://i.imgur.com/Y1bH3v1.png)

3.  Next, you will be asked to choose a location for your Firestore data. Select the location that is closest to your users. Once you have selected a location, click **Enable**.

![Database Location](https://i.imgur.com/b9e1b2B.png)

## Step 4: Set Up Security Rules

1.  Once your database is created, navigate to the **Rules** tab.

![Rules Tab](https://i.imgur.com/g05Z9Y8.png)

2.  Replace the default security rules with the following. These rules ensure that a user can always access their own data, but an administrator (who you will set up in Step 6) can read everyone's data.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admins can read all user data, but only users can write to their own data.
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || request.auth.token.isAdmin == true);
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3.  Click **Publish** to save your new rules.

![Publish Rules](https://i.imgur.com/u7K8g6a.png)

## Step 5: Create a "users" Collection

1.  Go back to the **Data** tab.
2.  Click **Start collection**.

![Start Collection](https://i.imgur.com/2Y0g3bM.png)

3.  A dialog will appear asking for a **Collection ID**. Type in `users` and click **Next**.

![Collection ID](https://i.imgur.com/z8e4b1D.png)

4.  You can skip adding a document by clicking **Cancel**, as the application will handle this automatically when a new user registers.

## Step 6: Set Up an Admin User

For the Admin Dashboard to work, you need to designate at least one user as an administrator. You can do this by setting a **custom claim** on their account.

1.  First, make sure the user you want to be an admin has already registered through the application.
2.  In the Firebase Console, go to **Build** > **Authentication**.
3.  In the **Users** tab, find the user you want to make an admin. Click the **three-dot menu** on the far right of their row and select **Manage user**.
4.  In the user's details panel, scroll down to the **Custom Claims** section.
5.  Add the following claim:
    *   **Key:** `isAdmin`
    *   **Value:** `true`
6.  Click **Add** to save the claim.

![Custom Claims](https://i.imgur.com/6g0v6dZ.png)

Now, when this user logs in, their authentication token will contain the `isAdmin: true` claim, and the Firestore security rules will grant them read access to all documents in the `users` collection.
