import React, { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUser } from '../contexts/UserContext';

// Screens
import HomeScreen from '../screens/HomeScreen';
import RecipesScreen from '../screens/RecipesScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import StarterScreen from '../screens/StarterScreen';
import StarterDetailScreen from '../screens/StarterDetailScreen';
import StarterTimerScreen from '../screens/StarterTimerScreen';
import ShopScreen from '../screens/ShopScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ToolsScreen from '../screens/ToolsScreen';
import TimelineCalculatorScreen from '../screens/TimelineCalculatorScreen';
import HydrationCalculatorScreen from '../screens/HydrationCalculatorScreen';
import DoughTempCalculatorScreen from '../screens/DoughTempCalculatorScreen';
import RecipeValidatorScreen from '../screens/RecipeValidatorScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddStarterScreen from '../screens/AddStarterScreen';

// Notification service
import NotificationService from '../utils/notificationService';

// Stack navigators
const HomeStack = createStackNavigator();
const RecipeStack = createStackNavigator();
const StarterStack = createStackNavigator();
const ShopStack = createStackNavigator();
const ToolsStack = createStackNavigator();
const AuthStack = createStackNavigator();

// Tab navigator
const Tab = createBottomTabNavigator();

// Default screen options
const defaultScreenOptions = {
  headerStyle: {
    backgroundColor: '#FEF3C7', // amber-100
    elevation: 0, // Remove shadow on Android
    shadowOpacity: 0, // Remove shadow on iOS
  },
  headerTintColor: '#92400E', // amber-800
  headerTitleStyle: {
    fontWeight: '600',
  },
};

// HomeStack Navigator
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator 
      screenOptions={defaultScreenOptions}
      initialRouteName="Home"
    >
      <HomeStack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Bakehouse Breads' }}
      />
      <HomeStack.Screen 
        name="RecipeDetail" 
        component={RecipeDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.recipeName || 'Recipe Details'
        })}
      />
      <HomeStack.Screen 
        name="StarterDetail" 
        component={StarterDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.starterName || 'Starter Details'
        })}
      />
      <HomeStack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Your Profile' }}
      />
    </HomeStack.Navigator>
  );
}

// RecipeStack Navigator
function RecipeStackNavigator() {
  return (
    <RecipeStack.Navigator 
      screenOptions={defaultScreenOptions}
      initialRouteName="Recipes"
    >
      <RecipeStack.Screen 
        name="Recipes" 
        component={RecipesScreen}
        options={{ title: 'Bread Recipes' }}
      />
      <RecipeStack.Screen 
        name="RecipeDetail" 
        component={RecipeDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.recipeName || 'Recipe Details'
        })}
      />
      <RecipeStack.Screen 
        name="RecipeValidator" 
        component={RecipeValidatorScreen}
        options={{ title: 'Recipe Validator' }}
      />
    </RecipeStack.Navigator>
  );
}

// StarterStack Navigator
function StarterStackNavigator() {
  return (
    <StarterStack.Navigator 
      screenOptions={defaultScreenOptions}
      initialRouteName="Starters"
    >
      <StarterStack.Screen 
        name="Starters" 
        component={StarterScreen}
        options={{ title: 'Sourdough Starters' }}
      />
      <StarterStack.Screen 
        name="StarterDetail" 
        component={StarterDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.starterName || 'Starter Details'
        })}
      />
      <StarterStack.Screen 
        name="StarterTimer" 
        component={StarterTimerScreen}
        options={{ title: 'Feeding Timer' }}
      />
      <StarterStack.Screen 
        name="AddStarter" 
        component={AddStarterScreen}
        options={{ title: 'Add New Starter' }}
      />
    </StarterStack.Navigator>
  );
}

// ShopStack Navigator
function ShopStackNavigator() {
  return (
    <ShopStack.Navigator 
      screenOptions={defaultScreenOptions}
      initialRouteName="Shop"
    >
      <ShopStack.Screen 
        name="Shop" 
        component={ShopScreen}
        options={{ title: 'Bakehouse Shop' }}
      />
      <ShopStack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.productName || 'Product Details'
        })}
      />
      <ShopStack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ title: 'Shopping Cart' }}
      />
      <ShopStack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
    </ShopStack.Navigator>
  );
}

// ToolsStack Navigator
function ToolsStackNavigator() {
  return (
    <ToolsStack.Navigator 
      screenOptions={defaultScreenOptions}
      initialRouteName="Tools"
    >
      <ToolsStack.Screen 
        name="Tools" 
        component={ToolsScreen}
        options={{ title: 'Baker\'s Tools' }}
      />
      <ToolsStack.Screen 
        name="TimelineCalculator" 
        component={TimelineCalculatorScreen}
        options={{ title: 'Baking Timeline' }}
      />
      <ToolsStack.Screen 
        name="HydrationCalculator" 
        component={HydrationCalculatorScreen}
        options={{ title: 'Hydration Calculator' }}
      />
      <ToolsStack.Screen 
        name="DoughTempCalculator" 
        component={DoughTempCalculatorScreen}
        options={{ title: 'Dough Temperature' }}
      />
      <ToolsStack.Screen 
        name="RecipeValidator" 
        component={RecipeValidatorScreen}
        options={{ title: 'Recipe Validator' }}
      />
    </ToolsStack.Navigator>
  );
}

// Auth Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator 
      screenOptions={{
        ...defaultScreenOptions,
        headerShown: false,
      }}
      initialRouteName="Login"
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// Main Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'RecipesTab') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'StarterTab') {
            iconName = focused ? 'flask' : 'flask-outline';
          } else if (route.name === 'ShopTab') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'ToolsTab') {
            iconName = focused ? 'construct' : 'construct-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#D97706', // amber-600
        tabBarInactiveTintColor: '#6B7280', // gray-500
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStackNavigator} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="RecipesTab" 
        component={RecipeStackNavigator} 
        options={{ title: 'Recipes' }}
      />
      <Tab.Screen 
        name="StarterTab" 
        component={StarterStackNavigator} 
        options={{ title: 'Starters' }}
      />
      <Tab.Screen 
        name="ShopTab" 
        component={ShopStackNavigator} 
        options={{ title: 'Shop' }}
      />
      <Tab.Screen 
        name="ToolsTab" 
        component={ToolsStackNavigator} 
        options={{ title: 'Tools' }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const { user, isLoading, checkAuth } = useUser();

  // Initialize notifications
  useEffect(() => {
    NotificationService.initializeNotifications();
    NotificationService.requestNotificationPermissions();
  }, []);

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Set status bar style
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#FEF3C7');
      StatusBar.setBarStyle('dark-content');
    } else {
      StatusBar.setBarStyle('dark-content');
    }
  }, []);

  // Show loading screen
  if (isLoading) {
    return null; // Return a loading screen component here
  }

  return (
    <NavigationContainer>
      {user ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}