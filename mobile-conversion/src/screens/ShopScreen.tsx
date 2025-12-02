import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';
import { useShop } from '../contexts/ShopContext';
import { fetchStarters } from '../api/apiClient';

// Define product types
interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  badge?: string;
  inStock: boolean;
  category: string;
}

// Shop categories
const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'starters', name: 'Starters' },
  { id: 'tools', name: 'Baking Tools' },
  { id: 'books', name: 'Books' },
  { id: 'supplies', name: 'Supplies' },
];

const ShopScreen = () => {
  const navigation = useNavigation();
  const { addItem, cart } = useShop();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Fetch shop products (currently only starters)
  const {
    data: starters = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['starters'],
    queryFn: fetchStarters,
  });

  // Convert starters to product format (excluding homemade starter)
  const starterProducts: Product[] = starters
    .filter(starter => starter.id !== 1) // Exclude homemade starter
    .map((starter) => ({
      id: starter.id,
      name: starter.name,
      description: starter.description,
      price: starter.price,
      imageUrl: starter.imageUrl,
      badge: starter.badge,
      inStock: starter.inStock,
      category: 'starters',
    }));

  // Currently we only have starters; in the future we would merge with other product types
  const allProducts = [...starterProducts];

  // Filter products by category
  const filteredProducts = selectedCategory === 'all'
    ? allProducts
    : allProducts.filter(product => product.category === selectedCategory);

  // Check if product is in cart
  const isInCart = (productId: number): boolean => {
    return cart.some(item => item.productId === productId);
  };

  // Get quantity of product in cart
  const getCartQuantity = (productId: number): number => {
    const cartItem = cart.find(item => item.productId === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Render category button
  const renderCategoryButton = (category: { id: string; name: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === category.id && styles.categoryButtonTextActive,
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  // Render product card
  const renderProductCard = ({ item }: { item: Product }) => {
    const cartQuantity = getCartQuantity(item.id);
    
    return (
      <Card style={styles.productCard} elevation={1}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ProductDetail', { 
            productId: item.id,
            productType: item.category,
          })}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.productImage}
          />
          
          {item.badge && (
            <Badge
              text={item.badge}
              variant={item.badge === 'NEW' ? 'primary' : 'info'}
              size="small"
              style={styles.productBadge}
            />
          )}
          
          <View style={styles.productContent}>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.productDescription} numberOfLines={2}>
              {item.description}
            </Text>
            
            <View style={styles.productMeta}>
              <Text style={styles.productPrice}>{item.price}</Text>
              {!item.inStock && (
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              )}
            </View>
            
            {item.inStock && (
              <View style={styles.productActions}>
                {cartQuantity > 0 ? (
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => {
                        const cartItem = cart.find(cartItem => cartItem.productId === item.id);
                        if (cartItem) {
                          // Logic to decrease quantity will be implemented in ShopContext
                        }
                      }}
                    >
                      <Ionicons name="remove" size={16} color="#4B5563" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{cartQuantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => {
                        addItem({
                          productId: item.id,
                          productType: item.category as 'starter' | 'product' | 'recipe',
                          name: item.name,
                          price: parseFloat(item.price.replace('$', '')),
                          quantity: 1,
                          imageUrl: item.imageUrl,
                        });
                      }}
                    >
                      <Ionicons name="add" size={16} color="#4B5563" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Button
                    title="Add to Cart"
                    variant="outline"
                    size="small"
                    iconName="cart-outline"
                    onPress={() => {
                      addItem({
                        productId: item.id,
                        productType: item.category as 'starter' | 'product' | 'recipe',
                        name: item.name,
                        price: parseFloat(item.price.replace('$', '')),
                        quantity: 1,
                        imageUrl: item.imageUrl,
                      });
                    }}
                  />
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cart-outline" size={64} color="#E5E7EB" />
      <Text style={styles.emptyStateTitle}>No Products Found</Text>
      <Text style={styles.emptyStateText}>
        {selectedCategory !== 'all'
          ? `We currently don't have any ${selectedCategory} available.`
          : 'No products are currently available in our shop.'}
      </Text>
      <Button
        title="View All Products"
        onPress={() => setSelectedCategory('all')}
        variant="outline"
        size="small"
        style={{ marginTop: 16 }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bakehouse Shop</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options-outline" size={24} color="#4B5563" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="cart-outline" size={24} color="#4B5563" />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((category) => renderCategoryButton(category))}
        </ScrollView>
      </View>
      
      {/* Product List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error Loading Products</Text>
          <Text style={styles.errorText}>
            Something went wrong while fetching products.
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
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.productsList}
          numColumns={2}
          columnWrapperStyle={styles.productsRow}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              colors={['#D97706']}
              tintColor="#D97706"
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.resultsCount}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
              </Text>
            </View>
          }
        />
      )}
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // gray-200
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#D97706', // amber-600
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // gray-200
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6', // gray-100
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#FEF3C7', // amber-100
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563', // gray-600
  },
  categoryButtonTextActive: {
    color: '#92400E', // amber-800
  },
  productsList: {
    padding: 8,
  },
  productsRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
  },
  productImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  productBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  productContent: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#4B5563', // gray-600
    marginBottom: 8,
    lineHeight: 16,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D97706', // amber-600
  },
  outOfStockText: {
    fontSize: 12,
    color: '#EF4444', // red-500
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
    borderRadius: 6,
    overflow: 'hidden',
  },
  quantityButton: {
    padding: 8,
    backgroundColor: '#F3F4F6', // gray-100
  },
  quantityText: {
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937', // gray-800
  },
  listHeader: {
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default ShopScreen;