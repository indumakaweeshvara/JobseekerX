import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { Application, ApplicationStatus } from '../types';
import { Ionicons } from '@expo/vector-icons';

const STATUS_CONFIG: Record<ApplicationStatus, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
    Pending: { bg: '#FFF7ED', text: '#EA580C', icon: 'time' },
    Reviewed: { bg: '#EEF2FF', text: '#4F46E5', icon: 'eye' },
    Accepted: { bg: '#F0FDF4', text: '#16A34A', icon: 'checkmark-circle' },
    Rejected: { bg: '#FEF2F2', text: '#EF4444', icon: 'close-circle' },
};

export const MyApplicationsScreen = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'applications'),
            where('userId', '==', user.uid),
            orderBy('appliedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const apps = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as Application[];
            setApplications(apps);
            setLoading(false);
        }, (error) => {
            console.log('Applications fetch info:', error.message);
            setLoading(false);
        });

        return unsubscribe;
    }, [user]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <View style={styles.loadingCard}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text style={styles.loadingText}>Loading applications...</Text>
                </View>
            </View>
        );
    }

    if (applications.length === 0) {
        return (
            <View style={styles.centered}>
                <View style={styles.emptyIconBg}>
                    <Ionicons name="document-text-outline" size={48} color="#4F46E5" />
                </View>
                <Text style={styles.emptyTitle}>No applications yet</Text>
                <Text style={styles.emptyText}>Apply to jobs and track them here</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.summaryBar}>
                <Text style={styles.summaryText}>
                    {applications.length} {applications.length === 1 ? 'application' : 'applications'}
                </Text>
            </View>
            <FlatList
                data={applications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const status = item.status || 'Pending';
                    const config = STATUS_CONFIG[status];
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
                                <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                                    <Ionicons name={config.icon} size={14} color={config.text} style={{ marginRight: 4 }} />
                                    <Text style={[styles.statusText, { color: config.text }]}>
                                        {status}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.cardDivider} />
                            <View style={styles.dateRow}>
                                <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                                <Text style={styles.dateText}>
                                    Applied {item.appliedAt?.toDate
                                        ? item.appliedAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        : 'Recently'}
                                </Text>
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
        backgroundColor: '#EEF2FF',
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
        marginRight: 12,
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
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 12,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 13,
        color: '#94A3B8',
        fontWeight: '500',
    },
});
