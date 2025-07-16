# Firebase Security Rules for The List of Us

## Updated Rules with Public Read Access

Here are your updated security rules that maintain your existing security model while allowing public read access to shared lists:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Lists: Allow public read for shared lists, full access for owners/collaborators
    match /lists/{listId} {
      // Public read access for shared lists
      allow read: if resource.data.isShared == true;

      // Full access for authenticated users who own or collaborate on the list
      allow read, write: if request.auth != null &&
        (resource.data.ownerId == request.auth.uid ||
         request.auth.uid in resource.data.collaborators);

      // Allow creating new lists
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.ownerId;
    }

    // Items: Allow public read for items in shared lists, full access for owners/collaborators
    match /lists/{listId}/items/{itemId} {
      // Public read access for items in shared lists
      allow read: if get(/databases/$(database)/documents/lists/$(listId)).data.isShared == true;

      // Full access for authenticated users who own or collaborate on the parent list
      allow read, write: if request.auth != null &&
        (get(/databases/$(database)/documents/lists/$(listId)).data.ownerId == request.auth.uid ||
         request.auth.uid in get(/databases/$(database)/documents/lists/$(listId)).data.collaborators);
    }

    // Standalone items collection (for backward compatibility)
    match /items/{itemId} {
      // Public read access for items in shared lists
      allow read: if resource.data.listId != null &&
        get(/databases/$(database)/documents/lists/$(resource.data.listId)).data.isShared == true;

      // Full access for authenticated users
      allow read, write: if request.auth != null;
    }

    // Users can read/write invitations they're involved with
    match /invitations/{invitationId} {
      allow read, write: if request.auth != null &&
        (resource.data.invitedUserId == request.auth.uid ||
         resource.data.invitedBy == request.auth.uid);
    }
  }
}
```

## Key Changes Made

1. **Added Public Read Access**: Lists with `isShared: true` can now be read by anyone
2. **Maintained Existing Security**: All your existing user/collaborator access rules remain intact
3. **Items Collection Support**: Added public read access for items in shared lists
4. **Backward Compatibility**: Your existing authenticated access patterns still work

## How It Works

- **Public Lists**: Anyone can read lists where `isShared: true`
- **Private Lists**: Only owners and collaborators can access (unchanged)
- **Items**: Items in shared lists are publicly readable
- **Authentication**: All write operations still require authentication
- **User Data**: User documents remain private (unchanged)

## Testing

After updating these rules:

1. Lists with `isShared: true` will be publicly readable
2. Your website can now fetch and display shared lists
3. Private lists remain secure for authenticated users only

This maintains your security model while enabling the public sharing functionality for your website!
