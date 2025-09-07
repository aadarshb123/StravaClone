import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../store';
import auth from '@react-native-firebase/auth';
import {logout} from '../store/slices/userSlice';

const ProfileScreen = () => {
  // Get user data and stats from Redux store
  const activities = useSelector((state: RootState) => state.activities.list);
  const user = useSelector((state: RootState) => state.user.currentUser);
  const dispatch = useDispatch();
  
  const handleLogout = async () => {
    try {
      await auth().signOut();
      dispatch(logout());
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Calculate stats
  const totalActivities = activities.length || 3; // Mock: 3
  const totalDistance = activities.reduce((sum: number, activity: any) => 
    sum + parseFloat(activity.distance || 0), 0) || 23.5; // Mock: 23.5
  const totalDuration = activities.reduce((sum: number, activity: any) => 
    sum + (activity.duration || 0), 0) || 7800; // Mock: 7800

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Icon name="account-circle" size={100} color="#FC4C02" />
        </View>
        <Text style={styles.userName}>{user?.name || 'John Doe'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'john.doe@example.com'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>All-Time Stats</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="directions-run" size={30} color="#FC4C02" />
            <Text style={styles.statNumber}>{totalActivities}</Text>
            <Text style={styles.statLabel}>Activities</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="timeline" size={30} color="#FC4C02" />
            <Text style={styles.statNumber}>{totalDistance.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Total km</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="timer" size={30} color="#FC4C02" />
            <Text style={styles.statNumber}>{formatTotalTime(totalDuration)}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="settings" size={24} color="#666" />
          <Text style={styles.menuText}>Settings</Text>
          <Icon name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="help-outline" size={24} color="#666" />
          <Text style={styles.menuText}>Help & Support</Text>
          <Icon name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="info-outline" size={24} color="#666" />
          <Text style={styles.menuText}>About</Text>
          <Icon name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#d32f2f" />
          <Text style={[styles.menuText, styles.logoutText]}>Log Out</Text>
          <Icon name="chevron-right" size={24} color="#d32f2f" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutButton: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#d32f2f',
  },
});

export default ProfileScreen;