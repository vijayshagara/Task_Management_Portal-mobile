import { useEffect, useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchListings } from './marketplaceSlice';
import { getSocialMediaUrl } from '../../utils/socialHelpers';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme';

export default function MarketplaceScreen({ navigation }) {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.marketplace);

  useEffect(() => {
    dispatch(fetchListings());
  }, [dispatch]);

  if (loading && !items.length) return <LoadingView message="Loading marketplace…" />;

  return (
    <Screen
      title="Marketplace"
      subtitle="Buy & sell livestock"
      action={<Button title="Sell" onPress={() => navigation.navigate('CreateListing')} style={{ paddingVertical: 8, minHeight: 36 }} />}
    >
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title="No listings yet" message="Check back later for cows and equipment" />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ListingDetail', { id: item.id })}>
            {item.photos?.[0] ? (
              <Image source={{ uri: getSocialMediaUrl(item.photos[0]) }} style={styles.img} />
            ) : (
              <View style={styles.placeholder}><Text>🐄</Text></View>
            )}
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.price}>₹{item.price}{item.negotiable ? ' · Negotiable' : ''}</Text>
            <Text style={styles.location} numberOfLines={1}>{item.location || '—'}</Text>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.sm },
  row: { gap: spacing.sm },
  card: { flex: 1, backgroundColor: colors.card, borderRadius: 12, overflow: 'hidden', marginBottom: spacing.sm },
  img: { width: '100%', height: 120 },
  placeholder: { height: 120, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '600', fontSize: 13, padding: spacing.sm, color: colors.text },
  price: { paddingHorizontal: spacing.sm, color: colors.primary, fontWeight: '700' },
  location: { padding: spacing.sm, paddingTop: 0, fontSize: 11, color: colors.textMuted },
});
