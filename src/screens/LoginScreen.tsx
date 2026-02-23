import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Platform,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Button } from '../components/Button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
    navigation: LoginScreenNavigationProp;
}

export const LoginScreen = ({ navigation }: Props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.headerSection}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="briefcase" size={36} color="#FFFFFF" />
                    </View>
                    <Text style={styles.appName}>JobSeeker</Text>
                    <Text style={styles.tagline}>Discover Your Dream Career</Text>
                </View>

                {/* Form */}
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Welcome Back</Text>
                    <Text style={styles.formSubtitle}>Sign in to continue</Text>

                    {/* Email Input - Direct TextInput */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>EMAIL</Text>
                        <View style={[
                            styles.inputRow,
                            emailFocused ? styles.inputRowFocused : null,
                        ]}>
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={emailFocused ? '#4F46E5' : '#94A3B8'}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.textInput}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                placeholderTextColor="#94A3B8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                                editable={true}
                                underlineColorAndroid="transparent"
                                returnKeyType="next"
                            />
                        </View>
                    </View>

                    {/* Password Input - Direct TextInput */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>PASSWORD</Text>
                        <View style={[
                            styles.inputRow,
                            passwordFocused ? styles.inputRowFocused : null,
                        ]}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={passwordFocused ? '#4F46E5' : '#94A3B8'}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.textInput}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter your password"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={true}
                                autoCapitalize="none"
                                autoCorrect={false}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                editable={true}
                                underlineColorAndroid="transparent"
                                returnKeyType="done"
                            />
                        </View>
                    </View>

                    <View style={styles.buttonSection}>
                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            icon="log-in-outline"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.linkContainer}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.linkText}>
                            Don't have an account?{' '}
                            <Text style={styles.linkBold}>Create Account</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4F46E5',
    },
    scrollContent: {
        flexGrow: 1,
    },
    headerSection: {
        alignItems: 'center',
        paddingTop: 70,
        paddingBottom: 40,
    },
    logoContainer: {
        width: 72,
        height: 72,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    appName: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    tagline: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.75)',
        marginTop: 6,
        fontWeight: '500',
    },
    formCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 28,
        paddingTop: 36,
        paddingBottom: 40,
    },
    formTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.5,
    },
    formSubtitle: {
        fontSize: 15,
        color: '#94A3B8',
        marginTop: 4,
        marginBottom: 28,
        fontWeight: '500',
    },
    fieldContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        color: '#475569',
        marginBottom: 6,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        minHeight: 52,
    },
    inputRowFocused: {
        borderColor: '#4F46E5',
        backgroundColor: '#FFFFFF',
    },
    inputIcon: {
        marginLeft: 14,
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: Platform.OS === 'ios' ? 14 : 10,
        fontSize: 15,
        color: '#1E293B',
    },
    buttonSection: {
        marginTop: 16,
    },
    linkContainer: {
        marginTop: 24,
        alignItems: 'center',
    },
    linkText: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '500',
    },
    linkBold: {
        color: '#4F46E5',
        fontWeight: '700',
    },
});
