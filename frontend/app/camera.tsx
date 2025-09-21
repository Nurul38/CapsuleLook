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

// Camera imports
let Camera, CameraView;
try {
  const cameraModule = require('expo-camera');
  Camera = cameraModule.Camera;
  CameraView = cameraModule.CameraView;
} catch (error) {
  Camera = null;
  CameraView = null;
}

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

// Enhanced options with more variety
const functionOptions = [
  { value: 'casual', label: 'Casual', icon: 'shirt', description: 'Everyday comfortable wear' },
  { value: 'formal', label: 'Formal', icon: 'business', description: 'Professional & dressy' },
  { value: 'athletic', label: 'Athletic', icon: 'fitness', description: 'Sports & workout gear' },
  { value: 'work', label: 'Work', icon: 'briefcase', description: 'Office & professional' },
  { value: 'sleep', label: 'Sleepwear', icon: 'moon', description: 'Pajamas & nightwear' },
  { value: 'outdoor', label: 'Outdoor', icon: 'leaf', description: 'Adventure & nature' },
  { value: 'party', label: 'Party', icon: 'musical-notes', description: 'Celebrations & events' },
  { value: 'vacation', label: 'Vacation', icon: 'airplane', description: 'Travel & leisure' },
];

const categoryOptions = [
  { value: 'winter', label: 'Winter', icon: 'snow', description: 'Cold weather clothing' },
  { value: 'summer', label: 'Summer', icon: 'sunny', description: 'Hot weather essentials' },
  { value: 'spring', label: 'Spring', icon: 'flower', description: 'Mild weather transition' },
  { value: 'autumn', label: 'Autumn', icon: 'leaf', description: 'Fall season wear' },
  { value: 'costume', label: 'Costume', icon: 'star', description: 'Special event costumes' },
  { value: 'wedding', label: 'Wedding', icon: 'heart', description: 'Wedding attire' },
  { value: 'events', label: 'Events', icon: 'calendar', description: 'Special occasions' },
  { value: 'party', label: 'Party', icon: 'wine', description: 'Party outfits' },
  { value: 'beach', label: 'Beach', icon: 'water', description: 'Beach & swimwear' },
  { value: 'gym', label: 'Gym', icon: 'barbell', description: 'Gym & fitness' },
  { value: 'travel', label: 'Travel', icon: 'bag', description: 'Travel essentials' },
  { value: 'maternity', label: 'Maternity', icon: 'heart-circle', description: 'Maternity wear' },
  { value: 'undergarments', label: 'Undergarments', icon: 'eye-off', description: 'Intimate wear' },
  { value: 'accessories', label: 'Accessories', icon: 'diamond', description: 'Jewelry & accessories' },
];

const colorOptions = [
  'Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Gray', 'Grey', 'Brown', 
  'Pink', 'Purple', 'Orange', 'Navy', 'Burgundy', 'Maroon', 'Teal', 'Turquoise',
  'Beige', 'Cream', 'Ivory', 'Gold', 'Silver', 'Rose Gold', 'Coral', 'Mint',
  'Lavender', 'Olive', 'Khaki', 'Denim', 'Multicolor'
];

// Enhanced brand options with ethical considerations
// Compatible with "No Thanks" app and BDS guidelines

// ETHICAL & SUSTAINABLE BRANDS - Prioritized options
const ethicalBrands = [
  // Ethical & Sustainable Fashion
  'Everlane', 'Patagonia', 'Eileen Fisher', 'Reformation', 'Girlfriend Collective',
  'Kotn', 'Pact', 'People Tree', 'Thought Clothing', 'Armed Angels',
  'Organic Basics', 'Honest Basics', 'Kowtow', 'Ninety Percent', 'Mayamiko',
  
  // Palestinian & Muslim-Supporting Brands  
  'WATAN Apparel', 'Rula Couture', 'PaliRoots', 'Hikmah Boutique',
  'Modest Street', 'Zahra Collective', 'Baraka Threads', 'Nour Modest Fashion',
  
  // Verified Independent & Small Brands
  'Sézane', 'Ganni', 'Staud', 'Rejina Pyo', 'Arket', 'COS', 'Weekday',
  'Acne Studios', 'Norse Projects', '& Other Stories', 'Monki',
  
  // Always Ethical Options
  'Vintage', 'Thrifted', 'Second-hand', 'Consignment', 'DIY/Handmade',
  'Estate Sale', 'Garage Sale', 'Hand-me-down', 'Inherited', 'Upcycled',
];

// NEUTRAL BRANDS - Not on boycott lists but not actively ethical
const neutralBrands = [
  'Marks & Spencer', 'Next', 'ASOS', 'New Look', 'River Island',
  'Mango', 'Urban Outfitters', 'American Eagle', 'Levi\'s', 'Wrangler',
  'Lee', 'Dockers', 'Dickies', 'Carhartt', 'Hanes', 'Fruit of the Loom',
];

// PROBLEMATIC BRANDS - Based on BDS boycott list and "No Thanks" app
const problematicBrands = [
  // Major BDS Targets - DO NOT include in main dropdown
  'Zara', 'Bershka', 'Pull & Bear', 'Massimo Dutti', 'Stradivarius', // Inditex
  'Puma', 'Adidas', 'Nike', 'Under Armour', 'Reebok', 'New Balance',
  'H&M', 'Uniqlo', 'Gap', 'Banana Republic', 'Old Navy', 'Athleta',
  
  // Designer Brands with Israeli Ties
  'Ralph Lauren', 'Polo Ralph Lauren', 'Tommy Hilfiger', 'Calvin Klein', 
  'Michael Kors', 'Hugo Boss', 'Lacoste',
  
  // Luxury Brands with Concerns  
  'Bulgari', 'Chanel', 'Dior', 'Louis Vuitton', 'Hermès', 'Gucci',
  'Prada', 'Versace', 'Armani', 'Dolce & Gabbana', 'Valentino',
  'Givenchy', 'Saint Laurent', 'Balenciaga', 'Bottega Veneta', 'Fendi',
  
  // Fast Fashion with Ethical Concerns
  'Forever 21', 'Shein', 'Romwe', 'Zaful', 'Fashion Nova', 'Primark',
  'Boohoo', 'Missguided', 'Pretty Little Thing', 'Charlotte Russe',
];

// Combine ethical and neutral brands for main dropdown (exclude problematic ones)
const brandOptions = [
  ...ethicalBrands,
  ...neutralBrands,
];

export default function CameraEnhancedScreen() {
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
  
  // Tab navigation state
  const [currentTab, setCurrentTab] = useState<'details' | 'function' | 'category' | 'extras'>('details');
  
  // Dropdown states
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [colorSearch, setColorSearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  
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
      function: '',
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
    if (Platform.OS === 'web' || !Camera) {
      setCameraPermission(true);
      setMediaPermission(true);
      return;
    }

    try {
      if (Camera) {
        const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
        setCameraPermission(cameraStatus === 'granted');
      }
      setMediaPermission(true);
    } catch (error) {
      console.error('Permission request error:', error);
      setCameraPermission(false);
      setMediaPermission(true);
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
      setShowAIOptions(true);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = false;
      
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
            setImageBase64(base64Data);
            setShowAIOptions(true);
          };
          reader.readAsDataURL(file);
        }
        input.value = '';
      };
      
      input.click();
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
        allowsMultipleSelection: false,
        selectionLimit: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        if (!asset.type || asset.type !== 'image') {
          Alert.alert('Invalid Selection', 'Please select an image file only.');
          return;
        }
        
        setImageUri(asset.uri);
        setImageBase64(asset.base64 || '');
        setShowAIOptions(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Selection Error', 'Failed to select image. Please try again.');
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
    
    // Color detection
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

    // Generate smart auto-name
    generateSmartAutoName(undefined, detectedColor);
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
    const currentFunction = watch('function');
    const currentIndex = index || itemCount + 1;
    
    let autoName = '';
    
    // Priority naming with function and category
    if (currentCategory) {
      const categoryLabel = categoryOptions.find(opt => opt.value === currentCategory)?.label || currentCategory;
      autoName = `${categoryLabel}-${String(currentIndex).padStart(3, '0')}`;
      
      if (currentColor && type) {
        autoName += ` (${currentColor} ${type.charAt(0).toUpperCase() + type.slice(1)})`;
      } else if (currentColor) {
        autoName += ` (${currentColor})`;
      } else if (type) {
        autoName += ` (${type.charAt(0).toUpperCase() + type.slice(1)})`;
      }
    } else if (currentFunction) {
      const functionLabel = functionOptions.find(opt => opt.value === currentFunction)?.label || currentFunction;
      autoName = `${functionLabel}-${String(currentIndex).padStart(3, '0')}`;
      
      if (currentColor) {
        autoName += ` (${currentColor})`;
      }
    } else if (currentColor) {
      autoName = `${currentColor} Item-${String(currentIndex).padStart(3, '0')}`;
    } else {
      autoName = `Item-${String(currentIndex).padStart(3, '0')}`;
    }
    
    // Add brand prefix if available
    if (currentBrand && !autoName.includes(currentBrand)) {
      autoName = `${currentBrand} ${autoName}`;
    }
    
    setValue('name', autoName);
  };

  // Check brand ethics function
  const checkBrandEthics = (brand: string) => {
    const lowerBrand = brand.toLowerCase().trim();
    
    // Check if it's a problematic brand
    if (problematicBrands.some(b => lowerBrand.includes(b.toLowerCase()))) {
      return 'problematic';
    }
    
    // Check if it's an ethical brand
    if (ethicalBrands.some(b => lowerBrand.includes(b.toLowerCase()))) {
      return 'ethical';
    }
    
    return 'neutral';
  };

  // Handle brand selection with ethics check
  const handleBrandSelection = (selectedBrand: string, skipWarning: boolean = false) => {
    const ethicsStatus = checkBrandEthics(selectedBrand);
    
    if (ethicsStatus === 'problematic' && !skipWarning) {
      Alert.alert(
        '⚠️ Ethical Concern',
        `${selectedBrand} is on the BDS boycott list due to alleged support of genocide and human rights violations in Palestine.\n\nWould you still like to add this brand to your wardrobe?`,
        [
          {
            text: 'Choose Different Brand',
            style: 'cancel'
          },
          {
            text: 'Learn More',
            onPress: () => {
              Alert.alert(
                'Ethical Fashion Info',
                'Visibee promotes ethical fashion choices. This brand has been flagged by the BDS movement and "No Thanks" app for potential human rights concerns. You can still add it, or choose from our ethical alternatives.',
                [
                  { text: 'Choose Alternative', style: 'cancel' },
                  { text: 'Add Anyway', onPress: () => handleBrandSelection(selectedBrand, true) }
                ]
              );
            }
          },
          {
            text: 'Add Anyway',
            style: 'destructive',
            onPress: () => handleBrandSelection(selectedBrand, true)
          }
        ]
      );
      return;
    }
    
    // If ethical or user confirmed, proceed with selection
    setValue('brand', selectedBrand);
    setShowBrandDropdown(false);
    setBrandSearch('');
    
    if (ethicsStatus === 'ethical') {
      // Optional: Show positive feedback for ethical choice
      console.log(`✅ Great choice! ${selectedBrand} is an ethical brand.`);
    }
  };

  const filteredColors = colorOptions.filter(color =>
    color.toLowerCase().includes(colorSearch.toLowerCase())
  );

  const filteredBrands = brandOptions.filter(brand =>
    brand.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const renderDropdown = (
    items: string[],
    searchValue: string,
    setSearchValue: (value: string) => void,
    onSelect: (value: string) => void,
    placeholder: string,
    isBrandDropdown: boolean = false
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
        {items.map((item) => {
          const ethicsStatus = isBrandDropdown ? checkBrandEthics(item) : 'neutral';
          
          return (
            <TouchableOpacity
              key={item}
              style={[
                styles.dropdownItem,
                ethicsStatus === 'ethical' && styles.ethicalDropdownItem,
                ethicsStatus === 'problematic' && styles.problematicDropdownItem
              ]}
              onPress={() => {
                if (isBrandDropdown) {
                  handleBrandSelection(item);
                } else {
                  onSelect(item);
                  setSearchValue('');
                }
              }}
            >
              <View style={styles.dropdownItemContent}>
                <Text style={[
                  styles.dropdownItemText,
                  ethicsStatus === 'ethical' && styles.ethicalText,
                  ethicsStatus === 'problematic' && styles.problematicText
                ]}>
                  {item}
                </Text>
                {ethicsStatus === 'ethical' && (
                  <Ionicons name="leaf" size={16} color="#10b981" />
                )}
                {ethicsStatus === 'problematic' && (
                  <Ionicons name="warning" size={16} color="#ef4444" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
        
        <TouchableOpacity
          style={[styles.dropdownItem, styles.customOption]}
          onPress={() => {
            if (isBrandDropdown) {
              handleBrandSelection(searchValue);
            } else {
              onSelect(searchValue);
              setSearchValue('');
            }
          }}
        >
          <Ionicons name="add" size={16} color="#6366f1" />
          <Text style={[styles.dropdownItemText, { color: '#6366f1' }]}>
            Add "{searchValue}"
            {isBrandDropdown && searchValue && checkBrandEthics(searchValue) === 'problematic' && 
              <Text style={{ color: '#ef4444' }}> ⚠️</Text>
            }
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
      
      // Auto-generate name if not provided
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
              setCurrentTab('details');
              getItemCount();
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

  // Tab Content Renderers
  const renderDetailsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Basic Information</Text>
      
      {/* Name with Auto-Generate Option */}
      <View style={styles.formGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Name *</Text>
          <TouchableOpacity
            onPress={() => generateSmartAutoName()}
            style={styles.autoButton}
          >
            <Ionicons name="refresh" size={14} color="#6366f1" />
            <Text style={styles.autoButtonText}>Auto Generate</Text>
          </TouchableOpacity>
        </View>
        <Controller
          control={control}
          name="name"
          defaultValue=""
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="e.g., Blue T-shirt or leave blank for auto-indexing"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
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
          defaultValue=""
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowBrandDropdown(!showBrandDropdown)}
              >
                <Text style={[styles.dropdownButtonText, value && styles.dropdownButtonTextSelected]}>
                  {value || 'Select or enter brand (optional)'}
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
                'Brand',
                true // This is the brand dropdown, so enable ethics checking
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
          defaultValue=""
          render={({ field: { onChange, onBlur, value } }) => (
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
                    {value || 'Select or enter color (optional)'}
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
    </View>
  );

  const renderFunctionTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Function & Purpose</Text>
      <Text style={styles.tabDescription}>What is this clothing item primarily used for? (Optional)</Text>
      
      <Controller
        control={control}
        name="function"
        defaultValue=""
        render={({ field: { onChange, value } }) => (
          <View style={styles.optionsGrid}>
            {functionOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  value === option.value && styles.optionCardActive,
                ]}
                onPress={() => onChange(value === option.value ? '' : option.value)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={32}
                  color={value === option.value ? 'white' : '#6366f1'}
                />
                <Text style={[
                  styles.optionLabel,
                  value === option.value && styles.optionLabelActive,
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  value === option.value && styles.optionDescriptionActive,
                ]}>
                  {option.description}
                </Text>
                {value === option.value && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );

  const renderCategoryTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Category & Season</Text>
      <Text style={styles.tabDescription}>When or for what occasion do you wear this? (Optional)</Text>
      
      <Controller
        control={control}
        name="category"
        defaultValue=""
        render={({ field: { onChange, value } }) => (
          <View style={styles.optionsGrid}>
            {categoryOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  value === option.value && styles.optionCardActive,
                ]}
                onPress={() => onChange(value === option.value ? '' : option.value)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={32}
                  color={value === option.value ? 'white' : '#6366f1'}
                />
                <Text style={[
                  styles.optionLabel,
                  value === option.value && styles.optionLabelActive,
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  value === option.value && styles.optionDescriptionActive,
                ]}>
                  {option.description}
                </Text>
                {value === option.value && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );

  const renderExtrasTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Additional Information</Text>
      <Text style={styles.tabDescription}>Optional details like purchase link and tags</Text>
      
      {/* Purchase Link */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Purchase Link</Text>
        <Controller
          control={control}
          name="purchase_link"
          defaultValue=""
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.purchase_link && styles.inputError]}
              placeholder="https://example.com/product (optional)"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
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
          defaultValue=""
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="comfortable, summer, favorite (separate with commas)"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholderTextColor="#9ca3af"
              multiline
            />
          )}
        />
      </View>
    </View>
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
            <Text style={styles.sectionTitle}>Photo *</Text>
            
            <View style={styles.privacyNotice}>
              <Ionicons name="shield-checkmark" size={16} color="#10b981" />
              <Text style={styles.privacyText}>
                Privacy Protected: Only photos you explicitly select are accessed.
              </Text>
            </View>
            
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
              {Platform.OS !== 'web' && (
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={() => setShowCamera(true)}
                  disabled={!cameraPermission}
                >
                  <Ionicons name="camera" size={24} color="#6366f1" />
                  <Text style={styles.imageButtonText}>Camera</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.imageButton, Platform.OS === 'web' && { flex: 1 }]}
                onPress={pickImage}
                disabled={Platform.OS !== 'web' && !mediaPermission}
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

          {/* Tab Navigation */}
          <View style={styles.tabNavigation}>
            <TouchableOpacity
              style={[styles.tab, currentTab === 'details' && styles.activeTab]}
              onPress={() => setCurrentTab('details')}
            >
              <Ionicons 
                name="information-circle" 
                size={20} 
                color={currentTab === 'details' ? '#6366f1' : '#9ca3af'} 
              />
              <Text style={[styles.tabText, currentTab === 'details' && styles.activeTabText]}>
                Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, currentTab === 'function' && styles.activeTab]}
              onPress={() => setCurrentTab('function')}
            >
              <Ionicons 
                name="fitness" 
                size={20} 
                color={currentTab === 'function' ? '#6366f1' : '#9ca3af'} 
              />
              <Text style={[styles.tabText, currentTab === 'function' && styles.activeTabText]}>
                Function
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, currentTab === 'category' && styles.activeTab]}
              onPress={() => setCurrentTab('category')}
            >
              <Ionicons 
                name="pricetag" 
                size={20} 
                color={currentTab === 'category' ? '#6366f1' : '#9ca3af'} 
              />
              <Text style={[styles.tabText, currentTab === 'category' && styles.activeTabText]}>
                Category
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, currentTab === 'extras' && styles.activeTab]}
              onPress={() => setCurrentTab('extras')}
            >
              <Ionicons 
                name="add-circle" 
                size={20} 
                color={currentTab === 'extras' ? '#6366f1' : '#9ca3af'} 
              />
              <Text style={[styles.tabText, currentTab === 'extras' && styles.activeTabText]}>
                Extras
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContainer}>
            {currentTab === 'details' && renderDetailsTab()}
            {currentTab === 'function' && renderFunctionTab()}
            {currentTab === 'category' && renderCategoryTab()}
            {currentTab === 'extras' && renderExtrasTab()}
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
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  privacyText: {
    fontSize: 12,
    color: '#15803d',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
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
    borderBottomColor: '#6366f1',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
    marginTop: 4,
  },
  activeTabText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  // Tab Content Styles
  tabContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
    minHeight: 400,
  },
  tabContent: {
    flex: 1,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  tabDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  // Form Styles
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
  // Options Grid Styles
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    minHeight: 120,
  },
  optionCardActive: {
    backgroundColor: '#6366f1',
    borderColor: '#4f46e5',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
    textAlign: 'center',
  },
  optionLabelActive: {
    color: 'white',
  },
  optionDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  optionDescriptionActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
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