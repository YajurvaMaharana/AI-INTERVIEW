import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface SelectorOption {
  label: string;
  value: string;
}

interface NativeSelectorProps {
  options: SelectorOption[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  label: string;
}

export function NativeSelector({ options, selectedValue, onSelect, label }: NativeSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.chip,
              selectedValue === option.value && styles.chipSelected
            ]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.chipText,
              selectedValue === option.value && styles.chipTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#E0E0E0',
  },
  scrollContent: {
    gap: 12,
    paddingRight: 20,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#1A1832',
    borderWidth: 1,
    borderColor: '#2A2842',
  },
  chipSelected: {
    backgroundColor: '#6C63FF',
    borderColor: '#8A84FF',
  },
  chipText: {
    fontSize: 15,
    color: '#A0A0C0',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
