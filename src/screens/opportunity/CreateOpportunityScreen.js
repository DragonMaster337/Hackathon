import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import GradientButton from '../../components/common/GradientButton';
import { colors, spacing, typography, borderRadius } from '../../theme';

const TYPES = [
  { key: 'internship', label: 'Internship' },
  { key: 'learnership', label: 'Learnership' },
  { key: 'graduate_programme', label: 'Graduate' },
  { key: 'job', label: 'Job' },
  { key: 'bursary', label: 'Bursary' },
];

export default function CreateOpportunityScreen({ navigation }) {
  const { profile } = useAuth();

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState(profile?.company_name || '');
  const [type, setType] = useState('internship');
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [niceToHave, setNiceToHave] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const toList = (s) =>
    s.split(',').map((x) => x.trim()).filter(Boolean);

  const submit = async () => {
    if (!title.trim()) return Alert.alert('Add a title');
    if (!requiredSkills.trim()) {
      return Alert.alert(
        'Add required skills',
        'Skills drive the match score, so an opportunity without them cannot be ranked.'
      );
    }

    setSaving(true);
    const { error } = await supabase.from('opportunities').insert({
      employer_id: profile.id,
      title: title.trim(),
      company_name: companyName.trim() || profile?.company_name,
      opportunity_type: type,
      location: location.trim() || null,
      is_remote: isRemote,
      description: description.trim() || null,
      required_skills: toList(requiredSkills),
      nice_to_have_skills: toList(niceToHave),
      field_of_study: fieldOfStudy.trim() || null,
      closing_date: closingDate.trim() || null,
      application_url: applicationUrl.trim() || null,
    });
    setSaving(false);

    if (error) return Alert.alert('Could not post', error.message);
    Alert.alert('Posted', 'Your opportunity is live.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Post an opportunity</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Input label="Job title" value={title} onChangeText={setTitle} placeholder="Junior Data Analyst" autoCapitalize="words" />
          <Input label="Company" value={companyName} onChangeText={setCompanyName} placeholder="Company name" autoCapitalize="words" />

          <Text style={styles.label}>Type</Text>
          <View style={styles.chipRow}>
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.chip, type === t.key && styles.chipActive]}
                onPress={() => setType(t.key)}
              >
                <Text style={[styles.chipText, type === t.key && styles.chipTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="Location" value={location} onChangeText={setLocation} placeholder="Johannesburg" autoCapitalize="words" />

          <TouchableOpacity style={styles.toggle} onPress={() => setIsRemote(!isRemote)}>
            <Ionicons
              name={isRemote ? 'checkbox' : 'square-outline'}
              size={20}
              color={isRemote ? colors.primary : colors.textMuted}
            />
            <Text style={styles.toggleText}>This role is remote</Text>
          </TouchableOpacity>

          <Input
            label="Required skills"
            value={requiredSkills}
            onChangeText={setRequiredSkills}
            placeholder="SQL, Excel, Python"
          />
          <Text style={styles.hint}>
            Comma separated. These are what the match score is calculated against.
          </Text>

          <Input label="Nice to have" value={niceToHave} onChangeText={setNiceToHave} placeholder="Power BI, Tableau" />
          <Input label="Field of study" value={fieldOfStudy} onChangeText={setFieldOfStudy} placeholder="Information Technology" autoCapitalize="words" />
          <Input label="Description" value={description} onChangeText={setDescription} placeholder="What the role involves" multiline />
          <Input label="Closing date" value={closingDate} onChangeText={setClosingDate} placeholder="2026-09-30" />
          <Input label="Application link" value={applicationUrl} onChangeText={setApplicationUrl} placeholder="https://" />

          <View style={{ marginTop: spacing.xl }}>
            <GradientButton title="Post opportunity" onPress={submit} loading={saving} />
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  navTitle: { ...typography.h3 },
  scroll: { paddingHorizontal: spacing.xl },
  label: { ...typography.caption, marginTop: spacing.lg, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md },
  toggleText: { ...typography.body },
  hint: { ...typography.bodySmall, color: colors.textMuted, marginTop: -spacing.sm },
});
