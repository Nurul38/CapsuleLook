import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

// Face Shape Categories for Hijab Styling
const faceShapes = {
  oval: {
    name: 'Oval Face',
    characteristics: ['Balanced proportions', 'Slightly longer than wide', 'Soft jawline'],
    hijabStyles: ['turkish-simple', 'side-drape', 'french-twist', 'voluminous-style'],
    description: 'Lucky you! Oval faces suit almost any hijab style.',
    tips: ['Experiment with different volumes', 'Try asymmetrical draping', 'Most styles will flatter you']
  },
  round: {
    name: 'Round Face',
    characteristics: ['Full cheeks', 'Width equals length', 'Soft features'],
    hijabStyles: ['side-drape', 'french-twist', 'voluminous-style'],
    description: 'Add height and angles to elongate your beautiful features.',
    tips: ['Add volume at the crown', 'Avoid wide draping at cheek level', 'Try asymmetrical styles']
  },
  square: {
    name: 'Square Face',
    characteristics: ['Strong jawline', 'Wide forehead', 'Angular features'],
    hijabStyles: ['turkish-simple', 'side-drape', 'summer-breathable'],
    description: 'Soften angular features with flowing, curved draping.',
    tips: ['Choose soft, flowing fabrics', 'Add curves with draping', 'Avoid tight wrapping around face']
  },
  heart: {
    name: 'Heart-Shaped Face',
    characteristics: ['Wide forehead', 'Narrow chin', 'Prominent cheekbones'],
    hijabStyles: ['malaysian-simple', 'dupatta-style', 'winter-warm'],
    description: 'Balance your forehead with width at the jawline.',
    tips: ['Add volume at chin level', 'Keep forehead coverage moderate', 'Try chin-framing styles']
  },
  long: {
    name: 'Long Face',
    characteristics: ['Length greater than width', 'High forehead', 'Elongated features'],
    hijabStyles: ['turban-wrap', 'voluminous-style', 'ninja-underscarf'],
    description: 'Add width and minimize length for perfect balance.',
    tips: ['Create horizontal volume', 'Avoid extra height', 'Try wide, flowing styles']
  },
  diamond: {
    name: 'Diamond Face',
    characteristics: ['Narrow forehead and chin', 'Wide cheekbones', 'Angular features'],
    hijabStyles: ['french-twist', 'side-drape', 'summer-breathable'],
    description: 'Highlight your cheekbones while balancing narrow areas.',
    tips: ['Add width at forehead and chin', 'Showcase your cheekbones', 'Soft draping works well']
  }
};

// Hijab Colors and Recommendations
const hijabColors = {
  // Neutral Colors
  neutrals: {
    name: 'Neutral Tones',
    colors: [
      { name: 'Classic Black', hex: '#000000', occasions: ['Formal', 'Everyday', 'Work'] },
      { name: 'Pure White', hex: '#FFFFFF', occasions: ['Summer', 'Casual', 'Fresh looks'] },
      { name: 'Cream', hex: '#F5F5DC', occasions: ['Elegant', 'Soft looks', 'Vintage'] },
      { name: 'Beige', hex: '#F5F5DC', occasions: ['Natural', 'Earth tones', 'Minimal'] },
      { name: 'Taupe', hex: '#483C32', occasions: ['Sophisticated', 'Professional', 'Autumn'] },
      { name: 'Charcoal', hex: '#36454F', occasions: ['Modern', 'Urban', 'Chic'] },
    ]
  },
  // Warm Colors
  warm: {
    name: 'Warm Tones',
    colors: [
      { name: 'Rust Orange', hex: '#B7410E', occasions: ['Autumn', 'Earthy', 'Bohemian'] },
      { name: 'Terracotta', hex: '#E2725B', occasions: ['Warm weather', 'Natural', 'Casual'] },
      { name: 'Golden Yellow', hex: '#FFD700', occasions: ['Sunny days', 'Cheerful', 'Festive'] },
      { name: 'Burnt Sienna', hex: '#E97451', occasions: ['Fall season', 'Cozy', 'Rich looks'] },
      { name: 'Coral', hex: '#FF7F50', occasions: ['Spring', 'Feminine', 'Soft'] },
    ]
  },
  // Cool Colors
  cool: {
    name: 'Cool Tones',
    colors: [
      { name: 'Navy Blue', hex: '#000080', occasions: ['Professional', 'Classic', 'Timeless'] },
      { name: 'Emerald Green', hex: '#50C878', occasions: ['Elegant', 'Fresh', 'Natural'] },
      { name: 'Royal Purple', hex: '#7851A9', occasions: ['Regal', 'Special occasions', 'Luxurious'] },
      { name: 'Steel Blue', hex: '#4682B4', occasions: ['Cool weather', 'Calming', 'Professional'] },
      { name: 'Lavender', hex: '#E6E6FA', occasions: ['Soft', 'Romantic', 'Spring'] },
    ]
  },
  // Bold Colors
  bold: {
    name: 'Bold & Vibrant',
    colors: [
      { name: 'Fuchsia Pink', hex: '#FF1493', occasions: ['Statement', 'Fun', 'Youthful'] },
      { name: 'Electric Blue', hex: '#7DF9FF', occasions: ['Modern', 'Eye-catching', 'Summer'] },
      { name: 'Bright Red', hex: '#FF0000', occasions: ['Confident', 'Bold', 'Special events'] },
      { name: 'Vibrant Green', hex: '#00FF00', occasions: ['Fresh', 'Energetic', 'Nature-inspired'] },
      { name: 'Sunset Orange', hex: '#FF8C00', occasions: ['Warm', 'Energizing', 'Creative'] },
    ]
  }
};

// Affiliate Shopping Links
const affiliateStores = {
  hijab: [
    { 
      name: 'Hijab House', 
      description: 'Premium hijab collection with worldwide shipping',
      website: 'https://hijabhouse.com',
      affiliate: '?ref=visibee',
      logo: '🧕',
      speciality: 'Luxury scarves'
    },
    { 
      name: 'Modanisa', 
      description: 'Turkish modest fashion leader',
      website: 'https://modanisa.com',
      affiliate: '?affiliate=visibee',
      logo: '👗',
      speciality: 'Complete modest outfits'
    },
    { 
      name: 'Haute Hijab', 
      description: 'Modern hijab styles and accessories',
      website: 'https://hautehijab.com',
      affiliate: '?partner=visibee',
      logo: '✨',
      speciality: 'Contemporary designs'
    },
  ],
  shoes: [
    { 
      name: 'Annah Hariri', 
      description: 'Modest fashion shoes and accessories',
      website: 'https://annahhariri.com',
      affiliate: '?ref=visibee',
      logo: '👠',
      speciality: 'Modest footwear'
    },
    { 
      name: 'Nike Hijab Collection', 
      description: 'Sports hijabs and athletic wear',
      website: 'https://nike.com/hijab',
      affiliate: '?source=visibee',
      logo: '👟',
      speciality: 'Athletic wear'
    },
  ],
  complete: [
    { 
      name: 'SHEIN Modest', 
      description: 'Affordable complete modest outfits',
      website: 'https://shein.com/modest',
      affiliate: '?ref=visibee123',
      logo: '🛍️',
      speciality: 'Budget-friendly'
    },
    { 
      name: 'Uniqlo Modest Wear', 
      description: 'Quality basics for modest fashion',
      website: 'https://uniqlo.com/modest',
      affiliate: '?partner=visibee',
      logo: '👕',
      speciality: 'Quality basics'
    },
  ]
};

// Enhanced hijab styles with face shape compatibility
const hijabStyles = {
  'turkish-simple': {
    name: 'Turkish Simple',
    region: 'Middle East',
    difficulty: 'Beginner',
    time: '2-3 minutes',
    description: 'Clean, modern style popular in Turkey with minimal pins and a sleek finish.',
    faceShapes: ['oval', 'square'],
    colorRecommendations: ['neutrals', 'cool'],
    instructions: [
      'Place hijab on head with equal lengths on both sides',
      'Wrap one side around face and under chin',
      'Bring around back of head',
      'Pin at shoulder level',
      'Adjust for comfort and coverage'
    ],
    occasions: ['Daily wear', 'Work', 'University'],
    fabrics: ['Cotton', 'Chiffon', 'Jersey'],
    shoeStyle: ['Loafers', 'Ballet flats', 'Ankle boots'],
    wardrobeMatch: ['Blazers', 'Button-down shirts', 'Trousers'],
    tutorials: [
      { platform: 'YouTube', title: 'Turkish Hijab Tutorial - Simple & Elegant', url: 'https://youtube.com/watch?v=example1' },
      { platform: 'Instagram', title: '@hijabfashion Turkish Style', url: 'https://instagram.com/p/example1' }
    ]
  },
  'side-drape': {
    name: 'Side Drape',
    region: 'Middle East',
    difficulty: 'Intermediate',
    time: '5-7 minutes',
    description: 'Elegant style with fabric draped gracefully over one shoulder.',
    faceShapes: ['oval', 'round', 'square', 'diamond'],
    colorRecommendations: ['cool', 'bold'],
    instructions: [
      'Place hijab with one side longer than the other',
      'Wrap shorter side around face',
      'Pin under chin',
      'Drape longer side over opposite shoulder',
      'Adjust draping for desired look'
    ],
    occasions: ['Formal events', 'Weddings', 'Special occasions'],
    fabrics: ['Silk', 'Chiffon', 'Satin'],
    shoeStyle: ['Heels', 'Dress shoes', 'Formal sandals'],
    wardrobeMatch: ['Evening gowns', 'Cocktail dresses', 'Formal suits'],
    tutorials: [
      { platform: 'YouTube', title: 'Side Drape Hijab - Party Look', url: 'https://youtube.com/watch?v=example2' }
    ]
  },
  'french-twist': {
    name: 'French Twist',
    region: 'Europe',
    difficulty: 'Intermediate',
    time: '4-6 minutes',
    description: 'Sophisticated European style with a twisted detail.',
    faceShapes: ['heart', 'diamond', 'oval'],
    colorRecommendations: ['neutrals', 'warm'],
    instructions: [
      'Place hijab on head with one side longer',
      'Twist the longer side loosely',
      'Wrap around head and under chin',
      'Pin the twist for security',
      'Adjust for elegant finish'
    ],
    occasions: ['Professional meetings', 'Formal events', 'Date nights'],
    fabrics: ['Silk', 'Satin', 'Crepe'],
    shoeStyle: ['Pumps', 'Block heels', 'Oxford shoes'],
    wardrobeMatch: ['Blazers', 'Shift dresses', 'Elegant blouses'],
    tutorials: [
      { platform: 'YouTube', title: 'French Twist Hijab - Elegant Style', url: 'https://youtube.com/watch?v=example6' }
    ]
  },
  'voluminous-style': {
    name: 'Voluminous Style',
    region: 'Contemporary',
    difficulty: 'Advanced',
    time: '10-15 minutes',
    description: 'Trendy style with added volume using techniques like teasing and layering.',
    faceShapes: ['round', 'long', 'oval'],
    colorRecommendations: ['bold', 'neutrals'],
    instructions: [
      'Start with a volumizing cap or underscarf',
      'Tease the hijab fabric for volume',
      'Drape carefully to maintain volume',
      'Pin strategically to hold shape',
      'Use hijab pins for security'
    ],
    occasions: ['Weddings', 'Fashion events', 'Photography'],
    fabrics: ['Chiffon', 'Organza', 'Tulle'],
    shoeStyle: ['Statement heels', 'Designer flats', 'Embellished sandals'],
    wardrobeMatch: ['Formal gowns', 'Designer outfits', 'Statement pieces'],
    tutorials: [
      { platform: 'YouTube', title: 'Voluminous Hijab Tutorial - Wedding Style', url: 'https://youtube.com/watch?v=example8' }
    ]
  },
  // Add more styles here...
};

export default function HijabStylesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [expandedStyle, setExpandedStyle] = useState<string | null>(null);

  const regions = ['All', 'Middle East', 'South Asia', 'Africa', 'Southeast Asia', 'Europe', 'Contemporary', 'Universal'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredStyles = Object.entries(hijabStyles).filter(([key, style]) => {
    const matchesSearch = !searchQuery || 
      style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.region.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = selectedRegion === 'All' || style.region === selectedRegion;
    const matchesDifficulty = selectedDifficulty === 'All' || style.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesRegion && matchesDifficulty;
  });

  const openTutorial = async (url: string, title: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      // For demo purposes, show alert instead of opening actual URLs
      alert(`Tutorial: ${title}\n\nThis would normally open the tutorial link in your browser or app.`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10b981';
      case 'Intermediate': return '#f59e0b';
      case 'Advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderStyleCard = (key: string, style: any) => {
    const isExpanded = expandedStyle === key;
    
    return (
      <View key={key} style={styles.styleCard}>
        <TouchableOpacity
          style={styles.styleHeader}
          onPress={() => setExpandedStyle(isExpanded ? null : key)}
        >
          <View style={styles.styleMainInfo}>
            <Text style={styles.styleName}>{style.name}</Text>
            <View style={styles.styleMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="location" size={14} color="#6b7280" />
                <Text style={styles.metaText}>{style.region}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time" size={14} color="#6b7280" />
                <Text style={styles.metaText}>{style.time}</Text>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(style.difficulty) }]}>
                <Text style={styles.difficultyText}>{style.difficulty}</Text>
              </View>
            </View>
            <Text style={styles.styleDescription}>{style.description}</Text>
          </View>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#9ca3af" 
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Instructions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Step-by-Step Instructions</Text>
              {style.instructions.map((step: string, index: number) => (
                <View key={index} style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            {/* Occasions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Best For</Text>
              <View style={styles.tagContainer}>
                {style.occasions.map((occasion: string, index: number) => (
                  <View key={index} style={styles.occasionTag}>
                    <Text style={styles.occasionText}>{occasion}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Recommended Fabrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommended Fabrics</Text>
              <View style={styles.tagContainer}>
                {style.fabrics.map((fabric: string, index: number) => (
                  <View key={index} style={styles.fabricTag}>
                    <Text style={styles.fabricText}>{fabric}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Tutorial Links */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Video Tutorials</Text>
              {style.tutorials.map((tutorial: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tutorialLink}
                  onPress={() => openTutorial(tutorial.url, tutorial.title)}
                >
                  <View style={styles.tutorialInfo}>
                    <Ionicons 
                      name={tutorial.platform === 'YouTube' ? 'logo-youtube' : 
                           tutorial.platform === 'Instagram' ? 'logo-instagram' : 
                           'videocam'} 
                      size={24} 
                      color={tutorial.platform === 'YouTube' ? '#ef4444' : 
                             tutorial.platform === 'Instagram' ? '#ec4899' : 
                             '#8b5cf6'} 
                    />
                    <View style={styles.tutorialText}>
                      <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
                      <Text style={styles.tutorialPlatform}>{tutorial.platform}</Text>
                    </View>
                  </View>
                  <Ionicons name="open" size={20} color="#9ca3af" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Hijab Styles</Text>
        <View style={styles.backButton} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hijab styles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Region:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {regions.map((region) => (
              <TouchableOpacity
                key={region}
                style={[
                  styles.filterButton,
                  selectedRegion === region && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedRegion(region)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedRegion === region && styles.filterTextActive,
                  ]}
                >
                  {region}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Difficulty:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {difficulties.map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.filterButton,
                  selectedDifficulty === difficulty && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedDifficulty(difficulty)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedDifficulty === difficulty && styles.filterTextActive,
                  ]}
                >
                  {difficulty}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Results */}
      <ScrollView 
        style={styles.resultsContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredStyles.length} style{filteredStyles.length !== 1 ? 's' : ''} found
          </Text>
        </View>

        {filteredStyles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="flower-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No styles found</Text>
            <Text style={styles.emptyDescription}>
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          <View style={styles.stylesList}>
            {filteredStyles.map(([key, style]) => renderStyleCard(key, style))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  filtersContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#ec4899',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterTextActive: {
    color: 'white',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  stylesList: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  styleCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  styleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
  },
  styleMainInfo: {
    flex: 1,
  },
  styleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  styleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  styleDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  expandedContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ec4899',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  occasionTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  occasionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400e',
  },
  fabricTag: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  fabricText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#065f46',
  },
  tutorialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  tutorialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tutorialText: {
    marginLeft: 12,
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  tutorialPlatform: {
    fontSize: 12,
    color: '#6b7280',
  },
});