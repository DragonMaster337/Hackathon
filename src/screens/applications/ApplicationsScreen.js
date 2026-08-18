import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../theme';

const STAGES = [
  { key: 'saved', label: 'Saved', icon: 'bookmark-outline' },
  { key: 'applied', label: 'Applied', icon: 'paper-plane-outline' },
  { key: 'interviewing', label: 'Interviewing', icon: 'chatbubbles-outline' },
  { key: 'offer', label: 'Offer', icon: 'trophy-outline' },
];

export default function ApplicationsScreen({ navigation }) {
  const { profile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stage, setStage] = useState('saved');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('applications')
      .select('*, opportunities(id, title, company_name, location, is_remote, closing_date)')
      .eq('student_id', profile.id)
      .order('updated_at', { ascending: false });
    setApplications(data || []);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [profile?.id])
  );

  const counts = STAGES.reduce((acc, s) => {
    acc[s.key] = applications.filter((a) => a.status === s.key).length;
    return acc;
  }, {});

  const visible = applications.filter((a) => a.status === stage);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Applications</Text>
        <Text style={styles.subtitle}>Track every role from saved to offer</Text>
      </View>

      <View style={styles.stageRow}>
        {STAGES.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.stage, stage === s.key && styles.stageActive]}
            onPress={() => setStage(s.key)}
          >
            <Ionicons
              name={s.icon}
              size={16}
              color={stage === s.key ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.stageCount, stage === s.key && styles.stageCountActive]}>
              {counts[s.key] || 0}
            </Text>
            <Text style={[styles.stageLabel, stage === s.key && styles.stageLabelActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const opp = item.opportunities;
            if (!opp) return null;
            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() =>
                  navigation.navigate('OpportunityDetail', { opportunityId: opp.id })
                }
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {opp.title}
                  </Text>
                  <Text style={styles.rowCompany} numberOfLines={1}>
                    {opp.company_name} · {opp.is_remote ? 'Remote' : opp.location}
                  </Text>
                </View>
                {item.match_score != null && (
                  <Text style={styles.rowScore}>{item.match_score}%</Text>
                )}
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="folder-open-outline" size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptyBody}>
                {stage === 'saved'
                  ? 'Save opportunities from the feed to keep them here.'
                  : `No applications at the ${stage} stage.`}
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
  stageRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: 2,
  },
  stageActive: { borderColor: colors.primary, backgroundColor: colors.surfaceLight },
  stageCount: { ...typography.h3, color: colors.textSecondary },
  stageCountActive: { color: colors.textPrimary },
  stageLabel: { fontSize: 10, color: colors.textMuted },
  stageLabelActive: { color: colors.textSecondary },
  list: { paddingHorizontal: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  rowTitle: { ...typography.body, fontWeight: '600' },
  rowCompany: { ...typography.bodySmall, marginTop: 1 },
  rowScore: { fontSize: 13, fontWeight: '700', color: colors.primary },
  empty: { alignItems: 'center', paddingTop: 50, gap: spacing.sm },
  emptyTitle: { ...typography.h3 },
  emptyBody: { ...typography.bodySmall, textAlign: 'center', paddingHorizontal: spacing.xxl },
});
