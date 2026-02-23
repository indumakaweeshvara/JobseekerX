import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { storage, auth as firebaseAuth, db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

export const ProfileScreen = () => {
    const { user, signOut } = useAuth();
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const [uploading, setUploading] = useState(false);
    const [appCount, setAppCount] = useState(0);
    const [savedCount, setSavedCount] = useState(0);

    useEffect(() => {
        loadStats();
    }, [user]);

    const loadStats = async () => {
        if (!user) return;
        try {
            const appsQ = query(collection(db, 'applications'), where('userId', '==', user.uid));
            const appsSnap = await getDocs(appsQ);
            setAppCount(appsSnap.size);

            const savedQ = query(collection(db, 'bookmarks'), where('userId', '==', user.uid));
            const savedSnap = await getDocs(savedQ);
            setSavedCount(savedSnap.size);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permissions to change your photo.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        if (!user) return;
        setUploading(true);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `profiles/${user.uid}`);

            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);

            if (firebaseAuth.currentUser) {
                await updateProfile(firebaseAuth.currentUser, {
                    photoURL: downloadURL,
                });
                Alert.alert('Success! 🎉', 'Profile photo updated!');
            }
        } catch (error: any) {
            Alert.alert('Upload Failed', error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Profile Header Card */}
            <View style={styles.headerCard}>
                <TouchableOpacity onPress={pickImage} disabled={uploading} style={styles.avatarWrapper}>
                    <View style={styles.avatar}>
                        {uploading ? (
                            <ActivityIndicator size="large" color="#FFFFFF" />
                        ) : user?.photoURL ? (
                            <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>
                                {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                            </Text>
                        )}
                    </View>
                    <View style={styles.editBadge}>
                        <Ionicons name="camera" size={14} color="#FFFFFF" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.name}>{user?.displayName || 'User'}</Text>
                <Text style={styles.email}>{user?.email}</Text>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{appCount}</Text>
                        <Text style={styles.statLabel}>Applied</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{savedCount}</Text>
                        <Text style={styles.statLabel}>Saved</Text>
                    </View>
                </View>
            </View>

            {/* Menu Section */}
            <View style={styles.menuCard}>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyApplications')}>
                    <View style={[styles.menuIcon, { backgroundColor: '#EEF2FF' }]}>
                        <Ionicons name="document-text" size={20} color="#4F46E5" />
                    </View>
                    <View style={styles.menuInfo}>
                        <Text style={styles.menuText}>My Applications</Text>
                        <Text style={styles.menuSubtext}>Track your job applications</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SavedJobs')}>
                    <View style={[styles.menuIcon, { backgroundColor: '#FFF7ED' }]}>
                        <Ionicons name="bookmark" size={20} color="#F59E0B" />
                    </View>
                    <View style={styles.menuInfo}>
                        <Text style={styles.menuText}>Saved Jobs</Text>
                        <Text style={styles.menuSubtext}>Jobs you've bookmarked</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </TouchableOpacity>
            </View>

            {/* Logout */}
            <View style={styles.logoutSection}>
                <Button
                    title="Sign Out"
                    onPress={signOut}
                    variant="outline"
                    icon="log-out-outline"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 16,
    },
    headerCard: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 28,
        borderRadius: 24,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 32,
        backgroundColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 40,
        color: '#FFFFFF',
        fontWeight: '800',
    },
    editBadge: {
        position: 'absolute',
        bottom: 2,
        right: -2,
        backgroundColor: '#4F46E5',
        width: 32,
        height: 32,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    name: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.3,
    },
    email: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 4,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 40,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 26,
        fontWeight: '800',
        color: '#4F46E5',
    },
    statLabel: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 36,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 20,
    },
    menuCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginHorizontal: 18,
    },
    menuIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuInfo: {
        flex: 1,
    },
    menuText: {
        fontSize: 16,
        color: '#0F172A',
        fontWeight: '600',
    },
    menuSubtext: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 2,
    },
    logoutSection: {
        marginTop: 'auto',
        paddingTop: 16,
    },
});
