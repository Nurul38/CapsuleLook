import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Ethical Brand Management System for Visibee
// Compatible with "No Thanks" app and BDS guidelines

// ETHICAL BRANDS LIST - Verified clean brands
const ethicalBrands = [
  // Ethical & Sustainable Brands
  'Everlane', 'Patagonia', 'Eileen Fisher', 'Reformation', 'Girlfriend Collective',
  'Kotn', 'Pact', 'People Tree', 'Thought Clothing', 'Armed Angels',
  'Organic Basics', 'Honest Basics', 'Kowtow', 'Ninety Percent', 'Mayamiko',
  
  // Palestinian & Muslim-Supporting Brands  
  'WATAN Apparel', 'Rula Couture', 'PaliRoots', 'Hikmah Boutique',
  'Modest Street', 'Zahra Collective', 'Baraka Threads', 'Nour Modest Fashion',
  
  // Verified Independent & Small Brands
  'Sézane', 'Ganni', 'Staud', 'Rejina Pyo', '& Other Stories', 'Monki',
  'Arket', 'COS', 'Weekday', 'Acne Studios', 'Norse Projects',
  
  // Thrift & Vintage (Always Ethical)
  'Vintage', 'Thrifted', 'Second-hand', 'Consignment', 'Estate Sale',
  'Garage Sale', 'Hand-me-down', 'Inherited', 'Upcycled', 'DIY/Handmade',
];

// BRANDS TO AVOID - Based on BDS and "No Thanks" app guidelines
const problematicBrands = [
  // Major BDS Targets
  'Zara', 'Bershka', 'Pull & Bear', 'Massimo Dutti', 'Stradivarius', // Inditex group
  'Puma', 'Adidas', 'Nike', 'Under Armour', 'Reebok',
  'H&M', 'Uniqlo', 'Gap', 'Banana Republic', 'Old Navy',
  
  // Designer Brands with Israeli Ties
  'Ralph Lauren', 'Tommy Hilfiger', 'Calvin Klein', 'Michael Kors',
  'Hugo Boss', 'Lacoste', 'Polo Ralph Lauren',
  
  // Luxury Brands with Concerns
  'Bulgari', 'Chanel', 'Dior', 'Louis Vuitton', 'Hermès', 'Gucci',
  
  // Fast Fashion with Labor/Ethical Issues
  'Forever 21', 'Shein', 'Romwe', 'Zaful', 'Fashion Nova',
  'Primark', 'Boohoo', 'Missguided', 'Pretty Little Thing',
];

// NEUTRAL BRANDS - Not on boycott lists but not actively supporting causes
const neutralBrands = [
  'Marks & Spencer', 'Next', 'ASOS', 'Topshop', 'New Look',
  'River Island', 'Mango', 'Urban Outfitters', 'American Eagle',
  'Hollister', 'Abercrombie & Fitch', 'Levi\'s', 'Wrangler',
];

interface EthicalBrandSelectorProps {
  onBrandSelect: (brand: string, isEthical: boolean) => void;
  currentBrand: string;
}

export const EthicalBrandSelector: React.FC<EthicalBrandSelectorProps> = ({
  onBrandSelect,
  currentBrand
}) => {
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const checkBrandEthics = (brand: string) => {
    const lowerBrand = brand.toLowerCase();
    
    if (problematicBrands.some(b => lowerBrand.includes(b.toLowerCase()))) {
      return 'problematic';
    }
    if (ethicalBrands.some(b => lowerBrand.includes(b.toLowerCase()))) {
      return 'ethical';
    }
    return 'neutral';
  };

  const handleBrandSelection = (brand: string, showWarning: boolean = true) => {
    const ethicsStatus = checkBrandEthics(brand);
    
    if (ethicsStatus === 'problematic' && showWarning) {
      Alert.alert(
        '⚠️ Ethical Concern',
        `${brand} is on the BDS boycott list for alleged support of genocide and human rights violations in Palestine. Would you still like to add this brand?`,
        [
          {
            text: 'Choose Different Brand',
            style: 'cancel'
          },
          {
            text: 'Add Anyway',
            style: 'destructive',
            onPress: () => onBrandSelect(brand, false)
          }
        ]
      );
    } else {
      onBrandSelect(brand, ethicsStatus === 'ethical');
    }
  };

  const renderBrandOption = (brand: string) => {
    const ethicsStatus = checkBrandEthics(brand);
    const isSelected = currentBrand === brand;
    
    return (
      <TouchableOpacity
        key={brand}
        style={[
          styles.brandOption,
          isSelected && styles.brandOptionSelected,
          ethicsStatus === 'ethical' && styles.ethicalBrand,
          ethicsStatus === 'problematic' && styles.problematicBrand
        ]}
        onPress={() => handleBrandSelection(brand)}
      >
        <Text style={[
          styles.brandText,
          isSelected && styles.brandTextSelected,
          ethicsStatus === 'ethical' && styles.ethicalText,
          ethicsStatus === 'problematic' && styles.problematicText
        ]}>
          {brand}
        </Text>
        
        {ethicsStatus === 'ethical' && (
          <Ionicons name="leaf" size={16} color="#10b981" />
        )}
        {ethicsStatus === 'problematic' && (
          <Ionicons name="warning" size={16} color="#ef4444" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Ethical Brands Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="leaf" size={20} color="#10b981" />
          <Text style={styles.sectionTitle}>Ethical & Sustainable Brands</Text>
        </View>
        <View style={styles.brandsGrid}>
          {ethicalBrands.map(renderBrandOption)}
        </View>
      </View>

      {/* Neutral Brands Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="help-circle" size={20} color="#6b7280" />
          <Text style={styles.sectionTitle}>Other Brands</Text>
        </View>
        <View style={styles.brandsGrid}>
          {neutralBrands.map(renderBrandOption)}
        </View>
      </View>

      {/* Manual Input Section */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.manualInputButton}
          onPress={() => setShowManualInput(!showManualInput)}
        >
          <Ionicons name="create" size={20} color="#6366f1" />
          <Text style={styles.manualInputButtonText}>Add Custom Brand</Text>
        </TouchableOpacity>

        {showManualInput && (
          <View style={styles.manualInputContainer}>
            <TextInput
              style={styles.manualInput}
              placeholder="Enter brand name..."
              value={manualInput}
              onChangeText={setManualInput}
              onSubmitEditing={() => {
                if (manualInput.trim()) {
                  handleBrandSelection(manualInput.trim());
                  setManualInput('');
                  setShowManualInput(false);
                }
              }}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                if (manualInput.trim()) {
                  handleBrandSelection(manualInput.trim());
                  setManualInput('');
                  setShowManualInput(false);
                }
              }}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Ethics Information */}
      <View style={styles.ethicsInfo}>
        <Text style={styles.ethicsTitle}>🕊️ Ethical Shopping</Text>
        <Text style={styles.ethicsDescription}>
          Visibee promotes ethical fashion choices. Brands are categorized based on their ethical practices, 
          BDS guidelines, and support for human rights. You can always add any brand manually.
        </Text>
        
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <Ionicons name="leaf" size={16} color="#10b981" />
            <Text style={styles.legendText}>Ethical & Sustainable</Text>
          </View>
          <View style={styles.legendItem}>
            <Ionicons name="warning" size={16} color="#ef4444" />
            <Text style={styles.legendText}>May have ethical concerns</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  brandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  brandOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    gap: 6,
  },
  brandOptionSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  ethicalBrand: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  problematicBrand: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  brandText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  brandTextSelected: {
    color: 'white',
  },
  ethicalText: {
    color: '#065f46',
  },
  problematicText: {
    color: '#991b1b',
  },
  manualInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    gap: 8,
  },
  manualInputButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  manualInputContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  manualInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  ethicsInfo: {
    backgroundColor: '#fefce8',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
    marginTop: 8,
  },
  ethicsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  ethicsDescription: {
    fontSize: 14,
    color: '#b45309',
    lineHeight: 20,
    marginBottom: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#b45309',
    fontWeight: '500',
  },
});

export default EthicalBrandSelector;