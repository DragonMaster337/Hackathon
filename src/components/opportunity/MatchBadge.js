import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../theme';
import { MATCH_BANDS } from '../../lib/matching';

/**
 * The match score. Deliberately prominent - it is the product's whole claim,
 * so it reads as a number the student can act on rather than a decoration.
 */
export default function MatchBadge({ match, size = 'md' }) {
  if (!match) return null;

  const tint = colors[MATCH_BANDS[match.band]?.color] || colors.textMuted;
  const isLarge = size === 'lg';

  return (
    <View
      style={[
        styles.wrap,
        isLarge && styles.wrapLarge,
        { borderColor: tint, backgroundColor: `${tint}1A` },
      ]}
    >
      <Text style={[styles.score, isLarge && styles.scoreLarge, { color: tint }]}>
        {match.score}%
      </Text>
      <Text style={[styles.label, isLarge && styles.labelLarge]}>
        {MATCH_BANDS[match.band]?.label || 'Match'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    minWidth: 62,
  },
  wrapLarge: { paddingHorizontal: 16, paddingVertical: 10, minWidth: 96 },
  score: { fontSize: 15, fontWeight: '700' },
  scoreLarge: { fontSize: 26 },
  label: { fontSize: 9, color: colors.textMuted, marginTop: 1, letterSpacing: 0.3 },
  labelLarge: { fontSize: 11, marginTop: 2 },
});
