import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';
import MatchBadge from './MatchBadge';

const TYPE_LABELS = {
  job: 'Job',
  internship: 'Internship',
  learnership: 'Learnership',
  graduate_programme: 'Graduate programme',
  bursary: 'Bursary',
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  return Number.isFinite(diff) ? diff : null;
}

export default function OpportunityCard({ opportunity, match, onPress, saved }) {
  const closing = daysUntil(opportunity.closing_date);
  const urgent = closing !== null && closing >= 0 && closing <= 7;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={styles.logo}>
          {opportunity.logo_url ? (
            <Image source={{ uri: opportunity.logo_url }} style={styles.logoImg} />
          ) : (
            <Text style={styles.logoText}>
              {(opportunity.company_name || '?').charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={2}>
            {opportunity.title}
          </Text>
          <Text style={styles.company} numberOfLines={1}>
            {opportunity.company_name || 'Unnamed company'}
          </Text>
        </View>

        <MatchBadge match={match} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>
            {TYPE_LABELS[opportunity.opportunity_type] || opportunity.opportunity_type}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={12} color={colors.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>
            {opportunity.is_remote ? 'Remote' : opportunity.location || 'Not specified'}
          </Text>
        </View>
        {saved && <Ionicons name="bookmark" size={13} color={colors.primary} />}
      </View>

      {match?.summary ? (
        <View style={styles.matchRow}>
          <Ionicons
            name={match.missing?.length ? 'alert-circle-outline' : 'checkmark-circle-outline'}
            size={13}
            color={match.missing?.length ? colors.matchPartial : colors.matchStrong}
          />
          <Text style={styles.matchText} numberOfLines={1}>
            {match.summary}
          </Text>
        </View>
      ) : null}

      {closing !== null && closing >= 0 && (
        <Text style={[styles.closing, urgent && styles.closingUrgent]}>
          {closing === 0 ? 'Closes today' : `Closes in ${closing} day${closing === 1 ? '' : 's'}`}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  logo: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: { width: '100%', height: '100%' },
  logoText: { ...typography.h3, color: colors.textSecondary },
  headerText: { flex: 1 },
  title: { ...typography.h3, marginBottom: 2 },
  company: { ...typography.bodySmall },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1 },
  metaText: { fontSize: 11, color: colors.textMuted },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  matchText: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  closing: { fontSize: 11, color: colors.textMuted, marginTop: spacing.sm },
  closingUrgent: { color: colors.closingSoon, fontWeight: '600' },
});
