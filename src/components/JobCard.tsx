import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Job } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface JobCardProps {
    job: Job;
    onPress: () => void;
    onDelete?: () => void;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
    'Full-time': { bg: '#EEF2FF', text: '#4F46E5', icon: 'briefcase' },
    'Part-time': { bg: '#FFF7ED', text: '#EA580C', icon: 'time' },
    'Remote': { bg: '#F0FDF4', text: '#16A34A', icon: 'globe' },
    'Contract': { bg: '#FDF4FF', text: '#9333EA', icon: 'document-text' },
};

export const JobCard: React.FC<JobCardProps> = ({ job, onPress, onDelete }) => {
    const typeColor = TYPE_COLORS[job.type] || TYPE_COLORS['Full-time'];

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.header}>
                <View style={[styles.companyLogo, { backgroundColor: typeColor.bg }]}>
                    <Ionicons name={typeColor.icon as any} size={22} color={typeColor.text} />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
                    <Text style={styles.company}>{job.company}</Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: typeColor.bg }]}>
                    <Text style={[styles.typeText, { color: typeColor.text }]}>{job.type}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Ionicons name="location" size={14} color="#4F46E5" />
                    </View>
                    <Text style={styles.detailText}>{job.location}</Text>
                </View>
                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Ionicons name="wallet" size={14} color="#16A34A" />
                    </View>
                    <Text style={[styles.detailText, styles.salaryText]}>{job.salary}</Text>
                </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>{job.description}</Text>

            {job.requirements && job.requirements.length > 0 && (
                <View style={styles.tagsRow}>
                    {job.requirements.split(',').slice(0, 3).map((req, i) => (
                        <View key={i} style={styles.miniTag}>
                            <Text style={styles.miniTagText}>{req.trim()}</Text>
                        </View>
                    ))}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 18,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#1E293B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    companyLogo: {
        width: 46,
        height: 46,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
        letterSpacing: -0.3,
    },
    company: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
        marginTop: 2,
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 14,
    },
    details: {
        flexDirection: 'row',
        marginBottom: 10,
        gap: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailIcon: {
        width: 24,
        height: 24,
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
    salaryText: {
        color: '#16A34A',
        fontWeight: '600',
    },
    description: {
        fontSize: 13,
        color: '#94A3B8',
        lineHeight: 20,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 12,
    },
    miniTag: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    miniTagText: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
    },
});
