import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExplore, globalSearch, clearSearchResults } from './notificationsSlice';
import { getSocialMediaUrl } from '../../utils/socialHelpers';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme';

export default function ExploreScreen({ navigation }) {
  const dispatch = useDispatch();
  const { explore, searchResults } = useSelector((s) => s.notifications);
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchExplore());
    return () => dispatch(clearSearchResults());
  }, [dispatch]);

  if (!explore && !searchResults) return <LoadingView message="Loading explore…" />;

  return (
    <Screen title="Explore" subtitle="Discover farms and listings">
      <View style={styles.searchRow}>
        <Input value={query} onChangeText={setQuery} placeholder="Search users, farms…" style={{ flex: 1, marginBottom: 0 }} />
        <Button title="Go" onPress={() => query.trim() && dispatch(globalSearch(query.trim()))} style={{ minWidth: 60 }} />
      </View>

      <ScrollView>
        {searchResults ? (
          <>
            {searchResults.users?.map((u) => (
              <TouchableOpacity key={u.id} style={styles.item} onPress={() => navigation.navigate('Profile', { userId: u.id })}>
                <Text style={styles.itemTitle}>{u.name}</Text>
                <Text style={styles.itemSub}>@{u.profile?.username}</Text>
              </TouchableOpacity>
            ))}
            {searchResults.listings?.map((l) => (
              <TouchableOpacity key={l.id} style={styles.item} onPress={() => navigation.navigate('ListingDetail', { id: l.id })}>
                <Text style={styles.itemTitle}>{l.title}</Text>
                <Text style={styles.itemSub}>₹{l.price}</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending Hashtags</Text>
              <View style={styles.tags}>
                {explore.trendingHashtags?.map(({ tag, count }) => (
                  <Text key={tag} style={styles.tag}>#{tag} ({count})</Text>
                ))}
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Suggested Farmers</Text>
              {explore.suggestedUsers?.map((u) => (
                <TouchableOpacity key={u.id} style={styles.userCard} onPress={() => navigation.navigate('Profile', { userId: u.id })}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{u.name?.charAt(0)}</Text></View>
                  <View>
                    <Text style={styles.itemTitle}>{u.name}</Text>
                    <Text style={styles.itemSub}>{u.profile?.farmName}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Listings</Text>
              {explore.recentListings?.map((l) => (
                <TouchableOpacity key={l.id} style={styles.listingCard} onPress={() => navigation.navigate('ListingDetail', { id: l.id })}>
                  {l.photos?.[0] && <Image source={{ uri: getSocialMediaUrl(l.photos[0]) }} style={styles.listingImg} />}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{l.title}</Text>
                    <Text style={styles.itemSub}>₹{l.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.card },
  section: { backgroundColor: colors.card, margin: spacing.sm, padding: spacing.md, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.sm, color: colors.text },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700' },
  listingCard: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  listingImg: { width: 56, height: 56, borderRadius: 8 },
  item: { backgroundColor: colors.card, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemTitle: { fontWeight: '600', color: colors.text },
  itemSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});
