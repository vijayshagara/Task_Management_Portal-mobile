import { FlatList, RefreshControl } from 'react-native';
import { colors } from '../theme';

export default function RefreshableFlatList({ refreshing = false, onRefresh, contentContainerStyle, data, ...props }) {
  return (
    <FlatList
      data={data}
      {...props}
      contentContainerStyle={[
        (!data || data.length === 0) && styles.emptyGrow,
        contentContainerStyle,
      ]}
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

const styles = {
  emptyGrow: { flexGrow: 1 },
};
