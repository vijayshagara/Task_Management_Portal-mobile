import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

import LoginScreen from '../features/auth/LoginScreen';
import RegisterScreen from '../features/auth/RegisterScreen';
import FeedScreen from '../features/social/FeedScreen';
import ExploreScreen from '../features/social/ExploreScreen';
import MarketplaceScreen from '../features/social/MarketplaceScreen';
import ListingDetailScreen from '../features/social/ListingDetailScreen';
import CreateListingScreen from '../features/social/CreateListingScreen';
import ProfileScreen from '../features/social/ProfileScreen';
import ConversationsScreen from '../features/social/ConversationsScreen';
import ChatScreen from '../features/social/ChatScreen';
import FarmMenuScreen from '../features/dashboard/FarmMenuScreen';
import DashboardScreen from '../features/dashboard/DashboardScreen';
import CowListScreen from '../features/cows/CowListScreen';
import CowDetailScreen from '../features/cows/CowDetailScreen';
import CowFormScreen from '../features/cows/CowFormScreen';
import HealthScreen from '../features/health/HealthScreen';
import HeatCycleScreen from '../features/heatCycles/HeatCycleScreen';
import TasksScreen from '../features/tasks/TasksScreen';
import UsersScreen from '../features/users/UsersScreen';
import NotificationsScreen from '../features/social/NotificationsScreen';
import SettingsScreen from '../features/social/SettingsScreen';
import DiaryScreen from '../features/farm/DiaryScreen';
import MilkScreen from '../features/farm/MilkScreen';
import VaccinationsScreen from '../features/farm/VaccinationsScreen';
import PregnanciesScreen from '../features/farm/PregnanciesScreen';
import KnowledgeScreen from '../features/farm/KnowledgeScreen';
import DevicesScreen from '../features/farm/DevicesScreen';

const AuthStack = createNativeStackNavigator();
const FeedStack = createNativeStackNavigator();
const ExploreStack = createNativeStackNavigator();
const MarketStack = createNativeStackNavigator();
const MessagesStack = createNativeStackNavigator();
const MenuStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function FeedNavigator() {
  return (
    <FeedStack.Navigator screenOptions={{ headerShown: false }}>
      <FeedStack.Screen name="FeedHome" component={FeedScreen} />
      <FeedStack.Screen name="Profile" component={ProfileScreen} />
    </FeedStack.Navigator>
  );
}

function ExploreNavigator() {
  return (
    <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
      <ExploreStack.Screen name="ExploreHome" component={ExploreScreen} />
      <ExploreStack.Screen name="Profile" component={ProfileScreen} />
      <ExploreStack.Screen name="ListingDetail" component={ListingDetailScreen} />
    </ExploreStack.Navigator>
  );
}

function MarketNavigator() {
  return (
    <MarketStack.Navigator screenOptions={{ headerShown: false }}>
      <MarketStack.Screen name="MarketHome" component={MarketplaceScreen} />
      <MarketStack.Screen name="ListingDetail" component={ListingDetailScreen} />
      <MarketStack.Screen name="CreateListing" component={CreateListingScreen} />
      <MarketStack.Screen name="Profile" component={ProfileScreen} />
    </MarketStack.Navigator>
  );
}

function MessagesNavigator() {
  return (
    <MessagesStack.Navigator screenOptions={{ headerShown: false }}>
      <MessagesStack.Screen name="Conversations" component={ConversationsScreen} />
      <MessagesStack.Screen name="Chat" component={ChatScreen} />
    </MessagesStack.Navigator>
  );
}

function MenuNavigator() {
  return (
    <MenuStack.Navigator screenOptions={{ headerShown: false }}>
      <MenuStack.Screen name="FarmMenu" component={FarmMenuScreen} />
      <MenuStack.Screen name="Dashboard" component={DashboardScreen} />
      <MenuStack.Screen name="Diary" component={DiaryScreen} />
      <MenuStack.Screen name="Milk" component={MilkScreen} />
      <MenuStack.Screen name="Vaccinations" component={VaccinationsScreen} />
      <MenuStack.Screen name="Pregnancies" component={PregnanciesScreen} />
      <MenuStack.Screen name="Knowledge" component={KnowledgeScreen} />
      <MenuStack.Screen name="Devices" component={DevicesScreen} />
      <MenuStack.Screen name="Cows" component={CowListScreen} />
      <MenuStack.Screen name="CowDetail" component={CowDetailScreen} />
      <MenuStack.Screen name="CowForm" component={CowFormScreen} />
      <MenuStack.Screen name="Health" component={HealthScreen} />
      <MenuStack.Screen name="HeatCycles" component={HeatCycleScreen} />
      <MenuStack.Screen name="Tasks" component={TasksScreen} />
      <MenuStack.Screen name="Users" component={UsersScreen} />
      <MenuStack.Screen name="Notifications" component={NotificationsScreen} />
      <MenuStack.Screen name="Settings" component={SettingsScreen} />
      <MenuStack.Screen name="Profile" component={ProfileScreen} />
    </MenuStack.Navigator>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.card,
          height: tabBarHeight,
          paddingBottom: insets.bottom,
          paddingTop: Platform.OS === 'android' ? 4 : 6,
        },
        tabBarLabelStyle: { fontSize: 11, marginBottom: Platform.OS === 'android' ? 2 : 0 },
        tabBarIcon: ({ color, size }) => {
          const icons = { FeedTab: 'home', ExploreTab: 'compass', MarketTab: 'storefront', MessagesTab: 'chatbubbles', MenuTab: 'menu' };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="FeedTab" component={FeedNavigator} options={{ title: 'Feed' }} />
      <Tab.Screen name="ExploreTab" component={ExploreNavigator} options={{ title: 'Explore' }} />
      <Tab.Screen name="MarketTab" component={MarketNavigator} options={{ title: 'Market' }} />
      <Tab.Screen name="MessagesTab" component={MessagesNavigator} options={{ title: 'Messages' }} />
      <Tab.Screen name="MenuTab" component={MenuNavigator} options={{ title: 'Farm' }} />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

export default function RootNavigator() {
  const { token, bootstrapping } = useSelector((s) => s.auth);
  if (bootstrapping) return null;
  return (
    <NavigationContainer>
      {token ? <MainTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
