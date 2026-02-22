import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
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
            });
            setIsApplied(true);
            Alert.alert('Success', 'Your application has been submitted!');
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

    const requirementsList = job.requirements
        ? job.requirements.split(',').map((r: string) => r.trim()).filter((r: string) => r.length > 0)
        : [];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{job.type}</Text>
                    </View>
                    <TouchableOpacity onPress={handleBookmark} style={styles.bookmarkBtn}>
                        <Ionicons
                            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                            size={26}
                            color={isBookmarked ? '#FF9500' : '#999'}
                        />
                    </TouchableOpacity>
                </View>
                <Text style={styles.title}>{job.title}</Text>
                <Text style={styles.company}>{job.company}</Text>
            </View>

            <View style={styles.infoSection}>
                <View style={styles.infoCard}>
                    <Ionicons name="location-outline" size={22} color="#007AFF" />
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>{job.location}</Text>
                </View>
                <View style={styles.infoCard}>
                    <Ionicons name="cash-outline" size={22} color="#34C759" />
                    <Text style={styles.infoLabel}>Salary</Text>
                    <Text style={styles.infoValue}>{job.salary}</Text>
                </View>
            </View>

            <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Job Description</Text>
                <Text style={styles.descriptionText}>{job.description}</Text>
            </View>

            {requirementsList.length > 0 && (
                <View style={styles.requirementsSection}>
                    <Text style={styles.sectionTitle}>Requirements</Text>
                    <View style={styles.tagsContainer}>
                        {requirementsList.map((req: string, index: number) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{req}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.footer}>
                <Button
                    title={isApplied ? '✓ Applied' : 'Apply Now'}
                    onPress={handleApply}
                    disabled={isApplied || loading}
                    loading={loading}
                    variant={isApplied ? 'secondary' : 'primary'}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    content: {
        padding: 20,
    },
    header: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    badge: {
        backgroundColor: '#E8F2FF',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        color: '#007AFF',
        fontWeight: 'bold',
        fontSize: 13,
    },
    bookmarkBtn: {
        padding: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    company: {
        fontSize: 17,
        color: '#007AFF',
        fontWeight: '600',
    },
    infoSection: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    infoCard: {
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
    infoLabel: {
        fontSize: 12,
        color: '#999',
        marginTop: 6,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 2,
        textAlign: 'center',
    },
    descriptionSection: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 15,
        color: '#555',
        lineHeight: 24,
    },
    requirementsSection: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: '#F0F4FF',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#D0DCFF',
    },
    tagText: {
        fontSize: 13,
        color: '#4A6CF7',
        fontWeight: '500',
    },
    footer: {
        marginTop: 8,
        marginBottom: 20,
    },
});
