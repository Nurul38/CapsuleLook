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

// Kibbe Body Types
const kibbeTypes = {
  D: {
    name: 'Dramatic',
    description: 'Sharp, angular, tall, narrow',
    characteristics: ['Sharp bone structure', 'Narrow silhouette', 'Straight lines', 'Minimal curves'],
    recommendations: ['Tailored pieces', 'Sharp shoulders', 'Minimal details', 'Monochromatic looks']
  },
  DC: {
    name: 'Dramatic Classic',
    description: 'Balanced with slight sharpness',
    characteristics: ['Moderate height', 'Balanced proportions', 'Some angularity', 'Refined bone structure'],
    recommendations: ['Classic tailoring', 'Clean lines', 'Minimal patterns', 'Structured pieces']
  },
  FN: {
    name: 'Flamboyant Natural',
    description: 'Strong, broad, angular',
    characteristics: ['Broad shoulders', 'Long limbs', 'Strong bone structure', 'Natural strength'],
    recommendations: ['Relaxed fits', 'Natural fabrics', 'Unconstructed pieces', 'Bold patterns']
  },
  N: {
    name: 'Natural',
    description: 'Moderate, relaxed, straight',
    characteristics: ['Moderate proportions', 'Relaxed bone structure', 'Straight silhouette', 'Natural lines'],
    recommendations: ['Casual pieces', 'Natural textures', 'Relaxed fits', 'Minimal structure']
  },
  C: {
    name: 'Classic',
    description: 'Balanced, moderate, symmetrical',
    characteristics: ['Balanced proportions', 'Moderate everything', 'Symmetrical features', 'Even bone structure'],
    recommendations: ['Traditional pieces', 'Balanced silhouettes', 'Quality fabrics', 'Timeless styles']
  },
  SC: {
    name: 'Soft Classic',
    description: 'Balanced with slight softness',
    characteristics: ['Moderate height', 'Soft bone structure', 'Gentle curves', 'Refined features'],
    recommendations: ['Soft tailoring', 'Gentle curves', 'Subtle details', 'Feminine touches']
  },
  FG: {
    name: 'Flamboyant Gamine',
    description: 'Sharp, petite, contrasted',
    characteristics: ['Petite frame', 'Sharp features', 'Contrasting elements', 'Angular bone structure'],
    recommendations: ['Mixed patterns', 'Sharp details', 'Cropped pieces', 'Geometric shapes']
  },
  G: {
    name: 'Gamine',
    description: 'Petite, sharp, boyish',
    characteristics: ['Small frame', 'Sharp bone structure', 'Boyish figure', 'Compact proportions'],
    recommendations: ['Tailored pieces', 'Sharp lines', 'Minimal curves', 'Structured looks']
  },
  SG: {
    name: 'Soft Gamine',
    description: 'Petite with soft curves',
    characteristics: ['Small frame', 'Soft curves', 'Delicate features', 'Compact with femininity'],
    recommendations: ['Fitted pieces', 'Soft details', 'Curved lines', 'Delicate patterns']
  },
  TR: {
    name: 'Theatrical Romantic',
    description: 'Petite, sharp with soft curves',
    characteristics: ['Small frame', 'Sharp bones with curves', 'Ornate details', 'Dramatic femininity'],
    recommendations: ['Ornate details', 'Fitted silhouettes', 'Luxurious fabrics', 'Dramatic elements']
  },
  R: {
    name: 'Romantic',
    description: 'Soft, curvy, rounded',
    characteristics: ['Soft bone structure', 'Curved lines', 'Rounded features', 'Lush femininity'],
    recommendations: ['Soft fabrics', 'Curved silhouettes', 'Ornate details', 'Flowing lines']
  },
  SD: {
    name: 'Soft Dramatic',
    description: 'Tall with soft curves',
    characteristics: ['Tall frame', 'Sharp bones with curves', 'Dramatic presence', 'Bold femininity'],
    recommendations: ['Dramatic silhouettes', 'Bold details', 'Fitted waists', 'Statement pieces']
  }
};

// Self-Assessment Questions
const questions = [
  {
    id: 1,
    question: "How would you describe your bone structure?",
    options: [
      { value: 'sharp', text: 'Sharp and angular', types: ['D', 'FG'] },
      { value: 'moderate', text: 'Moderate and balanced', types: ['DC', 'C', 'SC'] },
      { value: 'soft', text: 'Soft and rounded', types: ['R', 'TR', 'SG'] },
      { value: 'broad', text: 'Broad and strong', types: ['FN', 'N'] },
    ]
  },
  {
    id: 2,
    question: "What is your height?",
    options: [
      { value: 'petite', text: 'Under 5\'3" (160cm)', types: ['FG', 'G', 'SG', 'TR', 'R'] },
      { value: 'moderate', text: '5\'3" - 5\'6" (160-168cm)', types: ['DC', 'C', 'SC', 'N'] },
      { value: 'tall', text: 'Over 5\'6" (168cm)', types: ['D', 'FN', 'SD'] },
    ]
  },
  {
    id: 3,
    question: "How would you describe your overall body shape?",
    options: [
      { value: 'straight', text: 'Straight and narrow', types: ['D', 'FN', 'G'] },
      { value: 'balanced', text: 'Balanced proportions', types: ['DC', 'C', 'SC'] },
      { value: 'curvy', text: 'Curvy with defined waist', types: ['R', 'TR', 'SD', 'SG'] },
      { value: 'natural', text: 'Natural and relaxed', types: ['N', 'FN'] },
    ]
  },
  {
    id: 4,
    question: "How would you describe your facial features?",
    options: [
      { value: 'sharp', text: 'Sharp and defined', types: ['D', 'FG', 'G'] },
      { value: 'balanced', text: 'Balanced and symmetrical', types: ['DC', 'C'] },
      { value: 'soft', text: 'Soft and rounded', types: ['R', 'SC', 'SG'] },
      { value: 'strong', text: 'Strong and bold', types: ['FN', 'SD'] },
      { value: 'delicate', text: 'Delicate and ornate', types: ['TR'] },
    ]
  },
  {
    id: 5,
    question: "Which style naturally appeals to you?",
    options: [
      { value: 'minimal', text: 'Minimal and sleek', types: ['D', 'DC'] },
      { value: 'classic', text: 'Classic and timeless', types: ['C', 'SC'] },
      { value: 'natural', text: 'Natural and relaxed', types: ['N', 'FN'] },
      { value: 'romantic', text: 'Romantic and ornate', types: ['R', 'TR'] },
      { value: 'edgy', text: 'Edgy and contrasted', types: ['FG', 'G', 'SG'] },
      { value: 'dramatic', text: 'Dramatic and bold', types: ['SD'] },
    ]
  },
];

export default function KibbeAnalysisScreen() {
  const [currentStep, setCurrentStep] = useState<'choice' | 'questionnaire' | 'photo' | 'results'>('choice');
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [kibbeResult, setKibbeResult] = useState<string | null>(null);
  const [analysisMethod, setAnalysisMethod] = useState<'questionnaire' | 'photo' | 'both' | null>(null);

  const calculateKibbeType = () => {
    const typeScores: {[key: string]: number} = {};
    
    // Initialize scores
    Object.keys(kibbeTypes).forEach(type => {
      typeScores[type] = 0;
    });
    
    // Calculate scores based on answers
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = questions.find(q => q.id === parseInt(questionId));
      const option = question?.options.find(opt => opt.value === answer);
      
      option?.types.forEach(type => {
        typeScores[type] = (typeScores[type] || 0) + 1;
      });
    });
    
    // Find the type with the highest score
    const topType = Object.entries(typeScores).reduce((a, b) => 
      typeScores[a[0]] > typeScores[b[0]] ? a : b
    )[0];
    
    return topType;
  };

  const analyzePhotoWithAI = async () => {
    if (!imageBase64) return null;
    
    try {
      setIsAnalyzing(true);
      const response = await fetch(`${BACKEND_URL}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: imageBase64,
          analysis_type: 'kibbe',
        }),
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const result = await response.json();
      
      // Parse AI response to extract Kibbe type
      const aiResponse = result.result.toLowerCase();
      let detectedType = null;
      
      Object.entries(kibbeTypes).forEach(([type, data]) => {
        if (aiResponse.includes(data.name.toLowerCase()) || aiResponse.includes(type.toLowerCase())) {
          detectedType = type;
        }
      });
      
      return detectedType || 'C'; // Default to Classic if no clear match
    } catch (error) {
      console.error('AI analysis error:', error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMethodChoice = (method: 'questionnaire' | 'photo' | 'both') => {
    setAnalysisMethod(method);
    if (method === 'questionnaire' || method === 'both') {
      setCurrentStep('questionnaire');
    } else {
      setCurrentStep('photo');
    }
  };

  const handleAnswerSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: value }));
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Questionnaire completed
      if (analysisMethod === 'questionnaire') {
        const result = calculateKibbeType();
        setKibbeResult(result);
        setCurrentStep('results');
      } else if (analysisMethod === 'both') {
        setCurrentStep('photo');
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
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
    const aiResult = await analyzePhotoWithAI();
    
    if (analysisMethod === 'photo') {
      setKibbeResult(aiResult);
    } else if (analysisMethod === 'both') {
      // Combine questionnaire and photo results
      const questionnaireResult = calculateKibbeType();
      // You could implement a more sophisticated combination logic here
      setKibbeResult(aiResult || questionnaireResult);
    }
    
    setCurrentStep('results');
  };

  const resetAnalysis = () => {
    setCurrentStep('choice');
    setAnswers({});
    setCurrentQuestion(0);
    setImageUri(null);
    setImageBase64(null);
    setKibbeResult(null);
    setAnalysisMethod(null);
  };

  const renderMethodChoice = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Kibbe Analysis</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="body" size={48} color="#8b5cf6" />
          </View>
          <Text style={styles.introTitle}>Discover Your Kibbe Body Type</Text>
          <Text style={styles.introDescription}>
            Understanding your Kibbe body type helps you choose clothing that works harmoniously with your natural lines and proportions.
          </Text>
        </View>

        <View style={styles.methodsContainer}>
          <Text style={styles.sectionTitle}>Choose Your Analysis Method</Text>
          
          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => handleMethodChoice('questionnaire')}
          >
            <View style={[styles.methodIcon, { backgroundColor: '#06b6d4' }]}>
              <Ionicons name="help-circle" size={32} color="white" />
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>Self-Assessment</Text>
              <Text style={styles.methodDescription}>
                Answer 5 questions about your bone structure, proportions, and style preferences
              </Text>
              <Text style={styles.methodTime}>⏱ 3-5 minutes</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => handleMethodChoice('photo')}
          >
            <View style={[styles.methodIcon, { backgroundColor: '#f59e0b' }]}>
              <Ionicons name="camera" size={32} color="white" />
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>AI Photo Analysis</Text>
              <Text style={styles.methodDescription}>
                Upload a full-body photo for AI-powered body type analysis
              </Text>
              <Text style={styles.methodTime}>⏱ 1-2 minutes</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodCard, styles.recommendedCard]}
            onPress={() => handleMethodChoice('both')}
          >
            <View style={[styles.methodIcon, { backgroundColor: '#8b5cf6' }]}>
              <Ionicons name="sparkles" size={32} color="white" />
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>Combined Analysis</Text>
              <Text style={styles.methodDescription}>
                Get the most accurate result with both questionnaire and photo analysis
              </Text>
              <Text style={styles.methodTime}>⏱ 5-7 minutes</Text>
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommended</Text>
              </View>
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
        <TouchableOpacity onPress={resetAnalysis} style={styles.backButton}>
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
              { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentQuestion + 1} of {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            {questions[currentQuestion]?.question}
          </Text>
          
          <View style={styles.optionsContainer}>
            {questions[currentQuestion]?.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  answers[questions[currentQuestion].id] === option.value && styles.selectedOption
                ]}
                onPress={() => handleAnswerSelect(option.value)}
              >
                <Text style={[
                  styles.optionText,
                  answers[questions[currentQuestion].id] === option.value && styles.selectedOptionText
                ]}>
                  {option.text}
                </Text>
                {answers[questions[currentQuestion].id] === option.value && (
                  <Ionicons name="checkmark-circle" size={24} color="#8b5cf6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  const renderPhotoAnalysis = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={resetAnalysis} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Photo Analysis</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Upload Full-Body Photo</Text>
          <Text style={styles.photoInstructions}>
            For best results, use a photo where you're standing straight, wearing fitted clothing, with your full body visible.
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
            <Ionicons name="images" size={24} color="#8b5cf6" />
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
                <Text style={styles.analyzeButtonText}>Analyze Photo</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );

  const renderResults = () => {
    const result = kibbeResult ? kibbeTypes[kibbeResult as keyof typeof kibbeTypes] : null;
    
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
          <TouchableOpacity onPress={resetAnalysis} style={styles.backButton}>
            <Ionicons name="refresh" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Your Result</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <View style={styles.resultIcon}>
                <Text style={styles.resultTypeText}>{kibbeResult}</Text>
              </View>
              <Text style={styles.resultTitle}>{result.name}</Text>
              <Text style={styles.resultDescription}>{result.description}</Text>
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

            <View style={styles.recommendationsSection}>
              <Text style={styles.sectionTitle}>Style Recommendations</Text>
              {result.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Ionicons name="star" size={20} color="#f59e0b" />
                  <Text style={styles.recommendationText}>{rec}</Text>
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
      return renderMethodChoice();
    case 'questionnaire':
      return renderQuestionnaire();
    case 'photo':
      return renderPhotoAnalysis();
    case 'results':
      return renderResults();
    default:
      return renderMethodChoice();
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
  recommendedCard: {
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
  methodTime: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  recommendedBadge: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  recommendedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: '#8b5cf6',
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
    borderColor: '#8b5cf6',
    backgroundColor: '#f3f4f6',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  selectedOptionText: {
    color: '#8b5cf6',
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
    height: 300,
    borderRadius: 16,
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
    height: 300,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
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
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  selectImageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  analyzeButton: {
    backgroundColor: '#8b5cf6',
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
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTypeText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
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
  recommendationsSection: {
    marginBottom: 32,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  recommendationText: {
    fontSize: 16,
    color: '#374151',
  },
  actionButton: {
    backgroundColor: '#8b5cf6',
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