import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

export default function ProfileScreen({ navigation }) {
  const { profile, signOut } = useAuth();
  const [connections, setConnections] = useState(0);
  const [applied, setApplied] = useState(0);

  const load = async () => {
    if (!profile?.id) return;

    const { data: count } = await supabase.rpc('connection_count', {
      target_user_id: profile.id,
    });
    setConnections(count || 0);

    const { count: appCount } = await supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', profile.id)
      .neq('status', 'saved');
    setApplied(appCount || 0);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [profile?.id])
  );

  const isEmployer = profile?.account_type === 'employer';
  const profileFields = [
    profile?.full_name,
    profile?.headline,
    profile?.university,
    profile?.skills?.length,
    profile?.cv_url,
  ];
  const completeness = Math.round(
    (profileFields.filter(Boolean).length / profileFields.length) * 100
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.full_name || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="create-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{profile?.full_name || 'Add your name'}</Text>
        <Text style={styles.headline}>
          {profile?.headline || (isEmployer ? 'Employer' : 'Student')}
        </Text>
        {profile?.university ? (
          <Text style={styles.university}>{profile.university}</Text>
        ) : null}

        <View style={styles.statRow}>
          <Stat value={connections} label="Connections" />
          <Stat value={applied} label="Applications" />
          <Stat value={`${completeness}%`} label="Profile" />
        </View>

        {completeness < 100 && (
          <TouchableOpacity
            style={styles.nudge}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="alert-circle-outline" size={18} color={colors.matchPartial} />
            <Text style={styles.nudgeText}>
              A complete profile produces far better matches.
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        <Section title="Skills">
          {profile?.skills?.length ? (
            <View style={styles.chipRow}>
              {profile.skills.map((s) => (
                <View key={s} style={styles.chip}>
                  <Text style={styles.chipText}>{s}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              No skills yet. Match scores depend on these.
            </Text>
          )}
        </Section>

        {profile?.target_roles?.length ? (
          <Section title="Target roles">
            <View style={styles.chipRow}>
              {profile.target_roles.map((r) => (
                <View key={r} style={styles.chip}>
                  <Text style={styles.chipText}>{r}</Text>
                </View>
              ))}
            </View>
          </Section>
        ) : null}

        {profile?.bio ? (
          <Section title="About">
            <Text style={styles.bodyText}>{profile.bio}</Text>
          </Section>
        ) : null}

        <View style={styles.menu}>
          <MenuRow
            icon="settings-outline"
            label="Notification settings"
            onPress={() => navigation.navigate('NotificationSettings')}
          />
          <MenuRow
            icon="document-text-outline"
            label="Terms"
            onPress={() => navigation.navigate('Terms')}
          />
          <MenuRow
            icon="shield-outline"
            label="Privacy policy"
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <MenuRow
            icon="log-out-outline"
            label="Sign out"
            danger
            onPress={() =>
              Alert.alert('Sign out?', '', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign out', style: 'destructive', onPress: signOut },
              ])
            }
          />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function MenuRow({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
      <Ionicons name={icon} size={19} color={danger ? colors.error : colors.textSecondary} />
      <Text style={[styles.menuLabel, danger && { color: colors.error }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.textSecondary },
  name: { ...typography.h1, marginTop: spacing.lg },
  headline: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  university: { ...typography.bodySmall, marginTop: 2 },
  statRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: spacing.lg,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.h2 },
  statLabel: { ...typography.bodySmall, marginTop: 1 },
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  nudgeText: { ...typography.bodySmall, flex: 1 },
  section: { marginTop: spacing.xxl },
  sectionTitle: { ...typography.caption, marginBottom: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: { fontSize: 12, color: colors.textPrimary },
  emptyText: { ...typography.bodySmall },
  bodyText: { ...typography.body, color: colors.textSecondary },
  menu: { marginTop: spacing.xxl, gap: 1 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  menuLabel: { ...typography.body, flex: 1 },
});
