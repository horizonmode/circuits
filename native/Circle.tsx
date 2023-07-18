/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {ColorValue, Text, View} from 'react-native';
import {Svg, Circle} from 'react-native-svg';

export type CircleProps = {
  text: string;
  total: number;
  remaining: number;
  fontColor: ColorValue;
};

function CircleTimer({
  text,
  total,
  remaining,
  fontColor,
}: CircleProps): JSX.Element {
  const size = 200;
  const width = 200;
  const radius = 50;
  let percentLeft = remaining / total;
  let pct = 100;
  if (percentLeft) {
    const c = Math.PI * (radius * 2);
    if (percentLeft < 0) percentLeft = 0;
    if (percentLeft > 100) percentLeft = 100;
    pct = (1 - percentLeft) * c;
  }
  return (
    <View
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Svg
        width={width}
        height={size}
        style={{transform: [{rotateZ: '-90deg'}]}}>
        <Circle
          cx="100"
          cy="100"
          r={radius}
          stroke={'grey'}
          strokeWidth="8"
          opacity={'.3'}
          fill="transparent"
        />
        <Circle
          cx="100"
          cy="100"
          r={radius}
          stroke={fontColor}
          strokeWidth="8"
          fill="transparent"
          strokeDashoffset={pct}
          strokeDasharray={2 * Math.PI * radius}
        />
      </Svg>
      <Text
        style={{
          textAlign: 'center',
          fontSize: 50,
          position: 'absolute',
          color: fontColor,
          fontWeight: '400',
        }}>
        {text}
      </Text>
    </View>
  );
}

export default CircleTimer;
