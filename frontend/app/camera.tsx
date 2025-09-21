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
  Modal,
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
  category: z.string().optional(),
  purchase_link: z.string().url('Invalid URL').optional().or(z.literal('')),
  tags: z.string().optional(),
});

type ClothingFormData = z.infer<typeof clothingSchema>;

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

// Predefined options
const functionOptions = [
  { value: 'casual', label: 'Casual', icon: 'shirt' },
  { value: 'formal', label: 'Formal', icon: 'business' },
  { value: 'athletic', label: 'Athletic', icon: 'fitness' },
  { value: 'work', label: 'Work', icon: 'briefcase' },
  { value: 'sleep', label: 'Sleepwear', icon: 'moon' },
  { value: 'outdoor', label: 'Outdoor', icon: 'leaf' },
];

const categoryOptions = [
  'Winter', 'Summer', 'Spring', 'Autumn', 'Costume', 'Wedding', 'Events', 
  'Party', 'Beach', 'Gym', 'Travel', 'Maternity', 'Undergarments', 'Accessories'
];

const colorOptions = [
  'Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Gray', 'Grey', 'Brown', 
  'Pink', 'Purple', 'Orange', 'Navy', 'Burgundy', 'Maroon', 'Teal', 'Turquoise',
  'Beige', 'Cream', 'Ivory', 'Gold', 'Silver', 'Rose Gold', 'Coral', 'Mint',
  'Lavender', 'Olive', 'Khaki', 'Denim', 'Multicolor'
];

const brandOptions = [
  // High Street Brands
  'H&M', 'Zara', 'Uniqlo', 'Mango', 'COS', 'Massimo Dutti', 'Bershka', '& Other Stories',
  'Weekday', 'Monki', 'ARKET', 'Topshop', 'ASOS', 'Urban Outfitters', 'American Eagle',
  'Abercrombie & Fitch', 'Hollister', 'Gap', 'Banana Republic', 'Old Navy',
  'Forever 21', 'Charlotte Russe', 'Primark', 'New Look', 'River Island',
  'Marks & Spencer', 'Next', 'John Lewis', 'Debenhams', 'House of Fraser',
  
  // Designer Brands
  'Chanel', 'Dior', 'Louis Vuitton', 'Hermès', 'Prada', 'Gucci', 'Versace',
  'Armani', 'Dolce & Gabbana', 'Valentino', 'Givenchy', 'Saint Laurent',
  'Balenciaga', 'Bottega Veneta', 'Fendi', 'Celine', 'Loewe', 'Burberry',
  'Alexander McQueen', 'Stella McCartney', 'Marc Jacobs', 'Tom Ford',
  'Ralph Lauren', 'Calvin Klein', 'Tommy Hilfiger', 'Michael Kors',
  
  // Athletic Brands
  'Nike', 'Adidas', 'Puma', 'Under Armour', 'Reebok', 'New Balance',
  'Asics', 'Lululemon', 'Athleta', 'Patagonia', 'The North Face',
  
  // Contemporary Brands
  'Cos', 'Acne Studios', 'Ganni', 'Sandro', 'Maje', 'Isabel Marant',
  'Theory', 'Vince', 'Rag & Bone', 'Equipment', 'Frame', 'Citizens of Humanity'
];

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [mediaPermission, setMediaPermission] = useState<boolean | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  
  // Dropdown states
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [colorSearch, setColorSearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  
  const cameraRef = useRef<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ClothingFormData>({
    resolver: zodResolver(clothingSchema),
    defaultValues: {
      name: '',
      brand: '',
      color: '',
      function: 'casual',
      category: '',
      purchase_link: '',
      tags: '',
    },
  });

  useEffect(() => {
    requestPermissions();
    getItemCount();
  }, []);

  const getItemCount = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/clothing`);
      if (response.ok) {
        const items = await response.json();
        setItemCount(items.length);
      }
    } catch (error) {
      console.error('Error getting item count:', error);
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(cameraStatus === 'granted');

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
      
      // Show AI analysis options
      setShowAIOptions(true);
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
        
        // Show AI analysis options
        setShowAIOptions(true);
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
      setShowAIOptions(false);
      
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
      
      // Auto-fill form based on AI analysis
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
    
    // Enhanced color detection with more comprehensive color matching
    const colorMappings = {
      'red': ['red', 'crimson', 'cherry', 'burgundy', 'maroon', 'scarlet'],
      'blue': ['blue', 'navy', 'royal', 'cobalt', 'sapphire', 'azure'],
      'green': ['green', 'emerald', 'forest', 'lime', 'olive', 'mint'],
      'yellow': ['yellow', 'golden', 'amber', 'honey', 'lemon', 'canary'],
      'black': ['black', 'ebony', 'charcoal', 'jet', 'midnight'],
      'white': ['white', 'ivory', 'cream', 'pearl', 'snow', 'off-white'],
      'gray': ['gray', 'grey', 'silver', 'slate', 'ash', 'pewter'],
      'brown': ['brown', 'tan', 'beige', 'chocolate', 'coffee', 'camel'],
      'pink': ['pink', 'rose', 'blush', 'coral', 'salmon', 'magenta'],
      'purple': ['purple', 'violet', 'lavender', 'plum', 'indigo', 'mauve'],
      'orange': ['orange', 'peach', 'apricot', 'tangerine', 'rust'],
    };
    
    let detectedColor = '';
    for (const [color, variations] of Object.entries(colorMappings)) {
      if (variations.some(variation => lowerAnalysis.includes(variation))) {
        detectedColor = color.charAt(0).toUpperCase() + color.slice(1);
        break;
      }
    }
    
    if (detectedColor && !watch('color')) {
      setValue('color', detectedColor);
    }

    // Enhanced garment type detection
    const garmentMappings = {
      'shirt': ['shirt', 'blouse', 'top', 'tee', 't-shirt', 'tank top', 'camisole'],
      'dress': ['dress', 'gown', 'frock', 'sundress', 'maxi dress', 'mini dress'],
      'pants': ['pants', 'trousers', 'slacks', 'chinos', 'leggings'],
      'jeans': ['jeans', 'denim'],
      'skirt': ['skirt', 'mini skirt', 'maxi skirt', 'pleated skirt'],
      'jacket': ['jacket', 'blazer', 'coat', 'cardigan', 'hoodie', 'sweater'],
      'shorts': ['shorts', 'bermuda', 'hot pants'],
      'shoes': ['shoes', 'boots', 'sandals', 'sneakers', 'heels', 'flats'],
      'bag': ['bag', 'purse', 'backpack', 'tote', 'clutch', 'handbag'],
    };
    
    let detectedType = '';
    for (const [type, variations] of Object.entries(garmentMappings)) {
      if (variations.some(variation => lowerAnalysis.includes(variation))) {
        detectedType = type;
        break;
      }
    }
    
    // Generate smart auto-name based on category, color, and type
    if (detectedType || detectedColor) {
      generateSmartAutoName(detectedType, detectedColor);
    }
  };

  const generateAutoName = (baseType?: string) => {
    const currentColor = watch('color');
    const currentBrand = watch('brand');
    const currentCategory = watch('category');
    const nextIndex = itemCount + 1;
    
    generateSmartAutoName(baseType, currentColor, currentBrand, currentCategory, nextIndex);
  };

  const generateSmartAutoName = (
    type?: string, 
    color?: string, 
    brand?: string, 
    category?: string, 
    index?: number
  ) => {
    const currentColor = color || watch('color');
    const currentBrand = brand || watch('brand');
    const currentCategory = category || watch('category');
    const currentIndex = index || itemCount + 1;
    
    let autoName = '';
    
    // Priority 1: Category-based naming with running numbers
    if (currentCategory) {
      const categoryCount = itemCount + 1; // This should be category-specific count in real app
      autoName = `${currentCategory}-${String(categoryCount).padStart(3, '0')}`;
      
      // Add descriptors if available
      if (currentColor && type) {
        autoName += ` (${currentColor} ${type.charAt(0).toUpperCase() + type.slice(1)})`;
      } else if (currentColor) {
        autoName += ` (${currentColor})`;
      } else if (type) {
        autoName += ` (${type.charAt(0).toUpperCase() + type.slice(1)})`;
      }
    } 
    // Priority 2: Type-based naming
    else if (type) {
      const typeFormatted = type.charAt(0).toUpperCase() + type.slice(1);
      if (currentColor) {
        autoName = `${currentColor} ${typeFormatted}`;
      } else {
        autoName = typeFormatted;
      }
      
      // Add running number for same type
      autoName += `-${String(currentIndex).padStart(3, '0')}`;
    }
    // Priority 3: Color-based naming
    else if (currentColor) {
      autoName = `${currentColor} Item-${String(currentIndex).padStart(3, '0')}`;
    }
    // Priority 4: Generic indexed naming
    else {
      autoName = `Item-${String(currentIndex).padStart(3, '0')}`;
    }
    
    // Add brand prefix if available
    if (currentBrand && !autoName.includes(currentBrand)) {
      autoName = `${currentBrand} ${autoName}`;
    }
    
    setValue('name', autoName);
  };

  const filteredColors = colorOptions.filter(color =>
    color.toLowerCase().includes(colorSearch.toLowerCase())
  );

  const filteredBrands = brandOptions.filter(brand =>
    brand.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const filteredCategories = categoryOptions.filter(category =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const renderDropdown = (
    items: string[],
    searchValue: string,
    setSearchValue: (value: string) => void,
    onSelect: (value: string) => void,
    placeholder: string
  ) => (
    <View style={styles.dropdown}>
      <TextInput
        style={styles.dropdownSearch}
        placeholder={`Search ${placeholder.toLowerCase()}...`}
        value={searchValue}
        onChangeText={setSearchValue}
        placeholderTextColor="#9ca3af"
      />
      <ScrollView style={styles.dropdownList} nestedScrollEnabled>
        {items.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.dropdownItem}
            onPress={() => {
              onSelect(item);
              setSearchValue('');
            }}
          >
            <Text style={styles.dropdownItemText}>{item}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.dropdownItem, styles.customOption]}
          onPress={() => {
            onSelect(searchValue);
            setSearchValue('');
          }}
        >
          <Ionicons name="add" size={16} color="#6366f1" />
          <Text style={[styles.dropdownItemText, { color: '#6366f1' }]}>
            Add "{searchValue}"
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const onSubmit = async (data: ClothingFormData) => {
    if (!imageBase64) {
      Alert.alert('Error', 'Please add an image first');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()) : [];
      
      // Auto-generate indexed name if not provided
      let finalName = data.name;
      if (!finalName) {
        const nextIndex = itemCount + 1;
        finalName = `Item ${String(nextIndex).padStart(3, '0')}`;
      }
      
      const clothingData = {
        name: finalName,
        brand: data.brand || undefined,
        color: data.color || undefined,
        function: data.function || undefined,
        category: data.category || undefined,
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
        `"${finalName}" has been added to your wardrobe!`,
        [
          {
            text: 'Add Another',
            onPress: () => {
              setImageUri(null);
              setImageBase64(null);
              setAiAnalysis('');
              reset();
              getItemCount(); // Update count for next auto-indexing
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

  // AI Options Modal
  const AIOptionsModal = () => (
    <Modal
      visible={showAIOptions}
      transparent
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Analyze this image?</Text>
          <Text style={styles.modalDescription}>
            AI can automatically detect clothing type, color, and generate a description to help fill out the form.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => setShowAIOptions(false)}
            >
              <Text style={styles.modalButtonTextSecondary}>Skip AI Analysis</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={() => analyzeImage(imageBase64 || '')}
            >
              <Text style={styles.modalButtonTextPrimary}>Analyze with AI</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
            
            {/* Name with Auto-Generate Option */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Name *</Text>
                <TouchableOpacity
                  onPress={() => generateAutoName()}
                  style={styles.autoButton}
                >
                  <Ionicons name="refresh" size={14} color="#6366f1" />
                  <Text style={styles.autoButtonText}>Auto Generate</Text>
                </TouchableOpacity>
              </View>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="e.g., Blue T-shirt or leave blank for auto-indexing"
                    value={value}
                    onChangeText={onChange}
                    placeholderTextColor="#9ca3af"
                  />
                )}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
            </View>

            {/* Brand with Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Brand</Text>
              <Controller
                control={control}
                name="brand"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setShowBrandDropdown(!showBrandDropdown)}
                    >
                      <Text style={[styles.dropdownButtonText, value && styles.dropdownButtonTextSelected]}>
                        {value || 'Select or enter brand'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#6b7280" />
                    </TouchableOpacity>
                    
                    {showBrandDropdown && renderDropdown(
                      filteredBrands,
                      brandSearch,
                      setBrandSearch,
                      (selectedBrand) => {
                        onChange(selectedBrand);
                        setShowBrandDropdown(false);
                        setBrandSearch('');
                      },
                      'Brand'
                    )}
                  </View>
                )}
              />
            </View>

            {/* Color with Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Color</Text>
              <Controller
                control={control}
                name="color"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setShowColorDropdown(!showColorDropdown)}
                    >
                      <View style={styles.colorPreview}>
                        {value && (
                          <View style={[styles.colorDot, { backgroundColor: value.toLowerCase() }]} />
                        )}
                        <Text style={[styles.dropdownButtonText, value && styles.dropdownButtonTextSelected]}>
                          {value || 'Select or enter color'}
                        </Text>
                      </View>
                      <Ionicons name="chevron-down" size={20} color="#6b7280" />
                    </TouchableOpacity>
                    
                    {showColorDropdown && renderDropdown(
                      filteredColors,
                      colorSearch,
                      setColorSearch,
                      (selectedColor) => {
                        onChange(selectedColor);
                        setShowColorDropdown(false);
                        setColorSearch('');
                      },
                      'Color'
                    )}
                  </View>
                )}
              />
            </View>

            {/* Function */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Function</Text>
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

            {/* Category with Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <Controller
                control={control}
                name="category"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    >
                      <Text style={[styles.dropdownButtonText, value && styles.dropdownButtonTextSelected]}>
                        {value || 'Select or enter category'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#6b7280" />
                    </TouchableOpacity>
                    
                    {showCategoryDropdown && renderDropdown(
                      filteredCategories,
                      categorySearch,
                      setCategorySearch,
                      (selectedCategory) => {
                        onChange(selectedCategory);
                        setShowCategoryDropdown(false);
                        setCategorySearch('');
                      },
                      'Category'
                    )}
                  </View>
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
        
        <AIOptionsModal />
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  autoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f4ff',
    borderRadius: 6,
  },
  autoButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366f1',
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
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  dropdownButtonTextSelected: {
    color: '#1f2937',
  },
  colorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: 'white',
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownSearch: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    fontSize: 14,
  },
  dropdownList: {
    maxHeight: 150,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#374151',
  },
  customOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#6366f1',
  },
  modalButtonSecondary: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalButtonTextPrimary: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
});