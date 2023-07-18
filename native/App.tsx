/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Image,
  ImageBackground,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import Video from 'react-native-video';

import MarqueeText from 'react-native-marquee';

import 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import {
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
} from '@microsoft/signalr';

import Circle from './Circle';
import {Programme, ScreenMapping} from './types';
import KeepAwake from 'react-native-keep-awake';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [videoSrc, setVideoSrc] = useState(
    'https://static.signageos.io/assets/video-test-1_e07fc21a7a72e3d33478243bd75d7743.mp4',
  );

  useEffect(() => {
    setVideoSrc(
      'https://signalromm3467ae.blob.core.windows.net/videos/Barbell floor chest press_4.mp4',
    );
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [time, setTime] = useState(0);
  const [mode, setMode] = useState('active');
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [programmeId, setProgrammeId] = useState<string>('');
  const [workout, setWorkout] = useState<ScreenMapping | null>(null);
  const [screen, setScreen] = useState<string>('');
  const [updated, setUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (programme && programmeId) {
      if (programmeId !== programme.sourceWorkoutId) {
        fetchProgramme();
      }
    }
  }, [programmeId, programme]);

  useEffect(() => {
    console.log(updated, programme?.lastUpdated);
    if (updated !== programme?.lastUpdated) {
      fetchProgramme();
    }
  }, [updated, programme?.lastUpdated]);

  //   const SetScreenStore = async (screenTag: string) => {
  //     await Preferences.set({
  //       key: "screen",
  //       value: screenTag,
  //     });
  //   };

  //   const GetScreen = async () => {
  //     const ret = await Preferences.get({ key: "screen" });
  //     return ret.value;
  //   };

  useEffect(() => {
    if (programme) {
      const workout = programme.mappings.find(m => m.screen.tag === screen);
      if (workout) {
        setWorkout(workout);
      }
    }
  }, [screen, programme]);

  useEffect(() => {
    const setupScreen = async () => {
      setScreen('screen1');
    };
    if (programme) setupScreen();
  }, [programme]);

  const fetchProgramme = async () => {
    console.log(process.env.REACT_APP_API_URL);
    const res = await fetch(
      `https://signalromm.azurewebsites.net/api/programme/getActive?code=1yI4xG8VMfZB1wp0n3ukdc_QMX0eKUskLEr-iRyVMKr7AzFuX2CbCw==&clientId=default`,
    );
    const progJson = (await res.json()) as Programme;
    setProgramme(progJson);
  };

  useEffect(() => {
    fetchProgramme();
  }, []);

  const styles = {
    videoView: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      flexDirection: 'column',
    },
    videoStyle: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
  };

  const [message, setMessage] = useState('');

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(`https://signalromm.azurewebsites.net/api`)
      .configureLogging(LogLevel.Information)
      .build();
    connection.on('newMessage', (message, mode, workoutId, timeUpdated) => {
      setMessage(message);
      setTime(parseInt(message, 10));
      setMode(mode);
      setProgrammeId(workoutId);
      setUpdated(timeUpdated);
    });

    connection.start();

    return () => {
      if (connection.state === HubConnectionState.Connected) connection.stop();
    };
  }, [setMessage]);

  return !workout ? (
    <Text>Loading...</Text>
  ) : (
    <SafeAreaView
      style={{
        flex: 1,
        display: 'flex',
        backgroundColor: Colors.white,
      }}>
      <KeepAwake />
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={Colors.white}
      />
      <View
        style={{
          position: 'absolute',
          marginLeft: 5,
          marginTop: 5,
          zIndex: 3,
          width: '10%',
          aspectRatio: 1,
        }}>
        <ImageBackground
          resizeMode="cover"
          style={{flex: 1}}
          source={require('./assets/images/logo-circle.jpg')}></ImageBackground>
      </View>
      <View
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          backgroundColor: Colors.white,
        }}>
        <Text
          style={{
            fontSize: 50,
            fontFamily: 'LeagueSpartan-Bold',
            color: 'grey',
          }}>
          {workout.exercise1?.title.toUpperCase()}
        </Text>
      </View>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          flexDirection: 'column',
        }}>
        <Video
          source={{
            uri: workout?.exercise1?.videoUrl,
          }}
          paused={!workout?.exercise1?.videoUrl} // make it start
          repeat={true} //
          resizeMode="contain"
          style={{
            position: 'absolute',
            zIndex: 1,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          zIndex: 8,
          display: 'flex',
          alignItems: 'center',
        }}>
        <Circle
          fontColor={mode === 'rest' ? '#0000FE' : '#FF6501'}
          total={
            mode == 'active'
              ? programme?.activeTime || 0
              : programme?.restTime || 0
          }
          remaining={time}
          text={time.toString()}
        />
        {mode === 'rest' && (
          <Text style={{position: 'absolute', top: 20, color: 'blue'}}>
            Rest
          </Text>
        )}
      </View>

      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        colors={['#fff', '#0000FE']}
        style={{
          position: 'absolute',
          opacity: 0.5,
          zIndex: 7,
          bottom: 0,
          width: '100%',
          height: '10%',
          display: 'flex',
          alignContent: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            fontSize: 24,
            fontFamily: 'LeagueSpartan-ExtraBold',
            color: '#0000FE',
            fontStyle: 'italic',
          }}>
          {programme?.message?.toLocaleUpperCase()}
        </Text>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    width: 100,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
