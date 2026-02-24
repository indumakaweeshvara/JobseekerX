import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, Switch, Linking, Modal, ScrollView, TextInput, Platform } from 'react-native';
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
    const [photoUrl, setPhotoUrl] = useState<string | null>(user?.photoURL || null);

    // Advanced Profile state
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState('');
    const [phone, setPhone] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [profileSaving, setProfileSaving] = useState(false);

    useEffect(() => {
        if (user) {
            fetchCounts();
            fetchResume();
            fetchPhoto();
            fetchProfile();
        }
    }, [user]);

    const fetchPhoto = async () => {
        if (!user) return;
        // First try auth photoURL
        if (user.photoURL) {
            setPhotoUrl(user.photoURL);
            return;
        }
        // Fallback: check Firestore
        try {
            const docSnap = await getDoc(doc(db, 'userPhotos', user.uid));
            if (docSnap.exists()) {
                setPhotoUrl(docSnap.data().photoURL);
            }
        } catch (e) {
            console.log('Photo fetch error:', e);
        }
    };

    const fetchProfile = async () => {
        if (!user) return;
        try {
            const docSnap = await getDoc(doc(db, 'userProfiles', user.uid));
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBio(data.bio || '');
                setSkills(data.skills || '');
                setPhone(data.phone || '');
                setLinkedin(data.linkedin || '');
            }
        } catch (e) {
            console.log('Profile fetch:', e);
        }
    };

    const saveProfile = async () => {
        if (!user) return;
        setProfileSaving(true);
        try {
            await setDoc(doc(db, 'userProfiles', user.uid), {
                bio: bio.trim(),
                skills: skills.trim(),
                phone: phone.trim(),
                linkedin: linkedin.trim(),
                updatedAt: new Date().toISOString(),
            });
            setShowEditProfile(false);
            Alert.alert('Saved! ✅', 'Profile updated successfully!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Could not save profile');
        } finally {
            setProfileSaving(false);
        }
    };

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
            console.log('Stats fetch:', e);
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
            console.log('Resume fetch:', e);
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
            xhr.onerror = (e) => reject(new Error('Failed to convert file'));
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
        });
    };

    const uploadPhoto = async (uri: string) => {
        if (!user) return;
        setUploading(true);
        try {
            // Step 1: Convert to blob
            const blob = await uriToBlob(uri);

            // Step 2: Upload to Firebase Storage
            const fileName = `profilePhotos/${user.uid}_${Date.now()}.jpg`;
            const storageRef = ref(storage, fileName);
            await uploadBytes(storageRef, blob);

            // Step 3: Get download URL
            const downloadUrl = await getDownloadURL(storageRef);

            // Step 4: Update locally immediately
            setPhotoUrl(downloadUrl);

            // Step 5: Save to Firestore (reliable backup)
            await setDoc(doc(db, 'userPhotos', user.uid), {
                photoURL: downloadUrl,
                updatedAt: new Date().toISOString(),
            });

            // Step 6: Try to update Auth profile (may fail silently)
            try {
                await updateProfile(firebaseAuth.currentUser!, { photoURL: downloadUrl });
                await firebaseAuth.currentUser!.reload();
            } catch (authErr) {
                // Auth update failed but Firestore has it
                console.log('Auth profile update skipped:', authErr);
            }

            Alert.alert('Success! 📸', 'Profile photo updated!');
        } catch (error: any) {
            console.log('Upload error:', error);
            Alert.alert('Upload Error', error.message || 'Could not upload photo. Please try again.');
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

    const skillTags = skills.split(',').map(s => s.trim()).filter(Boolean);

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 30 }}>
            {/* Profile Header */}
            <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                    {uploading ? (
                        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : photoUrl ? (
                        <Image source={{ uri: photoUrl }} style={styles.avatar} />
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

                {/* Bio */}
                {bio ? (
                    <Text style={[styles.bioText, { color: colors.textSecondary }]} numberOfLines={2}>{bio}</Text>
                ) : null}

                {/* Skills Tags */}
                {skillTags.length > 0 ? (
                    <View style={styles.skillsRow}>
                        {skillTags.slice(0, 5).map((skill, i) => (
                            <View key={i} style={[styles.skillTag, { backgroundColor: colors.primaryLight }]}>
                                <Text style={[styles.skillTagText, { color: colors.primary }]}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                ) : null}

                {/* Edit Profile Button */}
                <TouchableOpacity
                    style={[styles.editProfileBtn, { borderColor: colors.primary }]}
                    onPress={() => setShowEditProfile(true)}
                >
                    <Ionicons name="create-outline" size={16} color={colors.primary} />
                    <Text style={[styles.editProfileText, { color: colors.primary }]}>Edit Profile</Text>
                </TouchableOpacity>

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

            {/* Edit Profile Modal */}
            <Modal visible={showEditProfile} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                                <Ionicons name="close" size={24} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>BIO</Text>
                            <TextInput
                                style={[styles.fieldInput, styles.fieldMultiline, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Tell us about yourself..."
                                placeholderTextColor={colors.textMuted}
                                multiline
                                numberOfLines={3}
                            />

                            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>SKILLS (comma separated)</Text>
                            <TextInput
                                style={[styles.fieldInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                                value={skills}
                                onChangeText={setSkills}
                                placeholder="React Native, TypeScript, Firebase..."
                                placeholderTextColor={colors.textMuted}
                            />

                            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>PHONE</Text>
                            <TextInput
                                style={[styles.fieldInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="+94 XX XXX XXXX"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="phone-pad"
                            />

                            <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>LINKEDIN URL</Text>
                            <TextInput
                                style={[styles.fieldInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                                value={linkedin}
                                onChangeText={setLinkedin}
                                placeholder="https://linkedin.com/in/your-profile"
                                placeholderTextColor={colors.textMuted}
                                autoCapitalize="none"
                            />

                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                                onPress={saveProfile}
                                disabled={profileSaving}
                            >
                                {profileSaving ? (
                                    <ActivityIndicator color="#FFF" size="small" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Save Profile</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ScrollView>
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
    bioText: {
        fontSize: 14,
        fontWeight: '400',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    skillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
        paddingHorizontal: 10,
    },
    skillTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    skillTagText: {
        fontSize: 11,
        fontWeight: '700',
    },
    editProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 14,
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    editProfileText: {
        fontSize: 13,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 6,
        marginTop: 14,
    },
    fieldInput: {
        borderWidth: 1.5,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === 'ios' ? 14 : 10,
        fontSize: 15,
    },
    fieldMultiline: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    saveBtn: {
        marginTop: 24,
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
