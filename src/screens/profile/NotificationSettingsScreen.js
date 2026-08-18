import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

export default function NotificationSettingsScreen({ navigation }) {
  const { profile, updateProfile } = useAuth();
  const prefs = profile?.notification_preferences || {};

  const [friendRequest, setFriendRequest] = useState(prefs.friend_request !== false);
  const [friendAttendance, setFriendAttendance] = useState(prefs.friend_attendance !== false);
  const [eventReminder, setEventReminder] = useState(prefs.event_reminder !== false);
  const [eventUpdate, setEventUpdate] = useState(prefs.event_update !== false);
  const [eventCancelled, setEventCancelled] = useState(prefs.event_cancelled !== false);
  const [nearbyEvent, setNearbyEvent] = useState(prefs.nearby_event !== false);
  const [sponsored, setSponsored] = useState(prefs.sponsored !== false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      notification_preferences: {
        friend_request: friendRequest,
        friend_attendance: friendAttendance,
        event_reminder: eventReminder,
        event_update: eventUpdate,
        event_cancelled: eventCancelled,
        nearby_event: nearbyEvent,
        sponsored: sponsored,
      },
    });
    setSaving(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Saved!', 'Notification preferences updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  const renderToggle = (label, description, icon, value, onValueChange) => (
    <View style={styles.toggleRow}>
      <View style={styles.toggleIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.toggleInfo}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surfaceBorder, true: colors.primary + '60' }}
        thumbColor={value ? colors.primary : colors.textMuted}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.sectionTitle}>SOCIAL</Text>
        {renderToggle('Friend Requests', 'When someone sends you a friend request', 'person-add-outline', friendRequest, setFriendRequest)}
        {renderToggle('Friend Activity', 'When a friend RSVPs to an event', 'people-outline', friendAttendance, setFriendAttendance)}

        <Text style={styles.sectionTitle}>EVENTS</Text>
        {renderToggle('Event Reminders', '2 hours before events you\'re attending', 'alarm-outline', eventReminder, setEventReminder)}
        {renderToggle('Event Updates', 'When an event you\'re attending gets updated', 'create-outline', eventUpdate, setEventUpdate)}
        {renderToggle('Event Cancelled', 'When an event you\'re attending is cancelled', 'close-circle-outline', eventCancelled, setEventCancelled)}
        {renderToggle('Nearby Events', 'New events near your location', 'location-outline', nearbyEvent, setNearbyEvent)}

        <Text style={styles.sectionTitle}>OTHER</Text>
        {renderToggle('Promotions', 'Sponsored events and deals', 'megaphone-outline', sponsored, setSponsored)}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Preferences'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: 60, paddingBottom: spacing.huge },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xxl },
  backBtn: { width: 40, height: 40, borderRadius: borderRadius.full, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h3 },
  sectionTitle: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xl, marginBottom: spacing.md },
  toggleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.surfaceBorder, gap: spacing.md },
  toggleIcon: { width: 36, height: 36, borderRadius: borderRadius.sm, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  toggleInfo: { flex: 1 },
  toggleLabel: { ...typography.body, fontWeight: '500', marginBottom: 2 },
  toggleDesc: { ...typography.bodySmall, color: colors.textMuted, fontSize: 12 },
  saveBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: borderRadius.lg, alignItems: 'center', marginTop: spacing.xxl },
  saveBtnText: { ...typography.button, color: colors.white },
});
