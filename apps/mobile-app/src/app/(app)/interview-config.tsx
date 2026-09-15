import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { NativeSelector, SelectorOption } from '@/components/NativeSelector';

const INTERVIEW_TYPES: SelectorOption[] = [
  { label: 'Technical', value: 'technical' },
  { label: 'HR', value: 'hr' },
];

const DIFFICULTIES: SelectorOption[] = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
];

export default function InterviewConfigScreen() {
  const router = useRouter();
  
  const [role, setRole] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ role?: string; type?: string; difficulty?: string }>({});

  const validate = () => {
    const newErrors: { role?: string; type?: string; difficulty?: string } = {};
    
    if (!role || role.trim().length < 2) {
      newErrors.role = 'Role must be at least 2 characters.';
    }
    if (!type) {
      newErrors.type = 'Please select an interview type.';
    }
    if (!difficulty) {
      newErrors.difficulty = 'Please select a difficulty.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      // Assuming a base URL from env or localhost for dev
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/interviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: role.trim(),
          type,
          difficulty,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create interview');
      }
      
      const data = await response.json();
      
      if (data.session_id) {
        router.push(`/interview/${data.session_id}` as Parameters<typeof router.push>[0]);
      } else {
        throw new Error('No session ID returned');
      }
    } catch (error) {
      console.error('Error submitting interview config:', error);
      Alert.alert('Error', 'Failed to start interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Configure Interview</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Role / Domain</Text>
          <TextInput
            style={[styles.input, errors.role && styles.inputError]}
            placeholder="e.g. Frontend Developer, Product Manager"
            placeholderTextColor="#6B6B8D"
            value={role}
            onChangeText={(text) => {
              setRole(text);
              if (errors.role) setErrors(e => ({ ...e, role: undefined }));
            }}
          />
          {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <NativeSelector
            label="Interview Type"
            options={INTERVIEW_TYPES}
            selectedValue={type}
            onSelect={(val) => {
              setType(val);
              if (errors.type) setErrors(e => ({ ...e, type: undefined }));
            }}
          />
          {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <NativeSelector
            label="Difficulty"
            options={DIFFICULTIES}
            selectedValue={difficulty}
            onSelect={(val) => {
              setDifficulty(val);
              if (errors.difficulty) setErrors(e => ({ ...e, difficulty: undefined }));
            }}
          />
          {errors.difficulty && <Text style={styles.errorText}>{errors.difficulty}</Text>}
        </View>
        
        <View style={styles.spacer} />

        <TouchableOpacity 
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Start Interview</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0D23',
  },
  scrollContainer: {
    padding: 24,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 32,
    marginTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1A1832',
    borderWidth: 1,
    borderColor: '#2A2842',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF453A',
  },
  errorText: {
    color: '#FF453A',
    fontSize: 14,
    marginTop: 8,
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  submitButtonDisabled: {
    backgroundColor: '#4A43A8',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
