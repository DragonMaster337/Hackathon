import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: July 2026</Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.body}>We collect information you provide directly: name, email, date of birth, city, profile photo, and interests. We also collect: device information, location data (with your permission), app usage data, and event attendance records.</Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.body}>We use your information to: provide and personalise the app experience; show relevant events near you; connect you with friends; display targeted advertisements; send notifications about events and friend activity; improve our service.</Text>

        <Text style={styles.sectionTitle}>3. Location Data</Text>
        <Text style={styles.body}>We request location access to show nearby events and display your attendance on the map. Location data is only collected when you use the app and grant permission. You can revoke location access at any time in your device settings. Your exact location is not shared with other users — only your attendance at specific events is visible to friends based on your privacy settings.</Text>

        <Text style={styles.sectionTitle}>4. Data Sharing</Text>
        <Text style={styles.body}>We do not sell your personal data. We share data with: Supabase (database hosting); payment processors (for ad transactions); analytics providers (anonymised usage data). Event hosts can see aggregated attendance counts but not individual user details unless you RSVP publicly.</Text>

        <Text style={styles.sectionTitle}>5. Advertising</Text>
        <Text style={styles.body}>We show targeted ads based on your age, interests, and location. Advertisers do not receive your personal information — targeting is applied automatically by our system. You can adjust ad preferences in your notification settings.</Text>

        <Text style={styles.sectionTitle}>6. Your Privacy Controls</Text>
        <Text style={styles.body}>You can: set your profile to private or friends-only; control who sees your event attendance (public, friends only, or private); manage notification preferences; delete your account and all associated data at any time from Privacy Settings.</Text>

        <Text style={styles.sectionTitle}>7. Data Retention</Text>
        <Text style={styles.body}>We retain your data for as long as your account is active. When you delete your account, your personal data is permanently removed within 30 days. Anonymised usage data may be retained for analytics purposes.</Text>

        <Text style={styles.sectionTitle}>8. Data Security</Text>
        <Text style={styles.body}>We use industry-standard security measures including encrypted connections (HTTPS/TLS), secure authentication, and row-level security on our database. However, no system is completely secure and we cannot guarantee absolute data security.</Text>

        <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
        <Text style={styles.body}>PartyFinderSA is intended for users aged 18 and older. We do not knowingly collect data from anyone under 18. If we discover a minor's account, it will be terminated.</Text>

        <Text style={styles.sectionTitle}>10. POPIA Compliance</Text>
        <Text style={styles.body}>This privacy policy complies with the South African Protection of Personal Information Act (POPIA). You have the right to: access your personal data; correct inaccurate data; request deletion of your data; object to processing of your data. To exercise these rights, contact us at privacy@partyfindersa.co.za</Text>

        <Text style={styles.sectionTitle}>11. Changes</Text>
        <Text style={styles.body}>We may update this policy at any time. We will notify you of material changes via the app. Continued use after changes constitutes acceptance.</Text>

        <Text style={styles.sectionTitle}>12. Contact</Text>
        <Text style={styles.body}>For privacy-related questions or POPIA requests, contact our Information Officer at privacy@partyfindersa.co.za</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: borderRadius.full, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h3 },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.huge },
  updated: { ...typography.bodySmall, color: colors.textMuted, marginBottom: spacing.xl },
  sectionTitle: { ...typography.body, fontWeight: '700', marginTop: spacing.xl, marginBottom: spacing.sm },
  body: { ...typography.body, color: colors.textSecondary, lineHeight: 24 },
});
