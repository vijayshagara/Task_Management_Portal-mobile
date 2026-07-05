import { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchListing, contactSeller } from './marketplaceSlice';
import { fetchConversations } from './messagesSlice';
import { getSocialMediaUrl } from '../../utils/socialHelpers';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import RefreshableScrollView from '../../components/RefreshableScrollView';
import useRefresh from '../../hooks/useRefresh';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme';

export default function ListingDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const dispatch = useDispatch();
  const { selected: listing, detailLoading } = useSelector((s) => s.marketplace);

  useEffect(() => {
    dispatch(fetchListing(id));
  }, [dispatch, id]);

  const load = useCallback(() => dispatch(fetchListing(id)).unwrap(), [dispatch, id]);
  const { refreshing, onRefresh } = useRefresh(load);

  const handleContact = async () => {
    try {
      const conversation = await dispatch(contactSeller({ id, message: `Hi, I'm interested in: ${listing.title}` })).unwrap();
      await dispatch(fetchConversations());
      navigation.getParent()?.navigate('MessagesTab', { screen: 'Chat', params: { conversationId: conversation.id } });
    } catch (err) {
      Alert.alert('Error', err);
    }
  };

  if (detailLoading || !listing || listing.id !== id) return <LoadingView message="Loading listing…" />;

  return (
    <Screen title={listing.title} subtitle={`${listing.listingType} · ${listing.location || '—'}`}>
      <RefreshableScrollView
        contentContainerStyle={{ padding: spacing.md }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        {listing.photos?.map((photo) => (
          <Image key={photo} source={{ uri: getSocialMediaUrl(photo) }} style={styles.img} />
        ))}
        <Text style={styles.price}>₹{listing.price} {listing.negotiable && <Text style={styles.neg}>(Negotiable)</Text>}</Text>
        <Text style={styles.desc}>{listing.description}</Text>
        <View style={styles.grid}>
          {listing.breed && <View style={styles.gridItem}><Text style={styles.gridLabel}>Breed</Text><Text>{listing.breed}</Text></View>}
          {listing.age && <View style={styles.gridItem}><Text style={styles.gridLabel}>Age</Text><Text>{listing.age}</Text></View>}
          {listing.weight && <View style={styles.gridItem}><Text style={styles.gridLabel}>Weight</Text><Text>{listing.weight} kg</Text></View>}
        </View>
        <Text style={styles.seller}>Seller: {listing.seller?.name} ({listing.seller?.profile?.farmName})</Text>
        <Button title="Chat with Seller" onPress={handleContact} style={{ marginTop: spacing.lg }} />
      </RefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  img: { width: '100%', height: 220, borderRadius: 12, marginBottom: spacing.sm },
  price: { fontSize: 24, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  neg: { fontSize: 14, color: colors.textMuted },
  desc: { fontSize: 15, lineHeight: 22, color: colors.text, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  gridItem: { backgroundColor: colors.primaryLight, padding: spacing.sm, borderRadius: 8, minWidth: '45%' },
  gridLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  seller: { marginTop: spacing.md, color: colors.textMuted },
});
