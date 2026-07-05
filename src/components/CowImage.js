import { Image, View, Text, StyleSheet } from 'react-native';
import { getCowImageUrl } from '../utils/helpers';
import { colors } from '../theme';

export default function CowImage({ cow, size = 44, large = false, style }) {
  const frame = large
    ? styles.large
    : { width: size, height: size, borderRadius: size / 2 };

  if (!cow?.image) {
    return (
      <View style={[styles.placeholder, frame, style]}>
        <Text style={{ fontSize: large ? 48 : size * 0.45 }}>🐄</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: getCowImageUrl(cow) }}
      style={[frame, style]}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  large: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
});
