import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { API } from '../api/client';
import Ionicons from 'react-native-vector-icons/Ionicons';

const RecipeDetailScreen = ({ route }) => {
  const { id } = route.params;
  const [activeTab, setActiveTab] = useState('recipe'); // 'recipe' or 'timeline'

  // Fetch recipe details
  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => API.getRecipeById(id),
  });

  // Handle error
  if (error) {
    Alert.alert('Error', 'Failed to load recipe details');
  }

  // Calculate baker's percentages
  const calculateBakersPercentage = (ingredient) => {
    if (!recipe?.ingredients || !recipe.ingredients.length) return '0%';
    
    const totalFlourWeight = recipe.ingredients
      .filter(ing => ing.category === 'flour')
      .reduce((sum, ing) => sum + ing.weight, 0);
    
    if (totalFlourWeight === 0) return '0%';
    
    return `${Math.round((ingredient.weight / totalFlourWeight) * 100)}%`;
  };

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D97706" />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }

  // Render tabs
  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'recipe' && styles.activeTab]}
        onPress={() => setActiveTab('recipe')}
      >
        <Text
          style={[styles.tabText, activeTab === 'recipe' && styles.activeTabText]}
        >
          Recipe
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'timeline' && styles.activeTab]}
        onPress={() => setActiveTab('timeline')}
      >
        <Text
          style={[styles.tabText, activeTab === 'timeline' && styles.activeTabText]}
        >
          Timeline
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render recipe content
  const renderRecipeContent = () => (
    <View>
      <View style={styles.recipeMetrics}>
        <View style={styles.metricItem}>
          <Ionicons name="time-outline" size={20} color="#6B7280" />
          <Text style={styles.metricLabel}>Total Time</Text>
          <Text style={styles.metricValue}>{recipe?.totalTime || 'N/A'}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Ionicons name="water-outline" size={20} color="#6B7280" />
          <Text style={styles.metricLabel}>Hydration</Text>
          <Text style={styles.metricValue}>{recipe?.hydration || 'N/A'}%</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Ionicons name="speedometer-outline" size={20} color="#6B7280" />
          <Text style={styles.metricLabel}>Difficulty</Text>
          <Text style={styles.metricValue}>{recipe?.difficulty || 'Medium'}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Ingredients</Text>
      {recipe?.ingredients?.map((ingredient, index) => (
        <View key={index} style={styles.ingredientRow}>
          <Text style={styles.ingredientName}>{ingredient.name}</Text>
          <Text style={styles.ingredientAmount}>
            {ingredient.weight}g
          </Text>
          <Text style={styles.ingredientPercentage}>
            {calculateBakersPercentage(ingredient)}
          </Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Instructions</Text>
      {recipe?.instructions?.map((instruction, index) => (
        <View key={index} style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>{index + 1}</Text>
          </View>
          <Text style={styles.instructionText}>{instruction}</Text>
        </View>
      ))}

      <View style={styles.authorSection}>
        <Text style={styles.authorLabel}>Created by</Text>
        <Text style={styles.authorName}>{recipe?.author || 'Unknown'}</Text>
      </View>
    </View>
  );

  // Render timeline content
  const renderTimelineContent = () => (
    <View>
      <Text style={styles.timelineIntro}>
        Follow this timeline to bake your {recipe?.name}:
      </Text>
      
      {recipe?.timeline ? (
        recipe.timeline.map((step, index) => (
          <View key={index} style={styles.timelineStep}>
            <View style={styles.timelineStepHeader}>
              <Text style={styles.timelineTime}>{step.time}</Text>
              <Text style={styles.timelineAction}>{step.action}</Text>
            </View>
            <Text style={styles.timelineDescription}>
              {step.description}
            </Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyTimeline}>
          <Ionicons name="time" size={40} color="#D1D5DB" />
          <Text style={styles.emptyTimelineText}>
            No timeline available for this recipe.
          </Text>
          <TouchableOpacity style={styles.generateTimelineButton}>
            <Text style={styles.generateTimelineButtonText}>
              Generate Timeline
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: recipe?.imageUrl || 'https://images.unsplash.com/photo-1555951015-6da899b5e0b0?q=80&w=800' }}
          style={styles.recipeImage}
        />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.recipeTitle}>{recipe?.name}</Text>
        <Text style={styles.recipeDescription}>{recipe?.description}</Text>
        
        {renderTabs()}
        
        {activeTab === 'recipe' ? renderRecipeContent() : renderTimelineContent()}
      </View>
      
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="print-outline" size={20} color="#4B5563" />
          <Text style={styles.actionButtonText}>Print</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#4B5563" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryActionButton}>
          <Ionicons name="timer-outline" size={20} color="#FFFFFF" />
          <Text style={styles.primaryActionButtonText}>Start Baking</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280', // gray-500
  },
  imageContainer: {
    height: 250,
    width: '100%',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 16,
    color: '#6B7280', // gray-500
    marginBottom: 16,
    lineHeight: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // gray-200
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#D97706', // amber-600
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280', // gray-500
  },
  activeTabText: {
    color: '#D97706', // amber-600
  },
  recipeMetrics: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB', // gray-50
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#E5E7EB', // gray-200
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280', // gray-500
    marginTop: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937', // gray-800
    marginBottom: 12,
    marginTop: 20,
  },
  ingredientRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // gray-100
  },
  ingredientName: {
    flex: 2,
    fontSize: 16,
    color: '#1F2937', // gray-800
  },
  ingredientAmount: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937', // gray-800
    textAlign: 'right',
  },
  ingredientPercentage: {
    flex: 1,
    fontSize: 16,
    color: '#6B7280', // gray-500
    textAlign: 'right',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6', // gray-100
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563', // gray-600
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937', // gray-800
    lineHeight: 24,
  },
  authorSection: {
    marginTop: 24,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // gray-200
  },
  authorLabel: {
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
  authorName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937', // gray-800
    marginTop: 4,
  },
  timelineIntro: {
    fontSize: 16,
    color: '#6B7280', // gray-500
    marginBottom: 16,
    lineHeight: 24,
  },
  timelineStep: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F9FAFB', // gray-50
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#D97706', // amber-600
  },
  timelineStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937', // gray-800
    marginRight: 8,
  },
  timelineAction: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563', // gray-600
  },
  timelineDescription: {
    fontSize: 14,
    color: '#6B7280', // gray-500
    lineHeight: 20,
  },
  emptyTimeline: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTimelineText: {
    fontSize: 16,
    color: '#6B7280', // gray-500
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  generateTimelineButton: {
    backgroundColor: '#F3F4F6', // gray-100
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  generateTimelineButtonText: {
    fontSize: 16,
    color: '#4B5563', // gray-600
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // gray-200
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#F3F4F6', // gray-100
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#4B5563', // gray-600
    fontWeight: '500',
    marginLeft: 6,
  },
  primaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#D97706', // amber-600
  },
  primaryActionButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default RecipeDetailScreen;