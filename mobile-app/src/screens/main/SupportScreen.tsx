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
import { Card, Badge, Button } from '../../components/ui';
import { colors, spacing, typography } from '../../constants/theme';
import { SupportTicket, RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SupportScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  const fetchTickets = useCallback(async () => {
    // Mock data - replace with actual API call
    setTickets([
      {
        id: '1',
        ticketNumber: 'RT-2026-001',
        subject: 'Vraag over nieuwe functionaliteit',
        description: 'Ik wil graag een contactformulier toevoegen aan de website.',
        category: 'feature-request',
        priority: 'medium',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      },
      {
        id: '2',
        ticketNumber: 'RT-2026-002',
        subject: 'Website laadt langzaam',
        description: 'De website lijkt de laatste dagen trager te laden.',
        category: 'technical',
        priority: 'high',
        status: 'open',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      },
      {
        id: '3',
        ticketNumber: 'RT-2025-048',
        subject: 'Factuur vraag',
        description: 'Vraag over de laatste factuur.',
        category: 'billing',
        priority: 'low',
        status: 'resolved',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        messages: [],
      },
    ]);
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'open') {
      return !['resolved', 'closed'].includes(ticket.status);
    }
    if (filter === 'closed') {
      return ['resolved', 'closed'].includes(ticket.status);
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
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
      open: 'Open',
      in_progress: 'In behandeling',
      waiting_customer: 'Wacht op reactie',
      resolved: 'Opgelost',
      closed: 'Gesloten',
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      low: colors.textMuted,
      medium: colors.warning,
      high: colors.error,
      urgent: colors.error,
    };
    return colorMap[priority] || colors.textMuted;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Support</Text>
            <Text style={styles.subtitle}>
              {tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length} open tickets
            </Text>
          </View>
          <Button
            title="+ Nieuw"
            onPress={() => navigation.navigate('NewTicket')}
            size="sm"
          />
        </View>

        {/* Filter tabs */}
        <View style={styles.filterTabs}>
          {(['all', 'open', 'closed'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                {f === 'all' ? 'Alle' : f === 'open' ? 'Open' : 'Gesloten'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              style={styles.ticketCard}
              onPress={() => navigation.navigate('TicketDetail', { ticketId: ticket.id })}
            >
              <View style={styles.ticketHeader}>
                <View style={styles.ticketMeta}>
                  <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(ticket.priority) }]} />
                </View>
                <Badge
                  text={getStatusLabel(ticket.status)}
                  variant={getStatusBadge(ticket.status)}
                  size="sm"
                />
              </View>

              <Text style={styles.ticketSubject}>{ticket.subject}</Text>
              <Text style={styles.ticketDescription} numberOfLines={2}>
                {ticket.description}
              </Text>

              <View style={styles.ticketFooter}>
                <Text style={styles.ticketCategory}>
                  {ticket.category === 'technical' ? '🔧 Technisch' :
                   ticket.category === 'billing' ? '💰 Facturatie' :
                   ticket.category === 'feature-request' ? '✨ Feature' : '💬 Algemeen'}
                </Text>
                <Text style={styles.ticketDate}>
                  {new Date(ticket.createdAt).toLocaleDateString('nl-NL')}
                </Text>
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Geen tickets</Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'Je hebt nog geen support tickets.'
                : filter === 'open'
                ? 'Geen openstaande tickets.'
                : 'Geen gesloten tickets.'}
            </Text>
            <Button
              title="Nieuw ticket aanmaken"
              onPress={() => navigation.navigate('NewTicket')}
              style={styles.ctaButton}
            />
          </Card>
        )}
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: colors.textLight,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
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
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ticketNumber: {
    ...typography.caption,
    color: colors.textMuted,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ticketSubject: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  ticketDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  ticketCategory: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  ticketDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  ctaButton: {
    minWidth: 200,
  },
});

export default SupportScreen;
