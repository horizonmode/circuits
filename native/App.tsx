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

import {
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
} from '@microsoft/signalr';

import Circle from './Circle';

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
    });

    connection.start();

    return () => {
      if (connection.state === HubConnectionState.Connected) connection.stop();
    };
  }, [setMessage]);

  return (
    <SafeAreaView style={{width: '100%', height: '100%', display: 'flex'}}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={{display: 'flex', width: '100%', alignItems: 'center'}}>
        <Text style={{fontSize: 50, color: 'black'}}>Dumbell Lifts</Text>
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
            uri: videoSrc,
          }}
          paused={false} // make it start
          repeat={true} //
          resizeMode="contain"
          style={{
            position: 'absolute',
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
          right: 5,
          bottom: 5,
          display: 'flex',
          alignItems: 'center',
        }}>
        <MarqueeText
          style={{fontSize: 24}}
          speed={1}
          marqueeOnStart={true}
          loop={true}
          delay={1000}>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry and typesetting industry.
        </MarqueeText>
        <Text style={{fontSize: 50, color: 'black'}}>{message}</Text>
        <Circle text={'test'} />
      </View>
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
