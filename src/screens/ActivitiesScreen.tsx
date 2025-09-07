import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {format} from 'date-fns';
import {useSelector} from 'react-redux';
import {RootState} from '../store';
import {Activity} from '../store/slices/activitiesSlice';
import {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';

const ActivitiesScreen = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection('activities')
      .where('userId', '==', currentUser.id)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const fetchedActivities: Activity[] = [];
          snapshot.forEach((doc) => {
            fetchedActivities.push({
              id: doc.id,
              ...doc.data(),
            } as Activity);
          });
          setActivities(fetchedActivities);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching activities:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [currentUser]);

  // Mock data for testing (remove when Firebase is working)
  const mockActivities: Activity[] = [
    {
      id: '1',
      date: new Date().toISOString(),
      duration: 1800,
      distance: '5.2',
      type: 'Run',
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000).toISOString(),
      duration: 3600,
      distance: '10.5',
      type: 'Run',
    },
    {
      id: '3',
      date: new Date(Date.now() - 172800000).toISOString(),
      duration: 2400,
      distance: '7.8',
      type: 'Run',
    },
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const renderActivity = ({item}: {item: Activity}) => (
    <TouchableOpacity style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={styles.activityTypeContainer}>
          <Icon name="directions-run" size={24} color="#FC4C02" />
          <Text style={styles.activityType}>{item.type}</Text>
        </View>
        <Text style={styles.activityDate}>
          {format(new Date(item.date), 'MMM d, yyyy')}
        </Text>
      </View>
      
      <View style={styles.activityStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.distance}</Text>
          <Text style={styles.statLabel}>km</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDuration(item.duration)}</Text>
          <Text style={styles.statLabel}>Time</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {item.distance && item.duration 
              ? (item.duration / 60 / parseFloat(item.distance)).toFixed(2)
              : '0.00'}
          </Text>
          <Text style={styles.statLabel}>min/km</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {displayActivities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="directions-run" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No activities yet</Text>
          <Text style={styles.emptySubtext}>
            Start recording your first activity!
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayActivities}
          renderItem={renderActivity}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 15,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  activityTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  activityDate: {
    fontSize: 14,
    color: '#666',
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
});

export default ActivitiesScreen;