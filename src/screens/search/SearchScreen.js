import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { scoreOpportunities } from '../../lib/matching';
import OpportunityCard from '../../components/opportunity/OpportunityCard';
import { colors, spacing, typography, borderRadius } from '../../theme';

export default function SearchScreen({ navigation }) {
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [skills, setSkills] = useState([]);
  const [activeSkill, setActiveSkill] = useState(null);

  useEffect(() => {
    supabase
      .from('skills')
      .select('name')
      .limit(20)
      .then(({ data }) => setSkills((data || []).map((s) => s.name)));
  }, []);

  useEffect(() => {
    const timer = setTimeout(run, 250);
    return () => clearTimeout(timer);
  }, [query, activeSkill]);

  const run = async () => {
    let q = supabase.from('opportunities').select('*').eq('is_active', true).limit(50);

    if (query.trim()) {
      q = q.or(
        `title.ilike.%${query}%,company_name.ilike.%${query}%,location.ilike.%${query}%`
      );
    }
    if (activeSkill) {
      q = q.contains('required_skills', [activeSkill]);
    }

    const { data } = await q;
    setResults(await scoreOpportunities(profile, data || []));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search roles, companies, places"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        horizontal
        data={skills}
        keyExtractor={(s) => s}
        showsHorizontalScrollIndicator={false}
        style={styles.skillBar}
        contentContainerStyle={styles.skillContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, activeSkill === item && styles.chipActive]}
            onPress={() => setActiveSkill(activeSkill === item ? null : item)}
          >
            <Text style={[styles.chipText, activeSkill === item && styles.chipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.opportunity.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <OpportunityCard
            opportunity={item.opportunity}
            match={item.match}
            onPress={() =>
              navigation.navigate('OpportunityDetail', { opportunityId: item.opportunity.id })
            }
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {query || activeSkill ? 'Nothing matched that search.' : 'Search for an opportunity.'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    height: 46,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  input: { flex: 1, color: colors.textPrimary, fontSize: 15 },
  skillBar: { flexGrow: 0, maxHeight: 40 },
  skillContent: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  list: { padding: spacing.xl, paddingTop: spacing.lg },
  empty: { ...typography.bodySmall, textAlign: 'center', marginTop: 40 },
});
