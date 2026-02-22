import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { AddEditJobScreen } from '../screens/AddEditJobScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MainTabParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';

import { createStackNavigator } from '@react-navigation/stack';
import { JobDetailsScreen } from '../screens/JobDetailsScreen';
import { MyApplicationsScreen } from '../screens/MyApplicationsScreen';
import { SavedJobsScreen } from '../screens/SavedJobsScreen';
import { HomeStackParamList, ProfileStackParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const ProfileStackNav = createStackNavigator<ProfileStackParamList>();

const HomeNavigator = () => (
    <HomeStack.Navigator>
        <HomeStack.Screen name="JobBoard" component={HomeScreen} options={{ title: 'Job Board' }} />
        <HomeStack.Screen name="JobDetails" component={JobDetailsScreen} options={{ title: 'Job Details' }} />
    </HomeStack.Navigator>
);

const ProfileNavigator = () => (
    <ProfileStackNav.Navigator>
        <ProfileStackNav.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'My Profile' }} />
        <ProfileStackNav.Screen name="MyApplications" component={MyApplicationsScreen} options={{ title: 'My Applications' }} />
        <ProfileStackNav.Screen name="SavedJobs" component={SavedJobsScreen} options={{ title: 'Saved Jobs' }} />
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

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeNavigator} options={{ title: 'Jobs' }} />
            <Tab.Screen
                name="AddJob"
                component={AddEditJobScreen}
                options={{
                    title: 'Post Job',
                    headerShown: true,
                    headerTitleAlign: 'center'
                }}
            />
            <Tab.Screen name="Profile" component={ProfileNavigator} />
        </Tab.Navigator>
    );
};
