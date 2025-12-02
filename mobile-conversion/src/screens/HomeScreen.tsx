import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { fetchStarters, fetchFeaturedRecipes } from '../api/apiClient';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch featured starters
  const { 
    data: starters = [],
    isLoading: startersLoading,
    refetch: refetchStarters,
    error: startersError
  } = useQuery({
    queryKey: ['starters'],
    queryFn: fetchStarters
  });

  // Fetch featured recipes
  const { 
    data: recipes = [],
    isLoading: recipesLoading,
    refetch: refetchRecipes,
    error: recipesError
  } = useQuery({
    queryKey: ['recipes', 'featured'],
    queryFn: () => fetchFeaturedRecipes()
  });

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStarters(), refetchRecipes()]);
    setRefreshing(false);
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Filter to get only featured starters
  const featuredStarters = starters.filter(starter => starter.featured);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.headerTitle}>Bakehouse Breads</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={32} color="#4B5563" />
          </TouchableOpacity>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsScroll}
          >
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('Recipes')}
            >
              <View style={styles.quickActionIconContainer}>
                <Ionicons name="book-outline" size={24} color="#D97706" />
              </View>
              <Text style={styles.quickActionText}>My Recipes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('StarterTimer')}
            >
              <View style={styles.quickActionIconContainer}>
                <Ionicons name="timer-outline" size={24} color="#D97706" />
              </View>
              <Text style={styles.quickActionText}>Starter Timer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('TimelineCalculator')}
            >
              <View style={styles.quickActionIconContainer}>
                <Ionicons name="calendar-outline" size={24} color="#D97706" />
              </View>
              <Text style={styles.quickActionText}>Timeline</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionItem}
              onPress={() => navigation.navigate('HydrationCalculator')}
            >
              <View style={styles.quickActionIconContainer}>
                <Ionicons name="water-outline" size={24} color="#D97706" />
              </View>
              <Text style={styles.quickActionText}>Hydration</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* Featured Starter Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Starters</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Starter')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {startersLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading starters...</Text>
            </View>
          ) : startersError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load starters</Text>
              <TouchableOpacity onPress={() => refetchStarters()}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.startersContainer}
            >
              {featuredStarters.map((starter) => (
                <TouchableOpacity
                  key={starter.id}
                  style={styles.starterCard}
                  onPress={() => navigation.navigate('StarterDetail', { starter })}
                >
                  <Image
                    source={{ uri: starter.imageUrl }}
                    style={styles.starterImage}
                  />
                  {starter.badge && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{starter.badge}</Text>
                    </View>
                  )}
                  <View style={styles.starterInfo}>
                    <Text style={styles.starterName}>{starter.name}</Text>
                    <Text 
                      style={styles.starterDescription} 
                      numberOfLines={2}
                    >
                      {starter.description}
                    </Text>
                    <View style={styles.starterMeta}>
                      <Text style={styles.starterPrice}>{starter.price}</Text>
                      {starter.inStock ? (
                        <Text style={styles.inStockText}>In Stock</Text>
                      ) : (
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
        
        {/* Featured Recipes Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Recipes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Recipes')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recipesLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading recipes...</Text>
            </View>
          ) : recipesError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load recipes</Text>
              <TouchableOpacity onPress={() => refetchRecipes()}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.recipesContainer}>
              {recipes.slice(0, 3).map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.recipeCard}
                  onPress={() => navigation.navigate('RecipeDetail', { recipe })}
                >
                  <ImageBackground
                    source={{ uri: recipe.imageUrl }}
                    style={styles.recipeImage}
                    imageStyle={{ borderRadius: 8 }}
                  >
                    <View style={styles.recipeOverlay}>
                      <Text style={styles.recipeName}>{recipe.name}</Text>
                      <View style={styles.recipeMetaContainer}>
                        <View style={styles.recipeMeta}>
                          <Ionicons name="time-outline" size={14} color="#FFFFFF" />
                          <Text style={styles.recipeMetaText}>{recipe.totalTime}</Text>
                        </View>
                        <View style={styles.recipeMeta}>
                          <Ionicons name="water-outline" size={14} color="#FFFFFF" />
                          <Text style={styles.recipeMetaText}>{recipe.hydration}%</Text>
                        </View>
                        <View style={styles.recipeDifficulty}>
                          <Text style={styles.recipeDifficultyText}>
                            {recipe.difficulty}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={styles.viewAllRecipesButton}
                onPress={() => navigation.navigate('Recipes')}
              >
                <Text style={styles.viewAllRecipesText}>View All Recipes</Text>
                <Ionicons name="arrow-forward" size={16} color="#D97706" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Tools Preview Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Baker's Tools</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tools')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.toolsContainer}>
            <TouchableOpacity 
              style={styles.toolCard}
              onPress={() => navigation.navigate('TimelineCalculator')}
            >
              <View style={[styles.toolIconContainer, { backgroundColor: '#E1EFFE' }]}>
                <Ionicons name="calendar-outline" size={32} color="#3B82F6" />
              </View>
              <Text style={styles.toolName}>Timeline Calculator</Text>
              <Text style={styles.toolDescription} numberOfLines={2}>
                Plan your baking schedule perfectly
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.toolCard}
              onPress={() => navigation.navigate('HydrationCalculator')}
            >
              <View style={[styles.toolIconContainer, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="water-outline" size={32} color="#10B981" />
              </View>
              <Text style={styles.toolName}>Hydration Calculator</Text>
              <Text style={styles.toolDescription} numberOfLines={2}>
                Find the perfect water-to-flour ratio
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.toolCard}
              onPress={() => navigation.navigate('DoughTempCalculator')}
            >
              <View style={[styles.toolIconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="thermometer-outline" size={32} color="#D97706" />
              </View>
              <Text style={styles.toolName}>Temperature Calculator</Text>
              <Text style={styles.toolDescription} numberOfLines={2}>
                Calculate ideal water temperature
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.toolCard}
              onPress={() => navigation.navigate('RecipeValidator')}
            >
              <View style={[styles.toolIconContainer, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="checkmark-circle-outline" size={32} color="#EF4444" />
              </View>
              <Text style={styles.toolName}>Recipe Validator</Text>
              <Text style={styles.toolDescription} numberOfLines={2}>
                Analyze and improve your recipes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Shop Promo Banner */}
        <TouchableOpacity
          style={styles.promoBanner}
          onPress={() => navigation.navigate('Shop')}
        >
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1555951015-6da899b5c2cd?w=600&auto=format' }}
            style={styles.promoBannerImage}
            imageStyle={{ borderRadius: 8 }}
          >
            <View style={styles.promoBannerOverlay}>
              <Text style={styles.promoBannerTitle}>Shop Speciality Starters</Text>
              <Text style={styles.promoBannerDescription}>
                Elevate your bread with our unique sourdough cultures
              </Text>
              <View style={styles.promoBannerButton}>
                <Text style={styles.promoBannerButtonText}>Visit Shop</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
        
        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
  },
  profileButton: {
    padding: 4,
  },
  quickActionsContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // gray-100
  },
  quickActionsScroll: {
    paddingHorizontal: 16,
  },
  quickActionItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  quickActionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3C7', // amber-100
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#4B5563', // gray-600
    fontWeight: '500',
  },
  sectionContainer: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
  },
  seeAllText: {
    fontSize: 14,
    color: '#D97706', // amber-600
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444', // red-500
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    color: '#D97706', // amber-600
    fontWeight: '500',
  },
  startersContainer: {
    paddingRight: 16,
  },
  starterCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginRight: 16,
  },
  starterImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#D97706', // amber-600
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  starterInfo: {
    padding: 12,
  },
  starterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937', // gray-800
    marginBottom: 4,
  },
  starterDescription: {
    fontSize: 14,
    color: '#6B7280', // gray-500
    marginBottom: 8,
  },
  starterMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starterPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D97706', // amber-600
  },
  inStockText: {
    fontSize: 12,
    color: '#10B981', // emerald-500
  },
  outOfStockText: {
    fontSize: 12,
    color: '#EF4444', // red-500
  },
  recipesContainer: {
    marginBottom: 16,
  },
  recipeCard: {
    height: 160,
    borderRadius: 8,
    marginBottom: 16,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  recipeOverlay: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  recipeMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  recipeMetaText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  recipeDifficulty: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(217, 119, 6, 0.7)', // amber-600 with opacity
    borderRadius: 4,
  },
  recipeDifficultyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  viewAllRecipesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
    borderRadius: 8,
    backgroundColor: '#F9FAFB', // gray-50
  },
  viewAllRecipesText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D97706', // amber-600
    marginRight: 8,
  },
  toolsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  toolCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  toolIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937', // gray-800
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    color: '#6B7280', // gray-500
  },
  promoBanner: {
    marginHorizontal: 16,
    marginBottom: 24,
    height: 180,
    borderRadius: 8,
  },
  promoBannerImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  promoBannerOverlay: {
    padding: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.7)', // gray-800 with opacity
    borderRadius: 8,
  },
  promoBannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  promoBannerDescription: {
    fontSize: 14,
    color: '#F9FAFB', // gray-50
    marginBottom: 12,
  },
  promoBannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#D97706', // amber-600
    borderRadius: 6,
  },
  promoBannerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginRight: 8,
  },
  bottomSpacer: {
    height: 24,
  },
});

export default HomeScreen;