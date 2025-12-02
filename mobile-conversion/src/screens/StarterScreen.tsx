import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { fetchStarters } from '../api/apiClient';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';

// Define starter object type
interface StarterMaintenance {
  difficulty: string;
  feeding_schedule: string;
}

interface StarterFlavor {
  sweet: number;
  tangy?: number;
  sour?: number;
  complex?: number;
  umami?: number;
}

interface StarterFlourMix {
  [key: string]: number;
}

interface Starter {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: string;
  mainFlour: string;
  flourMix: StarterFlourMix;
  flavor: StarterFlavor;
  maintenance: StarterMaintenance;
  badge?: string;
  inStock: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define a type for user's starters
interface UserStarter {
  id: number;
  starterId: number;
  name: string;
  originalName: string;
  lastFed: string;
  feedingSchedule: string;
  health: 'excellent' | 'good' | 'needs attention' | 'critical';
  age: number; // in days
  imageUrl?: string;
  notes?: string;
}

const StarterScreen = () => {
  const navigation = useNavigation();
  const [myStarters, setMyStarters] = useState<UserStarter[]>([]);
  const [filterType, setFilterType] = useState<'my' | 'shop'>('my');

  // Fetch starters from shop
  const {
    data: shopStarters = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['starters'],
    queryFn: fetchStarters,
  });

  // Load user's starters from local storage
  useEffect(() => {
    // This would normally come from the API or local storage
    // For now, using mock data as placeholder
    const mockUserStarters: UserStarter[] = [
      {
        id: 1,
        starterId: 6, // References Koji starter from shop
        name: 'My Koji Starter',
        originalName: 'Koji Sourdough Starter',
        lastFed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        feedingSchedule: 'daily',
        health: 'excellent',
        age: 32,
        imageUrl: 'https://images.unsplash.com/photo-1585478259715-2977ac7c1795?w=600&auto=format',
        notes: 'Vigorous activity, pleasant aroma',
      },
      {
        id: 2,
        starterId: 8, // References Kombucha starter from shop
        name: 'Kombucha Test',
        originalName: 'Kombucha Sourdough Starter',
        lastFed: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
        feedingSchedule: 'daily',
        health: 'needs attention',
        age: 15,
        imageUrl: 'https://images.unsplash.com/photo-1629985858244-df6ac77840fc?w=600&auto=format',
        notes: 'Needs feeding urgently',
      },
    ];
    
    setMyStarters(mockUserStarters);
  }, []);

  // Calculate time since last feeding
  const getTimeSinceLastFed = (lastFed: string): string => {
    const lastFedDate = new Date(lastFed);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastFedDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  // Check if a starter needs feeding
  const needsFeeding = (lastFed: string, schedule: string): boolean => {
    const lastFedDate = new Date(lastFed);
    const now = new Date();
    const diffInHours = (now.getTime() - lastFedDate.getTime()) / (1000 * 60 * 60);
    
    switch (schedule) {
      case 'daily':
        return diffInHours >= 24;
      case 'twice_daily':
        return diffInHours >= 12;
      case 'weekly':
        return diffInHours >= 168; // 7 days
      default:
        return diffInHours >= 24;
    }
  };

  // Render user's starter card
  const renderUserStarterCard = ({ item }: { item: UserStarter }) => {
    const requiresFeeding = needsFeeding(item.lastFed, item.feedingSchedule);
    
    return (
      <Card style={styles.starterCard} elevation={2}>
        <TouchableOpacity
          onPress={() => navigation.navigate('StarterDetail', { starterId: item.id, isUserStarter: true })}
        >
          <View style={styles.starterCardHeader}>
            <View style={styles.starterCardContent}>
              <Text style={styles.starterName}>{item.name}</Text>
              <Text style={styles.starterOrigin}>From {item.originalName}</Text>
            </View>
            
            <View style={styles.starterActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('StarterTimer', { starterId: item.id, starterName: item.name })}
              >
                <Ionicons name="timer-outline" size={24} color="#D97706" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  // Logic to mark as fed would go here
                  Alert.alert('Starter Fed', `${item.name} has been marked as fed.`);
                }}
              >
                <Ionicons name="checkmark-circle-outline" size={24} color="#D97706" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.starterMetricsRow}>
            <View style={styles.starterMetric}>
              <Text style={styles.metricLabel}>Last Fed</Text>
              <View style={styles.lastFedContainer}>
                <Text 
                  style={[
                    styles.metricValue,
                    requiresFeeding && styles.needsFeedingText
                  ]}
                >
                  {getTimeSinceLastFed(item.lastFed)}
                </Text>
                {requiresFeeding && (
                  <Ionicons name="alert-circle" size={16} color="#EF4444" style={styles.alertIcon} />
                )}
              </View>
            </View>
            
            <View style={styles.starterMetric}>
              <Text style={styles.metricLabel}>Health</Text>
              <Text style={[
                styles.metricValue,
                item.health === 'excellent' && styles.excellentHealthText,
                item.health === 'good' && styles.goodHealthText,
                item.health === 'needs attention' && styles.needsAttentionText,
                item.health === 'critical' && styles.criticalHealthText,
              ]}>
                {item.health.charAt(0).toUpperCase() + item.health.slice(1)}
              </Text>
            </View>
            
            <View style={styles.starterMetric}>
              <Text style={styles.metricLabel}>Age</Text>
              <Text style={styles.metricValue}>{item.age} days</Text>
            </View>
          </View>
          
          <View style={styles.starterActionButtons}>
            <Button
              title="Feed Now"
              iconName="restaurant-outline"
              variant={requiresFeeding ? "primary" : "outline"}
              size="small"
              onPress={() => {
                // Logic to record feeding
                Alert.alert('Starter Fed', `${item.name} has been marked as fed.`);
              }}
              style={{ flex: 1, marginRight: 8 }}
            />
            
            <Button
              title="Set Timer"
              iconName="timer-outline"
              variant="outline"
              size="small"
              onPress={() => navigation.navigate('StarterTimer', { starterId: item.id, starterName: item.name })}
              style={{ flex: 1 }}
            />
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  // Render shop starter card
  const renderShopStarterCard = ({ item }: { item: Starter }) => {
    return (
      <Card style={styles.shopStarterCard} elevation={1}>
        <TouchableOpacity
          onPress={() => navigation.navigate('StarterDetail', { starterId: item.id, isUserStarter: false })}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.shopStarterImage}
          />
          
          {item.badge && (
            <Badge
              text={item.badge}
              variant="primary"
              size="small"
              style={styles.shopStarterBadge}
            />
          )}
          
          <View style={styles.shopStarterContent}>
            <Text style={styles.shopStarterName}>{item.name}</Text>
            <Text style={styles.shopStarterDescription} numberOfLines={2}>
              {item.description}
            </Text>
            
            <View style={styles.shopStarterDetails}>
              <Text style={styles.shopStarterPrice}>{item.price}</Text>
              <Text style={[
                styles.shopStarterStock,
                item.inStock ? styles.inStockText : styles.outOfStockText
              ]}>
                {item.inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
            
            <Button
              title="View Details"
              variant="outline"
              size="small"
              onPress={() => navigation.navigate('StarterDetail', { starterId: item.id, isUserStarter: false })}
              style={styles.viewDetailsButton}
            />
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  // Header component for empty state
  const EmptyState = () => (
    <View style={styles.emptyState}>
      {filterType === 'my' ? (
        <>
          <Ionicons name="flask-outline" size={64} color="#E5E7EB" />
          <Text style={styles.emptyStateTitle}>No Starters Yet</Text>
          <Text style={styles.emptyStateText}>
            You haven't added any sourdough starters yet. Add your first starter to begin tracking.
          </Text>
          <Button
            title="Add First Starter"
            onPress={() => navigation.navigate('AddStarter')}
            variant="primary"
            size="medium"
            style={{ marginTop: 16 }}
          />
        </>
      ) : (
        <>
          <Ionicons name="cart-outline" size={64} color="#E5E7EB" />
          <Text style={styles.emptyStateTitle}>No Starters Available</Text>
          <Text style={styles.emptyStateText}>
            There are currently no sourdough starters available in our shop. Please check back later.
          </Text>
          <Button
            title="Refresh"
            onPress={() => refetch()}
            variant="primary"
            size="medium"
            style={{ marginTop: 16 }}
          />
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Segment Control */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            filterType === 'my' && styles.segmentButtonActive,
          ]}
          onPress={() => setFilterType('my')}
        >
          <Text
            style={[
              styles.segmentButtonText,
              filterType === 'my' && styles.segmentButtonTextActive,
            ]}
          >
            My Starters
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.segmentButton,
            filterType === 'shop' && styles.segmentButtonActive,
          ]}
          onPress={() => setFilterType('shop')}
        >
          <Text
            style={[
              styles.segmentButtonText,
              filterType === 'shop' && styles.segmentButtonTextActive,
            ]}
          >
            Shop Starters
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content Area */}
      {filterType === 'my' ? (
        // My Starters View
        <View style={styles.contentContainer}>
          <FlatList
            data={myStarters}
            renderItem={renderUserStarterCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.startersList}
            ListEmptyComponent={<EmptyState />}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.sectionTitle}>My Sourdough Starters</Text>
                <Text style={styles.sectionSubtitle}>
                  Track and manage your sourdough starters
                </Text>
              </View>
            }
            ListFooterComponent={<View style={styles.listFooter} />}
          />
          
          {/* Add Starter Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddStarter')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        // Shop Starters View
        <View style={styles.contentContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#D97706" />
              <Text style={styles.loadingText}>Loading starters...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
              <Text style={styles.errorTitle}>Error Loading Starters</Text>
              <Text style={styles.errorText}>
                Something went wrong while fetching starters.
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
              data={shopStarters}
              renderItem={renderShopStarterCard}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.startersList}
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
                  <Text style={styles.sectionTitle}>Shop for Specialty Starters</Text>
                  <Text style={styles.sectionSubtitle}>
                    Discover unique sourdough starters for your baking adventures
                  </Text>
                </View>
              }
              ListFooterComponent={<View style={styles.listFooter} />}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  segmentContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // gray-200
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  segmentButtonActive: {
    borderBottomColor: '#D97706', // amber-600
  },
  segmentButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280', // gray-500
  },
  segmentButtonTextActive: {
    color: '#D97706', // amber-600
  },
  contentContainer: {
    flex: 1,
  },
  startersList: {
    padding: 16,
  },
  listHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
  starterCard: {
    marginBottom: 16,
  },
  starterCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  starterCardContent: {
    flex: 1,
  },
  starterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
  },
  starterOrigin: {
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
  starterActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  starterMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  starterMetric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280', // gray-500
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937', // gray-800
  },
  lastFedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  needsFeedingText: {
    color: '#EF4444', // red-500
  },
  alertIcon: {
    marginLeft: 4,
  },
  excellentHealthText: {
    color: '#10B981', // emerald-500
  },
  goodHealthText: {
    color: '#3B82F6', // blue-500
  },
  needsAttentionText: {
    color: '#F59E0B', // amber-500
  },
  criticalHealthText: {
    color: '#EF4444', // red-500
  },
  starterActionButtons: {
    flexDirection: 'row',
  },
  shopStarterCard: {
    marginBottom: 16,
  },
  shopStarterImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  shopStarterBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  shopStarterContent: {
    padding: 12,
  },
  shopStarterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
    marginBottom: 4,
  },
  shopStarterDescription: {
    fontSize: 14,
    color: '#4B5563', // gray-600
    marginBottom: 8,
    lineHeight: 20,
  },
  shopStarterDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shopStarterPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D97706', // amber-600
  },
  shopStarterStock: {
    fontSize: 14,
  },
  inStockText: {
    color: '#10B981', // emerald-500
  },
  outOfStockText: {
    color: '#EF4444', // red-500
  },
  viewDetailsButton: {
    width: '100%',
  },
  addButton: {
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
});

export default StarterScreen;