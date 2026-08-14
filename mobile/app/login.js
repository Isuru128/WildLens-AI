import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import API from '../src/services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;

export default function LoginPage() {
    const router = useRouter();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleIdentifierChange = (value) => {
        /*
         * Limit the input to 10 characters when the user
         * enters only numbers. Otherwise, treat it as an email.
         */
        if (/^\d*$/.test(value)) {
            setIdentifier(value.slice(0, 10));
        } else {
            setIdentifier(value);
        }
    };

    const handleLogin = async () => {
        const loginIdentifier = identifier.trim();

        if (!loginIdentifier || !password) {
            Alert.alert(
                'Missing information',
                'Please enter your email address or mobile number and password.'
            );

            return;
        }

        const isOnlyNumbers = /^\d+$/.test(loginIdentifier);

        if (isOnlyNumbers && !PHONE_REGEX.test(loginIdentifier)) {
            Alert.alert(
                'Invalid mobile number',
                'Your mobile number must contain exactly 10 digits.'
            );

            return;
        }

        if (
            !isOnlyNumbers &&
            !EMAIL_REGEX.test(loginIdentifier.toLowerCase())
        ) {
            Alert.alert(
                'Invalid email address',
                'Please enter a valid email address or a 10-digit mobile number.'
            );

            return;
        }

        try {
            setLoading(true);

            const response = await API.post('/auth/login', {
                identifier: loginIdentifier,
                password
            });

            const { token, user } = response.data;

            if (!token || !user) {
                Alert.alert(
                    'Login error',
                    'An invalid response was received from the server.'
                );

                return;
            }

            await AsyncStorage.multiSet([
                ['token', token],
                ['user', JSON.stringify(user)]
            ]);

            if (user.role === 'admin') {
                router.replace('/admin/dashboard');
            } else {
                router.replace('/user/dashboard');
            }
        } catch (error) {
            console.error(
                'Login error:',
                error.response?.data || error.message
            );

            const message =
                error.response?.data?.msg ||
                error.response?.data?.message ||
                'Login failed. Please check your details and try again.';

            Alert.alert('Unable to log in', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#102A25"
            />

            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    {/* Hero section */}
                    <View style={styles.hero}>
                        <View style={styles.heroGlowOne} />
                        <View style={styles.heroGlowTwo} />

                        <View style={styles.brandRow}>
                            <View style={styles.brandIcon}>
                                <Ionicons
                                    name="leaf"
                                    size={20}
                                    color="#FFFFFF"
                                />
                            </View>

                            <Text style={styles.brandName}>WILD LENS</Text>
                        </View>

                        <View style={styles.heroContent}>
                            <View style={styles.heroTextContainer}>
                                <View style={styles.exploreBadge}>
                                    <Ionicons
                                        name="compass-outline"
                                        size={14}
                                        color="#D9F99D"
                                    />

                                    <Text style={styles.exploreBadgeText}>
                                        EXPLORE THE WILD
                                    </Text>
                                </View>

                                <Text style={styles.heroTitle}>
                                    Nature is{'\n'}
                                    <Text style={styles.heroTitleAccent}>
                                        waiting.
                                    </Text>
                                </Text>

                                <Text style={styles.heroDescription}>
                                    Discover remarkable wildlife and capture
                                    every unforgettable moment.
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Login form card */}
                    <View style={styles.formCard}>
                        <View style={styles.formHeading}>
                            <Text style={styles.title}>Welcome back</Text>

                            <Text style={styles.subtitle}>
                                Sign in to continue your wildlife journey.
                            </Text>
                        </View>

                        <Text style={styles.label}>
                            Email or mobile number
                        </Text>

                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="person-outline"
                                size={21}
                                color="#6B7F78"
                                style={styles.inputIcon}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Email address or phone number"
                                placeholderTextColor="#98A6A1"
                                value={identifier}
                                onChangeText={handleIdentifierChange}
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="email-address"
                                textContentType="username"
                                autoComplete="username"
                                editable={!loading}
                                returnKeyType="next"
                                selectionColor="#2F795F"
                                accessibilityLabel="Email or mobile number"
                            />
                        </View>

                        <Text style={[styles.label, styles.passwordLabel]}>Password</Text>

                        <View style={styles.inputContainer}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={21}
                                color="#6B7F78"
                                style={styles.inputIcon}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#98A6A1"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="password"
                                autoComplete="password"
                                editable={!loading}
                                returnKeyType="done"
                                onSubmitEditing={handleLogin}
                                selectionColor="#2F795F"
                                accessibilityLabel="Password"
                            />

                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() =>
                                    setShowPassword((current) => !current)
                                }
                                disabled={loading}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel={
                                    showPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }
                            >
                                <Ionicons
                                    name={
                                        showPassword
                                            ? 'eye-off-outline'
                                            : 'eye-outline'
                                    }
                                    size={22}
                                    color="#6B7F78"
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.loginButton,
                                loading && styles.disabledButton
                            ]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                        >
                            {loading ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                />
                            ) : (
                                <View style={styles.buttonContent}>
                                    <Text style={styles.loginButtonText}>
                                        Sign in
                                    </Text>

                                    <Ionicons
                                        name="arrow-forward"
                                        size={20}
                                        color="#FFFFFF"
                                    />
                                </View>
                            )}
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />

                            <Text style={styles.dividerText}>
                                NEW TO WILD LENS?
                            </Text>

                            <View style={styles.divider} />
                        </View>

                        <TouchableOpacity
                            style={styles.registerButton}
                            onPress={() => router.push('/register')}
                            disabled={loading}
                            activeOpacity={0.8}
                            accessibilityRole="button"
                        >
                            <Ionicons
                                name="person-add-outline"
                                size={19}
                                color="#225B48"
                            />

                            <Text style={styles.registerButtonText}>
                                Create an account
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.securityMessage}>
                            <Ionicons
                                name="shield-checkmark-outline"
                                size={16}
                                color="#73847E"
                            />

                            <Text style={styles.securityMessageText}>
                                Your account information is securely protected.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#102A25'
    },

    keyboardContainer: {
        flex: 1
    },

    scrollContent: {
        flexGrow: 1,
        backgroundColor: '#F4F7F5'
    },

    hero: {
        minHeight: 315,
        paddingTop: 18,
        paddingHorizontal: 22,
        backgroundColor: '#102A25',
        overflow: 'hidden'
    },

    heroGlowOne: {
        position: 'absolute',
        top: -80,
        right: -70,
        width: 230,
        height: 230,
        borderRadius: 115,
        backgroundColor: 'rgba(89, 143, 107, 0.20)'
    },

    heroGlowTwo: {
        position: 'absolute',
        bottom: -110,
        left: -90,
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: 'rgba(208, 228, 154, 0.08)'
    },

    brandRow: {
        zIndex: 2,
        flexDirection: 'row',
        alignItems: 'center'
    },

    brandIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3D8064'
    },

    brandName: {
        marginLeft: 10,
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '900',
        letterSpacing: 2
    },

    heroContent: {
        flex: 1,
        paddingTop: 16,
        paddingBottom: 10
    },

    heroTextContainer: {
        zIndex: 2,
        width: '100%',
        paddingBottom: 20
    },

    exploreBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.09)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        marginBottom: 13
    },

    exploreBadgeText: {
        marginLeft: 5,
        color: '#D9F99D',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1
    },

    heroTitle: {
        color: '#FFFFFF',
        fontSize: 32,
        lineHeight: 38,
        fontWeight: '900',
        letterSpacing: -1
    },

    heroTitleAccent: {
        color: '#CFE8A9'
    },

    heroDescription: {
        marginTop: 10,
        color: '#BFCFC9',
        fontSize: 13,
        lineHeight: 19
    },

    formCard: {
        flex: 1,
        marginTop: -25,
        paddingTop: 28,
        paddingHorizontal: 22,
        paddingBottom: 30,
        backgroundColor: '#F8FAF9',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30
    },

    formHeading: {
        marginBottom: 25
    },

    title: {
        color: '#172A24',
        fontSize: 27,
        fontWeight: '900',
        letterSpacing: -0.5
    },

    subtitle: {
        color: '#75837E',
        fontSize: 14,
        lineHeight: 20,
        marginTop: 6
    },

    label: {
        color: '#293C35',
        fontSize: 13,
        fontWeight: '800',
        marginBottom: 8
    },

    passwordLabel: {
        marginTop: 17
    },

    inputContainer: {
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#DDE6E1',
        borderRadius: 16,
        shadowColor: '#14392C',
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2
    },

    inputIcon: {
        marginLeft: 16
    },

    input: {
        flex: 1,
        minHeight: 56,
        paddingHorizontal: 12,
        paddingVertical: 14,
        color: '#172A24',
        fontSize: 15
    },

    eyeButton: {
        width: 52,
        height: 54,
        alignItems: 'center',
        justifyContent: 'center'
    },

    loginButton: {
        minHeight: 56,
        marginTop: 24,
        paddingHorizontal: 20,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#225B48',
        shadowColor: '#225B48',
        shadowOffset: {
            width: 0,
            height: 8
        },
        shadowOpacity: 0.23,
        shadowRadius: 12,
        elevation: 6
    },

    disabledButton: {
        opacity: 0.62
    },

    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    loginButtonText: {
        marginRight: 9,
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '900'
    },

    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 22
    },

    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#DFE7E3'
    },

    dividerText: {
        marginHorizontal: 12,
        color: '#8B9893',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.8
    },

    registerButton: {
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#B9CCC4',
        borderRadius: 16,
        backgroundColor: '#EFF5F2'
    },

    registerButtonText: {
        marginLeft: 9,
        color: '#225B48',
        fontSize: 14,
        fontWeight: '900'
    },

    securityMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 19
    },

    securityMessageText: {
        marginLeft: 6,
        color: '#73847E',
        fontSize: 11
    }
});