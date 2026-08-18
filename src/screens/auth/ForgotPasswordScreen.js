import React, { useState } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import GradientButton from '../../components/common/GradientButton';
import Input from '../../components/common/Input';
import { colors, spacing, typography, borderRadius } from '../../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.sentWrap}>
          <View style={styles.sentIcon}>
            <Ionicons name="mail-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.sentTitle}>Check your email</Text>
          <Text style={styles.sentText}>
            We sent a password reset link to {email}. Check your inbox and follow the link to reset your password.
          </Text>
          <GradientButton title="Back to Login" onPress={() => navigation.goBack()} style={{ marginTop: spacing.xxl }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password.
          </Text>

          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com"
            icon="mail-outline" keyboardType="email-address" autoCapitalize="none" />

          <GradientButton title="Send Reset Link" onPress={handleReset} loading={loading} style={{ marginTop: spacing.lg }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xxl, paddingTop: 60, paddingBottom: spacing.xxxl },
  backBtn: { width: 40, height: 40, borderRadius: borderRadius.full, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xxl },
  title: { ...typography.h1, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xxxl, lineHeight: 22 },
  sentWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl },
  sentIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  sentTitle: { ...typography.h2, marginBottom: spacing.md },
  sentText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
