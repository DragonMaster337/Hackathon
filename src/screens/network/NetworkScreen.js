import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

export default function NetworkScreen() {
  const { profile } = useAuth();
  const [tab, setTab] = useState('suggested');
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!profile?.id) return;

    const { data: links } = await supabase
      .from('connections')
      .select('*, requester:profiles!requester_id(id, full_name, headline, avatar_url), addressee:profiles!addressee_id(id, full_name, headline, avatar_url)')
      .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`);

    const all = links || [];
    setConnections(
      all
        .filter((l) => l.status === 'accepted')
        .map((l) => (l.requester_id === profile.id ? l.addressee : l.requester))
        .filter(Boolean)
    );
    setPending(all.filter((l) => l.status === 'pending' && l.addressee_id === profile.id));

    const linkedIds = new Set(
      all.flatMap((l) => [l.requester_id, l.addressee_id])
    );
    linkedIds.add(profile.id);

    const { data: people } = await supabase
      .from('profiles')
      .select('id, full_name, headline, avatar_url, university, skills')
      .limit(40);

    setSuggested((people || []).filter((p) => !linkedIds.has(p.id)));
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [profile?.id])
  );

  const connect = async (targetId) => {
    await supabase.from('connections').insert({
      requester_id: profile.id,
      addressee_id: targetId,
      status: 'pending',
    });
    load();
  };

  const respond = async (connectionId, status) => {
    await supabase.from('connections').update({ status }).eq('id', connectionId);
    load();
  };

  const TABS = [
    { key: 'suggested', label: `Discover` },
    { key: 'pending', label: `Invites${pending.length ? ` (${pending.length})` : ''}` },
    { key: 'connections', label: `Connections` },
  ];

  const data =
    tab === 'suggested' ? suggested : tab === 'pending' ? pending : connections;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Network</Text>
        <Text style={styles.subtitle}>Connect with students and employers</Text>
      </View>

      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const person = tab === 'pending' ? item.requester : item;
            if (!person) return null;
            return (
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(person.full_name || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={1}>
                    {person.full_name || 'Unnamed'}
                  </Text>
                  <Text style={styles.headline} numberOfLines={1}>
                    {person.headline || person.university || 'Student'}
                  </Text>
                </View>

                {tab === 'suggested' && (
                  <TouchableOpacity style={styles.action} onPress={() => connect(person.id)}>
                    <Ionicons name="person-add-outline" size={16} color={colors.primary} />
                  </TouchableOpacity>
                )}
                {tab === 'pending' && (
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <TouchableOpacity
                      style={styles.action}
                      onPress={() => respond(item.id, 'accepted')}
                    >
                      <Ionicons name="checkmark" size={16} color={colors.matchStrong} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.action}
                      onPress={() => respond(item.id, 'declined')}
                    >
                      <Ionicons name="close" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={36} color={colors.textMuted} />
              <Text style={styles.emptyBody}>
                {tab === 'connections'
                  ? 'No connections yet.'
                  : tab === 'pending'
                  ? 'No pending invites.'
                  : 'No one to show yet.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg },
  title: { ...typography.h1 },
  subtitle: { ...typography.bodySmall, marginTop: 2 },
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.sm, marginBottom: spacing.lg },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 13, color: colors.textSecondary },
  tabTextActive: { color: colors.white, fontWeight: '600' },
  list: { paddingHorizontal: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.h3, color: colors.textSecondary },
  name: { ...typography.body, fontWeight: '600' },
  headline: { ...typography.bodySmall, marginTop: 1 },
  action: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingTop: 50, gap: spacing.sm },
  emptyBody: { ...typography.bodySmall },
});
