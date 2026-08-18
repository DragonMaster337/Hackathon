import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { scoreOpportunities, skillGaps } from '../../lib/matching';
import OpportunityCard from '../../components/opportunity/OpportunityCard';
import { colors, spacing, typography, borderRadius } from '../../theme';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'internship', label: 'Internships' },
  { key: 'learnership', label: 'Learnerships' },
  { key: 'graduate_programme', label: 'Graduate' },
  { key: 'job', label: 'Jobs' },
];

export default function HomeFeedScreen({ navigation }) {
  const { profile } = useAuth();
  const [ranked, setRanked] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [gaps, setGaps] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    let query = supabase
      .from('opportunities')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(100);

    if (filter !== 'all') query = query.eq('opportunity_type', filter);

    const { data: opportunities, error } = await query;
    if (error) {
      console.error('Feed load failed:', error.message);
      setLoading(false);
      return;
    }

    // The ranking step. Swapping the local scorer for the AI changes nothing
    // here - scoreOpportunities keeps the same contract either way.
    const scored = await scoreOpportunities(profile, opportunities || []);
    setRanked(scored);
    setGaps(skillGaps(profile, opportunities || []).slice(0, 3));

    if (profile?.id) {
      const { data: apps } = await supabase
        .from('applications')
        .select('opportunity_id')
        .eq('student_id', profile.id);
      setSavedIds(new Set((apps || []).map((a) => a.opportunity_id)));
    }

    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [filter, profile?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [filter, profile?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const hasNoSkills = !profile?.skills?.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {profile?.full_name ? `Hi ${profile.full_name.split(' ')[0]}` : 'Welcome'}
          </Text>
          <Text style={styles.subtitle}>Opportunities matched to your profile</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f.key}
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, filter === item.key && styles.chipActive]}
            onPress={() => setFilter(item.key)}
          >
            <Text style={[styles.chipText, filter === item.key && styles.chipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={ranked}
          keyExtractor={(item) => item.opportunity.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            <>
              {hasNoSkills && (
                <TouchableOpacity
                  style={styles.banner}
                  onPress={() => navigation.navigate('EditProfile')}
                >
                  <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bannerTitle}>Add your skills</Text>
                    <Text style={styles.bannerBody}>
                      Match scores need your skills to mean anything.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}

              {!hasNoSkills && gaps.length > 0 && (
                <View style={styles.gapCard}>
                  <Text style={styles.gapTitle}>Most requested skills you don't have</Text>
                  <View style={styles.gapRow}>
                    {gaps.map((g) => (
                      <View key={g.name} style={styles.gapChip}>
                        <Text style={styles.gapChipText}>{g.name}</Text>
                        <Text style={styles.gapCount}>{g.count}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          }
          renderItem={({ item }) => (
            <OpportunityCard
              opportunity={item.opportunity}
              match={item.match}
              saved={savedIds.has(item.opportunity.id)}
              onPress={() =>
                navigation.navigate('OpportunityDetail', {
                  opportunityId: item.opportunity.id,
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="briefcase-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No opportunities yet</Text>
              <Text style={styles.emptyBody}>
                Once employers post roles, they'll appear here ranked by how well they fit you.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  greeting: { ...typography.h1 },
  subtitle: { ...typography.bodySmall, marginTop: 2 },
  filterBar: { flexGrow: 0, maxHeight: 40 },
  filterContent: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: colors.white },
  list: { padding: spacing.xl, paddingTop: spacing.lg },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  bannerTitle: { ...typography.body, fontWeight: '600' },
  bannerBody: { ...typography.bodySmall, marginTop: 1 },
  gapCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  gapTitle: { ...typography.caption, marginBottom: spacing.md },
  gapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  gapChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  gapChipText: { fontSize: 12, color: colors.textPrimary },
  gapCount: { fontSize: 10, color: colors.textMuted },
  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.sm },
  emptyTitle: { ...typography.h3 },
  emptyBody: { ...typography.bodySmall, textAlign: 'center', paddingHorizontal: spacing.xxl },
});
