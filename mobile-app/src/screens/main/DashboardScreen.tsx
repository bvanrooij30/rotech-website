import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge } from '../../components/ui';
import { colors, spacing, typography, shadows } from '../../constants/theme';
import { Product, SupportTicket, Subscription, RootStackParamList } from '../../types';
import api from '../../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    products: Product[];
    tickets: SupportTicket[];
    subscription: Subscription | null;
  }>({
    products: [],
    tickets: [],
    subscription: null,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      // In development, use mock data
      // In production, fetch from API
      setData({
        products: [
          {
            id: '1',
            name: 'Bedrijfswebsite',
            type: 'website',
            domain: 'mijnbedrijf.nl',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        tickets: [
          {
            id: '1',
            ticketNumber: 'RT-2026-001',
            subject: 'Vraag over functionaliteit',
            description: 'Test ticket',
            category: 'general',
            priority: 'medium',
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [],
          },
        ],
        subscription: {
          id: '1',
          planType: 'business',
          planName: 'Business Onderhoud',
          monthlyPrice: 199,
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          hoursIncluded: 2,
          hoursUsed: 0.5,
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
      active: 'success',
      development: 'info',
      maintenance: 'warning',
      open: 'info',
      in_progress: 'warning',
      waiting_customer: 'warning',
      resolved: 'success',
      closed: 'default',
    };
    return variants[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Actief',
      development: 'In ontwikkeling',
      maintenance: 'Onderhoud',
      open: 'Open',
      in_progress: 'In behandeling',
      waiting_customer: 'Wacht op reactie',
      resolved: 'Opgelost',
      closed: 'Gesloten',
    };
    return labels[status] || status;
  };

  const firstName = user?.name?.split(' ')[0] || 'daar';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Welkom terug,</Text>
          <Text style={styles.userName}>{firstName}!</Text>
          <Text style={styles.welcomeSubtext}>
            Bekijk hier een overzicht van je projecten en abonnement.
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{data.products.length}</Text>
            <Text style={styles.statLabel}>Producten</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>
              {data.tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved').length}
            </Text>
            <Text style={styles.statLabel}>Open tickets</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statNumber, data.subscription ? { color: colors.accent } : {}]}>
              {data.subscription ? 'Actief' : 'Geen'}
            </Text>
            <Text style={styles.statLabel}>Abonnement</Text>
          </Card>
        </View>

        {/* Subscription Card */}
        {data.subscription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Abonnement</Text>
            <Card style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <View>
                  <Text style={styles.subscriptionName}>{data.subscription.planName}</Text>
                  <Text style={styles.subscriptionPrice}>
                    €{data.subscription.monthlyPrice}/maand
                  </Text>
                </View>
                <Badge text="Actief" variant="success" />
              </View>
              <View style={styles.hoursContainer}>
                <Text style={styles.hoursLabel}>Uren deze maand</Text>
                <View style={styles.hoursBar}>
                  <View
                    style={[
                      styles.hoursProgress,
                      {
                        width: `${Math.min(
                          (data.subscription.hoursUsed / data.subscription.hoursIncluded) * 100,
                          100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.hoursText}>
                  {data.subscription.hoursUsed} / {data.subscription.hoursIncluded} uur gebruikt
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mijn Producten</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllLink}>Bekijk alle</Text>
            </TouchableOpacity>
          </View>
          {data.products.length > 0 ? (
            data.products.map((product) => (
              <Card
                key={product.id}
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
              >
                <View style={styles.productHeader}>
                  <View style={styles.productIcon}>
                    <Text style={styles.productIconText}>
                      {product.type === 'website' ? '🌐' : product.type === 'webshop' ? '🛒' : '📱'}
                    </Text>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productDomain}>{product.domain || product.type}</Text>
                  </View>
                  <Badge text={getStatusLabel(product.status)} variant={getStatusBadge(product.status)} size="sm" />
                </View>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>Je hebt nog geen producten.</Text>
            </Card>
          )}
        </View>

        {/* Recent Tickets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recente Tickets</Text>
            <TouchableOpacity onPress={() => navigation.navigate('NewTicket')}>
              <Text style={styles.seeAllLink}>+ Nieuw ticket</Text>
            </TouchableOpacity>
          </View>
          {data.tickets.length > 0 ? (
            data.tickets.slice(0, 3).map((ticket) => (
              <Card
                key={ticket.id}
                style={styles.ticketCard}
                onPress={() => navigation.navigate('TicketDetail', { ticketId: ticket.id })}
              >
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
                  <Badge
                    text={getStatusLabel(ticket.status)}
                    variant={getStatusBadge(ticket.status)}
                    size="sm"
                  />
                </View>
                <Text style={styles.ticketSubject} numberOfLines={1}>
                  {ticket.subject}
                </Text>
                <Text style={styles.ticketDate}>
                  {new Date(ticket.createdAt).toLocaleDateString('nl-NL')}
                </Text>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>Geen support tickets.</Text>
            </Card>
          )}
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  welcomeCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.body.fontSize,
  },
  userName: {
    color: colors.textLight,
    fontSize: typography.h1.fontSize,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  welcomeSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.bodySmall.fontSize,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statNumber: {
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  seeAllLink: {
    color: colors.primary,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  subscriptionCard: {
    padding: spacing.lg,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  subscriptionName: {
    ...typography.h4,
    color: colors.text,
  },
  subscriptionPrice: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  hoursContainer: {
    marginTop: spacing.sm,
  },
  hoursLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  hoursBar: {
    height: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  hoursProgress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  hoursText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  productCard: {
    marginBottom: spacing.md,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  productIconText: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...typography.label,
    color: colors.text,
  },
  productDomain: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ticketCard: {
    marginBottom: spacing.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ticketNumber: {
    ...typography.caption,
    color: colors.textMuted,
  },
  ticketSubject: {
    ...typography.label,
    color: colors.text,
  },
  ticketDate: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});

export default DashboardScreen;
