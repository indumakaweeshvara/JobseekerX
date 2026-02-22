import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { Application, ApplicationStatus } from '../types';
import { Ionicons } from '@expo/vector-icons';

const STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string }> = {
    Pending: { bg: '#FFF3E0', text: '#FF9800' },
    Reviewed: { bg: '#E3F2FD', text: '#2196F3' },
    Accepted: { bg: '#E8F5E9', text: '#4CAF50' },
    Rejected: { bg: '#FFEBEE', text: '#F44336' },
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
        });

        return unsubscribe;
    }, [user]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (applications.length === 0) {
        return (
            <View style={styles.centered}>
                <Ionicons name="document-text-outline" size={64} color="#CCC" />
                <Text style={styles.emptyTitle}>No applications yet</Text>
                <Text style={styles.emptyText}>Apply to jobs and track them here</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={applications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const status = item.status || 'Pending';
                    const colors = STATUS_COLORS[status];
                    return (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                                    <Text style={styles.company}>{item.company}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                                    <Text style={[styles.statusText, { color: colors.text }]}>
                                        {status}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.dateRow}>
                                <Ionicons name="time-outline" size={14} color="#999" />
                                <Text style={styles.dateText}>
                                    {item.appliedAt?.toDate
                                        ? item.appliedAt.toDate().toLocaleDateString()
                                        : 'Recently'}
                                </Text>
                            </View>
                        </View>
                    );
                }}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#999',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#BBB',
        marginTop: 6,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
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
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    company: {
        fontSize: 14,
        color: '#007AFF',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 10,
    },
    dateText: {
        fontSize: 13,
        color: '#999',
    },
});
