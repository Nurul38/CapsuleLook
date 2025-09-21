import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HomeScreen() {
  const navigateTo = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} 
        backgroundColor="#6366f1"
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Visibee</Text>
          <Text style={styles.subtitle}>Your ADHD-Friendly E-Wardrobe</Text>
          <Text style={styles.description}>
            Never lose track of your clothes again. Visibee helps you organize, 
            discover, and style your wardrobe with AI-powered assistance.
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="shirt" size={24} color="#6366f1" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="color-palette" size={24} color="#06b6d4" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Colors</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="sparkles" size={24} color="#f59e0b" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Outfits</Text>
          </View>
        </View>

        {/* Main Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Main Features</Text>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigateTo('/wardrobe')}
          >
            <View style={[styles.featureIcon, { backgroundColor: '#6366f1' }]}>
              <Ionicons name="shirt" size={32} color="white" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>My Wardrobe</Text>
              <Text style={styles.featureDescription}>
                Add, organize, and manage your clothing items
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigateTo('/camera')}
          >
            <View style={[styles.featureIcon, { backgroundColor: '#10b981' }]}>
              <Ionicons name="camera" size={32} color="white" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Add Item</Text>
              <Text style={styles.featureDescription}>
                Take photos or upload images of your clothes
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigateTo('/ai-assistant')}
          >
            <View style={[styles.featureIcon, { backgroundColor: '#f59e0b' }]}>
              <Ionicons name="sparkles" size={32} color="white" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>AI Assistant</Text>
              <Text style={styles.featureDescription}>
                Get style recommendations and outfit suggestions
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigateTo('/kibbe')}
          >
            <View style={[styles.featureIcon, { backgroundColor: '#8b5cf6' }]}>
              <Ionicons name="body" size={32} color="white" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Kibbe Analysis</Text>
              <Text style={styles.featureDescription}>
                Discover your body type and style recommendations
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigateTo('/color-analysis')}
          >
            <View style={[styles.featureIcon, { backgroundColor: '#06b6d4' }]}>
              <Ionicons name="color-palette" size={32} color="white" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Color Analysis</Text>
              <Text style={styles.featureDescription}>
                Korean & Western color analysis methods
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigateTo('/hijab-styles')}
          >
            <View style={[styles.featureIcon, { backgroundColor: '#ec4899' }]}>
              <Ionicons name="flower" size={32} color="white" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Hijab Styles</Text>
              <Text style={styles.featureDescription}>
                Explore worldwide hijab styles and tutorials
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigateTo('/search')}
            >
              <Ionicons name="search" size={28} color="#6366f1" />
              <Text style={styles.quickActionText}>Search</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigateTo('/outfit-generator')}
            >
              <Ionicons name="shuffle" size={28} color="#10b981" />
              <Text style={styles.quickActionText}>Generate Outfit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingTop: Platform.OS === 'ios' ? 12 : 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#e0e7ff',
    marginBottom: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#c7d2fe',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  featuresContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  quickActionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
    textAlign: 'center',
  },
});