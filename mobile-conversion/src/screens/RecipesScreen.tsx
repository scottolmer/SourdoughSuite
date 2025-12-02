import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { fetchRecipes } from '../api/apiClient';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';
import { useBakerTools } from '../contexts/BakerToolsContext';

// Define recipe object type
interface Recipe {
  id: number;
  name: string;
  imageUrl: string;
  description: string;
  difficulty: string;
  totalTime: string;
  activeTime: string;
  hydration: number;
  author: string;
  featured: boolean;
  starterPercentage: number;
  saltPercentage: number;
  ingredients: any[];
  instructions: string[];
  categories: string[];
  createdAt: string;
  updatedAt: string;
}

const RecipesScreen = () => {
  const navigation = useNavigation();
  const { savedTimelines } = useBakerTools();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'popular'>('featured');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Fetch recipes
  const {
    data: recipes = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });

  // Filter and sort recipes
  const filteredRecipes = React.useMemo(() => {
    let filtered = [...recipes];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(query) ||
          recipe.description.toLowerCase().includes(query) ||
          recipe.author.toLowerCase().includes(query) ||
          recipe.categories.some((category) => category.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filterCategory) {
      filtered = filtered.filter((recipe) =>
        recipe.categories.includes(filterCategory)
      );
    }

    // Apply sorting
    if (sortBy === 'featured') {
      filtered.sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));
    } else if (sortBy === 'newest') {
      filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'popular') {
      // This would ideally use a popularity metric from the API
      // For now, just a dummy sort based on ID as placeholder
      filtered.sort((a, b) => b.id - a.id);
    }

    return filtered;
  }, [recipes, searchQuery, filterCategory, sortBy]);

  // Get unique categories for filter
  const categories = React.useMemo(() => {
    const categoriesSet = new Set<string>();
    recipes.forEach((recipe) => {
      recipe.categories.forEach((category) => {
        categoriesSet.add(category);
      });
    });
    return Array.from(categoriesSet).sort();
  }, [recipes]);

  // Render recipe card
  const renderRecipeCard = ({ item }: { item: Recipe }) => {
    // Check if this recipe has a saved timeline
    const hasTimeline = savedTimelines.some((timeline) => timeline.recipeId === item.id);

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
      >
        <ImageBackground
          source={{ uri: item.imageUrl }}
          style={styles.recipeImage}
          imageStyle={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
        >
          {item.featured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
          
          {hasTimeline && (
            <View style={styles.timelineBadge}>
              <Ionicons name="calendar-outline" size={14} color="#FFFFFF" />
              <Text style={styles.timelineBadgeText}>Planned</Text>
            </View>
          )}
        </ImageBackground>
        
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeName}>{item.name}</Text>
          <Text style={styles.recipeAuthor}>By {item.author}</Text>
          
          <Text 
            style={styles.recipeDescription}
            numberOfLines={2}
          >
            {item.description}
          </Text>
          
          <View style={styles.recipeMetaInfo}>
            <View style={styles.recipeMeta}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.recipeMetaText}>{item.totalTime}</Text>
            </View>
            
            <View style={styles.recipeMeta}>
              <Ionicons name="water-outline" size={16} color="#6B7280" />
              <Text style={styles.recipeMetaText}>{item.hydration}%</Text>
            </View>
            
            <Badge
              text={item.difficulty}
              variant={
                item.difficulty === 'Easy' ? 'success' :
                item.difficulty === 'Medium' ? 'primary' :
                item.difficulty === 'Advanced' ? 'warning' : 'secondary'
              }
              size="small"
            />
          </View>
          
          <View style={styles.recipeCategories}>
            {item.categories.slice(0, 2).map((category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryChip}
                onPress={() => setFilterCategory(category)}
              >
                <Text style={styles.categoryChipText}>{category}</Text>
              </TouchableOpacity>
            ))}
            {item.categories.length > 2 && (
              <Text style={styles.moreCategoriesText}>+{item.categories.length - 2}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render filter chips
  const renderCategoryChip = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.filterChip,
        filterCategory === category && styles.filterChipSelected,
      ]}
      onPress={() => {
        setFilterCategory(filterCategory === category ? null : category);
      }}
    >
      <Text
        style={[
          styles.filterChipText,
          filterCategory === category && styles.filterChipTextSelected,
        ]}
      >
        {category}
      </Text>
      {filterCategory === category && (
        <Ionicons name="close-circle" size={16} color="#FFFFFF" style={styles.clearFilterIcon} />
      )}
    </TouchableOpacity>
  );

  // Render sort buttons
  const renderSortButton = (value: 'featured' | 'newest' | 'popular', label: string) => (
    <TouchableOpacity
      style={[styles.sortButton, sortBy === value && styles.sortButtonSelected]}
      onPress={() => setSortBy(value)}
    >
      <Text
        style={[
          styles.sortButtonText,
          sortBy === value && styles.sortButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Component for empty state
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="book-outline" size={64} color="#E5E7EB" />
      <Text style={styles.emptyStateTitle}>No Recipes Found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery || filterCategory
          ? "We couldn't find any recipes matching your search or filters."
          : "You don't have any recipes yet."}
      </Text>
      {(searchQuery || filterCategory) && (
        <Button
          title="Clear Filters"
          onPress={() => {
            setSearchQuery('');
            setFilterCategory(null);
          }}
          variant="outline"
          size="small"
          style={styles.clearFiltersButton}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={24} color="#4B5563" />
        </TouchableOpacity>
      </View>
      
      {/* Category Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={categories}
          renderItem={({ item }) => renderCategoryChip(item)}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
          ListHeaderComponent={
            <View style={styles.sortButtons}>
              {renderSortButton('featured', 'Featured')}
              {renderSortButton('newest', 'Newest')}
              {renderSortButton('popular', 'Popular')}
            </View>
          }
        />
      </View>
      
      {/* Recipe List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={styles.loadingText}>Loading recipes...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error Loading Recipes</Text>
          <Text style={styles.errorText}>
            Something went wrong while fetching recipes.
          </Text>
          <Button
            title="Try Again"
            onPress={() => refetch()}
            variant="primary"
            size="small"
            style={styles.tryAgainButton}
          />
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.recipeList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              colors={['#D97706']}
              tintColor="#D97706"
            />
          }
          ListEmptyComponent={<EmptyState />}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.resultsCount}>
                {filteredRecipes.length} {filteredRecipes.length === 1 ? 'Recipe' : 'Recipes'}
              </Text>
            </View>
          }
          ListFooterComponent={<View style={styles.listFooter} />}
        />
      )}
      
      {/* Create Recipe Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateRecipe')}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // gray-100
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB', // gray-50
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1F2937', // gray-800
  },
  filterButton: {
    padding: 8,
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // gray-100
  },
  filtersList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // gray-100
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#D97706', // amber-600
  },
  filterChipText: {
    fontSize: 14,
    color: '#4B5563', // gray-600
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  clearFilterIcon: {
    marginLeft: 4,
  },
  sortButtons: {
    flexDirection: 'row',
    marginRight: 16,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F3F4F6', // gray-100
  },
  sortButtonSelected: {
    backgroundColor: '#FEF3C7', // amber-100
  },
  sortButtonText: {
    fontSize: 14,
    color: '#4B5563', // gray-600
  },
  sortButtonTextSelected: {
    color: '#92400E', // amber-800
    fontWeight: '500',
  },
  recipeList: {
    padding: 16,
  },
  listHeader: {
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
  },
  recipeImage: {
    width: '100%',
    height: 160,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  featuredBadge: {
    backgroundColor: '#D97706', // amber-600
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    position: 'absolute',
    top: 8,
    left: 8,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timelineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue-500 with opacity
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  timelineBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  recipeInfo: {
    padding: 12,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
    marginBottom: 2,
  },
  recipeAuthor: {
    fontSize: 14,
    color: '#6B7280', // gray-500
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#4B5563', // gray-600
    marginBottom: 12,
    lineHeight: 20,
  },
  recipeMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  recipeMetaText: {
    fontSize: 14,
    color: '#6B7280', // gray-500
    marginLeft: 4,
  },
  recipeCategories: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChip: {
    backgroundColor: '#F3F4F6', // gray-100
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 12,
    color: '#4B5563', // gray-600
  },
  moreCategoriesText: {
    fontSize: 12,
    color: '#6B7280', // gray-500
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6B7280', // gray-500
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280', // gray-500
    textAlign: 'center',
    marginBottom: 16,
  },
  tryAgainButton: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280', // gray-500
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  clearFiltersButton: {
    marginTop: 8,
  },
  createButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D97706', // amber-600
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  listFooter: {
    height: 80, // Space for the FAB
  },
});

export default RecipesScreen;