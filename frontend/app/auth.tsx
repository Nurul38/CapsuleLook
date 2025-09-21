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
            <View style={[styles.wardrobeIllustration]} />
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <View style={styles.hangerIcon}>
                  <Text style={styles.hangerText}>👗</Text>
                  <Text style={styles.beeEmoji}>🐝</Text>
                </View>
              </View>
              <Text style={styles.heroTitle}>Visibee</Text>
              <Text style={styles.heroSubtitle}>Unlock Your Wardrobe's Full Potential</Text>
              <Text style={styles.tagline}>Your Style, Perfectly Organized.</Text>
            </View>
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
    backgroundColor: '#FFFAF0', // Creamy White
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
    opacity: 0.12,
  },
  circle1: {
    width: 280,
    height: 280,
    backgroundColor: '#E6E6FA', // Soft Lavender
    top: -140,
    right: -80,
  },
  circle2: {
    width: 180,
    height: 180,
    backgroundColor: '#FFDAB9', // Miffed Pink
    top: 60,
    left: -60,
  },
  circle3: {
    width: 120,
    height: 120,
    backgroundColor: '#B76E79', // Rose Gold
    top: 180,
    right: 40,
  },
  wardrobeIllustration: {
    position: 'absolute',
    top: 120,
    right: 30,
    width: 100,
    height: 120,
    opacity: 0.15,
    backgroundColor: '#E6E6FA',
    borderRadius: 12,
    // Simple wardrobe silhouette
    borderWidth: 2,
    borderColor: '#B76E79',
  },
  heroSection: {
    background: 'linear-gradient(135deg, #FFFAF0 0%, #E6E6FA 100%)',
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
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#FFFAF0', // Creamy White
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#B76E79', // Rose Gold border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  hangerIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  hangerBar: {
    transform: [{ rotate: '0deg' }],
  },
  hangerHook: {
    position: 'absolute',
    top: -8,
    width: 2,
    height: 12,
    backgroundColor: '#B76E79',
    borderRadius: 1,
  },
  beeWing: {
    position: 'absolute',
    top: -4,
    right: -12,
  },
  beeEmoji: {
    fontSize: 14,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#B76E79', // Rose Gold
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 38,
    letterSpacing: -0.8,
    // Would use elegant serif font like Playfair Display in production
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#4B0082', // Deep Plum
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
    fontWeight: '500',
    // Would use clean sans-serif font like Montserrat in production
  },
  tagline: {
    fontSize: 14,
    color: '#B76E79', // Rose Gold
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFAF0', // Creamy White
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 32,
    paddingHorizontal: 32,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E6E6FA', // Soft Lavender
    borderRadius: 16,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#B76E79', // Rose Gold
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B0082', // Deep Plum
  },
  tabTextActive: {
    color: '#FFFAF0', // Creamy White
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B0082', // Deep Plum
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E6E6FA', // Soft Lavender
    borderRadius: 14,
    backgroundColor: '#FFFAF0', // Creamy White
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
    color: '#B76E79', // Rose Gold
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    color: '#4B0082', // Deep Plum
  },
  inputError: {
    borderColor: '#B76E79', // Use Rose Gold instead of red for softer feel
  },
  eyeIcon: {
    padding: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#B76E79', // Rose Gold instead of harsh red
    marginTop: 6,
  },
  submitButton: {
    backgroundColor: '#B76E79', // Rose Gold
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#FFDAB9', // Miffed Pink when disabled
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFAF0', // Creamy White
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  footerText: {
    fontSize: 14,
    color: '#4B0082', // Deep Plum
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B76E79', // Rose Gold
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 14,
    color: '#B76E79', // Rose Gold
    fontWeight: '500',
  },
});