import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyProfile, fetchProfile, fetchUserPosts, followUser, unfollowUser, updateProfile, clearViewedProfile,
} from './profileSlice';
import { likePost, unlikePost } from './feedSlice';
import { startConversation } from './messagesSlice';
import PostCard from './components/PostCard';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import RefreshableScrollView from '../../components/RefreshableScrollView';
import useRefresh from '../../hooks/useRefresh';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors, spacing } from '../../theme';

export default function ProfileScreen({ navigation, route }) {
  const userId = route.params?.userId;
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.user);
  const { myProfile, viewedProfile, userPosts, loading, saving } = useSelector((s) => s.profile);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const isOwnProfile = !userId || userId === currentUser?.id;
  const profile = isOwnProfile ? myProfile : viewedProfile;

  useEffect(() => {
    if (isOwnProfile) dispatch(fetchMyProfile());
    else {
      dispatch(fetchProfile(userId));
      dispatch(fetchUserPosts(userId));
    }
    return () => dispatch(clearViewedProfile());
  }, [dispatch, userId, isOwnProfile]);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        username: profile.profile?.username || '',
        bio: profile.profile?.bio || '',
        farmName: profile.profile?.farmName || '',
        location: profile.profile?.location || '',
      });
    }
  }, [profile]);

  const load = useCallback(() => {
    if (isOwnProfile) return dispatch(fetchMyProfile()).unwrap();
    return Promise.all([
      dispatch(fetchProfile(userId)).unwrap(),
      dispatch(fetchUserPosts(userId)).unwrap(),
    ]);
  }, [dispatch, isOwnProfile, userId]);
  const { refreshing, onRefresh } = useRefresh(load);

  const handleMessage = async () => {
    try {
      const conv = await dispatch(startConversation(userId)).unwrap();
      navigation.getParent()?.navigate('MessagesTab', { screen: 'Chat', params: { conversationId: conv.id } });
    } catch (err) {
      Alert.alert('Error', err);
    }
  };

  const handleSave = async () => {
    try {
      await dispatch(updateProfile(form)).unwrap();
      setEditing(false);
      Alert.alert('Success', 'Profile updated');
    } catch (err) {
      Alert.alert('Error', err);
    }
  };

  if (loading && !profile) return <LoadingView message="Loading profile…" />;

  return (
    <Screen
      title={isOwnProfile ? 'My Profile' : profile?.name}
      subtitle={profile?.profile?.farmName || 'Farmer profile'}
      action={
        !isOwnProfile ? (
          <View style={styles.actions}>
            <Button title="Message" onPress={handleMessage} style={{ paddingHorizontal: 12 }} />
            <Button
              title={profile?.isFollowing ? 'Unfollow' : 'Follow'}
              variant="outline"
              onPress={() => dispatch(profile?.isFollowing ? unfollowUser(userId) : followUser(userId))}
              style={{ paddingHorizontal: 12 }}
            />
          </View>
        ) : (
          <Button title={editing ? 'Cancel' : 'Edit'} variant="outline" onPress={() => setEditing(!editing)} style={{ paddingHorizontal: 12 }} />
        )
      }
    >
      <RefreshableScrollView refreshing={refreshing} onRefresh={onRefresh}>
        <View style={styles.card}>
          <View style={styles.avatarLg}><Text style={styles.avatarLgText}>{profile?.name?.charAt(0)}</Text></View>
          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.username}>@{profile?.profile?.username}</Text>
          <Text style={styles.bio}>{profile?.profile?.bio}</Text>
          <Text style={styles.location}>{profile?.profile?.location}</Text>
          <View style={styles.stats}>
            <View style={styles.stat}><Text style={styles.statNum}>{profile?.stats?.postsCount || 0}</Text><Text style={styles.statLabel}>Posts</Text></View>
            <View style={styles.stat}><Text style={styles.statNum}>{profile?.stats?.followersCount || 0}</Text><Text style={styles.statLabel}>Followers</Text></View>
            <View style={styles.stat}><Text style={styles.statNum}>{profile?.stats?.followingCount || 0}</Text><Text style={styles.statLabel}>Following</Text></View>
          </View>
        </View>

        {editing && (
          <View style={styles.form}>
            {['name', 'username', 'farmName', 'location', 'bio'].map((field) => (
              <Input key={field} value={form[field] || ''} onChangeText={(v) => setForm({ ...form, [field]: v })} placeholder={field} multiline={field === 'bio'} />
            ))}
            <Button title="Save Profile" onPress={handleSave} loading={saving} />
          </View>
        )}

        {!isOwnProfile && userPosts.map((post) => (
          <PostCard key={post.id} post={post} navigation={navigation} onLike={(id) => dispatch(likePost(id))} onUnlike={(id) => dispatch(unlikePost(id))} />
        ))}
      </RefreshableScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 6 },
  card: { backgroundColor: colors.card, alignItems: 'center', padding: spacing.lg, margin: spacing.sm, borderRadius: 12 },
  avatarLg: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarLgText: { color: colors.white, fontSize: 28, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  username: { color: colors.textMuted, marginTop: 2 },
  bio: { textAlign: 'center', marginTop: spacing.sm, color: colors.text, lineHeight: 20 },
  location: { color: colors.textMuted, marginTop: 4, fontSize: 13 },
  stats: { flexDirection: 'row', marginTop: spacing.lg, gap: spacing.xl },
  stat: { alignItems: 'center' },
  statNum: { fontWeight: '700', fontSize: 18, color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted },
  form: { padding: spacing.md, backgroundColor: colors.card, margin: spacing.sm, borderRadius: 12 },
});
