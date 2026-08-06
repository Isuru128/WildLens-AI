import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';

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
         * When the user enters only numbers, limit the value
         * to a maximum of 10 digits.
         *
         * Otherwise, allow the value as an email address.
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
                'Validation Error',
                'Please enter your email/mobile number and password'
            );

            return;
        }

        const isOnlyNumbers = /^\d+$/.test(loginIdentifier);

        if (isOnlyNumbers && !PHONE_REGEX.test(loginIdentifier)) {
            Alert.alert(
                'Validation Error',
                'Mobile number must be exactly 10 digits'
            );

            return;
        }

        if (
            !isOnlyNumbers &&
            !EMAIL_REGEX.test(loginIdentifier.toLowerCase())
        ) {
            Alert.alert(
                'Validation Error',
                'Please enter a valid email address or 10-digit mobile number'
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
                    'Login Error',
                    'Invalid response received from the server'
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
                'Login failed. Please check your details and try again.';

            Alert.alert('Login Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.container}>
                <Text style={styles.logo}>
                    Wild Lens
                </Text>

                <Text style={styles.title}>
                    Welcome Back
                </Text>

                <Text style={styles.subtitle}>
                    Login using your email address or phone number
                </Text>

                <Text style={styles.label}>
                    Email or Phone Number
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email / Phone"
                    placeholderTextColor="#9ca3af"
                    value={identifier}
                    onChangeText={handleIdentifierChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="username"
                    editable={!loading}
                    returnKeyType="next"
                />

                <Text style={styles.label}>
                    Password
                </Text>

                <View style={styles.passwordField}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Enter your password"
                        placeholderTextColor="#9ca3af"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="password"
                        editable={!loading}
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
                    />

                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() =>
                            setShowPassword((current) => !current)
                        }
                        disabled={loading}
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
                            color="#6b7280"
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[
                        styles.button,
                        loading && styles.disabledButton
                    ]}
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            Login
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/register')}
                    disabled={loading}
                >
                    <Text style={styles.link}>
                        Don&apos;t have an account? Create account
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardContainer: {
        flex: 1
    },

    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#f5f7fb'
    },

    logo: {
        fontSize: 30,
        fontWeight: '900',
        color: '#2563eb',
        textAlign: 'center',
        marginBottom: 8
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 6
    },

    subtitle: {
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 28
    },

    label: {
        color: '#374151',
        fontWeight: '700',
        marginBottom: 7
    },

    input: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        color: '#111827'
    },

    passwordField: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center'
    },

    passwordInput: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 14,
        color: '#111827'
    },

    eyeButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center'
    },

    button: {
        minHeight: 50,
        backgroundColor: '#2563eb',
        padding: 15,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center'
    },

    disabledButton: {
        opacity: 0.65
    },

    buttonText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 16
    },

    link: {
        textAlign: 'center',
        marginTop: 18,
        color: '#16a34a',
        fontWeight: '700'
    }
});