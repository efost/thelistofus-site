# Firebase Setup for The List of Us Website

## 1. Firebase Configuration

Create a `.env.local` file in your project root with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 2. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Copy the config values to your `.env.local` file

## 3. Firestore Database Structure

Your Firestore should have two collections:

### Lists Collection (`lists`)

```javascript
{
  id: "fpm003EFTcCRbAKsNenP",
  name: "The BIG List",
  ownerName: "eric@efo.st",
  ownerId: "p0hwZjGk19VdXi0w9KpEwWsUH3d2",
  createdAt: Timestamp,
  lastModifiedAt: Timestamp,
  isShared: true,
  collaborators: ["p0hwZjGk19VdXi0w9KpEwWsUH3d2"],
  permissions: {
    "p0hwZjGk19VdXi0w9KpEwWsUH3d2": "owner"
  }
}
```

### Items Collection (`items`)

```javascript
{
  id: "auto-generated",
  name: "Standard Deviant",
  address: "280 14th St",
  city: "San Francisco",
  category: "None",
  notes: "Brewery/pinball",
  done: true,
  lat: 37.768471,
  long: -122.419476,
  createdAt: Timestamp,
  lastModifiedAt: Timestamp,
  listId: "fpm003EFTcCRbAKsNenP"
}
```

## 4. Security Rules

Set up Firestore security rules to allow public read access to shared lists:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /lists/{listId} {
      allow read: if resource.data.isShared == true;
      allow write: if request.auth != null;
    }
    match /items/{itemId} {
      allow read: if true; // Items are readable if their parent list is shared
      allow write: if request.auth != null;
    }
  }
}
```

## 5. Testing

Once configured, you can test with a real list ID from your Firebase database:

- Visit `/list/YOUR_ACTUAL_LIST_ID` to see real data
- The page will automatically fetch and display the list details
- Progress calculations will be based on actual completed items (`done: true`)
- Items will show name, address, city, and notes if available
- List metadata shows owner name, collaborators count, and last modified date

## 6. Features Implemented

- ✅ Real-time data fetching from Firebase
- ✅ Dynamic metadata generation for social sharing
- ✅ Progress calculation based on `done` field
- ✅ Shared/private list filtering (`isShared`)
- ✅ Error handling for non-existent lists
- ✅ TypeScript interfaces for type safety
- ✅ Support for location data (lat/long)
- ✅ Display of address, city, and notes for each item
- ✅ Collaborator count and permissions support
- ✅ Last modified date tracking
