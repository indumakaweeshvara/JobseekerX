import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { AddEditJobScreen } from '../screens/AddEditJobScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { JobDetailsScreen } from '../screens/JobDetailsScreen';
import { MyApplicationsScreen } from '../screens/MyApplicationsScreen';
import { SavedJobsScreen } from '../screens/SavedJobsScreen';
import { MainTabParamList, HomeStackParamList, ProfileStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();

const HomeNavigator = () => {
    const { colors } = useTheme();
    const headerStyle = {
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700' as const, fontSize: 18, color: colors.text },
        headerShadowVisible: false,
    };

    return (
        <HomeStack.Navigator>
            <HomeStack.Screen name="JobBoard" component={HomeScreen} options={{ title: 'Job Board', ...headerStyle }} />
            <HomeStack.Screen name="JobDetails" component={JobDetailsScreen} options={{ title: 'Job Details', ...headerStyle }} />
        </HomeStack.Navigator>
    );
};

const ProfileNavigator = () => {
    const { colors } = useTheme();
    const headerStyle = {
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700' as const, fontSize: 18, color: colors.text },
        headerShadowVisible: false,
    };

    return (
        <ProfileStackNav.Navigator>
            <ProfileStackNav.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'My Profile', ...headerStyle }} />
            <ProfileStackNav.Screen name="MyApplications" component={MyApplicationsScreen} options={{ title: 'My Applications', ...headerStyle }} />
            <ProfileStackNav.Screen name="SavedJobs" component={SavedJobsScreen} options={{ title: 'Saved Jobs', ...headerStyle }} />
        </ProfileStackNav.Navigator>
    );
};

export const MainTab = () => {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }: any) => ({
                tabBarIcon: ({ focused, color, size }: any) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Home') {
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
                    } else if (route.name === 'AddJob') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else {
                        iconName = 'alert';
                    }

                    return <Ionicons name={iconName} size={focused ? 26 : 24} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.tabBar,
                    borderTopWidth: 1,
                    borderTopColor: colors.borderLight,
                    paddingTop: 6,
                    paddingBottom: 8,
                    height: 64,
                    shadowColor: '#1E293B',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                    elevation: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginTop: 2,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeNavigator} options={{ title: 'Jobs' }} />
            <Tab.Screen
                name="AddJob"
                component={AddEditJobScreen}
                options={{
                    title: 'Post Job',
                    headerShown: true,
                    headerStyle: { backgroundColor: colors.surface },
                    headerTitleStyle: { fontWeight: '700' as const, fontSize: 18, color: colors.text },
                    headerShadowVisible: false,
                    headerTitleAlign: 'center',
                }}
            />
            <Tab.Screen name="Profile" component={ProfileNavigator} />
        </Tab.Navigator>
    );
};
