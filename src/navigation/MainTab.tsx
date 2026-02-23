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

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();

const headerStyle = {
    headerStyle: { backgroundColor: '#FFFFFF' },
    headerTitleStyle: { fontWeight: '700' as const, fontSize: 18, color: '#0F172A' },
    headerShadowVisible: false,
};

const HomeNavigator = () => (
    <HomeStack.Navigator>
        <HomeStack.Screen name="JobBoard" component={HomeScreen} options={{ title: 'Job Board', ...headerStyle }} />
        <HomeStack.Screen name="JobDetails" component={JobDetailsScreen} options={{ title: 'Job Details', ...headerStyle }} />
    </HomeStack.Navigator>
);

const ProfileNavigator = () => (
    <ProfileStackNav.Navigator>
        <ProfileStackNav.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'My Profile', ...headerStyle }} />
        <ProfileStackNav.Screen name="MyApplications" component={MyApplicationsScreen} options={{ title: 'My Applications', ...headerStyle }} />
        <ProfileStackNav.Screen name="SavedJobs" component={SavedJobsScreen} options={{ title: 'Saved Jobs', ...headerStyle }} />
    </ProfileStackNav.Navigator>
);

export const MainTab = () => {
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
                tabBarActiveTintColor: '#4F46E5',
                tabBarInactiveTintColor: '#94A3B8',
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#F1F5F9',
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
                    ...headerStyle,
                    headerTitleAlign: 'center',
                }}
            />
            <Tab.Screen name="Profile" component={ProfileNavigator} />
        </Tab.Navigator>
    );
};
