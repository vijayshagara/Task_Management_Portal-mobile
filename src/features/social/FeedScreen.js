import { useEffect, useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { fetchFeed, createPost, likePost, unlikePost, fetchStories } from './feedSlice';
import { fetchCows } from '../cows/cowSlice';
import PostCard from './components/PostCard';
import Screen from '../../components/Screen';
import LoadingView from '../../components/LoadingView';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { getSocialMediaUrl } from '../../utils/socialHelpers';
import { colors, spacing } from '../../theme';

export default function FeedScreen({ navigation }) {
  const dispatch = useDispatch();
  const { items, stories, loading, creating, page, totalPages } = useSelector((s) => s.feed);
  const { items: cows } = useSelector((s) => s.cows);
  const [showCreate, setShowCreate] = useState(false);
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    dispatch(fetchFeed({ page: 1 }));
    dispatch(fetchStories());
    dispatch(fetchCows());
  }, [dispatch]);

  const loadMore = () => {
    if (page < totalPages && !loading) dispatch(fetchFeed({ page: page + 1 }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleCreate = async () => {
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (location) formData.append('location', location);
    if (image) {
      formData.append('media', {
        uri: image.uri,
        name: 'post.jpg',
        type: image.mimeType || 'image/jpeg',
      });
    }
    try {
      await dispatch(createPost(formData)).unwrap();
      setContent('');
      setLocation('');
      setImage(null);
      setShowCreate(false);
      Alert.alert('Success', 'Post created!');
    } catch (err) {
      Alert.alert('Error', err);
    }
  };

  if (loading && !items.length) return <LoadingView message="Loading feed…" />;

  return (
    <Screen
      title="Farm Feed"
      subtitle="Connect with dairy farmers"
      action={
        <TouchableOpacity onPress={() => setShowCreate(!showCreate)}>
          <Text style={styles.createBtn}>{showCreate ? 'Cancel' : '+ Post'}</Text>
        </TouchableOpacity>
      }
    >
      {showCreate && (
        <View style={styles.createPanel}>
          <Input value={content} onChangeText={setContent} placeholder="What's happening on your farm?" multiline />
          <Input value={location} onChangeText={setLocation} placeholder="Location (optional)" />
          {image && <Image source={{ uri: image.uri }} style={styles.preview} />}
          <View style={styles.createActions}>
            <Button title="Add Photo" variant="outline" onPress={pickImage} style={{ flex: 1 }} />
            <Button title="Publish" onPress={handleCreate} loading={creating} style={{ flex: 1 }} />
          </View>
        </View>
      )}

      {stories?.length > 0 && (
        <View style={styles.storiesRow}>
          {stories.slice(0, 8).map((s) => (
            <View key={s.id} style={styles.storyBubble}>
              <Text style={styles.storyInitial}>{s.user?.name?.charAt(0)}</Text>
            </View>
          ))}
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            navigation={navigation}
            onLike={(id) => dispatch(likePost(id))}
            onUnlike={(id) => dispatch(unlikePost(id))}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loading ? <LoadingView message="Loading more…" /> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  createBtn: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  createPanel: { backgroundColor: colors.card, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  createActions: { flexDirection: 'row', gap: spacing.sm },
  preview: { width: '100%', height: 160, borderRadius: 8, marginBottom: spacing.sm },
  storiesRow: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm, backgroundColor: colors.card },
  storyBubble: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFD54F' },
  storyInitial: { color: colors.white, fontWeight: '700' },
});
