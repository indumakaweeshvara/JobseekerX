import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Share, Modal, TextInput, Platform } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '../types';
import { Button } from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, deleteDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

type JobDetailsRouteProp = RouteProp<HomeStackParamList, 'JobDetails'>;

export const JobDetailsScreen = () => {
    const route = useRoute<JobDetailsRouteProp>();
    const navigation = useNavigation();
    const { user } = useAuth();
    const { job } = route.params;
    const [isApplied, setIsApplied] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(false);

    // Cover Letter Modal state
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');

    useEffect(() => {
        checkIfApplied();
        checkIfBookmarked();
    }, []);

    const checkIfApplied = async () => {
        if (!user) return;
        const q = query(
            collection(db, 'applications'),
            where('jobId', '==', job.id),
            where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        setIsApplied(!snapshot.empty);
    };

    const checkIfBookmarked = async () => {
        if (!user) return;
        const bookmarkId = `${user.uid}_${job.id}`;
        const docSnap = await getDoc(doc(db, 'bookmarks', bookmarkId));
        setIsBookmarked(docSnap.exists());
    };

    // Apply with Cover Letter
    const handleApply = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const appId = `${user.uid}_${job.id}`;
            await setDoc(doc(db, 'applications', appId), {
                jobId: job.id,
                userId: user.uid,
                appliedAt: serverTimestamp(),
                jobTitle: job.title,
                company: job.company,
                status: 'Pending',
                coverLetter: coverLetter.trim() || '',
                applicantName: user.displayName || '',
                applicantEmail: user.email || '',
            });
            setIsApplied(true);
            setShowApplyModal(false);
            setCoverLetter('');
            Alert.alert('Success! 🎉', 'Your application has been submitted!');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBookmark = async () => {
        if (!user) return;
        const bookmarkId = `${user.uid}_${job.id}`;
        try {
            if (isBookmarked) {
                await deleteDoc(doc(db, 'bookmarks', bookmarkId));
                setIsBookmarked(false);
            } else {
                await setDoc(doc(db, 'bookmarks', bookmarkId), {
                    jobId: job.id,
                    userId: user.uid,
                    savedAt: serverTimestamp(),
                    jobTitle: job.title,
                    company: job.company,
                    location: job.location,
                    salary: job.salary,
                    type: job.type,
                });
                setIsBookmarked(true);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    // Share Job
    const handleShare = async () => {
        try {
            await Share.share({
                title: `${job.title} at ${job.company}`,
                message: `🚀 Check out this job!\n\n📌 ${job.title}\n🏢 ${job.company}\n📍 ${job.location}\n💰 ${job.salary}\n📋 ${job.type}\n\n${job.description ? job.description.substring(0, 150) + '...' : ''}\n\nFound on JobSeeker App`,
            });
        } catch (error: any) {
            Alert.alert('Error', 'Could not share this job');
        }
    };

    const requirementsList = job.requirements
        ? job.requirements.split(',').map((r: string) => r.trim()).filter((r: string) => r.length > 0)
        : [];

    const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
        'Full-time': { bg: '#EEF2FF', text: '#4F46E5' },
        'Part-time': { bg: '#FFF7ED', text: '#EA580C' },
        'Remote': { bg: '#F0FDF4', text: '#16A34A' },
        'Contract': { bg: '#FDF4FF', text: '#9333EA' },
    };
    const typeColor = TYPE_COLORS[job.type] || TYPE_COLORS['Full-time'];

    return (
        <>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header Card */}
                <View style={styles.headerCard}>
                    <View style={styles.headerTop}>
                        <View style={[styles.badge, { backgroundColor: typeColor.bg }]}>
                            <Text style={[styles.badgeText, { color: typeColor.text }]}>{job.type}</Text>
                        </View>
                        <View style={styles.actionButtons}>
                            {/* Share Button */}
                            <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
                                <View style={styles.actionCircle}>
                                    <Ionicons name="share-social" size={18} color="#64748B" />
                                </View>
                            </TouchableOpacity>
                            {/* Bookmark Button */}
                            <TouchableOpacity onPress={handleBookmark} style={styles.actionBtn}>
                                <View style={[styles.actionCircle, isBookmarked && styles.bookmarkActive]}>
                                    <Ionicons
                                        name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                                        size={18}
                                        color={isBookmarked ? '#FFFFFF' : '#64748B'}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.title}>{job.title}</Text>
                    <View style={styles.companyRow}>
                        <View style={styles.companyIcon}>
                            <Ionicons name="business" size={16} color="#4F46E5" />
                        </View>
                        <Text style={styles.company}>{job.company}</Text>
                    </View>
                </View>

                {/* Info Cards */}
                <View style={styles.infoSection}>
                    <View style={styles.infoCard}>
                        <View style={[styles.infoIconBg, { backgroundColor: '#EEF2FF' }]}>
                            <Ionicons name="location" size={20} color="#4F46E5" />
                        </View>
                        <Text style={styles.infoLabel}>Location</Text>
                        <Text style={styles.infoValue}>{job.location}</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <View style={[styles.infoIconBg, { backgroundColor: '#F0FDF4' }]}>
                            <Ionicons name="wallet" size={20} color="#16A34A" />
                        </View>
                        <Text style={styles.infoLabel}>Salary</Text>
                        <Text style={styles.infoValue}>{job.salary}</Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="document-text" size={18} color="#4F46E5" />
                        <Text style={styles.sectionTitle}>Job Description</Text>
                    </View>
                    <Text style={styles.descriptionText}>{job.description}</Text>
                </View>

                {/* Requirements */}
                {requirementsList.length > 0 ? (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                            <Text style={styles.sectionTitle}>Requirements</Text>
                        </View>
                        <View style={styles.tagsContainer}>
                            {requirementsList.map((req: string, index: number) => (
                                <View key={index} style={styles.tag}>
                                    <Ionicons name="checkmark" size={12} color="#4F46E5" style={{ marginRight: 4 }} />
                                    <Text style={styles.tagText}>{req}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : null}

                {/* Apply / Share Buttons */}
                <View style={styles.footer}>
                    <Button
                        title={isApplied ? '✓ Already Applied' : 'Apply Now'}
                        onPress={() => {
                            if (!isApplied) setShowApplyModal(true);
                        }}
                        disabled={isApplied}
                        variant={isApplied ? 'secondary' : 'primary'}
                        icon={isApplied ? 'checkmark-circle' : 'paper-plane'}
                    />
                    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                        <Ionicons name="share-social-outline" size={18} color="#4F46E5" />
                        <Text style={styles.shareButtonText}>Share This Job</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Apply Modal with Cover Letter */}
            <Modal
                visible={showApplyModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowApplyModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Apply for Position</Text>
                            <TouchableOpacity onPress={() => setShowApplyModal(false)}>
                                <View style={styles.closeBtn}>
                                    <Ionicons name="close" size={20} color="#64748B" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalJobInfo}>
                            <Text style={styles.modalJobTitle}>{job.title}</Text>
                            <Text style={styles.modalJobCompany}>{job.company}</Text>
                        </View>

                        <View style={styles.modalApplicantInfo}>
                            <View style={styles.applicantRow}>
                                <Ionicons name="person-circle" size={20} color="#4F46E5" />
                                <Text style={styles.applicantText}>{user?.displayName || 'Your Name'}</Text>
                            </View>
                            <View style={styles.applicantRow}>
                                <Ionicons name="mail" size={18} color="#4F46E5" />
                                <Text style={styles.applicantText}>{user?.email || 'your@email.com'}</Text>
                            </View>
                        </View>

                        <Text style={styles.coverLetterLabel}>COVER LETTER (OPTIONAL)</Text>
                        <View style={styles.coverLetterBox}>
                            <TextInput
                                style={styles.coverLetterInput}
                                value={coverLetter}
                                onChangeText={setCoverLetter}
                                placeholder="Tell the employer why you're a great fit for this role..."
                                placeholderTextColor="#94A3B8"
                                multiline={true}
                                numberOfLines={6}
                                textAlignVertical="top"
                                editable={true}
                                underlineColorAndroid="transparent"
                            />
                        </View>

                        <Button
                            title="Submit Application"
                            onPress={handleApply}
                            loading={loading}
                            icon="paper-plane"
                        />
                        <TouchableOpacity
                            style={styles.skipBtn}
                            onPress={handleApply}
                        >
                            <Text style={styles.skipText}>Skip cover letter & apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    headerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 22,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    badge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 10,
    },
    badgeText: {
        fontWeight: '700',
        fontSize: 12,
        letterSpacing: 0.3,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        padding: 2,
    },
    actionCircle: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookmarkActive: {
        backgroundColor: '#F59E0B',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    companyRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    companyIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    company: {
        fontSize: 16,
        color: '#4F46E5',
        fontWeight: '600',
    },
    infoSection: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    infoIconBg: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 4,
        textAlign: 'center',
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 22,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
    },
    descriptionText: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 24,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    tagText: {
        fontSize: 13,
        color: '#4F46E5',
        fontWeight: '600',
    },
    footer: {
        marginTop: 8,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: '#EEF2FF',
        gap: 8,
    },
    shareButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4F46E5',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingTop: 12,
        maxHeight: '85%',
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalJobInfo: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    modalJobTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    modalJobCompany: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
        marginTop: 4,
    },
    modalApplicantInfo: {
        backgroundColor: '#EEF2FF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
        gap: 8,
    },
    applicantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    applicantText: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '500',
    },
    coverLetterLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    coverLetterBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        marginBottom: 20,
        minHeight: 140,
    },
    coverLetterInput: {
        padding: 16,
        fontSize: 14,
        color: '#1E293B',
        lineHeight: 22,
        minHeight: 130,
    },
    skipBtn: {
        alignItems: 'center',
        marginTop: 12,
    },
    skipText: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
    },
});
