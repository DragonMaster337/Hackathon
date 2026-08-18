import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';

export default function TermsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last updated: July 2026</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.body}>By creating an account or using PartyFinderSA, you agree to these Terms of Service. If you do not agree, do not use the app. You must be at least 18 years old to use this service.</Text>

        <Text style={styles.sectionTitle}>2. User Accounts</Text>
        <Text style={styles.body}>You are responsible for maintaining the security of your account and password. You must provide accurate information during registration. You may not use another person's account without permission. PartyFinderSA reserves the right to suspend or terminate accounts that violate these terms.</Text>

        <Text style={styles.sectionTitle}>3. User Content</Text>
        <Text style={styles.body}>You retain ownership of content you post (events, images, descriptions). By posting, you grant PartyFinderSA a non-exclusive licence to display and distribute your content within the app. You may not post content that is illegal, harmful, threatening, abusive, defamatory, or violates the rights of others.</Text>

        <Text style={styles.sectionTitle}>4. Event Listings</Text>
        <Text style={styles.body}>Hosts are responsible for the accuracy of their event information including dates, times, locations, and pricing. PartyFinderSA does not guarantee event details and is not liable for cancellations or changes made by hosts. Attendees acknowledge that RSVP does not guarantee entry to events.</Text>

        <Text style={styles.sectionTitle}>5. Advertising & Promotions</Text>
        <Text style={styles.body}>Advertisers agree to pay the listed rates for their selected packages. Impressions and clicks are tracked automatically. Refunds are not provided for delivered impressions. PartyFinderSA reserves the right to reject any advertisement that violates these terms or is deemed inappropriate.</Text>

        <Text style={styles.sectionTitle}>6. Payments</Text>
        <Text style={styles.body}>All payments are processed in South African Rand (ZAR). Payment processing is handled by third-party providers. PartyFinderSA does not store your payment card details.</Text>

        <Text style={styles.sectionTitle}>7. Prohibited Conduct</Text>
        <Text style={styles.body}>You may not: use the app for illegal purposes; harass or threaten other users; post spam or misleading content; attempt to hack, reverse-engineer, or disrupt the service; create multiple accounts to circumvent restrictions; scrape or collect user data without consent.</Text>

        <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
        <Text style={styles.body}>PartyFinderSA is provided "as is" without warranties. We are not liable for any damages arising from your use of the app, attendance at events, or interactions with other users. Your use of the app is at your own risk.</Text>

        <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
        <Text style={styles.body}>We may update these terms at any time. Continued use after changes constitutes acceptance. We will notify users of material changes via the app.</Text>

        <Text style={styles.sectionTitle}>10. Contact</Text>
        <Text style={styles.body}>For questions about these terms, contact us at support@partyfindersa.co.za</Text>
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
