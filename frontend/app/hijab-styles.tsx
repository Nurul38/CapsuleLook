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

// Enhanced hijab styles with face shape compatibility and Malaysian inspiration
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
  'malaysian-simple': {
    name: 'Malaysian Simple',
    region: 'Southeast Asia',
    difficulty: 'Beginner',
    time: '3-4 minutes',
    description: 'Classic Malaysian style perfect for humid weather, inspired by local hijabi influencers.',
    faceShapes: ['oval', 'heart', 'long'],
    colorRecommendations: ['neutrals', 'warm'],
    instructions: [
      'Place hijab with one side slightly longer',
      'Wrap shorter side under chin and pin',
      'Bring longer side across and tuck behind ear',
      'Pin securely at shoulder',
      'Adjust for comfortable coverage'
    ],
    occasions: ['Daily wear', 'Casual outings', 'Shopping'],
    fabrics: ['Cotton', 'Bamboo fiber', 'Breathable jersey'],
    shoeStyle: ['Sandals', 'Sneakers', 'Slip-ons'],
    wardrobeMatch: ['Baju kurung', 'Casual dresses', 'Modest tops'],
    tutorials: [
      { platform: 'TikTok', title: '@malaysian_hijabi Simple Daily Style', url: 'https://tiktok.com/@example' },
      { platform: 'Instagram', title: 'Malaysian Hijab Tutorial', url: 'https://instagram.com/p/example2' }
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
  'malaysian-twist': {
    name: 'Malaysian Modern Twist',
    region: 'Southeast Asia',
    difficulty: 'Intermediate',
    time: '6-8 minutes',
    description: 'Trendy Malaysian style seen on social media, featuring elegant twists and volume.',
    faceShapes: ['oval', 'round', 'heart'],
    colorRecommendations: ['bold', 'warm'],
    instructions: [
      'Start with hijab draped evenly',
      'Create a loose twist on one side',
      'Wrap around head maintaining the twist',
      'Pin the twisted section decoratively',
      'Arrange remaining fabric for volume'
    ],
    occasions: ['Social events', 'Dates', 'Photography'],
    fabrics: ['Chiffon', 'Silk', 'Crepe'],
    shoeStyle: ['Block heels', 'Stylish flats', 'Wedges'],
    wardrobeMatch: ['Modern baju kurung', 'Midi dresses', 'Styled blouses'],
    tutorials: [
      { platform: 'TikTok', title: '@kl_hijabi Modern Twist Tutorial', url: 'https://tiktok.com/@example' },
      { platform: 'Instagram', title: 'Malaysian Modern Hijab Style', url: 'https://instagram.com/p/example3' }
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
  'malaysian-casual': {
    name: 'Malaysian Casual Chic',
    region: 'Southeast Asia',
    difficulty: 'Beginner',
    time: '2-3 minutes',
    description: 'Effortless everyday style popular among Malaysian university students and young professionals.',
    faceShapes: ['oval', 'round', 'square'],
    colorRecommendations: ['neutrals', 'cool'],
    instructions: [
      'Place hijab loosely on head',
      'Cross both sides under chin',
      'Bring both sides to the back',
      'Tie or pin at the nape',
      'Adjust for comfort and coverage'
    ],
    occasions: ['University', 'Casual work', 'Daily errands'],
    fabrics: ['Cotton', 'Modal', 'Jersey'],
    shoeStyle: ['White sneakers', 'Canvas shoes', 'Comfortable flats'],
    wardrobeMatch: ['Oversized shirts', 'Casual dresses', 'Denim jackets'],
    tutorials: [
      { platform: 'TikTok', title: '@hijab_daily Malaysian Casual Style', url: 'https://tiktok.com/@example' }
    ]
  },
  'malaysian-formal': {
    name: 'Malaysian Formal Elegance',
    region: 'Southeast Asia',
    difficulty: 'Advanced',
    time: '8-12 minutes',
    description: 'Sophisticated Malaysian style for formal occasions, inspired by traditional and modern elements.',
    faceShapes: ['oval', 'heart', 'diamond'],
    colorRecommendations: ['cool', 'neutrals'],
    instructions: [
      'Start with an underscarf for volume',
      'Drape hijab with decorative pleats',
      'Create asymmetrical draping',
      'Pin with decorative hijab pins',
      'Finish with elegant shoulder draping'
    ],
    occasions: ['Weddings', 'Formal dinners', 'Corporate events'],
    fabrics: ['Silk', 'Premium chiffon', 'Satin'],
    shoeStyle: ['Formal heels', 'Pointed toe flats', 'Elegant sandals'],
    wardrobeMatch: ['Formal baju kurung', 'Evening dresses', 'Tailored suits'],
    tutorials: [
      { platform: 'Instagram', title: 'Malaysian Formal Hijab Styling', url: 'https://instagram.com/p/example4' },
      { platform: 'YouTube', title: 'Elegant Malaysian Hijab for Special Events', url: 'https://youtube.com/watch?v=example9' }
    ]
  },
};

export default function HijabStylesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedFaceShape, setSelectedFaceShape] = useState<string>('All');
  const [selectedColorCategory, setSelectedColorCategory] = useState<string>('All');
  const [expandedStyle, setExpandedStyle] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'styles' | 'faceShape' | 'colors' | 'shopping'>('styles');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedFaceShape, setDetectedFaceShape] = useState<string | null>(null);

  const regions = ['All', 'Middle East', 'South Asia', 'Africa', 'Southeast Asia', 'Europe', 'Contemporary', 'Universal'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const faceShapeOptions = ['All', 'oval', 'round', 'square', 'heart', 'long', 'diamond'];
  const colorCategories = ['All', 'neutrals', 'warm', 'cool', 'bold'];

  const filteredStyles = Object.entries(hijabStyles).filter(([key, style]) => {
    const matchesSearch = !searchQuery || 
      style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.region.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = selectedRegion === 'All' || style.region === selectedRegion;
    const matchesDifficulty = selectedDifficulty === 'All' || style.difficulty === selectedDifficulty;
    const matchesFaceShape = selectedFaceShape === 'All' || style.faceShapes?.includes(selectedFaceShape);
    const matchesColor = selectedColorCategory === 'All' || style.colorRecommendations?.includes(selectedColorCategory);
    
    return matchesSearch && matchesRegion && matchesDifficulty && matchesFaceShape && matchesColor;
  });

  const analyzeImageForFaceShape = async (base64Image: string) => {
    try {
      setIsAnalyzing(true);
      const response = await fetch(`${BACKEND_URL}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: base64Image,
          analysis_type: 'face_shape_hijab',
        }),
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const result = await response.json();
      
      // Parse AI response to determine face shape
      const aiResponse = result.result.toLowerCase();
      let detectedShape = 'oval'; // Default fallback
      
      Object.keys(faceShapes).forEach(shape => {
        if (aiResponse.includes(shape) || aiResponse.includes(faceShapes[shape].name.toLowerCase())) {
          detectedShape = shape;
        }
      });
      
      setDetectedFaceShape(detectedShape);
      setSelectedFaceShape(detectedShape);
      return detectedShape;
    } catch (error) {
      console.error('Face shape analysis error:', error);
      Alert.alert('Analysis Error', 'Could not analyze face shape. Please try manual selection.');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const pickImageForAnalysis = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
          if (!file.type.startsWith('image/')) {
            Alert.alert('Invalid File', 'Please select an image file only.');
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64 = e.target?.result as string;
            const base64Data = base64.split(',')[1];
            setImageUri(base64);
            analyzeImageForFaceShape(base64Data);
          };
          reader.readAsDataURL(file);
        }
        input.value = '';
      };
      input.click();
    } else {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true,
        });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          setImageUri(asset.uri);
          if (asset.base64) {
            analyzeImageForFaceShape(asset.base64);
          }
        }
      } catch (error) {
        console.error('Error picking image:', error);
        Alert.alert('Error', 'Failed to pick image');
      }
    }
  };

  const openAffiliateLink = async (store: any) => {
    const fullUrl = store.website + store.affiliate;
    try {
      const supported = await Linking.canOpenURL(fullUrl);
      if (supported) {
        await Linking.openURL(fullUrl);
      } else {
        // For demo purposes
        Alert.alert(
          'Visit Store', 
          `${store.name}\n${store.description}\n\n${fullUrl}`,
          [
            { text: 'Copy Link', onPress: () => {/* Copy to clipboard logic */} },
            { text: 'Close' }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Link Error', 'Could not open store link');
    }
  };

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

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'styles' && styles.activeTab]}
          onPress={() => setCurrentTab('styles')}
        >
          <Ionicons 
            name="flower" 
            size={20} 
            color={currentTab === 'styles' ? '#ec4899' : '#6b7280'} 
          />
          <Text style={[styles.tabText, currentTab === 'styles' && styles.activeTabText]}>
            Styles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentTab === 'faceShape' && styles.activeTab]}
          onPress={() => setCurrentTab('faceShape')}
        >
          <Ionicons 
            name="person" 
            size={20} 
            color={currentTab === 'faceShape' ? '#ec4899' : '#6b7280'} 
          />
          <Text style={[styles.tabText, currentTab === 'faceShape' && styles.activeTabText]}>
            Face Shape
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentTab === 'colors' && styles.activeTab]}
          onPress={() => setCurrentTab('colors')}
        >
          <Ionicons 
            name="color-palette" 
            size={20} 
            color={currentTab === 'colors' ? '#ec4899' : '#6b7280'} 
          />
          <Text style={[styles.tabText, currentTab === 'colors' && styles.activeTabText]}>
            Colors
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, currentTab === 'shopping' && styles.activeTab]}
          onPress={() => setCurrentTab('shopping')}
        >
          <Ionicons 
            name="bag" 
            size={20} 
            color={currentTab === 'shopping' ? '#ec4899' : '#6b7280'} 
          />
          <Text style={[styles.tabText, currentTab === 'shopping' && styles.activeTabText]}>
            Shopping
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {currentTab === 'styles' && renderStylesTab()}
      {currentTab === 'faceShape' && renderFaceShapeTab()}
      {currentTab === 'colors' && renderColorsTab()}
      {currentTab === 'shopping' && renderShoppingTab()}
    </SafeAreaView>
  );

  // Styles Tab Content
  function renderStylesTab() {
    return (
      <>
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
      </>
    );
  }

  // Face Shape Analysis Tab
  function renderFaceShapeTab() {
    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.tabSection}>
          <Text style={styles.tabTitle}>Face Shape Analysis</Text>
          <Text style={styles.tabDescription}>
            Discover your face shape to find the perfect hijab styles for you!
          </Text>

          {/* Photo Analysis */}
          <View style={styles.analysisSection}>
            <View style={styles.analysisHeader}>
              <Ionicons name="camera" size={24} color="#ec4899" />
              <View style={styles.analysisHeaderText}>
                <Text style={styles.analysisTitle}>AI Photo Analysis</Text>
                <Text style={styles.analysisSubtitle}>
                  Upload a clear, front-facing photo for analysis
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={pickImageForAnalysis}
              disabled={isAnalyzing}
            >
              <Ionicons 
                name="cloud-upload" 
                size={24} 
                color={isAnalyzing ? '#9ca3af' : '#ec4899'} 
              />
              <Text style={[styles.uploadButtonText, isAnalyzing && styles.uploadButtonTextDisabled]}>
                {isAnalyzing ? 'Analyzing...' : 'Upload Photo for Analysis'}
              </Text>
            </TouchableOpacity>

            {imageUri && (
              <View style={styles.uploadedImageContainer}>
                <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
                {detectedFaceShape && (
                  <View style={styles.analysisResult}>
                    <Text style={styles.resultTitle}>
                      Detected Face Shape: {faceShapes[detectedFaceShape]?.name}
                    </Text>
                    <Text style={styles.resultDescription}>
                      {faceShapes[detectedFaceShape]?.description}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Manual Selection */}
          <View style={styles.analysisSection}>
            <View style={styles.analysisHeader}>
              <Ionicons name="hand-right" size={24} color="#ec4899" />
              <View style={styles.analysisHeaderText}>
                <Text style={styles.analysisTitle}>Self-Assessment</Text>
                <Text style={styles.analysisSubtitle}>
                  Choose your face shape from the options below
                </Text>
              </View>
            </View>

            <View style={styles.faceShapeGrid}>
              {Object.entries(faceShapes).map(([key, shape]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.faceShapeCard,
                    selectedFaceShape === key && styles.faceShapeCardSelected
                  ]}
                  onPress={() => setSelectedFaceShape(key)}
                >
                  <Text style={styles.faceShapeName}>{shape.name}</Text>
                  <Text style={styles.faceShapeCharacteristics}>
                    {shape.characteristics.join(', ')}
                  </Text>
                  {selectedFaceShape === key && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={24} color="#ec4899" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {selectedFaceShape && selectedFaceShape !== 'All' && (
              <View style={styles.recommendationsSection}>
                <Text style={styles.recommendationsTitle}>
                  Recommended Hijab Styles for {faceShapes[selectedFaceShape]?.name}
                </Text>
                <Text style={styles.recommendationsDescription}>
                  {faceShapes[selectedFaceShape]?.description}
                </Text>
                <View style={styles.tipsList}>
                  {faceShapes[selectedFaceShape]?.tips.map((tip, index) => (
                    <View key={index} style={styles.tip}>
                      <Ionicons name="bulb" size={16} color="#f59e0b" />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  // Colors Tab Content  
  function renderColorsTab() {
    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.tabSection}>
          <Text style={styles.tabTitle}>Hijab Colors & Palettes</Text>
          <Text style={styles.tabDescription}>
            Explore beautiful color options inspired by Malaysian hijabi fashion
          </Text>

          {Object.entries(hijabColors).map(([categoryKey, category]) => (
            <View key={categoryKey} style={styles.colorSection}>
              <Text style={styles.colorSectionTitle}>{category.name}</Text>
              
              <View style={styles.colorGrid}>
                {category.colors.map((color, index) => (
                  <View key={index} style={styles.colorCard}>
                    <View 
                      style={[styles.colorSwatch, { backgroundColor: color.hex }]}
                    />
                    <View style={styles.colorInfo}>
                      <Text style={styles.colorName}>{color.name}</Text>
                      <View style={styles.occasionTags}>
                        {color.occasions.map((occasion, idx) => (
                          <View key={idx} style={styles.occasionTag}>
                            <Text style={styles.occasionText}>{occasion}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  // Shopping Tab Content
  function renderShoppingTab() {
    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.tabSection}>
          <Text style={styles.tabTitle}>Shopping & Affiliates</Text>
          <Text style={styles.tabDescription}>
            Complete your hijab styling with curated shopping recommendations
          </Text>

          {/* Hijab Stores */}
          <View style={styles.shoppingSection}>
            <Text style={styles.shoppingSectionTitle}>🧕 Hijab Collections</Text>
            <View style={styles.storeGrid}>
              {affiliateStores.hijab.map((store, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.storeCard}
                  onPress={() => openAffiliateLink(store)}
                >
                  <View style={styles.storeHeader}>
                    <Text style={styles.storeLogo}>{store.logo}</Text>
                    <View style={styles.storeInfo}>
                      <Text style={styles.storeName}>{store.name}</Text>
                      <Text style={styles.storeSpeciality}>{store.speciality}</Text>
                    </View>
                    <Ionicons name="open" size={20} color="#9ca3af" />
                  </View>
                  <Text style={styles.storeDescription}>{store.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Shoes & Accessories */}
          <View style={styles.shoppingSection}>
            <Text style={styles.shoppingSectionTitle}>👠 Shoes & Accessories</Text>
            <View style={styles.storeGrid}>
              {affiliateStores.shoes.map((store, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.storeCard}
                  onPress={() => openAffiliateLink(store)}
                >
                  <View style={styles.storeHeader}>
                    <Text style={styles.storeLogo}>{store.logo}</Text>
                    <View style={styles.storeInfo}>
                      <Text style={styles.storeName}>{store.name}</Text>
                      <Text style={styles.storeSpeciality}>{store.speciality}</Text>
                    </View>
                    <Ionicons name="open" size={20} color="#9ca3af" />
                  </View>
                  <Text style={styles.storeDescription}>{store.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Complete Outfits */}
          <View style={styles.shoppingSection}>
            <Text style={styles.shoppingSectionTitle}>🛍️ Complete Styling</Text>
            <View style={styles.storeGrid}>
              {affiliateStores.complete.map((store, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.storeCard}
                  onPress={() => openAffiliateLink(store)}
                >
                  <View style={styles.storeHeader}>
                    <Text style={styles.storeLogo}>{store.logo}</Text>
                    <View style={styles.storeInfo}>
                      <Text style={styles.storeName}>{store.name}</Text>
                      <Text style={styles.storeSpeciality}>{store.speciality}</Text>
                    </View>
                    <Ionicons name="open" size={20} color="#9ca3af" />
                  </View>
                  <Text style={styles.storeDescription}>{store.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Future Enhancement Notice */}
          <View style={styles.futureSection}>
            <Ionicons name="rocket" size={32} color="#ec4899" />
            <Text style={styles.futureSectionTitle}>Coming Soon!</Text>
            <Text style={styles.futureSectionDescription}>
              Personalized affiliate partnerships and exclusive discounts for Visibee users.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }
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
  // Tab Navigation Styles
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#ec4899',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 4,
  },
  activeTabText: {
    color: '#ec4899',
    fontWeight: '600',
  },
  // Tab Content Styles
  tabContent: {
    flex: 1,
  },
  tabSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  tabDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 32,
  },
  // Face Shape Analysis Styles
  analysisSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  analysisHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  analysisSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdf2f8',
    borderWidth: 2,
    borderColor: '#ec4899',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ec4899',
    marginLeft: 8,
  },
  uploadButtonTextDisabled: {
    color: '#9ca3af',
  },
  uploadedImageContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  uploadedImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  analysisResult: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 14,
    color: '#15803d',
    lineHeight: 20,
  },
  faceShapeGrid: {
    gap: 12,
  },
  faceShapeCard: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  faceShapeCardSelected: {
    borderColor: '#ec4899',
    backgroundColor: '#fdf2f8',
  },
  faceShapeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  faceShapeCharacteristics: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  recommendationsSection: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  recommendationsDescription: {
    fontSize: 14,
    color: '#b45309',
    marginBottom: 12,
    lineHeight: 20,
  },
  tipsList: {
    gap: 8,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#b45309',
    lineHeight: 20,
  },
  // Colors Tab Styles
  colorSection: {
    marginBottom: 32,
  },
  colorSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  colorGrid: {
    gap: 12,
  },
  colorCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  colorInfo: {
    flex: 1,
  },
  colorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  occasionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  // Shopping Tab Styles
  shoppingSection: {
    marginBottom: 32,
  },
  shoppingSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  storeGrid: {
    gap: 12,
  },
  storeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeLogo: {
    fontSize: 24,
    marginRight: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  storeSpeciality: {
    fontSize: 12,
    color: '#ec4899',
    fontWeight: '500',
  },
  storeDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  futureSection: {
    alignItems: 'center',
    backgroundColor: '#fdf2f8',
    padding: 32,
    borderRadius: 16,
    marginTop: 24,
  },
  futureSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ec4899',
    marginTop: 16,
    marginBottom: 8,
  },
  futureSectionDescription: {
    fontSize: 14,
    color: '#be185d',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Styles Tab (existing styles)
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