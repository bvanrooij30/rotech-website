import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { APP_CONFIG } from '../../constants/config';

interface SettingItem {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export function SettingsScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Uitloggen',
      'Weet je zeker dat je wilt uitloggen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        { text: 'Uitloggen', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleContact = (type: 'email' | 'phone' | 'whatsapp') => {
    switch (type) {
      case 'email':
        Linking.openURL(`mailto:${APP_CONFIG.supportEmail}`);
        break;
      case 'phone':
        Linking.openURL(`tel:${APP_CONFIG.supportPhone}`);
        break;
      case 'whatsapp':
        Linking.openURL(`https://wa.me/${APP_CONFIG.supportPhone.replace(/\s/g, '').replace('+', '')}`);
        break;
    }
  };

  const sections: SettingSection[] = [
    {
      title: 'Account',
      items: [
        {
          icon: '👤',
          label: 'Profiel bewerken',
          value: user?.name,
          onPress: () => Alert.alert('Binnenkort beschikbaar', 'Deze functie komt binnenkort.'),
        },
        {
          icon: '📧',
          label: 'E-mailadres',
          value: user?.email,
        },
        {
          icon: '🔒',
          label: 'Wachtwoord wijzigen',
          onPress: () => Alert.alert('Binnenkort beschikbaar', 'Deze functie komt binnenkort.'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: '📧',
          label: 'E-mail support',
          value: APP_CONFIG.supportEmail,
          onPress: () => handleContact('email'),
        },
        {
          icon: '📞',
          label: 'Bel ons',
          value: APP_CONFIG.supportPhone,
          onPress: () => handleContact('phone'),
        },
        {
          icon: '💬',
          label: 'WhatsApp',
          onPress: () => handleContact('whatsapp'),
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          icon: '🌐',
          label: 'Website bezoeken',
          onPress: () => Linking.openURL(APP_CONFIG.websiteUrl),
        },
        {
          icon: 'ℹ️',
          label: 'App versie',
          value: APP_CONFIG.version,
        },
      ],
    },
    {
      title: '',
      items: [
        {
          icon: '🚪',
          label: 'Uitloggen',
          onPress: handleLogout,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Instellingen</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {user?.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Settings Sections */}
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            {section.title && (
              <Text style={styles.sectionTitle}>{section.title}</Text>
            )}
            <Card padding="none" style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex < section.items.length - 1 && styles.settingItemBorder,
                  ]}
                  onPress={item.onPress}
                  disabled={!item.onPress}
                >
                  <Text style={styles.settingIcon}>{item.icon}</Text>
                  <View style={styles.settingContent}>
                    <Text
                      style={[
                        styles.settingLabel,
                        item.destructive && styles.settingLabelDestructive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.value && (
                      <Text style={styles.settingValue} numberOfLines={1}>
                        {item.value}
                      </Text>
                    )}
                  </View>
                  {item.onPress && (
                    <Text style={styles.chevron}>›</Text>
                  )}
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {APP_CONFIG.appName} v{APP_CONFIG.version}
          </Text>
          <Text style={styles.footerText}>
            © 2026 Ro-Tech Development
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  userAvatarText: {
    color: colors.textLight,
    fontSize: 24,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h3,
    color: colors.text,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  adminBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  adminBadgeText: {
    color: colors.textLight,
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  sectionCard: {
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text,
  },
  settingLabelDestructive: {
    color: colors.error,
  },
  settingValue: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
});

export default SettingsScreen;
