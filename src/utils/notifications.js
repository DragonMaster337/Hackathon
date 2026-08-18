import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register device for push notifications and store token in Supabase
 */
export const registerForPushNotifications = async (userId) => {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  // Get the push token
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: undefined, // Uses the project ID from app.json
    });
    const token = tokenData.data;

    // Store token in Supabase
    await supabase.from('push_tokens').upsert(
      {
        user_id: userId,
        token,
        platform: Platform.OS,
        is_active: true,
      },
      { onConflict: 'token' }
    );

    return token;
  } catch (err) {
    console.log('Push token error:', err);
    return null;
  }
};

/**
 * Create a notification in the database
 */
export const createNotification = async ({ userId, type, title, body, data = {} }) => {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      body,
      data,
    });
  } catch (err) {
    console.error('Create notification error:', err);
  }
};

/**
 * Notify a user about a friend request
 */
export const notifyFriendRequest = async (toUserId, fromUserName, fromAvatarUrl) => {
  await createNotification({
    userId: toUserId,
    type: 'connection_request',
    title: 'New Friend Request',
    body: `${fromUserName} wants to be your friend`,
    data: { fromUserName, avatar_url: fromAvatarUrl || null },
  });
};

/**
 * Notify a student's connections when they land an offer.
 */
export const notifyConnectionsOfOffer = async (userId, userName, opportunityTitle) => {
  try {
    const { data: links } = await supabase
      .from('connections')
      .select('requester_id, addressee_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (!links?.length) return;

    const connectionIds = links.map((c) =>
      c.requester_id === userId ? c.addressee_id : c.requester_id
    );

    const notifications = connectionIds.map((id) => ({
      user_id: id,
      type: 'connection_update',
      title: 'Good news in your network',
      body: `${userName} received an offer for ${opportunityTitle}`,
      data: { user_name: userName },
    }));

    await supabase.from('notifications').insert(notifications);
  } catch (err) {
    console.error('Notify connections error:', err);
  }
};

/**
 * Notify user about friend request accepted
 */
export const notifyConnectionAccepted = async (toUserId, acceptedByName, acceptedByAvatarUrl) => {
  await createNotification({
    userId: toUserId,
    type: 'connection_request',
    title: 'Friend Request Accepted!',
    body: `${acceptedByName} accepted your friend request`,
    data: { acceptedByName, avatar_url: acceptedByAvatarUrl || null },
  });
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (userId) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) return 0;
  return count || 0;
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId) => {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId) => {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
};
