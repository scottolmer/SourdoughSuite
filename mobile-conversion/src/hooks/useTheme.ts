import { useColorScheme } from 'react-native';
import theme from '../utils/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

// Theme preferences type
type ThemePreference = 'light' | 'dark' | 'system';

/**
 * Hook for accessing the current theme and managing theme preferences
 * 
 * @returns Theme object and theme control functions
 */
export function useTheme() {
  // Get the device color scheme
  const deviceColorScheme = useColorScheme();
  
  // State for the user's theme preference
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  
  // Determine the actual theme mode based on preference and device scheme
  const themeMode = themePreference === 'system' 
    ? deviceColorScheme || 'light'
    : themePreference;
  
  // Load the user's theme preference from storage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem('themePreference');
        if (storedPreference && (
          storedPreference === 'light' || 
          storedPreference === 'dark' || 
          storedPreference === 'system'
        )) {
          setThemePreference(storedPreference as ThemePreference);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, []);
  
  // Function to change the theme preference
  const setTheme = async (newTheme: ThemePreference) => {
    try {
      await AsyncStorage.setItem('themePreference', newTheme);
      setThemePreference(newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };
  
  // Creates a dark theme version of the default theme
  const darkTheme = {
    ...theme,
    colors: {
      ...theme.colors,
      // Override the specific dark mode colors
      gray: {
        50: '#18191A', // Dark mode background
        100: '#242526', // Dark mode card background
        200: '#3A3B3C', // Dark mode borders
        300: '#4E4F50', // Dark mode disabled
        400: '#6A6C6D', // Dark mode disabled text
        500: '#B0B3B8', // Dark mode secondary text
        600: '#D8DADF', // Dark mode text
        700: '#E4E6EB', // Dark mode primary text
        800: '#F0F2F5', // Dark mode highlight
        900: '#FFFFFF', // Dark mode extra highlight
      },
    },
    componentTheme: {
      ...theme.componentTheme,
      // Update component theming for dark mode
      card: {
        ...theme.componentTheme.card,
        backgroundColor: theme.colors.gray[100], // Dark mode equivalent
        borderColor: theme.colors.gray[200], // Dark mode equivalent
      },
      input: {
        ...theme.componentTheme.input,
        backgroundColor: theme.colors.gray[100], // Dark mode equivalent
        borderColor: theme.colors.gray[200], // Dark mode equivalent
        textColor: theme.colors.gray[700], // Dark mode equivalent
      },
    },
  };
  
  // Return the appropriate theme based on the current mode
  return {
    theme: themeMode === 'dark' ? darkTheme : theme,
    themeMode,
    themePreference,
    setTheme,
    isDarkMode: themeMode === 'dark',
  };
}

export default useTheme;