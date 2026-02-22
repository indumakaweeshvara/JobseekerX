import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { storage, auth as firebaseAuth, db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

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
                Alert.alert('Success', 'Profile photo updated!');
            }
        } catch (error: any) {
            Alert.alert('Upload Failed', error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={pickImage} disabled={uploading} style={styles.avatarWrapper}>
                    <View style={styles.avatar}>
                        {uploading ? (
                            <ActivityIndicator size="large" color="#fff" />
                        ) : user?.photoURL ? (
                            <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>
                                {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                            </Text>
                        )}
                    </View>
                    <View style={styles.editBadge}>
                        <Ionicons name="camera" size={14} color="#fff" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.name}>{user?.displayName || 'User'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{appCount}</Text>
                    <Text style={styles.statLabel}>Applications</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{savedCount}</Text>
                    <Text style={styles.statLabel}>Saved Jobs</Text>
                </View>
            </View>

            <View style={styles.menuSection}>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyApplications')}>
                    <View style={[styles.menuIcon, { backgroundColor: '#E8F2FF' }]}>
                        <Ionicons name="document-text" size={20} color="#007AFF" />
                    </View>
                    <Text style={styles.menuText}>My Applications</Text>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SavedJobs')}>
                    <View style={[styles.menuIcon, { backgroundColor: '#FFF3E0' }]}>
                        <Ionicons name="bookmark" size={20} color="#FF9500" />
                    </View>
                    <Text style={styles.menuText}>Saved Jobs</Text>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
            </View>

            <View style={styles.logoutSection}>
                <Button title="Logout" onPress={signOut} variant="danger" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#007AFF',
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
        color: '#fff',
        fontWeight: 'bold',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#007AFF',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    email: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    statLabel: {
        fontSize: 13,
        color: '#999',
        marginTop: 4,
    },
    menuSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    logoutSection: {
        marginTop: 'auto',
        paddingTop: 20,
    },
});
