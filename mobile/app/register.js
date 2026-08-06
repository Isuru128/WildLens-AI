import {
    ScrollView,
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
import { Ionicons } from '@expo/vector-icons';

import API from '../src/services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;

export default function RegisterPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: '',
        identifier: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);
    const [loading, setLoading] = useState(false);

    // Update the selected form field.
    const update = (key, value) => {
        setForm((currentForm) => ({
            ...currentForm,
            [key]: value
        }));
    };

    // Accept either an email address or a 10-digit mobile number.
    const handleIdentifierChange = (value) => {
        /*
         * If the entered value contains only numbers,
         * limit it to a maximum of 10 digits.
         */
        if (/^\d*$/.test(value)) {
            update('identifier', value.slice(0, 10));
            return;
        }

        /*
         * If letters or symbols are entered,
         * treat the value as an email address.
         */
        update('identifier', value);
    };

    const handleRegister = async () => {
        const name = form.name.trim();
        const identifier = form.identifier.trim();
        const password = form.password;
        const confirmPassword = form.confirmPassword;

        // Check required fields.
        if (
            !name ||
            !identifier ||
            !password ||
            !confirmPassword
        ) {
            Alert.alert(
                'Validation Error',
                'Please complete all fields'
            );

            return;
        }

        /*
         * If the identifier contains only numbers,
         * treat it as a mobile number.
         */
        const isPhoneNumber = /^\d+$/.test(identifier);

        // Validate mobile number.
        if (
            isPhoneNumber &&
            !PHONE_REGEX.test(identifier)
        ) {
            Alert.alert(
                'Validation Error',
                'Mobile number must be exactly 10 digits'
            );

            return;
        }

        // Validate email address.
        if (
            !isPhoneNumber &&
            !EMAIL_REGEX.test(identifier.toLowerCase())
        ) {
            Alert.alert(
                'Validation Error',
                'Please enter a valid email address or 10-digit mobile number'
            );

            return;
        }

        // Validate password length.
        if (password.length < 6) {
            Alert.alert(
                'Validation Error',
                'Password must be at least 6 characters'
            );

            return;
        }

        // Confirm that both passwords are the same.
        if (password !== confirmPassword) {
            Alert.alert(
                'Validation Error',
                'Passwords do not match'
            );

            return;
        }

        try {
            setLoading(true);

            /*
             * Send only the entered identifier:
             *
             * If the user entered a phone number:
             * {
             *     name,
             *     phone,
             *     password
             * }
             *
             * If the user entered an email:
             * {
             *     name,
             *     email,
             *     password
             * }
             */
            const registrationData = {
                name,
                password,
                ...(isPhoneNumber
                    ? {
                        phone: identifier
                    }
                    : {
                        email: identifier.toLowerCase()
                    })
            };

            await API.post(
                '/auth/register',
                registrationData
            );

            Alert.alert(
                'Success',
                'Profile created successfully. You can now log in using your email or phone number.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/')
                    }
                ]
            );
        } catch (error) {
            console.error(
                'Registration error:',
                error.response?.data || error.message
            );

            const message =
                error.response?.data?.msg ||
                error.response?.data?.message ||
                error.message ||
                'Failed to create the profile';

            Alert.alert(
                'Registration Error',
                message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={
                Platform.OS === 'ios'
                    ? 'padding'
                    : undefined
            }
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>
                    Create User Profile
                </Text>

                <Text style={styles.subtitle}>
                    Register using an email address or mobile number
                </Text>

                {/* Full Name */}
                <Text style={styles.label}>
                    Your Name
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="#9ca3af"
                    value={form.name}
                    onChangeText={(value) =>
                        update('name', value)
                    }
                    autoCapitalize="words"
                    autoCorrect={false}
                    textContentType="name"
                    editable={!loading}
                    returnKeyType="next"
                />

                {/* One field for Email or Mobile Number */}
                <Text style={styles.label}>
                    Email or Mobile Number
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter email or phone number"
                    placeholderTextColor="#9ca3af"
                    value={form.identifier}
                    onChangeText={handleIdentifierChange}
                    keyboardType="default"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="username"
                    editable={!loading}
                    returnKeyType="next"
                />

                {/* Password */}
                <Text style={styles.label}>
                    Password
                </Text>

                <View style={styles.passwordField}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Minimum 6 characters"
                        placeholderTextColor="#9ca3af"
                        value={form.password}
                        onChangeText={(value) =>
                            update('password', value)
                        }
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="newPassword"
                        editable={!loading}
                        returnKeyType="next"
                    />

                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() =>
                            setShowPassword(
                                (current) => !current
                            )
                        }
                        disabled={loading}
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
                            color="#6b7280"
                        />
                    </TouchableOpacity>
                </View>

                {/* Confirm Password */}
                <Text style={styles.label}>
                    Confirm Password
                </Text>

                <View style={styles.passwordField}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Enter your password again"
                        placeholderTextColor="#9ca3af"
                        value={form.confirmPassword}
                        onChangeText={(value) =>
                            update(
                                'confirmPassword',
                                value
                            )
                        }
                        secureTextEntry={
                            !showConfirmPassword
                        }
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="newPassword"
                        editable={!loading}
                        returnKeyType="done"
                        onSubmitEditing={
                            handleRegister
                        }
                    />

                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() =>
                            setShowConfirmPassword(
                                (current) => !current
                            )
                        }
                        disabled={loading}
                        accessibilityRole="button"
                        accessibilityLabel={
                            showConfirmPassword
                                ? 'Hide confirmation password'
                                : 'Show confirmation password'
                        }
                    >
                        <Ionicons
                            name={
                                showConfirmPassword
                                    ? 'eye-off-outline'
                                    : 'eye-outline'
                            }
                            size={22}
                            color="#6b7280"
                        />
                    </TouchableOpacity>
                </View>

                {/* Register Button */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        loading &&
                            styles.disabledButton
                    ]}
                    onPress={handleRegister}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator
                            color="#ffffff"
                        />
                    ) : (
                        <Text style={styles.buttonText}>
                            Create Profile
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Login Link */}
                <TouchableOpacity
                    onPress={() =>
                        router.replace('/')
                    }
                    disabled={loading}
                >
                    <Text style={styles.link}>
                        Already have an account? Login
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardContainer: {
        flex: 1,
        backgroundColor: '#ffffff'
    },

    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingVertical: 40,
        backgroundColor: '#ffffff'
    },

    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 6
    },

    subtitle: {
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24
    },

    label: {
        color: '#374151',
        fontWeight: '700',
        marginBottom: 7
    },

    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 13,
        paddingVertical: 13,
        marginBottom: 13,
        color: '#111827',
        backgroundColor: '#ffffff'
    },

    passwordField: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 13,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center'
    },

    passwordInput: {
        flex: 1,
        paddingHorizontal: 13,
        paddingVertical: 13,
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
        backgroundColor: '#16a34a',
        padding: 15,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6
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
        color: '#2563eb',
        fontWeight: '700'
    }
});