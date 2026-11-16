import { useEffect, useRef } from 'react';
import { Animated, Easing, View, Text, StyleSheet } from 'react-native';
import Svg, { ClipPath, Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';
import { colors, spacing } from '../theme';

// Cute brown-and-white cartoon cow walking in place.
// Drawn in a 200x200 box; each moving part is its own layer so it can pivot around a joint.
const S = 200;
const OUT = '#6D4C41';
const CREAM = '#FFF8F0';
const BROWN = '#9A6240';
const PINK = '#F6A5B5';

const Layer = ({ children }) => (
  <Svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={StyleSheet.absoluteFill}>{children}</Svg>
);

// Rotate a full-size layer around (px, py) instead of its center.
const pivot = (px, py, rotate) => [
  { translateX: px - S / 2 }, { translateY: py - S / 2 }, { rotate },
  { translateX: -(px - S / 2) }, { translateY: -(py - S / 2) },
];

function LegShape({ x, far }) {
  return (
    <Layer>
      <Rect x={x} y="132" width="14" height="43" rx="7" fill={far ? '#EBDDD0' : CREAM} stroke={OUT} strokeWidth="2.5" />
      <Path d={`M${x} 165 h14 v4 q0 6 -7 6 q-7 0 -7 -6 z`} fill="#5D4037" stroke={OUT} strokeWidth="2" />
    </Layer>
  );
}

function Leg({ x, far, rotate }) {
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { transform: pivot(x + 7, 135, rotate) }]}>
      <LegShape x={x} far={far} />
    </Animated.View>
  );
}

function Grass() {
  return (
    <Layer>
      <Ellipse cx="100" cy="178" rx="76" ry="13" fill="#8BC34A" />
      <Ellipse cx="100" cy="176" rx="68" ry="9" fill="#9CCC65" />
      <Path d="M40 176 l3 -10 l3 10 M58 178 l3 -8 l3 8 M138 177 l3 -10 l3 10 M160 176 l3 -8 l3 8" stroke="#689F38" strokeWidth="3" strokeLinecap="round" fill="none" />
    </Layer>
  );
}

function Tail() {
  return (
    <Layer>
      <Path d="M168 104 C 188 98, 192 78, 185 62" stroke={OUT} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <Ellipse cx="184" cy="55" rx="6.5" ry="11" transform="rotate(12 184 55)" fill="#5D4037" stroke={OUT} strokeWidth="2" />
    </Layer>
  );
}

function Body() {
  return (
    <Layer>
      <Defs><ClipPath id="cowBody"><Ellipse cx="120" cy="118" rx="52" ry="36" /></ClipPath></Defs>
      <Ellipse cx="120" cy="118" rx="52" ry="36" fill={CREAM} stroke={OUT} strokeWidth="2.5" />
      <G clipPath="url(#cowBody)" fill={BROWN}>
        <Ellipse cx="142" cy="98" rx="24" ry="19" />
        <Ellipse cx="104" cy="142" rx="17" ry="11" />
        <Ellipse cx="152" cy="138" rx="11" ry="10" />
      </G>
      <Ellipse cx="118" cy="151" rx="13" ry="7" fill={PINK} stroke={OUT} strokeWidth="2" />
    </Layer>
  );
}

function Head() {
  return (
    <Layer>
      <Defs><ClipPath id="cowHead"><Circle cx="66" cy="82" r="34" /></ClipPath></Defs>
      <Path d="M48 56 q-6 -14 4 -16 q4 8 4 17 z" fill="#F5E6C8" stroke={OUT} strokeWidth="2" />
      <Path d="M82 52 q4 -14 14 -12 q-2 9 -9 16 z" fill="#F5E6C8" stroke={OUT} strokeWidth="2" />
      <Ellipse cx="30" cy="72" rx="17" ry="9" transform="rotate(-18 30 72)" fill={CREAM} stroke={OUT} strokeWidth="2.5" />
      <Ellipse cx="30" cy="72" rx="11" ry="5" transform="rotate(-18 30 72)" fill={PINK} />
      <Ellipse cx="103" cy="68" rx="17" ry="9" transform="rotate(22 103 68)" fill={CREAM} stroke={OUT} strokeWidth="2.5" />
      <Ellipse cx="103" cy="68" rx="11" ry="5" transform="rotate(22 103 68)" fill={PINK} />
      <Circle cx="66" cy="82" r="34" fill={CREAM} stroke={OUT} strokeWidth="2.5" />
      <G clipPath="url(#cowHead)"><Ellipse cx="86" cy="64" rx="19" ry="21" fill={BROWN} /></G>
      <Path d="M58 50 q4 -9 9 -2 q3 -7 8 1" fill={CREAM} stroke={OUT} strokeWidth="2" strokeLinejoin="round" />
      <Ellipse cx="50" cy="78" rx="9.5" ry="11.5" fill="#fff" stroke={OUT} strokeWidth="1.8" />
      <Circle cx="48" cy="80" r="6.8" fill="#2A1B14" />
      <Circle cx="45.5" cy="76.5" r="2.8" fill="#fff" />
      <Circle cx="50" cy="84" r="1.4" fill="#fff" />
      <Ellipse cx="80" cy="76" rx="9.5" ry="11.5" fill="#fff" stroke={OUT} strokeWidth="1.8" />
      <Circle cx="78" cy="78" r="6.8" fill="#2A1B14" />
      <Circle cx="75.5" cy="74.5" r="2.8" fill="#fff" />
      <Circle cx="80" cy="82" r="1.4" fill="#fff" />
      <Ellipse cx="38" cy="96" rx="6" ry="3.5" fill={PINK} opacity="0.6" />
      <Ellipse cx="94" cy="94" rx="6" ry="3.5" fill={PINK} opacity="0.6" />
      <Ellipse cx="64" cy="106" rx="25" ry="16" fill={PINK} stroke="#C26A7C" strokeWidth="2" />
      <Ellipse cx="54" cy="100" rx="3" ry="4" fill="#B0475D" />
      <Ellipse cx="74" cy="100" rx="3" ry="4" fill="#B0475D" />
      <Path d="M50 111 Q64 126 78 111 Q64 116 50 111 z" fill="#8B2E3B" stroke="#8B2E3B" strokeWidth="1.5" strokeLinejoin="round" />
      <Path d="M58 116 Q64 123 70 116 Q64 119 58 116 z" fill="#F48FB1" />
      <Path d="M44 122 Q64 138 90 120" stroke="#7E57C2" strokeWidth="6" strokeLinecap="round" fill="none" />
      <Circle cx="66" cy="136" r="7.5" fill="#FFC107" stroke="#B8860B" strokeWidth="2" />
      <Path d="M62 137 h8" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" />
    </Layer>
  );
}

/** Cute cartoon cow walking in place — used for every loading state in the app. */
export default function GrazingCow({ message, size = 150 }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 350, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 350, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t]);

  const stepA = t.interpolate({ inputRange: [0, 1], outputRange: ['-20deg', '20deg'] });
  const stepB = t.interpolate({ inputRange: [0, 1], outputRange: ['20deg', '-20deg'] });
  const tail = t.interpolate({ inputRange: [0, 1], outputRange: ['10deg', '-14deg'] });
  const nod = t.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '5deg'] });
  const bob = t.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  const scale = size / S;

  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={message || 'Loading'}>
      <View style={{ width: size, height: size }}>
        <View style={{ width: S, height: S, transform: [{ translateX: -(S - size) / 2 }, { translateY: -(S - size) / 2 }, { scale }] }}>
          <Grass />
          <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: bob }] }]}>
            <Leg x={160} far rotate={stepA} />
            <Leg x={84} far rotate={stepB} />
            <Animated.View style={[StyleSheet.absoluteFill, { transform: pivot(168, 104, tail) }]}><Tail /></Animated.View>
            <Body />
            <Leg x={146} rotate={stepB} />
            <Leg x={96} rotate={stepA} />
            <Animated.View style={[StyleSheet.absoluteFill, { transform: pivot(88, 105, nod) }]}><Head /></Animated.View>
          </Animated.View>
        </View>
      </View>
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  text: { marginTop: spacing.md, color: colors.textMuted, fontWeight: '600' },
});
