import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  hiddenSubjects: string[];
  notifications: boolean;
  completedAssignments: string[];
  assignmentNotes: Record<string, string>;
  customDates: Record<string, string>; // assignmentId -> new date
}

const defaultSettings: Settings = {
  theme: 'system',
  hiddenSubjects: [],
  notifications: true,
  completedAssignments: [],
  assignmentNotes: {},
  customDates: {},
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  toggleCompleted: (assignmentId: string) => void;
  isCompleted: (assignmentId: string) => boolean;
  setAssignmentNote: (assignmentId: string, note: string) => void;
  getAssignmentNote: (assignmentId: string) => string;
  setCustomDate: (assignmentId: string, date: string) => void;
  getCustomDate: (assignmentId: string) => string | undefined;
  toggleHiddenSubject: (subject: string) => void;
  isSubjectHidden: (subject: string) => boolean;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<Settings>('calendar-settings', defaultSettings);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (settings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const toggleCompleted = (assignmentId: string) => {
    setSettings(prev => {
      const completed = prev.completedAssignments.includes(assignmentId)
        ? prev.completedAssignments.filter(id => id !== assignmentId)
        : [...prev.completedAssignments, assignmentId];
      return { ...prev, completedAssignments: completed };
    });
  };

  const isCompleted = (assignmentId: string) => {
    return settings.completedAssignments.includes(assignmentId);
  };

  const setAssignmentNote = (assignmentId: string, note: string) => {
    setSettings(prev => ({
      ...prev,
      assignmentNotes: { ...prev.assignmentNotes, [assignmentId]: note }
    }));
  };

  const getAssignmentNote = (assignmentId: string) => {
    return settings.assignmentNotes[assignmentId] || '';
  };

  const setCustomDate = (assignmentId: string, date: string) => {
    setSettings(prev => ({
      ...prev,
      customDates: { ...prev.customDates, [assignmentId]: date }
    }));
  };

  const getCustomDate = (assignmentId: string) => {
    return settings.customDates[assignmentId];
  };

  const toggleHiddenSubject = (subject: string) => {
    setSettings(prev => {
      const hidden = prev.hiddenSubjects.includes(subject)
        ? prev.hiddenSubjects.filter(s => s !== subject)
        : [...prev.hiddenSubjects, subject];
      return { ...prev, hiddenSubjects: hidden };
    });
  };

  const isSubjectHidden = (subject: string) => {
    return settings.hiddenSubjects.includes(subject);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      toggleCompleted,
      isCompleted,
      setAssignmentNote,
      getAssignmentNote,
      setCustomDate,
      getCustomDate,
      toggleHiddenSubject,
      isSubjectHidden,
      resetSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
