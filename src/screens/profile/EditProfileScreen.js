import React, { useState, useEffect } from 'react';
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

export default function EditProfileScreen({ navigation }) {
  const { profile, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [headline, setHeadline] = useState(profile?.headline || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [university, setUniversity] = useState(profile?.university || '');
  const [qualification, setQualification] = useState(profile?.qualification || '');
  const [fieldOfStudy, setFieldOfStudy] = useState(profile?.field_of_study || '');
  const [graduationYear, setGraduationYear] = useState(
    profile?.graduation_year ? String(profile.graduation_year) : ''
  );
  const [companyName, setCompanyName] = useState(profile?.company_name || '');
  const [targetRoles, setTargetRoles] = useState((profile?.target_roles || []).join(', '));
  const [skills, setSkills] = useState(profile?.skills || []);
  const [allSkills, setAllSkills] = useState([]);
  const [saving, setSaving] = useState(false);

  const isStudent = profile?.account_type !== 'employer';

  useEffect(() => {
    supabase
      .from('skills')
      .select('name, category')
      .then(({ data }) => setAllSkills(data || []));
  }, []);

  const toggleSkill = (name) =>
    setSkills((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]));

  const save = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      full_name: fullName.trim(),
      headline: headline.trim() || null,
      bio: bio.trim() || null,
      location: location.trim() || null,
      university: isStudent ? university.trim() || null : null,
      qualification: isStudent ? qualification.trim() || null : null,
      field_of_study: isStudent ? fieldOfStudy.trim() || null : null,
      graduation_year: graduationYear ? parseInt(graduationYear, 10) || null : null,
      company_name: !isStudent ? companyName.trim() || null : null,
      target_roles: targetRoles
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
      skills,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);

    if (error) return Alert.alert('Could not save', error.message);
    navigation.goBack();
  };

  const categories = [...new Set(allSkills.map((s) => s.category))];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Edit profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Input label="Full name" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
          <Input label="Headline" value={headline} onChangeText={setHeadline} autoCapitalize="sentences" />
          <Input label="About" value={bio} onChangeText={setBio} multiline autoCapitalize="sentences" />
          <Input label="Location" value={location} onChangeText={setLocation} autoCapitalize="words" />

          {isStudent ? (
            <>
              <Input label="University / college" value={university} onChangeText={setUniversity} autoCapitalize="words" />
              <Input label="Qualification" value={qualification} onChangeText={setQualification} placeholder="BSc Information Technology" autoCapitalize="words" />
              <Input label="Field of study" value={fieldOfStudy} onChangeText={setFieldOfStudy} autoCapitalize="words" />
              <Input label="Graduation year" value={graduationYear} onChangeText={setGraduationYear} keyboardType="number-pad" placeholder="2026" />
              <Input label="Target roles" value={targetRoles} onChangeText={setTargetRoles} placeholder="Data Analyst, Junior Developer" />

              <Text style={styles.label}>Skills</Text>
              <Text style={styles.hint}>
                These drive your match scores. {skills.length} selected.
              </Text>
              {categories.map((category) => (
                <View key={category} style={styles.skillSection}>
                  <Text style={styles.skillCategory}>{category}</Text>
                  <View style={styles.chipRow}>
                    {allSkills
                      .filter((s) => s.category === category)
                      .map((s) => {
                        const on = skills.includes(s.name);
                        return (
                          <TouchableOpacity
                            key={s.name}
                            style={[styles.chip, on && styles.chipActive]}
                            onPress={() => toggleSkill(s.name)}
                          >
                            <Text style={[styles.chipText, on && styles.chipTextActive]}>
                              {s.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                </View>
              ))}
            </>
          ) : (
            <Input label="Company" value={companyName} onChangeText={setCompanyName} autoCapitalize="words" />
          )}

          <View style={{ marginTop: spacing.xl }}>
            <GradientButton title="Save changes" onPress={save} loading={saving} />
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
  label: { ...typography.caption, marginTop: spacing.xl },
  hint: { ...typography.bodySmall, marginBottom: spacing.lg },
  skillSection: { marginBottom: spacing.lg },
  skillCategory: { ...typography.caption, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: colors.white, fontWeight: '600' },
});
