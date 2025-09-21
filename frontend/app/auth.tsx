import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      
      // Mock authentication - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store user session
      await AsyncStorage.setItem('userSession', JSON.stringify({
        email: data.email,
        loginTime: new Date().toISOString(),
      }));
      
      // Navigate to main app
      router.replace('/');
    } catch (error) {
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      
      // Mock user creation - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store user session
      await AsyncStorage.setItem('userSession', JSON.stringify({
        username: data.username,
        email: data.email,
        loginTime: new Date().toISOString(),
      }));
      
      Alert.alert(
        'Welcome to Visibee!',
        'Your account has been created successfully.',
        [{ text: 'Get Started', onPress: () => router.replace('/') }]
      );
    } catch (error) {
      Alert.alert('Signup Failed', 'Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    loginForm.reset();
    signupForm.reset();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Background Elements */}
          <View style={styles.backgroundElements}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
            <View style={[styles.dressIcon, styles.dressPosition]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Ionicons name="shirt" size={32} color="white" />
              </View>
              <Text style={styles.title}>Visibee</Text>
              <Text style={styles.subtitle}>Your Friendly E-Wardrobe</Text>
            </View>
            
            <Text style={styles.welcomeText}>
              {isLogin ? 'Welcome back!' : 'Join the Visibee community!'}
            </Text>
            <Text style={styles.description}>
              {isLogin 
                ? 'Sign in to access your wardrobe and style insights'
                : 'Create your account to start organizing your wardrobe with AI'
              }
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, isLogin && styles.tabActive]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.tabActive]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {isLogin ? (
              // Login Form
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <Controller
                    control={loginForm.control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.inputContainer}>
                        <Ionicons name="mail" size={20} color="#9ca3af" style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, loginForm.formState.errors.email && styles.inputError]}
                          placeholder="Enter your email"
                          value={value}
                          onChangeText={onChange}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                    )}
                  />
                  {loginForm.formState.errors.email && (
                    <Text style={styles.errorText}>{loginForm.formState.errors.email.message}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <Controller
                    control={loginForm.control}
                    name="password"
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed" size={20} color="#9ca3af" style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, loginForm.formState.errors.password && styles.inputError]}
                          placeholder="Enter your password"
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry={!showPassword}
                          placeholderTextColor="#9ca3af"
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeIcon}
                        >
                          <Ionicons 
                            name={showPassword ? "eye-off" : "eye"} 
                            size={20} 
                            color="#9ca3af" 
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {loginForm.formState.errors.password && (
                    <Text style={styles.errorText}>{loginForm.formState.errors.password.message}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                  onPress={loginForm.handleSubmit(handleLogin)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              // Signup Form
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Username</Text>
                  <Controller
                    control={signupForm.control}
                    name="username"
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.inputContainer}>
                        <Ionicons name="person" size={20} color="#9ca3af" style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, signupForm.formState.errors.username && styles.inputError]}
                          placeholder="Choose a username"
                          value={value}
                          onChangeText={onChange}
                          autoCapitalize="none"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                    )}
                  />
                  {signupForm.formState.errors.username && (
                    <Text style={styles.errorText}>{signupForm.formState.errors.username.message}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <Controller
                    control={signupForm.control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.inputContainer}>
                        <Ionicons name="mail" size={20} color="#9ca3af" style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, signupForm.formState.errors.email && styles.inputError]}
                          placeholder="Enter your email"
                          value={value}
                          onChangeText={onChange}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                    )}
                  />
                  {signupForm.formState.errors.email && (
                    <Text style={styles.errorText}>{signupForm.formState.errors.email.message}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <Controller
                    control={signupForm.control}
                    name="password"
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed" size={20} color="#9ca3af" style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, signupForm.formState.errors.password && styles.inputError]}
                          placeholder="Create a password"
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry={!showPassword}
                          placeholderTextColor="#9ca3af"
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeIcon}
                        >
                          <Ionicons 
                            name={showPassword ? "eye-off" : "eye"} 
                            size={20} 
                            color="#9ca3af" 
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {signupForm.formState.errors.password && (
                    <Text style={styles.errorText}>{signupForm.formState.errors.password.message}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <Controller
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field: { onChange, value } }) => (
                      <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed" size={20} color="#9ca3af" style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, signupForm.formState.errors.confirmPassword && styles.inputError]}
                          placeholder="Confirm your password"
                          value={value}
                          onChangeText={onChange}
                          secureTextEntry={!showPassword}
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                    )}
                  />
                  {signupForm.formState.errors.confirmPassword && (
                    <Text style={styles.errorText}>{signupForm.formState.errors.confirmPassword.message}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                  onPress={signupForm.handleSubmit(handleSignup)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>Create Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={toggleMode}>
                <Text style={styles.footerLink}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Skip Option for Testing */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.1,
  },
  circle1: {
    width: 300,
    height: 300,
    backgroundColor: '#ec4899',
    top: -150,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    backgroundColor: '#8b5cf6',
    top: 50,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    backgroundColor: '#06b6d4',
    top: 200,
    right: 50,
  },
  header: {
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 32,
    paddingHorizontal: 32,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#1f2937',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  eyeIcon: {
    padding: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
});