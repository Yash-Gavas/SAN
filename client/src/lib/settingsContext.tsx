import { createContext, useState, useContext, ReactNode, useEffect } from "react";

export type ThemeType = 'light' | 'dark' | 'system';
export type ColorScheme = 'blue' | 'purple' | 'emerald' | 'orange' | 'indigo';

interface UserProfile {
  displayName: string | null;
  email: string | null;
  avatar: string | null;
  notificationsEnabled: boolean;
}

interface SettingsContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colorScheme: ColorScheme;
  setColorScheme: (color: ColorScheme) => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  userProfile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const defaultUserProfile: UserProfile = {
  displayName: null,
  email: null,
  avatar: null,
  notificationsEnabled: true
};

const defaultSettings: SettingsContextType = {
  theme: 'light',
  setTheme: () => {},
  colorScheme: 'blue',
  setColorScheme: () => {},
  isSettingsOpen: false,
  openSettings: () => {},
  closeSettings: () => {},
  userProfile: defaultUserProfile,
  updateProfile: () => {}
};

const SettingsContext = createContext<SettingsContextType>(defaultSettings);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('light');
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('blue');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeType | null;
    const savedColorScheme = localStorage.getItem('colorScheme') as ColorScheme | null;
    const savedProfile = localStorage.getItem('userProfile');

    if (savedTheme) setThemeState(savedTheme);
    if (savedColorScheme) setColorSchemeState(savedColorScheme);
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (systemTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply color scheme
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-color-scheme', colorScheme);
    
    // Save to localStorage
    localStorage.setItem('colorScheme', colorScheme);
  }, [colorScheme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  const setColorScheme = (newColorScheme: ColorScheme) => {
    setColorSchemeState(newColorScheme);
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
  };

  const updateProfile = (profileUpdate: Partial<UserProfile>) => {
    const newProfile = { ...userProfile, ...profileUpdate };
    setUserProfile(newProfile);
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
  };

  const value = {
    theme,
    setTheme,
    colorScheme,
    setColorScheme,
    isSettingsOpen,
    openSettings,
    closeSettings,
    userProfile,
    updateProfile
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}