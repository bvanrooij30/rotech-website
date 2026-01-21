import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button, Input, Card } from '../../components/ui';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

type Category = 'general' | 'technical' | 'billing' | 'feature-request';
type Priority = 'low' | 'medium' | 'high';

interface FormData {
  subject: string;
  description: string;
  category: Category;
  priority: Priority;
}

const categories: { value: Category; label: string; icon: string }[] = [
  { value: 'general', label: 'Algemeen', icon: '💬' },
  { value: 'technical', label: 'Technisch', icon: '🔧' },
  { value: 'billing', label: 'Facturatie', icon: '💰' },
  { value: 'feature-request', label: 'Feature verzoek', icon: '✨' },
];

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Laag', color: colors.textMuted },
  { value: 'medium', label: 'Normaal', color: colors.warning },
  { value: 'high', label: 'Hoog', color: colors.error },
];

export function NewTicketScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium',
  });
  const [errors, setErrors] = useState<{ subject?: string; description?: string }>({});

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Onderwerp is verplicht';
    } else if (formData.subject.length < 5) {
      newErrors.subject = 'Onderwerp moet minimaal 5 tekens zijn';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Beschrijving is verplicht';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Beschrijving moet minimaal 20 tekens zijn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        'Ticket aangemaakt',
        'Je support ticket is succesvol aangemaakt. We nemen zo snel mogelijk contact met je op.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Fout', 'Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Terug</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nieuw Ticket</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Subject */}
          <Input
            label="Onderwerp *"
            placeholder="Kort omschrijven waar het over gaat"
            value={formData.subject}
            onChangeText={(v) => updateField('subject', v)}
            error={errors.subject}
          />

          {/* Category */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Categorie</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryOption,
                    formData.category === cat.value && styles.categoryOptionActive,
                  ]}
                  onPress={() => updateField('category', cat.value)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      formData.category === cat.value && styles.categoryLabelActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Prioriteit</Text>
            <View style={styles.priorityRow}>
              {priorities.map((prio) => (
                <TouchableOpacity
                  key={prio.value}
                  style={[
                    styles.priorityOption,
                    formData.priority === prio.value && styles.priorityOptionActive,
                    formData.priority === prio.value && { borderColor: prio.color },
                  ]}
                  onPress={() => updateField('priority', prio.value)}
                >
                  <View style={[styles.priorityDot, { backgroundColor: prio.color }]} />
                  <Text
                    style={[
                      styles.priorityLabel,
                      formData.priority === prio.value && { color: prio.color },
                    ]}
                  >
                    {prio.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Beschrijving *</Text>
            <View style={[styles.textAreaContainer, errors.description && styles.textAreaError]}>
              <TextInput
                style={styles.textArea}
                placeholder="Beschrijf je vraag of probleem zo gedetailleerd mogelijk..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={formData.description}
                onChangeText={(v) => updateField('description', v)}
              />
            </View>
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
          </View>

          {/* Submit Button */}
          <Button
            title="Ticket versturen"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backButtonText: {
    ...typography.body,
    color: colors.primary,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  fieldGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  categoryOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  categoryLabelActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  priorityOptionActive: {
    borderWidth: 2,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  textAreaContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    minHeight: 150,
  },
  textAreaError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  textArea: {
    flex: 1,
    padding: spacing.lg,
    fontSize: typography.body.fontSize,
    color: colors.text,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});

export default NewTicketScreen;
