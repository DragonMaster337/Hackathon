import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { scoreOpportunity } from '../../lib/matching';
import MatchBadge from '../../components/opportunity/MatchBadge';
import GradientButton from '../../components/common/GradientButton';
import { colors, spacing, typography, borderRadius } from '../../theme';

const STATUS_FLOW = ['saved', 'applied', 'interviewing', 'offer'];

export default function OpportunityDetailScreen({ route, navigation }) {
  const { opportunityId } = route.params;
  const { profile } = useAuth();

  const [opportunity, setOpportunity] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    load();
    supabase.rpc('increment_opportunity_views', { target_opportunity_id: opportunityId });
  }, [opportunityId]);

  const load = async () => {
    const { data } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single();
    setOpportunity(data);

    if (profile?.id) {
      const { data: app } = await supabase
        .from('applications')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .eq('student_id', profile.id)
        .maybeSingle();
      setApplication(app);
    }
    setLoading(false);
  };

  const match = opportunity ? scoreOpportunity(profile, opportunity) : null;

  /**
   * Persist the match result alongside the application. Storing the score at
   * the time of applying means we can later measure whether high-scoring
   * matches actually converted - the feedback loop the AI will train against.
   */
  const upsertApplication = async (status) => {
    setBusy(true);
    const payload = {
      opportunity_id: opportunityId,
      student_id: profile.id,
      status,
      match_score: match?.score ?? null,
      match_reasons: {
        matched: match?.matched || [],
        missing: match?.missing || [],
        summary: match?.summary || '',
      },
      updated_at: new Date().toISOString(),
    };
    if (status !== 'saved') payload.applied_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('applications')
      .upsert(payload, { onConflict: 'opportunity_id,student_id' })
      .select()
      .single();

    setBusy(false);
    if (error) {
      Alert.alert('Something went wrong', error.message);
      return;
    }
    setApplication(data);
  };

  const openApplyLink = () => {
    if (opportunity?.application_url) {
      Linking.openURL(opportunity.application_url).catch(() =>
        Alert.alert('Could not open link')
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 60 }} color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!opportunity) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>This opportunity is no longer available.</Text>
      </SafeAreaView>
    );
  }

  const salary =
    opportunity.is_salary_hidden || (!opportunity.salary_min && !opportunity.salary_max)
      ? null
      : `R${opportunity.salary_min ?? '?'} - R${opportunity.salary_max ?? '?'} / ${opportunity.salary_period}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{opportunity.title}</Text>
        <Text style={styles.company}>{opportunity.company_name}</Text>

        <View style={styles.metaRow}>
          <Meta icon="location-outline" text={opportunity.is_remote ? 'Remote' : opportunity.location} />
          <Meta icon="briefcase-outline" text={opportunity.opportunity_type?.replace(/_/g, ' ')} />
          {salary && <Meta icon="cash-outline" text={salary} />}
          {opportunity.closing_date && (
            <Meta icon="calendar-outline" text={`Closes ${opportunity.closing_date}`} />
          )}
        </View>

        {/* Match breakdown - the explanation, not just the number. */}
        <View style={styles.matchCard}>
          <View style={styles.matchHeader}>
            <MatchBadge match={match} size="lg" />
            <View style={{ flex: 1 }}>
              <Text style={styles.matchTitle}>Why this score</Text>
              <Text style={styles.matchSummary}>{match?.summary}</Text>
            </View>
          </View>

          {match?.matched?.length > 0 && (
            <SkillGroup
              label="You have"
              skills={match.matched}
              color={colors.matchStrong}
              icon="checkmark"
            />
          )}
          {match?.missing?.length > 0 && (
            <SkillGroup
              label="You're missing"
              skills={match.missing}
              color={colors.matchPartial}
              icon="close"
            />
          )}
          {match?.bonus?.length > 0 && (
            <SkillGroup
              label="Bonus skills you have"
              skills={match.bonus}
              color={colors.primary}
              icon="star"
            />
          )}
        </View>

        {opportunity.description ? (
          <Section title="About the role" body={opportunity.description} />
        ) : null}
        {opportunity.responsibilities ? (
          <Section title="Responsibilities" body={opportunity.responsibilities} />
        ) : null}
        {opportunity.min_qualification ? (
          <Section title="Minimum qualification" body={opportunity.min_qualification} />
        ) : null}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.actionBar}>
        {application?.status && application.status !== 'saved' ? (
          <View style={styles.statusPill}>
            <Ionicons name="checkmark-circle" size={16} color={colors.matchStrong} />
            <Text style={styles.statusText}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => upsertApplication('saved')}
            disabled={busy}
          >
            <Ionicons
              name={application ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={application ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }}>
          <GradientButton
            title={application?.status && application.status !== 'saved' ? 'Update status' : 'Apply'}
            loading={busy}
            onPress={() => {
              if (application?.status && application.status !== 'saved') {
                const next = STATUS_FLOW[STATUS_FLOW.indexOf(application.status) + 1];
                if (next) upsertApplication(next);
                else Alert.alert('Already at the final stage');
              } else {
                upsertApplication('applied');
                openApplyLink();
              }
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Meta({ icon, text }) {
  if (!text) return null;
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={13} color={colors.textMuted} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

function Section({ title, body }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
    </View>
  );
}

function SkillGroup({ label, skills, color, icon }) {
  return (
    <View style={styles.skillGroup}>
      <Text style={styles.skillLabel}>{label}</Text>
      <View style={styles.skillRow}>
        {skills.map((s) => (
          <View key={s} style={[styles.skillChip, { borderColor: `${color}55` }]}>
            <Ionicons name={icon} size={11} color={color} />
            <Text style={styles.skillText}>{s}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  navBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  scroll: { paddingHorizontal: spacing.xl },
  notFound: { ...typography.body, textAlign: 'center', marginTop: 60 },
  title: { ...typography.h1, marginBottom: 4 },
  company: { ...typography.body, color: colors.textSecondary },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.lg },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textMuted, textTransform: 'capitalize' },
  matchCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  matchHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  matchTitle: { ...typography.h3 },
  matchSummary: { ...typography.bodySmall, marginTop: 2 },
  skillGroup: { marginTop: spacing.lg },
  skillLabel: { ...typography.caption, marginBottom: spacing.sm },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skillText: { fontSize: 12, color: colors.textPrimary },
  section: { marginTop: spacing.xl },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  sectionBody: { ...typography.body, color: colors.textSecondary },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  saveBtn: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
  },
  statusText: { fontSize: 12, color: colors.textPrimary, fontWeight: '600' },
});
