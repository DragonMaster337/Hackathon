import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../contexts/AuthContext';
import { colors, gradients } from '../theme';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import CreateProfileScreen from '../screens/auth/CreateProfileScreen';

// Main
import HomeFeedScreen from '../screens/main/HomeFeedScreen';
import SearchScreen from '../screens/search/SearchScreen';
import ApplicationsScreen from '../screens/applications/ApplicationsScreen';
import NetworkScreen from '../screens/network/NetworkScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Opportunity
import OpportunityDetailScreen from '../screens/opportunity/OpportunityDetailScreen';
import CreateOpportunityScreen from '../screens/opportunity/CreateOpportunityScreen';

// Supporting
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import NotificationSettingsScreen from '../screens/profile/NotificationSettingsScreen';
import TermsScreen from '../screens/legal/TermsScreen';
import PrivacyPolicyScreen from '../screens/legal/PrivacyPolicyScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function PlaceholderPost() {
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}

const ICONS = {
  Home: ['home', 'home-outline'],
  Search: ['search', 'search-outline'],
  Applications: ['briefcase', 'briefcase-outline'],
  Network: ['people', 'people-outline'],
  Profile: ['person', 'person-outline'],
};

function MainTabs() {
  const { profile } = useAuth();
  const isEmployer = profile?.account_type === 'employer';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceBorder,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ focused, color }) => {
          if (route.name === 'Post') {
            return (
              <LinearGradient
                colors={gradients.primary}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: -10,
                }}
              >
                <Ionicons name="add" size={28} color={colors.white} />
              </LinearGradient>
            );
          }
          const [active, inactive] = ICONS[route.name] || ['ellipse', 'ellipse-outline'];
          return <Ionicons name={focused ? active : inactive} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeFeedScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />

      {isEmployer && (
        <Tab.Screen
          name="Post"
          component={PlaceholderPost}
          options={{ tabBarLabel: '' }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('CreateOpportunity');
            },
          })}
        />
      )}

      <Tab.Screen name="Applications" component={ApplicationsScreen} />
      <Tab.Screen name="Network" component={NetworkScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { session, profile, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : !profile ? (
        <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="OpportunityDetail" component={OpportunityDetailScreen} />
          <Stack.Screen
            name="CreateOpportunity"
            component={CreateOpportunityScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
