# Notification & Sound System - Complete Guide

## Overview

The notification and sound system is now fully implemented! Here's what was added:

## ✅ What's Completed

### 1. **Database Schema** (convex/schema.ts)
- Added `notificationsEnabled`, `soundEnabled`, and `readReceipts` fields to userPreferences

### 2. **Backend API** (convex/userPreferences.ts)
- Updated mutation to handle notification preferences
- Preferences are saved per-workspace and per-member

### 3. **Notification Utilities** (src/lib/notifications.ts)
- Browser notification permission management
- `showMessageNotification()` - Display notifications for new messages
- `showMentionNotification()` - Display notifications for mentions
- Auto-close and click-to-focus functionality

### 4. **Sound Management** (src/lib/sounds.ts)
- Sound manager singleton with volume control
- `playNotificationSound()` - General message sound
- `playMentionSound()` - Louder sound for mentions
- `playSentSound()` - Quiet confirmation when sending

### 5. **React Hooks** (src/hooks/use-notifications.ts)
- `useNotifications()` hook with message deduplication
- Tracks seen messages to prevent duplicate notifications
- Integrates with router for click-to-navigate

### 6. **Notification Provider** (src/components/notification-provider.tsx)
- Context provider wrapping workspace layout
- Auto-requests permissions when notifications enabled
- Provides notification methods throughout the app

### 7. **Settings UI** (src/app/workspace/[workSpaceId]/settings/page.tsx)
- Enable/disable notifications toggle
- Enable/disable sounds toggle
- Read receipts toggle
- Browser permission status indicator
- All settings persist to database

## 🎵 Sound Files Setup

Sound files should be placed in `public/sounds/`:

```
public/sounds/
├── notification.mp3  (General message sound)
├── mention.mp3       (Mention alert sound)
└── sent.mp3          (Message sent confirmation)
```

**To add sounds:**
1. Download free notification sounds from:
   - [Freesound.org](https://freesound.org/)
   - [Zapsplat](https://www.zapsplat.com/)
   - [Notification Sounds](https://notificationsounds.com/)

2. Convert to MP3 (128-192 kbps, 44.1kHz)
3. Keep duration 0.5-2 seconds
4. Place in `public/sounds/`

## 🔧 How to Use

### In Your Components

#### Option 1: Use Notification Context (Recommended)
```typescript
import { useNotificationContext } from "@/components/notification-provider";

const MyComponent = () => {
  const { notifyNewMessage, notifyMention } = useNotificationContext();
  
  // When new message arrives
  notifyNewMessage({
    messageId: "msg123",
    senderName: "John Doe",
    senderId: "member456",
    messageBody: "Hello!",
    channelName: "general",
    channelId: "channel789",
  });
};
```

#### Option 2: Direct Function Calls
```typescript
import { showMessageNotification } from "@/lib/notifications";
import { playNotificationSound } from "@/lib/sounds";

// Manual trigger
showMessageNotification({
  senderName: "Jane",
  messageBody: "Hi there!",
  workspaceId: "workspace123",
});

playNotificationSound();
```

## 📋 Integration Checklist

To fully integrate notifications in message components:

- [ ] Add sound effect when user sends a message (`playSentSound()`)
- [ ] Detect new incoming messages in channels
- [ ] Check for @mentions in message body
- [ ] Call `notifyMention()` when user is mentioned
- [ ] Call `notifyNewMessage()` for other messages
- [ ] Clear notification history when switching channels
- [ ] Respect user's notification preferences

## 🎯 Features

### Browser Notifications
✅ Desktop notifications with click-to-focus  
✅ Permission request flow  
✅ Auto-dismiss after 5 seconds  
✅ Persistent for mentions  

### Sound Effects
✅ Different sounds for messages vs mentions  
✅ Adjustable volume (50% default, 70% mentions, 30% sent)  
✅ Can be disabled independently  

### User Preferences
✅ Per-workspace settings  
✅ Enable/disable notifications  
✅ Enable/disable sounds  
✅ Read receipts toggle  
✅ Theme preferences  

## 🚀 Next Steps (Optional Enhancements)

1. **Add Do Not Disturb mode** - Schedule quiet hours
2. **Notification filtering** - Only notify for DMs or mentions
3. **Custom notification sounds** - Let users upload their own
4. **Desktop app** - Better notification support via Electron
5. **Mobile push notifications** - Via service workers
6. **Vibration API** - Mobile device vibration

## 🐛 Troubleshooting

**Notifications not showing?**
- Check browser permissions in settings
- Ensure HTTPS (required for notifications)
- Check Settings page for permission status

**Sounds not playing?**
- Verify sound files exist in `public/sounds/`
- Check browser console for errors
- Ensure user interacted with page (browser requirement)

**Settings not saving?**
- Check network tab for API errors
- Verify workspace and member IDs are valid
- Check Convex dashboard for data

## 📚 Files Modified/Created

### Created
- `src/lib/notifications.ts` - Notification utilities
- `src/lib/sounds.ts` - Sound manager
- `src/hooks/use-notifications.ts` - Notification hook
- `src/components/notification-provider.tsx` - Context provider
- `src/lib/notification-integration-examples.ts` - Usage examples
- `public/sounds/README.md` - Sound file documentation

### Modified
- `convex/schema.ts` - Added notification fields
- `convex/userPreferences.ts` - Added notification mutations
- `src/app/workspace/[workSpaceId]/settings/page.tsx` - Added notification UI
- `src/app/workspace/[workSpaceId]/layout.tsx` - Wrapped with provider

## 🎉 Ready to Use!

The notification system is fully set up and ready to use. Just add the 3 sound files to `public/sounds/` and integrate notification calls into your message components as shown in the examples above.
