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
  Dimensions,
  Modal,
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

const { width: screenWidth } = Dimensions.get('window');
const itemsPerRow = 4;
const itemSize = (screenWidth - 60) / itemsPerRow; // 60 = padding (20) + gaps (10 * 4)

export default function WardrobeScreen() {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showFunctionModal, setShowFunctionModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const functionOptions = [
    { key: 'casual', label: 'Casual', icon: 'shirt', description: 'Everyday comfortable wear' },
    { key: 'formal', label: 'Formal', icon: 'business', description: 'Professional & dressy' },
    { key: 'athletic', label: 'Athletic', icon: 'fitness', description: 'Sports & workout gear' },
    { key: 'work', label: 'Work', icon: 'briefcase', description: 'Office & professional' },
    { key: 'sleep', label: 'Sleep', icon: 'moon', description: 'Pajamas & nightwear' },
    { key: 'outdoor', label: 'Outdoor', icon: 'leaf', description: 'Adventure & nature' },
    { key: 'party', label: 'Party', icon: 'musical-notes', description: 'Celebrations & events' },
    { key: 'vacation', label: 'Vacation', icon: 'airplane', description: 'Travel & leisure' },
  ];

  const filterTypes = [
    { key: 'all', label: 'All', icon: 'grid' },
    ...functionOptions,
    // Categories
    { key: 'winter', label: 'Winter', icon: 'snow' },
    { key: 'summer', label: 'Summer', icon: 'sunny' },
    { key: 'costume', label: 'Costume', icon: 'star' },
    { key: 'wedding', label: 'Wedding', icon: 'heart' },
    { key: 'events', label: 'Events', icon: 'calendar' },
  ];

  useEffect(() => {
    fetchClothingItems();
  }, []);

  // Auto-switch to grid view when filtering by function/category (except 'all')
  useEffect(() => {
    if (filterType !== 'all' && filteredItems.length > 0) {
      setViewMode('grid');
    }
  }, [filterType]);

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

  const updateItemFunction = async (itemId: string, newFunction: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`${BACKEND_URL}/api/clothing/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: newFunction,
        }),
      });

      if (!response.ok) throw new Error('Failed to update item');

      // Update local state
      setClothingItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, function: newFunction }
            : item
        )
      );

      return true;
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item function');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const moveSelectedItems = async (newFunction: string) => {
    try {
      setIsUpdating(true);
      const selectedItemsList = Array.from(selectedItems);
      
      // Update all selected items
      const updatePromises = selectedItemsList.map(itemId => 
        updateItemFunction(itemId, newFunction)
      );
      
      const results = await Promise.all(updatePromises);
      const successCount = results.filter(Boolean).length;
      
      if (successCount === selectedItemsList.length) {
        Alert.alert(
          'Success', 
          `Moved ${successCount} item${successCount !== 1 ? 's' : ''} to ${functionOptions.find(f => f.key === newFunction)?.label || newFunction}`
        );
      } else {
        Alert.alert('Partial Success', `Moved ${successCount} of ${selectedItemsList.length} items`);
      }
      
      setSelectedItems(new Set());
      setIsSelecting(false);
      setShowMoveModal(false);
      
    } catch (error) {
      console.error('Error moving items:', error);
      Alert.alert('Error', 'Failed to move items');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
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
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ai_description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filterType !== 'all') {
      // Check if filter matches function or category
      matchesFilter = 
        item.function?.toLowerCase() === filterType ||
        item.category?.toLowerCase() === filterType;
    }
    
    return matchesSearch && matchesFilter;
  });

  const renderClothingItemList = (item: ClothingItem) => (
    <TouchableOpacity 
      key={item.id} 
      style={[
        styles.itemCard,
        selectedItems.has(item.id) && styles.itemCardSelected
      ]}
      onPress={() => {
        if (isSelecting) {
          toggleItemSelection(item.id);
        } else {
          router.push(`/item-details/${item.id}` as any);
        }
      }}
      onLongPress={() => {
        if (!isSelecting) {
          setIsSelecting(true);
          setSelectedItems(new Set([item.id]));
        }
      }}
    >
      {isSelecting && (
        <View style={styles.selectionIndicator}>
          <View style={[
            styles.checkbox,
            selectedItems.has(item.id) && styles.checkboxSelected
          ]}>
            {selectedItems.has(item.id) && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
        </View>
      )}
      
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
            <TouchableOpacity 
              style={styles.functionTag}
              onPress={() => {
                setEditingItem(item);
                setShowFunctionModal(true);
              }}
            >
              <Ionicons name="bookmark" size={12} color="#6366f1" />
              <Text style={[styles.metaText, { color: '#6366f1' }]}>{item.function}</Text>
              <Ionicons name="create" size={10} color="#6366f1" />
            </TouchableOpacity>
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
      
      {!isSelecting && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteItem(item.id)}
        >
          <Ionicons name="trash" size={20} color="#ef4444" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderClothingItemGrid = (item: ClothingItem) => (
    <TouchableOpacity 
      key={item.id} 
      style={[
        styles.gridItem,
        selectedItems.has(item.id) && styles.gridItemSelected
      ]}
      onPress={() => {
        if (isSelecting) {
          toggleItemSelection(item.id);
        } else {
          router.push(`/item-details/${item.id}` as any);
        }
      }}
      onLongPress={() => {
        if (!isSelecting) {
          setIsSelecting(true);
          setSelectedItems(new Set([item.id]));
        }
      }}
    >
      {isSelecting && (
        <View style={styles.gridSelectionIndicator}>
          <View style={[
            styles.checkbox,
            selectedItems.has(item.id) && styles.checkboxSelected
          ]}>
            {selectedItems.has(item.id) && (
              <Ionicons name="checkmark" size={12} color="white" />
            )}
          </View>
        </View>
      )}
      
      {item.image_base64 ? (
        <Image
          source={{ uri: `data:image/jpeg;base64,${item.image_base64}` }}
          style={styles.gridItemImage}
          contentFit="cover"
        />
      ) : (
        <View style={styles.gridPlaceholderImage}>
          <Ionicons name="shirt" size={24} color="#9ca3af" />
        </View>
      )}
      
      <View style={styles.gridItemInfo}>
        <Text style={styles.gridItemName} numberOfLines={1}>{item.name}</Text>
        {item.brand && (
          <Text style={styles.gridItemBrand} numberOfLines={1}>{item.brand}</Text>
        )}
        {item.function && (
          <TouchableOpacity 
            style={styles.gridFunctionTag}
            onPress={() => {
              setEditingItem(item);
              setShowFunctionModal(true);
            }}
          >
            <Text style={styles.gridFunctionText}>{item.function}</Text>
            <Ionicons name="create" size={8} color="#6366f1" />
          </TouchableOpacity>
        )}
      </View>
      
      {!isSelecting && (
        <TouchableOpacity
          style={styles.gridDeleteButton}
          onPress={() => deleteItem(item.id)}
        >
          <Ionicons name="close" size={14} color="#ef4444" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderGrid = () => {
    const rows: ClothingItem[][] = [];
    for (let i = 0; i < filteredItems.length; i += itemsPerRow) {
      rows.push(filteredItems.slice(i, i + itemsPerRow));
    }

    return (
      <ScrollView 
        style={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
      >
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {row.map(renderClothingItemGrid)}
            {/* Fill remaining cells in last row with empty spaces */}
            {row.length < itemsPerRow && 
              Array.from({ length: itemsPerRow - row.length }).map((_, emptyIndex) => (
                <View key={`empty-${emptyIndex}`} style={styles.gridItem} />
              ))
            }
          </View>
        ))}
        
        {/* Show total count for grid view */}
        <View style={styles.gridFooter}>
          <Text style={styles.gridFooterText}>
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      </ScrollView>
    );
  };

  // Function Change Modal
  const renderFunctionModal = () => (
    <Modal
      visible={showFunctionModal}
      transparent
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Change Function</Text>
          <Text style={styles.modalDescription}>
            Move "{editingItem?.name}" to a different function folder
          </Text>
          
          <ScrollView style={styles.functionList} showsVerticalScrollIndicator={false}>
            {functionOptions.map((func) => (
              <TouchableOpacity
                key={func.key}
                style={[
                  styles.functionOption,
                  editingItem?.function === func.key && styles.functionOptionCurrent
                ]}
                onPress={async () => {
                  if (editingItem && editingItem.function !== func.key) {
                    const success = await updateItemFunction(editingItem.id, func.key);
                    if (success) {
                      setShowFunctionModal(false);
                      setEditingItem(null);
                    }
                  }
                }}
              >
                <View style={styles.functionOptionContent}>
                  <Ionicons 
                    name={func.icon as any} 
                    size={24} 
                    color={editingItem?.function === func.key ? '#10b981' : '#6366f1'} 
                  />
                  <View style={styles.functionOptionText}>
                    <Text style={[
                      styles.functionOptionLabel,
                      editingItem?.function === func.key && styles.functionOptionLabelCurrent
                    ]}>
                      {func.label}
                    </Text>
                    <Text style={styles.functionOptionDescription}>
                      {func.description}
                    </Text>
                  </View>
                  {editingItem?.function === func.key && (
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButtonSecondary}
              onPress={() => {
                setShowFunctionModal(false);
                setEditingItem(null);
              }}
            >
              <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Bulk Move Modal
  const renderMoveModal = () => (
    <Modal
      visible={showMoveModal}
      transparent
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Move Items</Text>
          <Text style={styles.modalDescription}>
            Move {selectedItems.size} selected item{selectedItems.size !== 1 ? 's' : ''} to:
          </Text>
          
          <ScrollView style={styles.functionList} showsVerticalScrollIndicator={false}>
            {functionOptions.map((func) => (
              <TouchableOpacity
                key={func.key}
                style={styles.functionOption}
                onPress={() => moveSelectedItems(func.key)}
                disabled={isUpdating}
              >
                <View style={styles.functionOptionContent}>
                  <Ionicons name={func.icon as any} size={24} color="#6366f1" />
                  <View style={styles.functionOptionText}>
                    <Text style={styles.functionOptionLabel}>{func.label}</Text>
                    <Text style={styles.functionOptionDescription}>{func.description}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#9ca3af" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButtonSecondary}
              onPress={() => {
                setShowMoveModal(false);
                setSelectedItems(new Set());
                setIsSelecting(false);
              }}
            >
              <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {isSelecting ? (
          <>
            <TouchableOpacity 
              onPress={() => {
                setIsSelecting(false);
                setSelectedItems(new Set());
              }} 
              style={styles.backButton}
            >
              <Ionicons name="close" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {selectedItems.size} selected
            </Text>
            <TouchableOpacity
              onPress={() => setShowMoveModal(true)}
              style={styles.moveButton}
              disabled={selectedItems.size === 0}
            >
              <Ionicons name="folder-open" size={24} color={selectedItems.size > 0 ? "#6366f1" : "#9ca3af"} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.title}>My Wardrobe</Text>
            <View style={styles.headerActions}>
              {/* Selection Mode Toggle */}
              <TouchableOpacity 
                onPress={() => setIsSelecting(!isSelecting)} 
                style={styles.selectButton}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#6b7280" />
              </TouchableOpacity>
              
              {/* View Mode Toggle */}
              <TouchableOpacity 
                onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')} 
                style={styles.viewModeButton}
              >
                <Ionicons 
                  name={viewMode === 'list' ? 'grid' : 'list'} 
                  size={20} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
              
              {/* Add Button */}
              <TouchableOpacity onPress={() => router.push('/camera' as any)} style={styles.addButton}>
                <Ionicons name="add" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Search Bar */}
      {!isSelecting && (
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
      )}

      {/* Filter Buttons */}
      {!isSelecting && (
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
      )}

      {/* Selection Actions Bar */}
      {isSelecting && selectedItems.size > 0 && (
        <View style={styles.selectionToolbar}>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => setShowMoveModal(true)}
          >
            <Ionicons name="folder-open" size={20} color="#6366f1" />
            <Text style={styles.toolbarButtonText}>Move to Folder</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => {
              const allSelected = filteredItems.length === selectedItems.size;
              if (allSelected) {
                setSelectedItems(new Set());
              } else {
                setSelectedItems(new Set(filteredItems.map(item => item.id)));
              }
            }}
          >
            <Ionicons 
              name={filteredItems.length === selectedItems.size ? "checkbox" : "square-outline"} 
              size={20} 
              color="#6366f1" 
            />
            <Text style={styles.toolbarButtonText}>
              {filteredItems.length === selectedItems.size ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* View Mode Indicator for Grid */}
      {viewMode === 'grid' && filterType !== 'all' && !isSelecting && (
        <View style={styles.gridModeIndicator}>
          <Ionicons name="grid" size={16} color="#6366f1" />
          <Text style={styles.gridModeText}>
            4×5 Preview for {filterTypes.find(f => f.key === filterType)?.label}
          </Text>
        </View>
      )}

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
        <>
          {viewMode === 'grid' ? (
            renderGrid()
          ) : (
            <ScrollView 
              style={styles.itemsList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.itemsContent}
            >
              {filteredItems.map(renderClothingItemList)}
            </ScrollView>
          )}
        </>
      )}
      
      {/* Modals */}
      {renderFunctionModal()}
      {renderMoveModal()}
      
      {/* Loading Overlay */}
      {isUpdating && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingOverlayText}>Updating items...</Text>
          </View>
        </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewModeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moveButton: {
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
  // Selection Toolbar
  selectionToolbar: {
    flexDirection: 'row',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ff',
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  toolbarButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
  },
  // Grid Mode Indicator
  gridModeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#f0f4ff',
    gap: 8,
  },
  gridModeText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
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
  // Selection Styles
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
  },
  gridSelectionIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    zIndex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  // List View Styles
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
    position: 'relative',
  },
  itemCardSelected: {
    borderWidth: 2,
    borderColor: '#6366f1',
    backgroundColor: '#f0f4ff',
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
  functionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
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
  // Grid View Styles
  gridContainer: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  gridItem: {
    width: itemSize,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    position: 'relative',
  },
  gridItemSelected: {
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  gridItemImage: {
    width: itemSize,
    height: itemSize,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  gridPlaceholderImage: {
    width: itemSize,
    height: itemSize,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridItemInfo: {
    padding: 8,
  },
  gridItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  gridItemBrand: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4,
  },
  gridFunctionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: '#f0f4ff',
    borderRadius: 6,
  },
  gridFunctionText: {
    fontSize: 8,
    color: '#6366f1',
    fontWeight: '500',
  },
  gridDeleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  gridFooter: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  gridFooterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  functionList: {
    maxHeight: 400,
    marginBottom: 24,
  },
  functionOption: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  functionOptionCurrent: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  functionOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  functionOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  functionOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  functionOptionLabelCurrent: {
    color: '#10b981',
  },
  functionOptionDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButtonSecondary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalButtonTextSecondary: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  // Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  loadingOverlayText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
});