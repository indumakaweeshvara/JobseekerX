import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { Bookmark } from '../types';
import { Ionicons } from '@expo/vector-icons';

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
    'Full-time': { bg: '#EEF2FF', text: '#4F46E5' },
    'Part-time': { bg: '#FFF7ED', text: '#EA580C' },
    'Remote': { bg: '#F0FDF4', text: '#16A34A' },
    'Contract': { bg: '#FDF4FF', text: '#9333EA' },
};

export const SavedJobsScreen = () => {
    const { user } = useAuth();
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'bookmarks'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as Bookmark[];
            setBookmarks(data);
            setLoading(false);
        });

        return unsubscribe;
    }, [user]);

    const handleRemove = async (bookmarkId: string) => {
        try {
            await deleteDoc(doc(db, 'bookmarks', bookmarkId));
        } catch (error: any) {
            console.log('Bookmark remove info:', error.message);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <View style={styles.loadingCard}>
                    <ActivityIndicator size="large" color="#F59E0B" />
                    <Text style={styles.loadingText}>Loading saved jobs...</Text>
                </View>
            </View>
        );
    }

    if (bookmarks.length === 0) {
        return (
            <View style={styles.centered}>
                <View style={styles.emptyIconBg}>
                    <Ionicons name="bookmark-outline" size={48} color="#F59E0B" />
                </View>
                <Text style={styles.emptyTitle}>No saved jobs</Text>
                <Text style={styles.emptyText}>Bookmark jobs you're interested in</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.summaryBar}>
                <Text style={styles.summaryText}>
                    {bookmarks.length} {bookmarks.length === 1 ? 'saved job' : 'saved jobs'}
                </Text>
            </View>
            <FlatList
                data={bookmarks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const typeColor = TYPE_COLORS[item.type] || TYPE_COLORS['Full-time'];
                    return (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                                    <View style={styles.companyRow}>
                                        <Ionicons name="business-outline" size={14} color="#64748B" />
                                        <Text style={styles.company}>{item.company}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleRemove(item.id)}
                                    style={styles.removeBtn}
                                >
                                    <Ionicons name="bookmark" size={22} color="#F59E0B" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.cardDivider} />

                            <View style={styles.cardDetails}>
                                <View style={styles.detailRow}>
                                    <View style={styles.detailIconBg}>
                                        <Ionicons name="location" size={14} color="#4F46E5" />
                                    </View>
                                    <Text style={styles.detailText}>{item.location}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <View style={styles.detailIconBg}>
                                        <Ionicons name="wallet" size={14} color="#16A34A" />
                                    </View>
                                    <Text style={[styles.detailText, { color: '#16A34A', fontWeight: '600' }]}>{item.salary}</Text>
                                </View>
                            </View>

                            <View style={[styles.typeBadge, { backgroundColor: typeColor.bg }]}>
                                <Text style={[styles.typeText, { color: typeColor.text }]}>{item.type}</Text>
                            </View>
                        </View>
                    );
                }}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingCard: {
        backgroundColor: '#FFFFFF',
        padding: 40,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    emptyIconBg: {
        width: 90,
        height: 90,
        borderRadius: 28,
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#334155',
    },
    emptyText: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 6,
    },
    summaryBar: {
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    summaryText: {
        fontSize: 13,
        color: '#94A3B8',
        fontWeight: '600',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        marginBottom: 12,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.3,
    },
    companyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    company: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    removeBtn: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 14,
    },
    cardDetails: {
        flexDirection: 'row',
        gap: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailIconBg: {
        width: 26,
        height: 26,
        borderRadius: 8,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    typeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 10,
        marginTop: 12,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});
