import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { markAsRead, markAllAsRead } from '../../utils/notifications';
import { colors, spacing, typography, borderRadius } from '../../theme';

const ICON_MAP = {
  friend_request: { name: 'person-add', color: '#8B5CF6' },
  friend_attendance: { name: 'people', color: '#06D6A0' },
  event_invite: { name: 'paper-plane', color: '#EC4899' },
  event_reminder: { name: 'alarm', color: '#FBBF24' },
  event_update: { name: 'create', color: '#3B82F6' },
  event_cancelled: { name: 'close-circle', color: '#EF4444' },
  nearby_event: { name: 'location', color: '#EC4899' },
  sponsored: { name: 'megaphone', color: '#F59E0B' },
};

export default function NotificationsScreen({ navigation }) {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    if (!profile) return;

    const channelName = 'notif-' + Date.now();
    const channel = supabase.channel(channelName);
    
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profile.id}`,
      },
      (payload) => {
        setNotifications((prev) => [payload.new, ...prev]);
      }
    );
    
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error) {
      setNotifications(data || []);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleNotificationTap = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
    }

    // Navigate based on type
    if (notification.type === 'friend_request') {
      navigation.navigate('MainTabs', { screen: 'Friends' });
    } else if (notification.type === 'event_invite' && notification.data?.event_id) {
      navigation.navigate('EventDetail', { eventId: notification.data.event_id });
    } else if (notification.type === 'friend_attendance' && notification.data?.event_id) {
      navigation.navigate('EventDetail', { eventId: notification.data.event_id });
    } else if (notification.type === 'event_reminder' && notification.data?.event_id) {
      navigation.navigate('EventDetail', { eventId: notification.data.event_id });
    } else if (notification.type === 'event_update' && notification.data?.event_id) {
      navigation.navigate('EventDetail', { eventId: notification.data.event_id });
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead(profile.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const renderNotification = ({ item }) => {
    const icon = ICON_MAP[item.type] || { name: 'notifications', color: colors.primary };
    const avatarUrl = item.data?.avatar_url;

    return (
      <TouchableOpacity
        style={[styles.notifItem, !item.is_read && styles.notifUnread]}
        onPress={() => handleNotificationTap(item)}
        activeOpacity={0.7}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.notifAvatar} />
        ) : (
          <View style={[styles.notifIcon, { backgroundColor: icon.color + '20' }]}>
            <Ionicons name={icon.name} size={20} color={icon.color} />
          </View>
        )}
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, !item.is_read && styles.notifTitleUnread]}>
            {item.title}
          </Text>
          <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.notifTime}>{getTimeAgo(item.created_at)}</Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Read all</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Unread count */}
      {unreadCount > 0 && (
        <Text style={styles.unreadLabel}>
          {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
        </Text>
      )}

      {/* Notification list */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>
              When friends RSVP to events or send you friend requests, you'll see them here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h2,
  },
  markAllBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  markAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  unreadLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.huge,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: spacing.md,
  },
  notifUnread: {
    backgroundColor: colors.primary + '08',
    borderColor: colors.primary + '25',
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    ...typography.body,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  notifTitleUnread: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  notifBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontSize: 11,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
