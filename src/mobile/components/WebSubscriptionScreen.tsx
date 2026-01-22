import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import { X, ExternalLink, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WebSubscriptionScreenProps {
  visible: boolean;
  onClose: () => void;
  reason?: 'trial_expired' | 'feature_limit' | 'upgrade_required' | 'manage_subscription';
}

export default function WebSubscriptionScreen({
  visible,
  onClose,
  reason = 'upgrade_required',
}: WebSubscriptionScreenProps) {
  const handleSubscribeOnWeb = () => {
    Alert.alert(
      'Continue to Website',
      'You will be redirected to invyeasy.com to manage your subscription. After subscribing, just log in again to access all features.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => {
            Linking.openURL('https://invyeasy.com/#pricing');
          },
        },
      ]
    );
  };

  const handleManageSubscription = () => {
    Alert.alert(
      'Manage Subscription',
      'You will be redirected to invyeasy.com to manage your subscription. Log in to access your billing dashboard.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => {
            Linking.openURL('https://invyeasy.com/#pricing');
          },
        },
      ]
    );
  };

  const getTitle = () => {
    switch (reason) {
      case 'trial_expired':
        return 'Your Trial Has Ended';
      case 'feature_limit':
        return 'Upgrade to Continue';
      case 'manage_subscription':
        return 'Manage Your Subscription';
      default:
        return 'Subscribe to InvyEasy';
    }
  };

  const getMessage = () => {
    switch (reason) {
      case 'trial_expired':
        return 'Subscribe to continue using InvyEasy and keep your inventory organized.';
      case 'feature_limit':
        return 'You\'ve reached your plan\'s limit. Upgrade to unlock more features.';
      case 'manage_subscription':
        return 'View and manage your subscription, billing, and plan details.';
      default:
        return 'Choose a plan that works for your business and unlock all features.';
    }
  };

  const plans = [
    {
      name: 'Personal',
      price: '$19/month',
      yearlyPrice: '$193/year',
      features: ['2 storage areas', '150 items', '1 user', 'Basic reports'],
    },
    {
      name: 'Starter',
      price: '$89/month',
      yearlyPrice: '$906/year',
      features: ['5 storage areas', '500 items', '5 users', 'Stock alerts'],
      popular: true,
    },
    {
      name: 'Professional',
      price: '$229/month',
      yearlyPrice: '$2,334/year',
      features: ['15 storage areas', '2,000 items', '15 users', 'Advanced analytics'],
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{getTitle()}</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close subscription screen"
            accessibilityRole="button"
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Message */}
          <Text style={styles.message}>{getMessage()}</Text>

          {/* Plans */}
          {reason !== 'manage_subscription' && (
            <View style={styles.plansContainer}>
              {plans.map((plan, index) => (
                <View
                  key={index}
                  style={[styles.planCard, plan.popular && styles.popularPlan]}
                >
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>MOST POPULAR</Text>
                    </View>
                  )}
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                  <Text style={styles.planYearlyPrice}>{plan.yearlyPrice}</Text>
                  <View style={styles.featuresContainer}>
                    {plan.features.map((feature, idx) => (
                      <View key={idx} style={styles.featureRow}>
                        <CheckCircle size={16} color="#22c55e" />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Info Box */}
          <View style={styles.infoBox}>
            <ExternalLink size={20} color="#f97316" />
            <Text style={styles.infoText}>
              Subscriptions are managed through our website. After subscribing, simply log in to
              the app to access all features.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            {reason === 'manage_subscription' ? (
              <TouchableOpacity
                onPress={handleManageSubscription}
                accessibilityLabel="Manage subscription on website"
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={['#f97316', '#dc2626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  <ExternalLink size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Manage on Website</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSubscribeOnWeb}
                accessibilityLabel="Subscribe on website"
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={['#f97316', '#dc2626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  <ExternalLink size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Subscribe on Website</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onClose}
              style={styles.secondaryButton}
              accessibilityLabel="Maybe later"
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Note */}
          <Text style={styles.footerNote}>
            Already subscribed? Just log in with your account to access all features.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 20,
    marginBottom: 30,
    lineHeight: 24,
  },
  plansContainer: {
    gap: 16,
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  popularPlan: {
    borderColor: '#f97316',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#f97316',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f97316',
    marginBottom: 4,
  },
  planYearlyPrice: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
    marginBottom: 30,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  footerNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 18,
  },
});
