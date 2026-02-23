import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, TextInput, RefreshControl } from 'react-native';
import { useJobs } from '../context/JobContext';
import { JobCard } from '../components/JobCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, JobType } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'JobBoard'>;

const FILTER_OPTIONS: ('All' | JobType)[] = ['All', 'Full-time', 'Part-time', 'Remote', 'Contract'];

const FILTER_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    'All': 'apps',
    'Full-time': 'briefcase',
    'Part-time': 'time',
    'Remote': 'globe',
    'Contract': 'document-text',
};

const getGreeting = (): { text: string; emoji: string } => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', emoji: '☀️' };
    if (hour < 17) return { text: 'Good Afternoon', emoji: '🌤️' };
    if (hour < 21) return { text: 'Good Evening', emoji: '🌙' };
    return { text: 'Good Night', emoji: '✨' };
};

export const HomeScreen = () => {
    const { jobs, loading } = useJobs();
    const { user } = useAuth();
    const { colors } = useTheme();
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const [searchText, setSearchText] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<'All' | JobType>('All');
    const [refreshing, setRefreshing] = useState(false);

    const greeting = getGreeting();
    const firstName = user?.displayName?.split(' ')[0] || 'there';

    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            job.title.toLowerCase().includes(searchText.toLowerCase()) ||
            job.company.toLowerCase().includes(searchText.toLowerCase());
        const matchesFilter = selectedFilter === 'All' || job.type === selectedFilter;
        return matchesSearch && matchesFilter;
    });

    // Pull-to-refresh handler
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Jobs auto-update via onSnapshot, just show the spinner briefly
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    // Stats
    const statsData = [
        { label: 'Total Jobs', value: jobs.length, icon: 'briefcase' as keyof typeof Ionicons.glyphMap, color: '#4F46E5', bg: '#EEF2FF' },
        { label: 'Remote', value: jobs.filter(j => j.type === 'Remote').length, icon: 'globe' as keyof typeof Ionicons.glyphMap, color: '#16A34A', bg: '#F0FDF4' },
        { label: 'Full-time', value: jobs.filter(j => j.type === 'Full-time').length, icon: 'time' as keyof typeof Ionicons.glyphMap, color: '#EA580C', bg: '#FFF7ED' },
    ];

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <View style={[styles.loadingCard, { backgroundColor: colors.surface }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textMuted }]}>Finding the best jobs...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.headerBar, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
                {/* Personalized greeting */}
                <View style={styles.headerTop}>
                    <View>
                        <Text style={[styles.greeting, { color: colors.textMuted }]}>{greeting.text}, {firstName} {greeting.emoji}</Text>
                        <Text style={[styles.greetingBold, { color: colors.text }]}>Find Your Dream Job</Text>
                    </View>
                    <View style={[styles.jobCountBadge, { backgroundColor: colors.primaryLight }]}>
                        <Text style={[styles.jobCountText, { color: colors.primary }]}>{jobs.length}</Text>
                        <Text style={[styles.jobCountLabel, { color: colors.textMuted }]}>Jobs</Text>
                    </View>
                </View>

                {/* Search */}
                <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search jobs, companies..."
                        placeholderTextColor="#94A3B8"
                        value={searchText}
                        onChangeText={setSearchText}
                        underlineColorAndroid="transparent"
                    />
                    {searchText.length > 0 ? (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
                {statsData.map((stat, idx) => (
                    <View key={idx} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                        <View style={[styles.statIconBg, { backgroundColor: stat.bg }]}>
                            <Ionicons name={stat.icon} size={16} color={stat.color} />
                        </View>
                        <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            {/* Filter Chips */}
            <View style={[styles.filterSection, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {FILTER_OPTIONS.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Ionicons
                                name={FILTER_ICONS[filter]}
                                size={14}
                                color={selectedFilter === filter ? '#FFFFFF' : '#64748B'}
                                style={styles.filterChipIcon}
                            />
                            <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.resultHeader}>
                <Text style={styles.resultCount}>
                    {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
                </Text>
            </View>

            {/* Job List with Pull-to-Refresh */}
            <FlatList
                data={filteredJobs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <JobCard
                        job={item}
                        onPress={() => navigation.navigate('JobDetails', { job: item })}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBg}>
                            <Ionicons name="search-outline" size={48} color="#4F46E5" />
                        </View>
                        <Text style={styles.emptyTitle}>No jobs found</Text>
                        <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
                    </View>
                }
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#4F46E5']}
                        tintColor="#4F46E5"
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    headerBar: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    greeting: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
    },
    greetingBold: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.5,
        marginTop: 2,
    },
    jobCountBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        alignItems: 'center',
    },
    jobCountText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#4F46E5',
    },
    jobCountLabel: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1E293B',
    },
    // Stats
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    statIconBg: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        marginTop: 2,
    },
    // Filters
    filterSection: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    filterScroll: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    filterChipActive: {
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
    },
    filterChipIcon: {
        marginRight: 6,
    },
    filterText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    resultHeader: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 4,
    },
    resultCount: {
        fontSize: 13,
        color: '#94A3B8',
        fontWeight: '600',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    center: {
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
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
        color: '#64748B',
        fontWeight: '500',
    },
    list: {
        paddingBottom: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
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
});
