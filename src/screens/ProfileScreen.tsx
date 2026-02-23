import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, Switch, Linking } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { storage, auth as firebaseAuth, db } from '../config/firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

export const ProfileScreen = () => {
    const { user, signOut } = useAuth();
    const { isDark, toggleTheme, colors } = useTheme();
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const [uploading, setUploading] = useState(false);
    const [applicationCount, setApplicationCount] = useState(0);
    const [bookmarkCount, setBookmarkCount] = useState(0);
    const [resumeUrl, setResumeUrl] = useState<string | null>(null);
    const [resumeUploading, setResumeUploading] = useState(false);
    const [resumeName, setResumeName] = useState<string>('');

    useEffect(() => {
        if (user) {
            fetchCounts();
            fetchResume();
        }
    }, [user]);

    const fetchCounts = async () => {
        if (!user) return;
        try {
            const appsQ = query(collection(db, 'applications'), where('userId', '==', user.uid));
            const appsSnap = await getDocs(appsQ);
            setApplicationCount(appsSnap.size);

            const bookQ = query(collection(db, 'bookmarks'), where('userId', '==', user.uid));
            const bookSnap = await getDocs(bookQ);
            setBookmarkCount(bookSnap.size);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchResume = async () => {
        if (!user) return;
        try {
            const docSnap = await getDoc(doc(db, 'resumes', user.uid));
            if (docSnap.exists()) {
                const data = docSnap.data();
                setResumeUrl(data.url);
                setResumeName(data.fileName || 'Resume');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const pickImage = async () => {
        Alert.alert(
            'Profile Photo',
            'Choose an option',
            [
                {
                    text: '📷 Camera',
                    onPress: async () => {
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permission needed', 'Camera permission is required');
                            return;
                        }
                        const result = await ImagePicker.launchCameraAsync({
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.5,
                        });
                        if (!result.canceled && result.assets[0]) {
                            await uploadPhoto(result.assets[0].uri);
                        }
                    },
                },
                {
                    text: '🖼️ Gallery',
                    onPress: async () => {
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permission needed', 'Gallery permission is required');
                            return;
                        }
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ['images'],
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.5,
                        });
                        if (!result.canceled && result.assets[0]) {
                            await uploadPhoto(result.assets[0].uri);
                        }
                    },
                },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    // Convert URI to blob using XMLHttpRequest (works in React Native)
    const uriToBlob = (uri: string): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = () => resolve(xhr.response);
            xhr.onerror = () => reject(new Error('Failed to convert file'));
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
        });
    };

    const uploadPhoto = async (uri: string) => {
        if (!user) return;
        setUploading(true);
        try {
            const blob = await uriToBlob(uri);
            const storageRef = ref(storage, `profilePhotos/${user.uid}`);
            await uploadBytes(storageRef, blob);
            const downloadUrl = await getDownloadURL(storageRef);
            await updateProfile(firebaseAuth.currentUser!, { photoURL: downloadUrl });
            Alert.alert('Success! 📸', 'Profile photo updated!');
        } catch (error: any) {
            Alert.alert('Upload Error', error.message || 'Could not upload photo');
        } finally {
            setUploading(false);
        }
    };

    // Resume Upload
    const pickResume = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const file = result.assets[0];
                await uploadResume(file.uri, file.name || 'resume.pdf');
            }
        } catch (error: any) {
            Alert.alert('Error', 'Could not pick document');
        }
    };

    const uploadResume = async (uri: string, fileName: string) => {
        if (!user) return;
        setResumeUploading(true);
        try {
            const blob = await uriToBlob(uri);
            const storageRef = ref(storage, `resumes/${user.uid}/${fileName}`);
            await uploadBytes(storageRef, blob);
            const downloadUrl = await getDownloadURL(storageRef);

            await setDoc(doc(db, 'resumes', user.uid), {
                userId: user.uid,
                url: downloadUrl,
                fileName: fileName,
                uploadedAt: new Date().toISOString(),
            });

            setResumeUrl(downloadUrl);
            setResumeName(fileName);
            Alert.alert('Success! 📄', 'Resume uploaded successfully!');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setResumeUploading(false);
        }
    };

    const viewResume = () => {
        if (resumeUrl) {
            Linking.openURL(resumeUrl);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Profile Header */}
            <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                    {uploading ? (
                        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : user?.photoURL ? (
                        <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
                            <Ionicons name="person" size={40} color={colors.primary} />
                        </View>
                    )}
                    <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
                        <Ionicons name="camera" size={14} color="#FFFFFF" />
                    </View>
                </TouchableOpacity>
                <Text style={[styles.name, { color: colors.text }]}>{user?.displayName || 'User'}</Text>
                <Text style={[styles.email, { color: colors.textMuted }]}>{user?.email}</Text>

                {/* Stats */}
                <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: colors.primary }]}>{applicationCount}</Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Applied</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: colors.warning }]}>{bookmarkCount}</Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Saved</Text>
                    </View>
                </View>
            </View>

            {/* Menu Items */}
            <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                {/* Dark Mode Toggle */}
                <View style={styles.menuItem}>
                    <View style={styles.menuLeft}>
                        <View style={[styles.menuIconBg, { backgroundColor: isDark ? '#1E1B4B' : '#F5F3FF' }]}>
                            <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={isDark ? '#A78BFA' : '#7C3AED'} />
                        </View>
                        <Text style={[styles.menuText, { color: colors.text }]}>Dark Mode</Text>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#E2E8F0', true: '#4F46E5' }}
                        thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
                    />
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Resume Upload */}
                <TouchableOpacity style={styles.menuItem} onPress={pickResume}>
                    <View style={styles.menuLeft}>
                        <View style={[styles.menuIconBg, { backgroundColor: colors.successBg }]}>
                            <Ionicons name="document-attach" size={18} color={colors.success} />
                        </View>
                        <View>
                            <Text style={[styles.menuText, { color: colors.text }]}>
                                {resumeUrl ? 'Update Resume' : 'Upload Resume'}
                            </Text>
                            {resumeName ? (
                                <Text style={[styles.menuSubtext, { color: colors.textMuted }]} numberOfLines={1}>
                                    📄 {resumeName}
                                </Text>
                            ) : (
                                <Text style={[styles.menuSubtext, { color: colors.textMuted }]}>PDF, DOC, DOCX</Text>
                            )}
                        </View>
                    </View>
                    {resumeUploading ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Ionicons name="cloud-upload-outline" size={20} color={colors.textMuted} />
                    )}
                </TouchableOpacity>

                {resumeUrl ? (
                    <>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <TouchableOpacity style={styles.menuItem} onPress={viewResume}>
                            <View style={styles.menuLeft}>
                                <View style={[styles.menuIconBg, { backgroundColor: colors.primaryLight }]}>
                                    <Ionicons name="eye-outline" size={18} color={colors.primary} />
                                </View>
                                <Text style={[styles.menuText, { color: colors.text }]}>View Resume</Text>
                            </View>
                            <Ionicons name="open-outline" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    </>
                ) : null}

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* My Applications */}
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyApplications')}>
                    <View style={styles.menuLeft}>
                        <View style={[styles.menuIconBg, { backgroundColor: colors.primaryLight }]}>
                            <Ionicons name="document-text" size={18} color={colors.primary} />
                        </View>
                        <Text style={[styles.menuText, { color: colors.text }]}>My Applications</Text>
                    </View>
                    <View style={styles.menuRight}>
                        <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.countText}>{applicationCount}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </View>
                </TouchableOpacity>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* Saved Jobs */}
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SavedJobs')}>
                    <View style={styles.menuLeft}>
                        <View style={[styles.menuIconBg, { backgroundColor: colors.warningBg }]}>
                            <Ionicons name="bookmark" size={18} color={colors.warning} />
                        </View>
                        <Text style={[styles.menuText, { color: colors.text }]}>Saved Jobs</Text>
                    </View>
                    <View style={styles.menuRight}>
                        <View style={[styles.countBadge, { backgroundColor: colors.warning }]}>
                            <Text style={styles.countText}>{bookmarkCount}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Sign Out */}
            <View style={styles.signOutSection}>
                <Button
                    title="Sign Out"
                    onPress={signOut}
                    variant="danger"
                    icon="log-out-outline"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    headerCard: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: -4,
        width: 30,
        height: 30,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    name: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    email: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        width: '100%',
        justifyContent: 'center',
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 40,
    },
    menuCard: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 14,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    menuIconBg: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        fontSize: 15,
        fontWeight: '600',
    },
    menuSubtext: {
        fontSize: 12,
        fontWeight: '400',
        marginTop: 2,
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    countBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        minWidth: 24,
        alignItems: 'center',
    },
    countText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    divider: {
        height: 1,
        marginHorizontal: 18,
    },
    signOutSection: {
        marginTop: 20,
    },
});
