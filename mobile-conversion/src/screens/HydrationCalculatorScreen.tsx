import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface IngredientItem {
  id: string;
  name: string;
  amount: string;
  unit: string;
  isLiquid: boolean;
  isFlour: boolean;
}

const HydrationCalculatorScreen = () => {
  const navigation = useNavigation();
  const [ingredients, setIngredients] = useState<IngredientItem[]>([
    { id: '1', name: 'Bread Flour', amount: '500', unit: 'g', isLiquid: false, isFlour: true },
    { id: '2', name: 'Water', amount: '350', unit: 'g', isLiquid: true, isFlour: false },
    { id: '3', name: 'Sourdough Starter', amount: '100', unit: 'g', isLiquid: false, isFlour: false },
  ]);
  const [hydration, setHydration] = useState(0);
  const [starterHydration, setStarterHydration] = useState('100');
  const [includeStarter, setIncludeStarter] = useState(true);

  // Calculate hydration whenever ingredients change
  useEffect(() => {
    calculateHydration();
  }, [ingredients, starterHydration, includeStarter]);

  // Add a new ingredient
  const addIngredient = () => {
    const newId = Date.now().toString();
    setIngredients([
      ...ingredients,
      { id: newId, name: '', amount: '0', unit: 'g', isLiquid: false, isFlour: false }
    ]);
  };

  // Remove an ingredient
  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(item => item.id !== id));
  };

  // Update ingredient value
  const updateIngredient = (id: string, field: keyof IngredientItem, value: string | boolean) => {
    setIngredients(
      ingredients.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Calculate hydration based on current ingredients
  const calculateHydration = () => {
    let totalFlour = 0;
    let totalLiquid = 0;
    let starterFlour = 0;
    let starterLiquid = 0;
    
    // Calculate starter contribution if included
    if (includeStarter) {
      const starters = ingredients.filter(item => 
        item.name.toLowerCase().includes('starter') || 
        item.name.toLowerCase().includes('levain')
      );
      
      const starterHydrationValue = parseFloat(starterHydration) / 100;
      
      starters.forEach(starter => {
        const starterAmount = parseFloat(starter.amount);
        if (!isNaN(starterAmount) && !isNaN(starterHydrationValue)) {
          // In a 100% hydration starter, half is flour and half is water
          starterFlour += starterAmount / (1 + starterHydrationValue);
          starterLiquid += (starterAmount * starterHydrationValue) / (1 + starterHydrationValue);
        }
      });
    }
    
    // Sum up all flour and liquid ingredients
    ingredients.forEach(item => {
      const amount = parseFloat(item.amount);
      if (!isNaN(amount)) {
        if (item.isFlour) {
          totalFlour += amount;
        } else if (item.isLiquid) {
          totalLiquid += amount;
        }
      }
    });
    
    // Add starter contributions
    totalFlour += starterFlour;
    totalLiquid += starterLiquid;
    
    // Calculate hydration percentage
    if (totalFlour > 0) {
      const hydrationValue = (totalLiquid / totalFlour) * 100;
      setHydration(Math.round(hydrationValue * 10) / 10); // Round to 1 decimal place
    } else {
      setHydration(0);
    }
  };

  // Get hydration analysis and recommendations
  const getHydrationAnalysis = () => {
    if (hydration < 60) {
      return {
        level: 'Stiff',
        description: 'This is a stiff dough that will be less sticky to handle but yield a more dense bread with less open crumb.',
        recommendation: 'Consider adding more water for a more open crumb structure.',
        color: '#3B82F6', // blue-500
      };
    } else if (hydration >= 60 && hydration < 70) {
      return {
        level: 'Medium',
        description: 'This is a moderate hydration good for beginners and results in a balanced bread texture.',
        recommendation: 'Perfect for sandwich bread and dinner rolls.',
        color: '#10B981', // emerald-500
      };
    } else if (hydration >= 70 && hydration < 80) {
      return {
        level: 'High',
        description: 'This is a wet dough that will be moderately challenging to handle but will yield good oven spring and open crumb.',
        recommendation: 'Great for artisan-style bread with a more open crumb.',
        color: '#F59E0B', // amber-500
      };
    } else {
      return {
        level: 'Very High',
        description: 'This is a very wet dough that will be challenging to handle but will yield excellent oven spring and very open crumb.',
        recommendation: 'Use advanced techniques like stretch and fold or coil folds to develop gluten.',
        color: '#EF4444', // red-500
      };
    }
  };

  const hydrationAnalysis = getHydrationAnalysis();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hydration Calculator</Text>
      </View>
      
      <View style={styles.hydrationDisplay}>
        <Text style={styles.hydrationLabel}>DOUGH HYDRATION</Text>
        <Text style={styles.hydrationValue}>{hydration}%</Text>
        <View 
          style={[
            styles.hydrationIndicator, 
            { backgroundColor: hydrationAnalysis.color }
          ]}
        >
          <Text style={styles.hydrationLevel}>{hydrationAnalysis.level}</Text>
        </View>
      </View>
      
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>Analysis</Text>
        <Text style={styles.analysisText}>{hydrationAnalysis.description}</Text>
        <Text style={styles.analysisRecommendation}>{hydrationAnalysis.recommendation}</Text>
      </View>
      
      <View style={styles.formSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Starter Settings</Text>
        </View>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Include starter in calculation:</Text>
          <Switch
            trackColor={{ false: '#E5E7EB', true: '#FDE68A' }}
            thumbColor={includeStarter ? '#D97706' : '#9CA3AF'}
            ios_backgroundColor="#E5E7EB"
            onValueChange={setIncludeStarter}
            value={includeStarter}
          />
        </View>
        
        {includeStarter && (
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Starter Hydration:</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={starterHydration}
                onChangeText={setStarterHydration}
                keyboardType="numeric"
              />
              <Text style={styles.inputSuffix}>%</Text>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.formSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
        </View>
        
        <View style={styles.ingredientHeader}>
          <Text style={[styles.ingredientColumn, { flex: 2 }]}>Ingredient</Text>
          <Text style={styles.ingredientColumn}>Amount</Text>
          <Text style={styles.ingredientColumn}>Type</Text>
          <Text style={[styles.ingredientColumn, { width: 40 }]}></Text>
        </View>
        
        {ingredients.map((ingredient) => (
          <View key={ingredient.id} style={styles.ingredientRow}>
            <TextInput
              style={[styles.ingredientInput, { flex: 2 }]}
              value={ingredient.name}
              onChangeText={(value) => updateIngredient(ingredient.id, 'name', value)}
              placeholder="Name"
            />
            
            <View style={styles.amountContainer}>
              <TextInput
                style={styles.amountInput}
                value={ingredient.amount}
                onChangeText={(value) => updateIngredient(ingredient.id, 'amount', value)}
                keyboardType="numeric"
              />
              <Text style={styles.unitText}>{ingredient.unit}</Text>
            </View>
            
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  ingredient.isFlour && styles.typeButtonActive
                ]}
                onPress={() => {
                  // Make mutually exclusive with isLiquid
                  updateIngredient(ingredient.id, 'isFlour', !ingredient.isFlour);
                  if (!ingredient.isFlour) {
                    updateIngredient(ingredient.id, 'isLiquid', false);
                  }
                }}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    ingredient.isFlour && styles.typeButtonTextActive
                  ]}
                >
                  Flour
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  ingredient.isLiquid && styles.typeButtonActive
                ]}
                onPress={() => {
                  // Make mutually exclusive with isFlour
                  updateIngredient(ingredient.id, 'isLiquid', !ingredient.isLiquid);
                  if (!ingredient.isLiquid) {
                    updateIngredient(ingredient.id, 'isFlour', false);
                  }
                }}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    ingredient.isLiquid && styles.typeButtonTextActive
                  ]}
                >
                  Liquid
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeIngredient(ingredient.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={addIngredient}
        >
          <Ionicons name="add-circle-outline" size={20} color="#D97706" />
          <Text style={styles.addButtonText}>Add Ingredient</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.saveSection}>
        <TouchableOpacity style={styles.saveButton}>
          <Ionicons name="save-outline" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save Recipe</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // gray-200
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
  },
  hydrationDisplay: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB', // gray-50
  },
  hydrationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280', // gray-500
    marginBottom: 8,
  },
  hydrationValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
    fontVariant: ['tabular-nums'],
  },
  hydrationIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  hydrationLevel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  analysisCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F9FAFB', // gray-50
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 14,
    color: '#4B5563', // gray-600
    lineHeight: 20,
    marginBottom: 8,
  },
  analysisRecommendation: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D97706', // amber-600
    fontStyle: 'italic',
  },
  formSection: {
    margin: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionHeader: {
    backgroundColor: '#F9FAFB', // gray-50
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // gray-200
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937', // gray-800
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // gray-200
  },
  switchLabel: {
    fontSize: 14,
    color: '#4B5563', // gray-600
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4B5563', // gray-600
    flex: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    borderRadius: 6,
    padding: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 14,
  },
  inputSuffix: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4B5563', // gray-600
  },
  ingredientHeader: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9FAFB', // gray-50
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // gray-200
  },
  ingredientColumn: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280', // gray-500
    flex: 1,
  },
  ingredientRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // gray-200
    alignItems: 'center',
  },
  ingredientInput: {
    fontSize: 14,
    color: '#1F2937', // gray-800
    flex: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    borderRadius: 6,
    padding: 6,
    width: 50,
    textAlign: 'center',
    fontSize: 14,
  },
  unitText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#4B5563', // gray-600
  },
  typeContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  typeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#F3F4F6', // gray-100
    marginVertical: 2,
    width: '100%',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#FEF3C7', // amber-100
  },
  typeButtonText: {
    fontSize: 12,
    color: '#6B7280', // gray-500
  },
  typeButtonTextActive: {
    color: '#92400E', // amber-800
    fontWeight: '500',
  },
  deleteButton: {
    width: 40,
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB', // gray-50
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#D97706', // amber-600
  },
  saveSection: {
    padding: 16,
    marginBottom: 24,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D97706', // amber-600
    borderRadius: 8,
    paddingVertical: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HydrationCalculatorScreen;