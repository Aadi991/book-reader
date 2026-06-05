# Personal Book Reader Architecture

## Overview

A private cross-platform PDF reader with:

* React Native mobile application
* Electron desktop application
* Offline reading support
* Cross-device reading synchronization
* Supabase Storage for PDFs
* Firebase Authentication
* Firestore for metadata and sync

The system is designed for personal use and does not require custom backend servers or an administrative dashboard.

---

# Architecture

```text
┌─────────────────────┐
│  React Native App   │
│    (Android/iOS)    │
└──────────┬──────────┘
           │
           │
           ▼

┌─────────────────────┐
│ Firebase Auth       │
└──────────┬──────────┘
           │
           ▼

┌─────────────────────┐
│ Firestore           │
│                     │
│ • Book Catalog      │
│ • Reading Progress  │
│ • User Settings     │
└──────────┬──────────┘
           │
           ▼

┌─────────────────────┐
│ Supabase Storage    │
│                     │
│ • PDF Files         │
└─────────────────────┘

           ▲
           │
           │

┌─────────────────────┐
│   Electron App      │
│     (Desktop)       │
└─────────────────────┘
```

---

# Technology Stack

## Mobile

React Native

Responsibilities:

* Authentication
* Library browsing
* PDF reading
* Offline storage
* Sync progress

---

## Desktop

Electron

Responsibilities:

* Authentication
* Library browsing
* PDF reading
* Offline storage
* Sync progress

---

## Authentication

Firebase Authentication

Supported Providers:

* Google Sign-In
* Email & Password

Purpose:

* User identity
* Secure access to Firestore
* Device synchronization

---

## Database

Firestore

Purpose:

* Book catalog
* Reading progress
* User preferences

---

## File Storage

Supabase Storage

Purpose:

* PDF hosting
* Book delivery
* Version-independent storage

---

# Storage Structure

Bucket:

```text
books
```

Structure:

```text
books/
├── series-a/
│   ├── vol-01.pdf
│   ├── vol-02.pdf
│   └── vol-03.pdf
│
├── series-b/
│   ├── vol-01.pdf
│   └── vol-02.pdf
│
└── standalone/
    ├── book-01.pdf
    └── book-02.pdf
```

---

# Firestore Schema

## Collection: books

Stores catalog metadata.

Document ID:

```text
series-a-vol-01
```

Document:

```json
{
  "title": "Volume 1",
  "series": "Series A",
  "volume": 1,
  "storagePath": "series-a/vol-01.pdf",
  "pageCount": 325,
  "createdAt": "timestamp"
}
```

Purpose:

* Populate library
* Locate PDFs
* Sort volumes

---

## Collection: reading_progress

Document ID:

```text
{userId}_{bookId}
```

Example:

```json
{
  "userId": "uid123",
  "bookId": "series-a-vol-01",
  "currentPage": 182,
  "percentComplete": 56.0,
  "lastOpenedAt": "timestamp",
  "completed": false
}
```

Purpose:

* Resume reading
* Synchronize progress
* Track completion

---

## Collection: user_settings

Document:

```json
{
  "userId": "uid123",
  "theme": "dark",
  "syncEnabled": true
}
```

Purpose:

* Cross-device preferences

---

# Authentication Flow

## Login

```text
Open App
     ↓
Firebase Login
     ↓
Receive User ID
     ↓
Load User Settings
     ↓
Load Reading Progress
     ↓
Load Book Catalog
```

---

# Book Upload Workflow

No admin portal exists.

Books are managed manually.

## Upload Process

Step 1:

Upload PDF to Supabase Storage.

Example:

```text
books/series-c/vol-01.pdf
```

Step 2:

Create Firestore document.

```json
{
  "title": "Volume 1",
  "series": "Series C",
  "volume": 1,
  "storagePath": "series-c/vol-01.pdf"
}
```

Step 3:

Applications automatically display the book.

No redeployment required.

---

# Library Loading

Application startup:

```text
App Launch
     ↓
Authenticate
     ↓
Read books collection
     ↓
Render Library
```

Library data comes entirely from Firestore.

---

# Book Opening Flow

```text
User Selects Book
        ↓
Check Local Cache
        ↓
File Exists?
```

If YES:

```text
Open Local PDF
```

If NO:

```text
Request Download URL
        ↓
Download PDF
        ↓
Store Locally
        ↓
Open PDF
```

---

# Offline Storage

## Mobile

React Native local storage:

```text
App Documents
└── books
    ├── vol-01.pdf
    ├── vol-02.pdf
    └── vol-03.pdf
```

Suggested libraries:

* react-native-fs
* react-native-blob-util

---

## Desktop

Electron local storage:

```text
AppData
└── BookReader
    └── books
        ├── vol-01.pdf
        ├── vol-02.pdf
        └── vol-03.pdf
```

Node filesystem APIs manage storage.

---

# Reading Synchronization

## Local Reading

During reading:

```text
Page Changed
      ↓
Update Local State
```

Application immediately remembers the latest page.

---

## Cloud Sync

Every few seconds or on chapter/page changes:

```text
Update Firestore
```

Example:

```json
{
  "currentPage": 183,
  "lastOpenedAt": "timestamp"
}
```

---

# Resume Reading

Example:

Phone:

```text
Current Page = 183
```

Firestore:

```text
Current Page = 183
```

Desktop:

```text
Open Same Book
       ↓
Read Firestore
       ↓
Jump To Page 183
```

---

# Security Model

## Firestore

Users may:

* Read own settings
* Read own progress
* Update own progress

Users may not:

* Access other users' progress

Books collection:

```text
Read Only
```

---

## Supabase Storage

Books bucket:

```text
Read Access:
Authenticated Users
```

Upload access:

```text
Owner Only
```

---

# Future Features

## Bookmarks

```json
{
  "userId": "uid123",
  "bookId": "series-a-vol-01",
  "page": 220,
  "label": "Chapter 8"
}
```

---

## Notes

```json
{
  "userId": "uid123",
  "bookId": "series-a-vol-01",
  "page": 220,
  "note": "Important section"
}
```

---

## Reading Statistics

* Total books read
* Pages read
* Reading streaks
* Completion rates

---

# Final System Summary

## Firebase Authentication

Responsible for:

* Login
* Identity
* Session management

## Firestore

Responsible for:

* Book catalog
* Reading progress
* User preferences

## Supabase Storage

Responsible for:

* PDF storage
* File delivery

## React Native

Responsible for:

* Mobile reading experience
* Offline storage
* Progress synchronization

## Electron

Responsible for:

* Desktop reading experience
* Offline storage
* Progress synchronization

The architecture is fully serverless, offline-first, and optimized for a personal PDF library with synchronized reading progress across devices.
