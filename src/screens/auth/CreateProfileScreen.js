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
import { LinearGradient } from 'expo-linear-gradient';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import GradientButton from '../../components/common/GradientButton';
import { colors, spacing, typography, borderRadius, gradients } from '../../theme';

export default function CreateProfileScreen() {
  const { createProfile } = useAuth();

  const [step, setStep] = useState(1); // 1: account type, 2: details, 3: skills
  const [accountType, setAccountType] = useState(null);
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [university, setUniversity] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('skills')
      .select('name, category')
      .then(({ data }) => setAllSkills(data || []));
  }, []);

  const toggleSkill = (name) =>
    setSelectedSkills((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );

  const submit = async () => {
    setSaving(true);
    const { error } = await createProfile({
      account_type: accountType,
      full_name: fullName.trim(),
      headline: headline.trim() || null,
      location: location.trim() || null,
      university: accountType === 'student' ? university.trim() || null : null,
      field_of_study: accountType === 'student' ? fieldOfStudy.trim() || null : null,
      company_name: accountType === 'employer' ? companyName.trim() || null : null,
      skills: accountType === 'student' ? selectedSkills : [],
    });
    setSaving(false);
    if (error) Alert.alert('Could not save profile', error.message);
  };

  // ---------- Step 1: who are you ----------
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>How will you be using the app?</Text>

          {[
            {
              key: 'student',
              icon: 'school',
              title: 'I am a student',
              body: 'Find internships, learnerships and graduate roles matched to your skills.',
            },
            {
              key: 'employer',
              icon: 'business',
              title: 'I am an employer',
              body: 'Post opportunities and reach graduates who actually fit the role.',
            },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.card, accountType === option.key && styles.cardSelected]}
              onPress={() => setAccountType(option.key)}
            >
              <LinearGradient
                colors={
                  accountType === option.key
                    ? gradients.primary
                    : [colors.surfaceLight, colors.surfaceLight]
                }
                style={styles.cardIcon}
              >
                <Ionicons
                  name={option.icon}
                  size={26}
                  color={accountType === option.key ? colors.white : colors.textMuted}
                />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{option.title}</Text>
                <Text style={styles.cardBody}>{option.body}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={{ marginTop: spacing.xxl }}>
            <GradientButton
              title="Continue"
              disabled={!accountType}
              onPress={() => setStep(2)}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---------- Step 2: details ----------
  if (step === 2) {
    const canContinue = fullName.trim().length > 1;
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => setStep(1)} style={styles.back}>
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.title}>About you</Text>
            <Text style={styles.subtitle}>This is what employers and students see.</Text>

            <Input label="Full name" value={fullName} onChangeText={setFullName} placeholder="Thabo Mokoena" autoCapitalize="words" />
            <Input
              label="Headline"
              value={headline}
              onChangeText={setHeadline}
              placeholder={
                accountType === 'student'
                  ? 'Final-year IT student | aspiring data analyst'
                  : 'Talent lead at Acme'
              }
              autoCapitalize="sentences"
            />
            <Input label="Location" value={location} onChangeText={setLocation} placeholder="Johannesburg" autoCapitalize="words" />

            {accountType === 'student' ? (
              <>
                <Input label="University / college" value={university} onChangeText={setUniversity} placeholder="Richfield" autoCapitalize="words" />
                <Input label="Field of study" value={fieldOfStudy} onChangeText={setFieldOfStudy} placeholder="Information Technology" autoCapitalize="words" />
              </>
            ) : (
              <Input label="Company" value={companyName} onChangeText={setCompanyName} placeholder="Company name" autoCapitalize="words" />
            )}

            <View style={{ marginTop: spacing.xl }}>
              <GradientButton
                title={accountType === 'student' ? 'Continue' : 'Finish'}
                disabled={!canContinue}
                loading={saving}
                onPress={() => (accountType === 'student' ? setStep(3) : submit())}
              />
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ---------- Step 3: skills ----------
  const categories = [...new Set(allSkills.map((s) => s.category))];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => setStep(2)} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.title}>Your skills</Text>
        <Text style={styles.subtitle}>
          Every match score is calculated from these. Pick everything you can genuinely do.
        </Text>

        {categories.map((category) => (
          <View key={category} style={styles.skillSection}>
            <Text style={styles.skillCategory}>{category}</Text>
            <View style={styles.chipRow}>
              {allSkills
                .filter((s) => s.category === category)
                .map((s) => {
                  const on = selectedSkills.includes(s.name);
                  return (
                    <TouchableOpacity
                      key={s.name}
                      style={[styles.chip, on && styles.chipActive]}
                      onPress={() => toggleSkill(s.name)}
                    >
                      <Text style={[styles.chipText, on && styles.chipTextActive]}>{s.name}</Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
          </View>
        ))}

        <View style={{ marginTop: spacing.xxl }}>
          <GradientButton
            title={`Finish${selectedSkills.length ? ` (${selectedSkills.length} selected)` : ''}`}
            disabled={selectedSkills.length === 0}
            loading={saving}
            onPress={submit}
          />
          <Text style={styles.footnote}>
            You can add more skills from your profile at any time.
          </Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  back: { width: 40, height: 40, justifyContent: 'center', marginBottom: spacing.sm },
  title: { ...typography.h1 },
  subtitle: { ...typography.bodySmall, marginTop: 4, marginBottom: spacing.xxl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
  },
  cardSelected: { borderColor: colors.primary },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { ...typography.h3 },
  cardBody: { ...typography.bodySmall, marginTop: 2 },
  skillSection: { marginBottom: spacing.xl },
  skillCategory: { ...typography.caption, marginBottom: spacing.md },
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
  footnote: { ...typography.bodySmall, textAlign: 'center', marginTop: spacing.md },
});
