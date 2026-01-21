import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Badge, Button } from '../../components/ui';
import { colors, spacing, typography } from '../../constants/theme';
import { Product, RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ProductsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = useCallback(async () => {
    // Mock data - replace with actual API call
    setProducts([
      {
        id: '1',
        name: 'Bedrijfswebsite',
        type: 'website',
        description: 'Professionele bedrijfswebsite met CMS',
        domain: 'mijnbedrijf.nl',
        status: 'active',
        launchDate: '2025-06-15',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Webshop',
        type: 'webshop',
        description: 'E-commerce platform met betalingsintegratie',
        domain: 'shop.mijnbedrijf.nl',
        status: 'development',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
      active: 'success',
      development: 'info',
      maintenance: 'warning',
      archived: 'default',
    };
    return variants[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Actief',
      development: 'In ontwikkeling',
      maintenance: 'Onderhoud',
      archived: 'Gearchiveerd',
    };
    return labels[status] || status;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      website: '🌐',
      webshop: '🛒',
      webapp: '📱',
      api: '🔗',
    };
    return icons[type] || '📦';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mijn Producten</Text>
        <Text style={styles.subtitle}>
          {products.length} product{products.length !== 1 ? 'en' : ''}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {products.length > 0 ? (
          products.map((product) => (
            <Card
              key={product.id}
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
            >
              <View style={styles.productHeader}>
                <View style={styles.productIcon}>
                  <Text style={styles.productIconText}>{getTypeIcon(product.type)}</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDomain}>{product.domain}</Text>
                </View>
                <Badge
                  text={getStatusLabel(product.status)}
                  variant={getStatusBadge(product.status)}
                  size="sm"
                />
              </View>

              {product.description && (
                <Text style={styles.productDescription} numberOfLines={2}>
                  {product.description}
                </Text>
              )}

              <View style={styles.productMeta}>
                <Text style={styles.metaText}>
                  Type: {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                </Text>
                {product.launchDate && (
                  <Text style={styles.metaText}>
                    Live sinds: {new Date(product.launchDate).toLocaleDateString('nl-NL')}
                  </Text>
                )}
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Geen producten</Text>
            <Text style={styles.emptyText}>
              Je hebt nog geen producten. Vraag een offerte aan om te beginnen!
            </Text>
            <Button
              title="Offerte aanvragen"
              onPress={() => {}}
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
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  productCard: {
    marginBottom: spacing.md,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
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
    ...typography.h4,
    color: colors.text,
  },
  productDomain: {
    ...typography.bodySmall,
    color: colors.primary,
    marginTop: 2,
  },
  productDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  metaText: {
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

export default ProductsScreen;
