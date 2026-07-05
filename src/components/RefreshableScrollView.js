import { ScrollView, RefreshControl } from 'react-native';
import { colors } from '../theme';

export default function RefreshableScrollView({ refreshing = false, onRefresh, style, ...props }) {
  return (
    <ScrollView
      style={[{ flex: 1 }, style]}
      {...props}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        ) : undefined
      }
    />
  );
}
