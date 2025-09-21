import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Camera, CameraView } from 'expo-camera';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const clothingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().optional(),
  color: z.string().optional(),
  function: z.string().optional(),
  purchase_link: z.string().url('Invalid URL').optional().or(z.literal('')),
  tags: z.string().optional(),
});

type ClothingFormData = z.infer<typeof clothingSchema>;

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [mediaPermission, setMediaPermission] = useState<boolean | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const cameraRef = useRef<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ClothingFormData>({
    resolver: zodResolver(clothingSchema),
    defaultValues: {
      name: '',
      brand: '',
      color: '',
      function: 'casual',
      purchase_link: '',
      tags: '',
    },
  });

  const functionOptions = [
    { value: 'casual', label: 'Casual', icon: 'shirt' },
    { value: 'formal', label: 'Formal', icon: 'business' },
    { value: 'athletic', label: 'Athletic', icon: 'fitness' },
    { value: 'work', label: 'Work', icon: 'briefcase' },
    { value: 'sleep', label: 'Sleepwear', icon: 'moon' },
    { value: 'outdoor', label: 'Outdoor', icon: 'leaf' },
  ];

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    // Camera permission
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(cameraStatus === 'granted');

    // Media library permission
    const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
    setMediaPermission(mediaStatus === 'granted');

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and media library permissions are required to add clothing items.',
        [{ text: 'OK' }]
      );
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || !cameraPermission) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      setImageUri(photo.uri);
      setImageBase64(photo.base64);
      setShowCamera(false);
      
      // Auto-analyze the image
      analyzeImage(photo.base64);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const pickImage = async () => {
    if (!mediaPermission) {
      Alert.alert('Permission Required', 'Media library permission is required.');
      return;
    }

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
        
        if (asset.base64) {
          // Auto-analyze the image
          analyzeImage(asset.base64);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const analyzeImage = async (base64Image: string) => {
    if (!base64Image) return;

    try {
      setIsAnalyzing(true);
      const response = await fetch(`${BACKEND_URL}/api/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: base64Image,
          analysis_type: 'description',
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json();
      setAiAnalysis(result.result);
      
      // Try to auto-fill form based on AI analysis
      autoFillFromAnalysis(result.result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setAiAnalysis('Analysis failed. You can still add the item manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const autoFillFromAnalysis = (analysis: string) => {
    const lowerAnalysis = analysis.toLowerCase();
    
    // Try to extract color
    const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'brown', 'pink', 'purple', 'orange'];
    const detectedColor = colors.find(color => lowerAnalysis.includes(color));
    if (detectedColor) {
      setValue('color', detectedColor);
    }

    // Try to extract garment type for name
    const garmentTypes = ['shirt', 'pants', 'dress', 'skirt', 'jacket', 'sweater', 'jeans', 'shorts', 't-shirt', 'blouse'];
    const detectedType = garmentTypes.find(type => lowerAnalysis.includes(type));
    if (detectedType && !watch('name')) {
      setValue('name', detectedType.charAt(0).toUpperCase() + detectedType.slice(1));
    }
  };

  const onSubmit = async (data: ClothingFormData) => {
    if (!imageBase64) {
      Alert.alert('Error', 'Please add an image first');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()) : [];
      
      const clothingData = {
        name: data.name,
        brand: data.brand || undefined,
        color: data.color || undefined,
        function: data.function || undefined,
        purchase_link: data.purchase_link || undefined,
        image_base64: imageBase64,
        tags: tagsArray,
      };

      const response = await fetch(`${BACKEND_URL}/api/clothing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clothingData),
      });

      if (!response.ok) throw new Error('Failed to create clothing item');

      Alert.alert(
        'Success',
        'Clothing item added to your wardrobe!',
        [
          {
            text: 'Add Another',
            onPress: () => {
              setImageUri(null);
              setImageBase64(null);
              setAiAnalysis('');
              setValue('name', '');
              setValue('brand', '');
              setValue('color', '');
              setValue('function', 'casual');
              setValue('purchase_link', '');
              setValue('tags', '');
            },
          },
          {
            text: 'View Wardrobe',
            onPress: () => router.push('/wardrobe' as any),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating clothing item:', error);
      Alert.alert('Error', 'Failed to add clothing item');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showCamera && cameraPermission) {
    return (
      <SafeAreaView style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.closeCamera}
              onPress={() => setShowCamera(false)}
            >
              <Ionicons name="close" size={32} color="white" />
            </TouchableOpacity>
            
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Item</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image Section */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Photo</Text>
            
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.selectedImage} contentFit="cover" />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => {
                    setImageUri(null);
                    setImageBase64(null);
                    setAiAnalysis('');
                  }}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={48} color="#9ca3af" />
                <Text style={styles.imagePlaceholderText}>Add a photo of your clothing item</Text>
              </View>
            )}
            
            <View style={styles.imageButtons}>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={() => setShowCamera(true)}
                disabled={!cameraPermission}
              >
                <Ionicons name="camera" size={24} color="#6366f1" />
                <Text style={styles.imageButtonText}>Camera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.imageButton}
                onPress={pickImage}
                disabled={!mediaPermission}
              >
                <Ionicons name="images" size={24} color="#6366f1" />
                <Text style={styles.imageButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Analysis */}
          {(isAnalyzing || aiAnalysis) && (
            <View style={styles.analysisSection}>
              <Text style={styles.sectionTitle}>AI Analysis</Text>
              {isAnalyzing ? (
                <View style={styles.analysisLoading}>
                  <ActivityIndicator size="small" color="#6366f1" />
                  <Text style={styles.analysisLoadingText}>Analyzing image...</Text>
                </View>
              ) : (
                <Text style={styles.analysisText}>{aiAnalysis}</Text>
              )}
            </View>
          )}

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Details</Text>
            
            {/* Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name *</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="e.g., Blue T-shirt"
                    value={value}
                    onChangeText={onChange}
                    placeholderTextColor="#9ca3af"
                  />
                )}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
            </View>

            {/* Brand */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Brand</Text>
              <Controller
                control={control}
                name="brand"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Nike, Zara, H&M"
                    value={value}
                    onChangeText={onChange}
                    placeholderTextColor="#9ca3af"
                  />
                )}
              />
            </View>

            {/* Color */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Color</Text>
              <Controller
                control={control}
                name="color"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Blue, Red, Black"
                    value={value}
                    onChangeText={onChange}
                    placeholderTextColor="#9ca3af"
                  />
                )}
              />
            </View>

            {/* Function */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <Controller
                control={control}
                name="function"
                render={({ field: { onChange, value } }) => (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.functionSelector}
                    contentContainerStyle={styles.functionContent}
                  >
                    {functionOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.functionOption,
                          value === option.value && styles.functionOptionActive,
                        ]}
                        onPress={() => onChange(option.value)}
                      >
                        <Ionicons
                          name={option.icon as any}
                          size={20}
                          color={value === option.value ? 'white' : '#6b7280'}
                        />
                        <Text
                          style={[
                            styles.functionText,
                            value === option.value && styles.functionTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              />
            </View>

            {/* Purchase Link */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Purchase Link</Text>
              <Controller
                control={control}
                name="purchase_link"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.purchase_link && styles.inputError]}
                    placeholder="https://example.com/product"
                    value={value}
                    onChangeText={onChange}
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                )}
              />
              {errors.purchase_link && (
                <Text style={styles.errorText}>{errors.purchase_link.message}</Text>
              )}
            </View>

            {/* Tags */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tags</Text>
              <Controller
                control={control}
                name="tags"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="comfortable, summer, favorite (separate with commas)"
                    value={value}
                    onChangeText={onChange}
                    placeholderTextColor="#9ca3af"
                    multiline
                  />
                )}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, (!imageBase64 || isSubmitting) && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={!imageBase64 || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Add to Wardrobe</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  closeCamera: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  cameraControls: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
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
  imageSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedImage: {
    width: 200,
    height: 200,
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
    height: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    gap: 8,
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  analysisSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  analysisLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  analysisLoadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  analysisText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
  },
  formSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  functionSelector: {
    marginTop: 8,
  },
  functionContent: {
    gap: 8,
  },
  functionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    gap: 6,
  },
  functionOptionActive: {
    backgroundColor: '#6366f1',
  },
  functionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  functionTextActive: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});