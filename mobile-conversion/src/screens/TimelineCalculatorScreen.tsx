import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useBakerTools } from '../contexts/BakerToolsContext';
import Button from '../components/Button';
import Card from '../components/Card';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, addHours, addMinutes, differenceInMinutes, parse } from 'date-fns';

interface TimelineStep {
  id: string;
  name: string;
  duration: number; // in minutes
  startTime: Date;
  endTime: Date;
  isCompleted: boolean;
  notes?: string;
}

interface BakingMethod {
  id: string;
  name: string;
  description: string;
  steps: {
    id: string;
    name: string;
    description: string;
    defaultDuration: number; // in minutes
  }[];
}

// Sample baking methods
const bakingMethods: BakingMethod[] = [
  {
    id: 'basic-sourdough',
    name: 'Basic Sourdough',
    description: 'A simple sourdough method with bulk fermentation and overnight cold proof.',
    steps: [
      { id: 'levain', name: 'Build Levain', description: 'Mix starter with flour and water', defaultDuration: 240 },
      { id: 'autolyse', name: 'Autolyse', description: 'Mix flour and water, rest', defaultDuration: 60 },
      { id: 'mix', name: 'Add Levain & Salt', description: 'Incorporate levain and salt into dough', defaultDuration: 30 },
      { id: 'bulk', name: 'Bulk Fermentation', description: 'Allow dough to ferment with folds every 30 minutes', defaultDuration: 300 },
      { id: 'preshape', name: 'Pre-shape', description: 'Divide and pre-shape dough', defaultDuration: 30 },
      { id: 'bench', name: 'Bench Rest', description: 'Rest dough on the counter', defaultDuration: 30 },
      { id: 'shape', name: 'Final Shape', description: 'Shape dough and place in banneton', defaultDuration: 20 },
      { id: 'proof', name: 'Final Proof', description: 'Proof in the refrigerator', defaultDuration: 720 },
      { id: 'preheat', name: 'Preheat Oven', description: 'Preheat oven with Dutch oven inside', defaultDuration: 60 },
      { id: 'bake-covered', name: 'Bake (Covered)', description: 'Bake with lid on', defaultDuration: 25 },
      { id: 'bake-uncovered', name: 'Bake (Uncovered)', description: 'Remove lid and continue baking', defaultDuration: 20 },
      { id: 'cool', name: 'Cool', description: 'Allow bread to cool before slicing', defaultDuration: 120 },
    ],
  },
  {
    id: 'same-day-sourdough',
    name: 'Same-Day Sourdough',
    description: 'A quicker method for making sourdough bread in a single day.',
    steps: [
      { id: 'levain', name: 'Build Levain', description: 'Mix starter with flour and water', defaultDuration: 180 },
      { id: 'mix', name: 'Mix Dough', description: 'Combine all ingredients', defaultDuration: 20 },
      { id: 'fold1', name: 'Stretch & Fold #1', description: 'First set of stretch and folds', defaultDuration: 30 },
      { id: 'fold2', name: 'Stretch & Fold #2', description: 'Second set of stretch and folds', defaultDuration: 30 },
      { id: 'fold3', name: 'Stretch & Fold #3', description: 'Third set of stretch and folds', defaultDuration: 30 },
      { id: 'fold4', name: 'Stretch & Fold #4', description: 'Fourth set of stretch and folds', defaultDuration: 30 },
      { id: 'bulk', name: 'Finish Bulk Fermentation', description: 'Let dough finish fermenting', defaultDuration: 60 },
      { id: 'shape', name: 'Shape', description: 'Shape dough and place in banneton', defaultDuration: 20 },
      { id: 'proof', name: 'Final Proof', description: 'Warm proof at room temperature', defaultDuration: 120 },
      { id: 'preheat', name: 'Preheat Oven', description: 'Preheat oven with Dutch oven inside', defaultDuration: 45 },
      { id: 'bake-covered', name: 'Bake (Covered)', description: 'Bake with lid on', defaultDuration: 25 },
      { id: 'bake-uncovered', name: 'Bake (Uncovered)', description: 'Remove lid and continue baking', defaultDuration: 20 },
      { id: 'cool', name: 'Cool', description: 'Allow bread to cool before slicing', defaultDuration: 60 },
    ],
  },
];

const TimelineCalculatorScreen = () => {
  const { saveTimeline, getTimeline } = useBakerTools();
  const [selectedMethod, setSelectedMethod] = useState<BakingMethod>(bakingMethods[0]);
  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([]);
  const [bakingDate, setBakingDate] = useState<Date>(new Date());
  const [bakingTime, setBakingTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [workBackwards, setWorkBackwards] = useState(true);
  const [showNotificationToggle, setShowNotificationToggle] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Load saved timeline if exists
  useEffect(() => {
    const loadSavedTimeline = async () => {
      const saved = await getTimeline();
      if (saved && saved.steps && saved.steps.length > 0) {
        setTimelineSteps(saved.steps.map(step => ({
          ...step,
          startTime: new Date(step.startTime),
          endTime: new Date(step.endTime),
        })));
        
        if (saved.methodId) {
          const method = bakingMethods.find(m => m.id === saved.methodId);
          if (method) {
            setSelectedMethod(method);
          }
        }
        
        if (saved.bakingDate) {
          setBakingDate(new Date(saved.bakingDate));
        }
        
        if (saved.bakingTime) {
          setBakingTime(new Date(saved.bakingTime));
        }
        
        setWorkBackwards(saved.workBackwards || true);
        setEnableNotifications(saved.enableNotifications || false);
      }
    };
    
    loadSavedTimeline();
  }, []);

  // Calculate the timeline
  const calculateTimeline = () => {
    setIsCalculating(true);
    
    const combinedDateTime = new Date(
      bakingDate.getFullYear(),
      bakingDate.getMonth(),
      bakingDate.getDate(),
      bakingTime.getHours(),
      bakingTime.getMinutes()
    );

    let newTimelineSteps: TimelineStep[] = [];
    
    if (workBackwards) {
      // If working backwards, the last step (baking) ends at the specified time
      // We need to work backwards from this point
      let currentTime = new Date(combinedDateTime);
      
      // Reverse the steps for calculation
      const reversedSteps = [...selectedMethod.steps].reverse();
      
      reversedSteps.forEach((step, index) => {
        const endTime = new Date(currentTime);
        const startTime = new Date(currentTime);
        startTime.setMinutes(startTime.getMinutes() - step.defaultDuration);
        
        newTimelineSteps.unshift({
          id: step.id,
          name: step.name,
          duration: step.defaultDuration,
          startTime,
          endTime,
          isCompleted: false,
          notes: step.description,
        });
        
        // Set the currentTime to the start time for the next step
        currentTime = new Date(startTime);
      });
    } else {
      // If working forwards, the first step starts at the specified time
      // We need to work forwards from this point
      let currentTime = new Date(combinedDateTime);
      
      selectedMethod.steps.forEach((step) => {
        const startTime = new Date(currentTime);
        const endTime = new Date(currentTime);
        endTime.setMinutes(endTime.getMinutes() + step.defaultDuration);
        
        newTimelineSteps.push({
          id: step.id,
          name: step.name,
          duration: step.defaultDuration,
          startTime,
          endTime,
          isCompleted: false,
          notes: step.description,
        });
        
        // Set the currentTime to the end time for the next step
        currentTime = new Date(endTime);
      });
    }
    
    setTimelineSteps(newTimelineSteps);
    saveTimeline({
      methodId: selectedMethod.id,
      bakingDate: bakingDate.toISOString(),
      bakingTime: bakingTime.toISOString(),
      workBackwards,
      enableNotifications,
      steps: newTimelineSteps,
    });
    
    setIsCalculating(false);
    
    // Optionally schedule notifications
    if (enableNotifications) {
      // This would call a notification service to schedule all step reminders
      Alert.alert(
        'Notifications Scheduled',
        'You will receive notifications for each baking step.',
        [{ text: 'OK' }]
      );
    }
  };

  // Toggle a step's completion status
  const toggleStepCompletion = (stepId: string) => {
    const updatedSteps = timelineSteps.map(step => 
      step.id === stepId ? { ...step, isCompleted: !step.isCompleted } : step
    );
    setTimelineSteps(updatedSteps);
    
    // Save the updated timeline
    saveTimeline({
      methodId: selectedMethod.id,
      bakingDate: bakingDate.toISOString(),
      bakingTime: bakingTime.toISOString(),
      workBackwards,
      enableNotifications,
      steps: updatedSteps,
    });
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  // Format time for display
  const formatTime = (date: Date): string => {
    return format(date, 'h:mm a');
  };

  // Render a timeline step card
  const renderTimelineStep = (step: TimelineStep, index: number) => {
    const isFirst = index === 0;
    const isLast = index === timelineSteps.length - 1;
    
    return (
      <View key={step.id} style={styles.timelineStepContainer}>
        {/* Timeline connector line */}
        {!isFirst && (
          <View style={styles.timelineConnectorTop}></View>
        )}
        
        {/* Timeline dot */}
        <View style={[
          styles.timelineDot,
          step.isCompleted ? styles.timelineDotCompleted : {}
        ]}>
          {step.isCompleted && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>
        
        {/* Timeline connector line */}
        {!isLast && (
          <View style={styles.timelineConnectorBottom}></View>
        )}
        
        {/* Step card */}
        <Card 
          style={[
            styles.timelineStepCard,
            step.isCompleted ? styles.timelineStepCardCompleted : {}
          ]} 
          elevation={1}
        >
          <TouchableOpacity 
            style={styles.stepCheckbox}
            onPress={() => toggleStepCompletion(step.id)}
          >
            <Ionicons
              name={step.isCompleted ? "checkmark-circle" : "ellipse-outline"}
              size={24}
              color={step.isCompleted ? "#10B981" : "#6B7280"}
            />
          </TouchableOpacity>
          
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepName}>{step.name}</Text>
              <Text style={styles.stepDuration}>{step.duration} min</Text>
            </View>
            
            <Text style={styles.stepDescription}>{step.notes}</Text>
            
            <View style={styles.stepTimes}>
              <View style={styles.stepTimeBlock}>
                <Text style={styles.stepTimeLabel}>Start</Text>
                <Text style={styles.stepTimeValue}>{formatTime(step.startTime)}</Text>
                <Text style={styles.stepDateValue}>{formatDate(step.startTime)}</Text>
              </View>
              
              <Ionicons name="arrow-forward" size={16} color="#9CA3AF" style={styles.stepTimesArrow} />
              
              <View style={styles.stepTimeBlock}>
                <Text style={styles.stepTimeLabel}>End</Text>
                <Text style={styles.stepTimeValue}>{formatTime(step.endTime)}</Text>
                <Text style={styles.stepDateValue}>{formatDate(step.endTime)}</Text>
              </View>
            </View>
          </View>
        </Card>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Baking Timeline Calculator</Text>
        </View>
        
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Method Selection */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Baking Method</Text>
            <View style={styles.methodButtonsContainer}>
              {bakingMethods.map(method => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodButton,
                    selectedMethod.id === method.id && styles.methodButtonActive
                  ]}
                  onPress={() => setSelectedMethod(method)}
                >
                  <Text 
                    style={[
                      styles.methodButtonText,
                      selectedMethod.id === method.id && styles.methodButtonTextActive
                    ]}
                  >
                    {method.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.methodDescription}>
              {selectedMethod.description}
            </Text>
          </Card>
          
          {/* Timing Configuration */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Timing Configuration</Text>
            
            <View style={styles.directionToggleContainer}>
              <Text style={styles.directionLabel}>
                {workBackwards 
                  ? 'Working backwards from bake time' 
                  : 'Working forwards from start time'}
              </Text>
              <Switch
                trackColor={{ false: '#E5E7EB', true: '#FEF3C7' }}
                thumbColor={workBackwards ? '#D97706' : '#9CA3AF'}
                onValueChange={() => setWorkBackwards(!workBackwards)}
                value={workBackwards}
              />
            </View>
            
            <Text style={styles.inputLabel}>
              {workBackwards ? 'When do you want to bake?' : 'When do you want to start?'}
            </Text>
            
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity 
                style={styles.dateTimeInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <Text style={styles.dateTimeText}>{formatDate(bakingDate)}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.dateTimeInput}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <Text style={styles.dateTimeText}>{formatTime(bakingTime)}</Text>
              </TouchableOpacity>
            </View>
            
            {showDatePicker && (
              <DateTimePicker
                value={bakingDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setBakingDate(selectedDate);
                  }
                }}
              />
            )}
            
            {showTimePicker && (
              <DateTimePicker
                value={bakingTime}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowTimePicker(false);
                  if (selectedDate) {
                    setBakingTime(selectedDate);
                  }
                }}
              />
            )}
            
            <View style={styles.notificationsContainer}>
              <Text style={styles.notificationsLabel}>Enable step notifications</Text>
              <Switch
                trackColor={{ false: '#E5E7EB', true: '#FEF3C7' }}
                thumbColor={enableNotifications ? '#D97706' : '#9CA3AF'}
                onValueChange={() => setEnableNotifications(!enableNotifications)}
                value={enableNotifications}
              />
            </View>
          </Card>
          
          {/* Calculate button */}
          <Button
            title="Calculate Timeline"
            iconName="calculator-outline"
            variant="primary"
            onPress={calculateTimeline}
            style={styles.calculateButton}
          />
          
          {/* Timeline Results */}
          {timelineSteps.length > 0 && (
            <View style={styles.timelineContainer}>
              <Text style={styles.timelineTitle}>Your Baking Timeline</Text>
              <Text style={styles.timelineSubtitle}>
                {workBackwards
                  ? `To finish baking at ${formatTime(bakingTime)} on ${formatDate(bakingDate)}`
                  : `Starting at ${formatTime(bakingTime)} on ${formatDate(bakingDate)}`}
              </Text>
              
              {/* Timeline steps */}
              <View style={styles.timelineStepsContainer}>
                {timelineSteps.map((step, index) => renderTimelineStep(step, index))}
              </View>
              
              {/* Export buttons */}
              <View style={styles.exportButtonsContainer}>
                <Button
                  title="Add to Calendar"
                  iconName="calendar-outline"
                  variant="outline"
                  size="small"
                  onPress={() => {
                    Alert.alert(
                      'Add to Calendar',
                      'This will add all baking steps to your calendar.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'OK', onPress: () => {
                          Alert.alert('Added to Calendar', 'All baking steps have been added to your calendar.');
                        }}
                      ]
                    );
                  }}
                  style={styles.exportButton}
                />
                
                <Button
                  title="Share Timeline"
                  iconName="share-outline"
                  variant="outline"
                  size="small"
                  onPress={() => {
                    Alert.alert(
                      'Share Timeline',
                      'Your baking timeline will be shared as a text summary.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'OK', onPress: () => {
                          // Here we would use React Native's Share API
                          Alert.alert('Timeline Shared', 'Your timeline has been shared.');
                        }}
                      ]
                    );
                  }}
                  style={styles.exportButton}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  methodButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  methodButton: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  methodButtonActive: {
    backgroundColor: '#FEF3C7',
  },
  methodButtonText: {
    color: '#4B5563',
    fontWeight: '500',
  },
  methodButtonTextActive: {
    color: '#92400E',
  },
  methodDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  directionToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  directionLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateTimeInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    marginRight: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#1F2937',
  },
  notificationsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationsLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  calculateButton: {
    marginVertical: 16,
  },
  timelineContainer: {
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  timelineSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  timelineStepsContainer: {
    position: 'relative',
  },
  timelineStepContainer: {
    flexDirection: 'row',
    position: 'relative',
    paddingLeft: 24,
    marginBottom: 16,
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1D5DB',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: '#10B981',
  },
  timelineConnectorTop: {
    position: 'absolute',
    left: 11,
    top: 0,
    width: 2,
    height: 16,
    backgroundColor: '#E5E7EB',
  },
  timelineConnectorBottom: {
    position: 'absolute',
    left: 11,
    top: 40,
    width: 2,
    bottom: 0,
    backgroundColor: '#E5E7EB',
  },
  timelineStepCard: {
    flex: 1,
    marginLeft: 16,
    flexDirection: 'row',
  },
  timelineStepCardCompleted: {
    borderLeftColor: '#10B981',
    borderLeftWidth: 3,
  },
  stepCheckbox: {
    padding: 8,
  },
  stepContent: {
    flex: 1,
    padding: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  stepDuration: {
    fontSize: 14,
    color: '#6B7280',
  },
  stepDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  stepTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    padding: 8,
  },
  stepTimeBlock: {
    flex: 1,
  },
  stepTimesArrow: {
    marginHorizontal: 4,
  },
  stepTimeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  stepTimeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  stepDateValue: {
    fontSize: 12,
    color: '#6B7280',
  },
  exportButtonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  exportButton: {
    flex: 1,
    marginRight: 8,
  },
});

export default TimelineCalculatorScreen;