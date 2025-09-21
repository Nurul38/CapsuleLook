import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

// Korean Color Analysis (Personal Color)
const koreanSeasons = {
  spring: {
    name: 'Bright Spring',
    description: 'Clear, bright, warm colors',
    characteristics: ['Light skin with golden undertones', 'Clear, bright eyes', 'Light to medium hair'],
    colors: ['Coral', 'Peach', 'Turquoise', 'Yellow-green', 'Clear red', 'Golden yellow'],
    avoid: ['Deep colors', 'Muted tones', 'Cool purples', 'Black']
  },
  summer: {
    name: 'Cool Summer', 
    description: 'Soft, cool, muted colors',
    characteristics: ['Light skin with pink undertones', 'Soft, muted eyes', 'Ash blonde to brown hair'],
    colors: ['Powder blue', 'Lavender', 'Rose pink', 'Soft gray', 'Mint green', 'Periwinkle'],
    avoid: ['Bright oranges', 'Golden yellows', 'Warm browns', 'Black']
  },
  autumn: {
    name: 'Deep Autumn',
    description: 'Rich, warm, earthy colors',
    characteristics: ['Medium to deep skin with golden undertones', 'Warm, rich eyes', 'Golden to deep brown hair'],
    colors: ['Rust orange', 'Olive green', 'Golden brown', 'Deep red', 'Mustard yellow', 'Chocolate brown'],
    avoid: ['Icy colors', 'Cool pinks', 'Pure white', 'Bright blues']
  },
  winter: {
    name: 'Clear Winter',
    description: 'Bold, cool, contrasting colors', 
    characteristics: ['Light to deep skin with cool undertones', 'Clear, contrasting eyes', 'Dark hair'],
    colors: ['Pure white', 'True red', 'Royal blue', 'Emerald green', 'Hot pink', 'Black'],
    avoid: ['Muted colors', 'Warm browns', 'Orange-reds', 'Golden yellows']
  }
};

// Western Color Analysis (Seasonal)
const westernSeasons = {
  spring: {
    name: 'True Spring',
    description: 'Warm, clear, light colors',
    characteristics: ['Warm skin undertones', 'Clear, bright features', 'Light eyes and hair'],
    colors: ['Clear green', 'Bright coral', 'Golden yellow', 'Warm pink', 'Light navy', 'Cream'],
    metallic: 'Gold',
    avoid: ['Cool undertones', 'Dark colors', 'Muted tones']
  },
  summer: {
    name: 'True Summer',
    description: 'Cool, soft, light colors',
    characteristics: ['Cool skin undertones', 'Soft, gentle features', 'Light to medium coloring'],
    colors: ['Soft blue', 'Dusty pink', 'Lavender gray', 'Mint', 'Mauve', 'Cool white'],
    metallic: 'Silver',
    avoid: ['Warm undertones', 'Bright colors', 'Heavy contrasts']
  },
  autumn: {
    name: 'True Autumn', 
    description: 'Warm, rich, deep colors',
    characteristics: ['Warm skin undertones', 'Rich, golden features', 'Deep coloring'],
    colors: ['Burnt orange', 'Forest green', 'Burgundy', 'Golden brown', 'Rust', 'Cream'],
    metallic: 'Gold',
    avoid: ['Cool undertones', 'Icy colors', 'Black and white contrasts']
  },
  winter: {
    name: 'True Winter',
    description: 'Cool, clear, deep colors',
    characteristics: ['Cool skin undertones', 'High contrast features', 'Dark hair and eyes'],
    colors: ['True white', 'Black', 'Royal blue', 'Emerald', 'Magenta', 'Icy pink'],
    metallic: 'Silver',
    avoid: ['Warm undertones', 'Muted colors', 'Earth tones']
  }
};

// Analysis Questions
const analysisQuestions = [
  {
    id: 1,
    question: "What are your skin's undertones?",
    options: [
      { value: 'warm', text: 'Warm (Golden, peachy, yellow)', seasons: ['spring', 'autumn'] },
      { value: 'cool', text: 'Cool (Pink, blue, red)', seasons: ['summer', 'winter'] },
      { value: 'neutral', text: 'Neutral (Mix of warm and cool)', seasons: ['spring', 'summer'] },
    ]
  },
  {
    id: 2, 
    question: "How does your skin react to sun exposure?",
    options: [
      { value: 'burns', text: 'Burns easily, tans minimally', seasons: ['summer', 'winter'] },
      { value: 'tans', text: 'Tans easily, burns rarely', seasons: ['autumn', 'spring'] },
      { value: 'mixed', text: 'Burns then tans', seasons: ['spring', 'summer'] },
    ]
  },
  {
    id: 3,
    question: "What is your natural hair color?",
    options: [
      { value: 'light', text: 'Light blonde to light brown', seasons: ['spring', 'summer'] },
      { value: 'medium', text: 'Medium brown to dark blonde', seasons: ['spring', 'autumn'] },
      { value: 'dark', text: 'Dark brown to black', seasons: ['autumn', 'winter'] },
      { value: 'red', text: 'Red or auburn', seasons: ['autumn', 'spring'] },
    ]
  },
  {
    id: 4,
    question: "What is your eye color?",
    options: [
      { value: 'light', text: 'Light blue, green, or hazel', seasons: ['spring', 'summer'] },
      { value: 'medium', text: 'Medium brown or amber', seasons: ['autumn', 'spring'] },
      { value: 'dark', text: 'Dark brown or black', seasons: ['winter', 'autumn'] },
      { value: 'bright', text: 'Bright blue or green', seasons: ['winter', 'summer'] },
    ]
  },
  {
    id: 5,
    question: "Which colors make you look most vibrant?",
    options: [
      { value: 'bright', text: 'Bright, clear colors', seasons: ['spring', 'winter'] },
      { value: 'soft', text: 'Soft, muted colors', seasons: ['summer'] },
      { value: 'rich', text: 'Rich, warm colors', seasons: ['autumn'] },
      { value: 'cool', text: 'Cool, icy colors', seasons: ['winter', 'summer'] },
    ]
  }
];

export default function ColorAnalysisScreen() {
  const [currentStep, setCurrentStep] = useState<'choice' | 'method' | 'questionnaire' | 'photo' | 'results'>('choice');
  const [analysisMethod, setAnalysisMethod] = useState<'korean' | 'western' | null>(null);
  const [inputMethod, setInputMethod] = useState<'questionnaire' | 'photo' | null>(null);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [colorResult, setColorResult] = useState<string | null>(null);

  const calculateColorSeason = () => {
    const seasonScores: {[key: string]: number} = {
      spring: 0,
      summer: 0,
      autumn: 0,
      winter: 0
    };
    
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = analysisQuestions.find(q => q.id === parseInt(questionId));
      const option = question?.options.find(opt => opt.value === answer);
      
      option?.seasons.forEach(season => {
        seasonScores[season] += 1;
      });
    });
    
    return Object.entries(seasonScores).reduce((a, b) => 
      seasonScores[a[0]] > seasonScores[b[0]] ? a : b
    )[0];
  };

  const analyzePhotoColors = async () => {
    if (!imageBase64) return null;
    
    try {
      setIsAnalyzing(true);
      const response = await fetch(`${BACKEND_URL}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: imageBase64,
          analysis_type: 'color',
        }),
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const result = await response.json();
      
      // Parse AI response to determine season
      const aiResponse = result.result.toLowerCase();
      let detectedSeason = null;
      
      if (aiResponse.includes('warm') && aiResponse.includes('bright')) {
        detectedSeason = 'spring';
      } else if (aiResponse.includes('cool') && aiResponse.includes('soft')) {
        detectedSeason = 'summer';
      } else if (aiResponse.includes('warm') && (aiResponse.includes('rich') || aiResponse.includes('deep'))) {
        detectedSeason = 'autumn';
      } else if (aiResponse.includes('cool') && (aiResponse.includes('clear') || aiResponse.includes('bright'))) {
        detectedSeason = 'winter';
      }
      
      return detectedSeason || 'summer'; // Default fallback
    } catch (error) {
      console.error('AI analysis error:', error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMethodChoice = (method: 'korean' | 'western') => {
    setAnalysisMethod(method);
    setCurrentStep('method');
  };

  const handleInputChoice = (method: 'questionnaire' | 'photo') => {
    setInputMethod(method);
    if (method === 'questionnaire') {
      setCurrentStep('questionnaire');
    } else {
      setCurrentStep('photo');
    }
  };

  const handleAnswerSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [analysisQuestions[currentQuestion].id]: value }));
    
    if (currentQuestion < analysisQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      const result = calculateColorSeason();
      setColorResult(result);
      setCurrentStep('results');
    }
  };

  const pickImage = async () => {
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
        setImageBase64(asset.base64 || '');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handlePhotoAnalysis = async () => {
    const result = await analyzePhotoColors();
    setColorResult(result);
    setCurrentStep('results');
  };

  const reset = () => {
    setCurrentStep('choice');
    setAnalysisMethod(null);
    setInputMethod(null);
    setAnswers({});
    setCurrentQuestion(0);
    setImageUri(null);
    setImageBase64(null);
    setColorResult(null);
  };

  const renderChoice = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Color Analysis</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="color-palette" size={48} color="#06b6d4" />
          </View>
          <Text style={styles.introTitle}>Discover Your Perfect Colors</Text>
          <Text style={styles.introDescription}>
            Find colors that make you look radiant and enhance your natural beauty through professional color analysis methods.
          </Text>
        </View>

        <View style={styles.methodsContainer}>
          <Text style={styles.sectionTitle}>Choose Analysis Method</Text>
          
          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => handleMethodChoice('korean')}
          >
            <View style={[styles.methodIcon, { backgroundColor: '#ec4899' }]}>
              <Text style={styles.methodEmoji}>🌸</Text>
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>Korean Personal Color</Text>
              <Text style={styles.methodDescription}>
                Based on Korean beauty standards focusing on skin tone and personal harmony
              </Text>
              <Text style={styles.methodFeatures}>4 seasons • Skin-focused • Popular in K-beauty</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => handleMethodChoice('western')}
          >
            <View style={[styles.methodIcon, { backgroundColor: '#8b5cf6' }]}>
              <Text style={styles.methodEmoji}>🎨</Text>
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>Western Seasonal Analysis</Text>
              <Text style={styles.methodDescription}>
                Traditional 4-season color analysis based on temperature and intensity
              </Text>
              <Text style={styles.methodFeatures}>Classic method • Temperature-based • Widely used</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.comparisonSection}>
          <Text style={styles.sectionTitle}>Method Comparison</Text>
          
          <View style={styles.comparisonCard}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>Korean Method</Text>
              <Text style={styles.comparisonText}>• Focuses on skin harmony{'\n'}• Considers Asian beauty standards{'\n'}• Popular in K-beauty industry</Text>
            </View>
            
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>Western Method</Text>
              <Text style={styles.comparisonText}>• Emphasizes undertones{'\n'}• Traditional seasonal approach{'\n'}• Widely used globally</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderMethod = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentStep('choice')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>{analysisMethod === 'korean' ? 'Korean' : 'Western'} Analysis</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.methodsContainer}>
          <Text style={styles.sectionTitle}>Choose Input Method</Text>
          
          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => handleInputChoice('questionnaire')}
          >
            <View style={[styles.methodIcon, { backgroundColor: '#06b6d4' }]}>
              <Ionicons name="help-circle" size={32} color="white" />
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>Self-Assessment</Text>
              <Text style={styles.methodDescription}>
                Answer questions about your skin, hair, and eyes
              </Text>
              <Text style={styles.methodTime}>⏱ 3-5 minutes</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => handleInputChoice('photo')}
          >
            <View style={[styles.methodIcon, { backgroundColor: '#f59e0b' }]}>
              <Ionicons name="camera" size={32} color="white" />
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>Photo Analysis</Text>
              <Text style={styles.methodDescription}>
                Upload a clear photo of your face in natural lighting
              </Text>
              <Text style={styles.methodTime}>⏱ 1-2 minutes</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderQuestionnaire = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentStep('method')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Self-Assessment</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestion + 1) / analysisQuestions.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentQuestion + 1} of {analysisQuestions.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            {analysisQuestions[currentQuestion]?.question}
          </Text>
          
          <View style={styles.optionsContainer}>
            {analysisQuestions[currentQuestion]?.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  answers[analysisQuestions[currentQuestion].id] === option.value && styles.selectedOption
                ]}
                onPress={() => handleAnswerSelect(option.value)}
              >
                <Text style={[
                  styles.optionText,
                  answers[analysisQuestions[currentQuestion].id] === option.value && styles.selectedOptionText
                ]}>
                  {option.text}
                </Text>
                {answers[analysisQuestions[currentQuestion].id] === option.value && (
                  <Ionicons name="checkmark-circle" size={24} color="#06b6d4" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderPhoto = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentStep('method')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Photo Analysis</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Upload Your Photo</Text>
          <Text style={styles.photoInstructions}>
            For best results, use a clear photo of your face in natural daylight, without makeup, and with neutral background.
          </Text>
          
          {imageUri ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.selectedImage} contentFit="cover" />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => {
                  setImageUri(null);
                  setImageBase64(null);
                }}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
              <Ionicons name="camera" size={48} color="#9ca3af" />
              <Text style={styles.imagePlaceholderText}>Tap to select photo</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.selectImageButton}
            onPress={pickImage}
          >
            <Ionicons name="images" size={24} color="#06b6d4" />
            <Text style={styles.selectImageText}>Select from Gallery</Text>
          </TouchableOpacity>

          {imageUri && (
            <TouchableOpacity
              style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
              onPress={handlePhotoAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.analyzeButtonText}>Analyze Colors</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );

  const renderResults = () => {
    const seasons = analysisMethod === 'korean' ? koreanSeasons : westernSeasons;
    const result = colorResult ? seasons[colorResult as keyof typeof seasons] : null;
    
    if (!result) {
      return (
        <View style={styles.container}>
          <Text>Analysis failed. Please try again.</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={reset} style={styles.backButton}>
            <Ionicons name="refresh" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Your Color Season</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <View style={styles.resultIcon}>
                <Text style={styles.seasonEmoji}>
                  {colorResult === 'spring' ? '🌸' : 
                   colorResult === 'summer' ? '☀️' : 
                   colorResult === 'autumn' ? '🍂' : '❄️'}
                </Text>
              </View>
              <Text style={styles.resultTitle}>{result.name}</Text>
              <Text style={styles.resultDescription}>{result.description}</Text>
              <Text style={styles.methodBadge}>
                {analysisMethod === 'korean' ? 'Korean Method' : 'Western Method'}
              </Text>
            </View>

            <View style={styles.characteristicsSection}>
              <Text style={styles.sectionTitle}>Your Characteristics</Text>
              {result.characteristics.map((char, index) => (
                <View key={index} style={styles.characteristicItem}>
                  <Ionicons name="checkmark" size={20} color="#10b981" />
                  <Text style={styles.characteristicText}>{char}</Text>
                </View>
              ))}
            </View>

            <View style={styles.colorsSection}>
              <Text style={styles.sectionTitle}>Your Best Colors</Text>
              <View style={styles.colorPalette}>
                {result.colors.map((color, index) => (
                  <View key={index} style={styles.colorItem}>
                    <View style={[styles.colorSwatch, { backgroundColor: color.toLowerCase().replace(/\s+/g, '') }]} />
                    <Text style={styles.colorName}>{color}</Text>
                  </View>
                ))}
              </View>
            </View>

            {analysisMethod === 'western' && 'metallic' in result && (
              <View style={styles.metalSection}>
                <Text style={styles.sectionTitle}>Recommended Metals</Text>
                <View style={styles.metalItem}>
                  <Ionicons name="star" size={20} color="#f59e0b" />
                  <Text style={styles.metalText}>{result.metallic} jewelry and accessories</Text>
                </View>
              </View>
            )}

            <View style={styles.avoidSection}>
              <Text style={styles.sectionTitle}>Colors to Avoid</Text>
              {result.avoid.map((avoid, index) => (
                <View key={index} style={styles.avoidItem}>
                  <Ionicons name="close" size={20} color="#ef4444" />
                  <Text style={styles.avoidText}>{avoid}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/wardrobe' as any)}
            >
              <Text style={styles.actionButtonText}>Apply to My Wardrobe</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  switch (currentStep) {
    case 'choice':
      return renderChoice();
    case 'method':
      return renderMethod();
    case 'questionnaire':
      return renderQuestionnaire();
    case 'photo':
      return renderPhoto();
    case 'results':
      return renderResults();
    default:
      return renderChoice();
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
  content: {
    flex: 1,
  },
  introSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  introDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  methodsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  methodCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodEmoji: {
    fontSize: 32,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  methodFeatures: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  methodTime: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  comparisonSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  comparisonCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  comparisonItem: {
    marginBottom: 20,
  },
  comparisonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  comparisonText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#06b6d4',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  questionContainer: {
    padding: 24,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedOption: {
    borderColor: '#06b6d4',
    backgroundColor: '#f0f9ff',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  selectedOptionText: {
    color: '#06b6d4',
    fontWeight: '600',
  },
  photoSection: {
    padding: 24,
  },
  photoInstructions: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  selectImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  selectImageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06b6d4',
  },
  analyzeButton: {
    backgroundColor: '#06b6d4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  analyzeButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    padding: 24,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  seasonEmoji: {
    fontSize: 48,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  methodBadge: {
    backgroundColor: '#06b6d4',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  characteristicsSection: {
    marginBottom: 32,
  },
  characteristicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  characteristicText: {
    fontSize: 16,
    color: '#374151',
  },
  colorsSection: {
    marginBottom: 32,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  colorItem: {
    alignItems: 'center',
    width: 80,
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  colorName: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  metalSection: {
    marginBottom: 32,
  },
  metalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  metalText: {
    fontSize: 16,
    color: '#374151',
  },
  avoidSection: {
    marginBottom: 32,
  },
  avoidItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  avoidText: {
    fontSize: 16,
    color: '#6b7280',
  },
  actionButton: {
    backgroundColor: '#06b6d4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});