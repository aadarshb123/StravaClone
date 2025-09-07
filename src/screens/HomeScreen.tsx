import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {useDispatch, useSelector} from 'react-redux';
import {addActivity} from '../store/slices/activitiesSlice';
import firestore from '@react-native-firebase/firestore';
import {RootState} from '../store';

interface Location {
  latitude: number;
  longitude: number;
}

const HomeScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [lastLocation, setLastLocation] = useState<Location | null>(null);
  const [pace, setPace] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  useEffect(() => {
    requestLocationPermission();
    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      // Start timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      // Start tracking location
      watchIdRef.current = Geolocation.watchPosition(
        (position) => {
          const {latitude, longitude} = position.coords;
          const newLocation = {latitude, longitude};
          
          setCurrentLocation(newLocation);
          
          // Calculate distance if we have previous location
          if (lastLocation) {
            const newDistance = calculateDistance(lastLocation, newLocation);
            setDistance(prev => prev + newDistance);
          }
          
          setLastLocation(newLocation);
        },
        (error) => {
          console.log('Location error:', error);
        },
        {
          accuracy: {
            android: 'high',
            ios: 'best',
          },
          enableHighAccuracy: true,
          distanceFilter: 10, // Update every 10 meters
          interval: 5000,
          fastestInterval: 2000,
        }
      );
    } else {
      // Stop tracking
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, lastLocation]);

  useEffect(() => {
    // Calculate pace
    if (distance > 0 && duration > 0) {
      const paceValue = (duration / 60) / distance;
      setPace(paceValue);
    }
  }, [distance, duration]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      if (auth !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for tracking');
      }
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location for tracking activities',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Location permission is required for tracking');
      }
    }
  };

  const calculateDistance = (loc1: Location, loc2: Location): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(loc2.latitude - loc1.latitude);
    const dLon = toRad(loc2.longitude - loc1.longitude);
    const lat1 = toRad(loc1.latitude);
    const lat2 = toRad(loc2.latitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * 
              Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in km
  };

  const toRad = (value: number): number => {
    return value * Math.PI / 180;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      setDuration(0);
      setDistance(0);
      setLastLocation(null);
      setPace(0);
    } else {
      // Stop recording
      setIsRecording(false);
      if (distance > 0.01) { // Only save if distance is meaningful
        saveActivity();
      } else {
        Alert.alert('No Activity', 'No significant distance was recorded');
        setDuration(0);
        setDistance(0);
        setLastLocation(null);
      }
    }
  };

  const saveActivity = async () => {
    const activity = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      duration,
      distance: distance.toFixed(2),
      type: 'Run',
      userId: currentUser?.id || '',
    };

    try {
      // Save to Firestore
      await firestore()
        .collection('activities')
        .add({
          ...activity,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      // Also update user stats
      if (currentUser?.id) {
        const userRef = firestore().collection('users').doc(currentUser.id);
        await userRef.update({
          totalActivities: firestore.FieldValue.increment(1),
          totalDistance: firestore.FieldValue.increment(parseFloat(distance.toFixed(2))),
          totalDuration: firestore.FieldValue.increment(duration),
        });
      }

      // Dispatch to Redux store for local state
      dispatch(addActivity(activity));
      
      Alert.alert(
        'Activity Saved!',
        `Duration: ${formatTime(duration)}\nDistance: ${distance.toFixed(2)} km`,
        [{text: 'OK'}]
      );
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert('Error', 'Failed to save activity. Please try again.');
    }

    // Reset values
    setDuration(0);
    setDistance(0);
    setLastLocation(null);
    setPace(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Tracker</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>{formatTime(duration)}</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={styles.statValue}>{distance.toFixed(2)} km</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Pace</Text>
          <Text style={styles.statValue}>
            {pace > 0 ? pace.toFixed(2) : '0.00'} min/km
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.startButton,
          isRecording && styles.stopButton
        ]}
        onPress={handleStartStop}>
        <Text style={styles.buttonText}>
          {isRecording ? 'STOP' : 'START'}
        </Text>
      </TouchableOpacity>

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Recording Activity</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    marginBottom: 60,
  },
  statBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  startButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FC4C02',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  stopButton: {
    backgroundColor: '#d32f2f',
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d32f2f',
    marginRight: 10,
  },
  recordingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default HomeScreen;