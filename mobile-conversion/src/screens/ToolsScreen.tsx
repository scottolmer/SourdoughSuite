import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ToolsScreen = () => {
  const navigation = useNavigation();

  // Define the baking tools
  const bakingTools = [
    {
      title: "Baker's Calculator",
      description: "Calculate baker's percentages for your recipes",
      icon: 'calculator-outline',
      screen: 'BakersCalculator',
      color: '#EFF6FF', // blue-50
      textColor: '#1E40AF', // blue-800
    },
    {
      title: "Timeline Calculator",
      description: "Plan your baking schedule with precision",
      icon: 'time-outline',
      screen: 'TimelineCalculator',
      color: '#F5F3FF', // violet-50
      textColor: '#5B21B6', // violet-800
    },
    {
      title: "Dough Temperature",
      description: "Calculate water temperature for ideal dough temperature",
      icon: 'thermometer-outline',
      screen: 'DoughTemperatureCalculator',
      color: '#FEF2F2', // red-50
      textColor: '#B91C1C', // red-800
    },
    {
      title: "Hydration Converter",
      description: "Convert between different hydration levels",
      icon: 'water-outline',
      screen: 'HydrationConverter',
      color: '#ECFDF5', // emerald-50
      textColor: '#065F46', // emerald-800
    },
    {
      title: "Recipe Validator",
      description: "Analyze and improve your bread recipes",
      icon: 'checkmark-circle-outline',
      screen: 'RecipeValidator',
      color: '#F0F9FF', // sky-50
      textColor: '#0369A1', // sky-800
    },
    {
      title: "Unit Converter",
      description: "Convert between weight and volume measurements",
      icon: 'swap-horizontal-outline',
      screen: 'UnitConverter',
      color: '#FEF3C7', // amber-50
      textColor: '#92400E', // amber-800
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Baker's Tools</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calculators & Tools</Text>
        
        {bakingTools.map((tool, index) => (
          <TouchableOpacity
            key={index}
            style={styles.toolCard}
            onPress={() => navigation.navigate(tool.screen)}
          >
            <View style={[styles.iconContainer, { backgroundColor: tool.color }]}>
              <Ionicons name={tool.icon} size={24} color={tool.textColor} />
            </View>
            <View style={styles.toolContent}>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolDescription}>{tool.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Troubleshooting</Text>
        
        <TouchableOpacity
          style={styles.troubleshootingCard}
          onPress={() => console.log('Navigate to troubleshooting')}
        >
          <View style={styles.troubleshootingContent}>
            <View style={styles.troubleshootingHeader}>
              <Ionicons name="help-buoy-outline" size={24} color="#D97706" />
              <Text style={styles.troubleshootingTitle}>Bread Troubleshooter</Text>
            </View>
            <Text style={styles.troubleshootingDescription}>
              Having issues with your bread? Our AI-powered troubleshooter can help diagnose and solve common baking problems.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Educational Resources</Text>
        
        <TouchableOpacity
          style={styles.resourceCard}
          onPress={() => console.log('Navigate to glossary')}
        >
          <View style={styles.resourceContent}>
            <Text style={styles.resourceTitle}>Sourdough Baking Glossary</Text>
            <Text style={styles.resourceDescription}>
              Learn the terminology used in artisan bread baking
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.resourceCard}
          onPress={() => console.log('Navigate to techniques')}
        >
          <View style={styles.resourceContent}>
            <Text style={styles.resourceTitle}>Advanced Techniques</Text>
            <Text style={styles.resourceDescription}>
              Master sophisticated bread-making methods and skills
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // gray-50
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
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937', // gray-800
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  toolContent: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#1F2937', // gray-800
  },
  toolDescription: {
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
  troubleshootingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB', // amber-50
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7', // amber-100
  },
  troubleshootingContent: {
    flex: 1,
  },
  troubleshootingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  troubleshootingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E', // amber-800
    marginLeft: 8,
  },
  troubleshootingDescription: {
    fontSize: 14,
    color: '#92400E', // amber-800
    opacity: 0.8,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#1F2937', // gray-800
  },
  resourceDescription: {
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
  footer: {
    height: 40,
  },
});

export default ToolsScreen;