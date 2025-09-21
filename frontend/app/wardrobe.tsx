import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';

interface ClothingItem {
  id: string;
  name: string;
  brand?: string;
  color?: string;
  function?: string;
  category?: string;
  purchase_date?: string;
  purchase_link?: string;
  image_base64?: string;
  ai_description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export default function WardrobeScreen() {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filterTypes = [
    { key: 'all', label: 'All', icon: 'grid' },
    { key: 'casual', label: 'Casual', icon: 'shirt' },
    { key: 'formal', label: 'Formal', icon: 'business' },
    { key: 'athletic', label: 'Athletic', icon: 'fitness' },
    { key: 'winter', label: 'Winter', icon: 'snow' },
    { key: 'summer', label: 'Summer', icon: 'sunny' },
    { key: 'costume', label: 'Costume', icon: 'star' },
    { key: 'wedding', label: 'Wedding', icon: 'heart' },
    { key: 'events', label: 'Events', icon: 'calendar' },
  ];

  const categoryTypes = [
    'Winter', 'Summer', 'Spring', 'Autumn', 'Costume', 'Wedding', 'Events', 
    'Party', 'Beach', 'Gym', 'Travel', 'Maternity', 'Undergarments', 'Accessories'
  ];

  useEffect(() => {
    fetchClothingItems();
  }, []);

  const fetchClothingItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/clothing`);
      if (!response.ok) throw new Error('Failed to fetch clothing items');
      
      const items = await response.json();
      setClothingItems(items);
    } catch (error) {
      console.error('Error fetching clothing items:', error);
      Alert.alert('Error', 'Failed to load wardrobe items');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${BACKEND_URL}/api/clothing/${itemId}`, {
                method: 'DELETE',
              });
              
              if (!response.ok) throw new Error('Failed to delete item');
              
              setClothingItems(prev => prev.filter(item => item.id !== itemId));
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const filteredItems = clothingItems.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ai_description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || item.function === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const renderClothingItem = (item: ClothingItem) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.itemCard}
      onPress={() => router.push(`/item-details/${item.id}` as any)}
    >
      <View style={styles.itemImageContainer}>
        {item.image_base64 ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.image_base64}` }}
            style={styles.itemImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="shirt" size={32} color="#9ca3af" />
          </View>
        )}
      </View>
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.brand && <Text style={styles.itemBrand}>{item.brand}</Text>}
        
        <View style={styles.itemMeta}>
          {item.color && (
            <View style={styles.metaTag}>
              <View style={[styles.colorDot, { backgroundColor: item.color.toLowerCase() }]} />
              <Text style={styles.metaText}>{item.color}</Text>
            </View>
          )}
          
          {item.function && (
            <View style={styles.metaTag}>
              <Ionicons name="bookmark" size={12} color="#6b7280" />
              <Text style={styles.metaText}>{item.function}</Text>
            </View>
          )}
          
          {item.category && (
            <View style={styles.metaTag}>
              <Ionicons name="pricetag" size={12} color="#6b7280" />
              <Text style={styles.metaText}>{item.category}</Text>
            </View>
          )}
        </View>
        
        {item.ai_description && (
          <Text style={styles.aiDescription} numberOfLines={2}>
            {item.ai_description}
          </Text>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteItem(item.id)}
      >
        <Ionicons name="trash" size={20} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>My Wardrobe</Text>
        <TouchableOpacity onPress={() => router.push('/camera' as any)} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your wardrobe..."
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

      {/* Filter Buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterTypes.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              filterType === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilterType(filter.key)}
          >
            <Ionicons 
              name={filter.icon as any} 
              size={18} 
              color={filterType === filter.key ? 'white' : '#6b7280'} 
            />
            <Text
              style={[
                styles.filterText,
                filterType === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading your wardrobe...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="shirt-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>
            {searchQuery || filterType !== 'all' 
              ? 'No items found' 
              : 'Your wardrobe is empty'
            }
          </Text>
          <Text style={styles.emptyDescription}>
            {searchQuery || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Add your first clothing item to get started'
            }
          </Text>
          {!searchQuery && filterType === 'all' && (
            <TouchableOpacity
              style={styles.addFirstItemButton}
              onPress={() => router.push('/camera' as any)}
            >
              <Text style={styles.addFirstItemText}>Add First Item</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView 
          style={styles.itemsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.itemsContent}
        >
          {filteredItems.map(renderClothingItem)}
        </ScrollView>
      )}
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
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  filterContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#6366f1',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterTextActive: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
    marginBottom: 24,
  },
  addFirstItemButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstItemText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  itemsList: {
    flex: 1,
  },
  itemsContent: {
    padding: 20,
    gap: 16,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemImageContainer: {
    marginRight: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  aiDescription: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
  },
});