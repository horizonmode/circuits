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

import {Svg, Circle} from 'react-native-svg';

export type CircleProps = {
  text: string;
};

function App({text}: CircleProps): JSX.Element {
  const size = 150;
  const width = 150;
  const height = 100;
  const radius = 50;
  const circunference = 0;
  const strokeWidth = 10;
  const strokeDashoffset = 0;
  return (
    <View style={{alignItems: 'center', justifyContent: 'center'}}>
      <View style={{position: 'absolute'}}>
        <Svg width={width} height={size}>
          <Circle
            stroke="#2162cc"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeDasharray={`${circunference} ${circunference}`}
            {...{strokeWidth, strokeDashoffset}}
          />
        </Svg>
      </View>
      <Text>{text}</Text>
    </View>
  );
}

export default App;
