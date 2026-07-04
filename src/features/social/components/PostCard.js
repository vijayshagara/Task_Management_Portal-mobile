import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { getSocialMediaUrl } from '../../../utils/socialHelpers';
import { fetchComments, addComment } from '../feedSlice';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { colors, spacing } from '../../../theme';

function CommentBlock({ comment, currentUserId, onReply, replyingTo, onSubmitReply, onCancelReply }) {
  const [replyText, setReplyText] = useState('');
  const isOwn = comment.authorId === currentUserId;

  return (
    <View style={styles.commentBlock}>
      <View style={[styles.commentMain, isOwn && styles.ownComment]}>
        <View style={styles.commentHeader}>
          <Text style={styles.badgeMain}>Comment</Text>
          <Text style={styles.authorName}>{comment.author?.name || 'User'}</Text>
        </View>
        <Text style={styles.commentText}>{comment.content}</Text>
        <View style={styles.commentMeta}>
          <Text style={styles.time}>{new Date(comment.createdAt).toLocaleString()}</Text>
          <TouchableOpacity onPress={onReply}><Text style={styles.replyBtn}>Reply</Text></TouchableOpacity>
        </View>
      </View>
      {replyingTo === comment.id && (
        <View style={styles.replyForm}>
          <Input value={replyText} onChangeText={setReplyText} placeholder="Write a reply..." />
          <View style={styles.replyActions}>
            <Button title="Reply" onPress={() => { onSubmitReply(replyText, comment.id); setReplyText(''); }} style={{ flex: 1 }} />
            <Button title="Cancel" variant="outline" onPress={onCancelReply} style={{ flex: 1 }} />
          </View>
        </View>
      )}
      {comment.replies?.map((reply) => (
        <View key={reply.id} style={[styles.commentReply, reply.authorId === currentUserId && styles.ownReply]}>
          <View style={styles.commentHeader}>
            <Text style={styles.badgeReply}>Reply</Text>
            <Text style={styles.authorName}>{reply.author?.name}</Text>
          </View>
          <Text style={styles.commentText}>{reply.content}</Text>
        </View>
      ))}
    </View>
  );
}

export default function PostCard({ post, onLike, onUnlike, navigation }) {
  const dispatch = useDispatch();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const comments = useSelector((s) => s.feed.comments[post.id] || []);
  const currentUserId = useSelector((s) => s.auth.user?.id);
  const firstMedia = post.media?.[0];

  useEffect(() => {
    if (showComments) dispatch(fetchComments(post.id));
  }, [showComments, post.id, dispatch]);

  const handleLike = () => (post.likedByMe ? onUnlike?.(post.id) : onLike?.(post.id));

  const submitComment = async (content, parentId) => {
    await dispatch(addComment({ postId: post.id, content, parentId })).unwrap();
    setShowComments(true);
    dispatch(fetchComments(post.id));
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.authorRow}
        onPress={() => navigation?.navigate('Profile', { userId: post.author?.id })}
      >
        <View style={styles.avatar}><Text style={styles.avatarText}>{post.author?.name?.charAt(0)}</Text></View>
        <View>
          <Text style={styles.authorName}>{post.author?.name}</Text>
          <Text style={styles.username}>@{post.author?.profile?.username}</Text>
        </View>
      </TouchableOpacity>

      {firstMedia && (
        <Image source={{ uri: getSocialMediaUrl(firstMedia.fileId) }} style={styles.media} resizeMode="cover" />
      )}

      {post.content ? <Text style={styles.content}>{post.content}</Text> : null}
      {post.location ? <Text style={styles.location}>📍 {post.location}</Text> : null}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
          <Ionicons name={post.likedByMe ? 'heart' : 'heart-outline'} size={22} color={post.likedByMe ? colors.danger : colors.text} />
          <Text style={styles.actionCount}>{post.likesCount || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowComments(!showComments)}>
          <Ionicons name="chatbubble-outline" size={21} color={colors.text} />
          <Text style={styles.actionCount}>{post.commentsCount || 0}</Text>
        </TouchableOpacity>
      </View>

      {showComments && (
        <View style={styles.commentsSection}>
          {comments.length === 0 ? (
            <Text style={styles.noComments}>No comments yet</Text>
          ) : (
            comments.map((c) => (
              <CommentBlock
                key={c.id}
                comment={c}
                currentUserId={currentUserId}
                replyingTo={replyingTo}
                onReply={() => setReplyingTo(c.id)}
                onCancelReply={() => setReplyingTo(null)}
                onSubmitReply={(text, parentId) => { submitComment(text, parentId); setReplyingTo(null); }}
              />
            ))
          )}
        </View>
      )}

      <View style={styles.commentInputRow}>
        <Input
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Write a comment..."
          style={{ flex: 1, marginBottom: 0 }}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={async () => {
            if (!commentText.trim()) return;
            await submitComment(commentText.trim());
            setCommentText('');
          }}
        >
          <Ionicons name="send" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, marginBottom: spacing.sm, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700' },
  authorName: { fontWeight: '600', fontSize: 14, color: colors.text },
  username: { fontSize: 12, color: colors.textMuted },
  media: { width: '100%', height: 220, borderRadius: 10, marginBottom: spacing.sm },
  content: { fontSize: 15, lineHeight: 22, color: colors.text, marginBottom: spacing.sm },
  location: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionCount: { fontSize: 14, color: colors.text },
  commentsSection: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  noComments: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.sm },
  commentBlock: { marginBottom: spacing.sm },
  commentMain: { backgroundColor: colors.primaryLight, borderLeftWidth: 4, borderLeftColor: colors.primary, padding: spacing.sm, borderRadius: 8 },
  ownComment: { backgroundColor: '#E8F5E9' },
  commentReply: { marginLeft: spacing.lg, marginTop: spacing.xs, backgroundColor: '#F8F9FA', borderLeftWidth: 3, borderLeftColor: colors.secondary, padding: spacing.sm, borderRadius: 8 },
  ownReply: { backgroundColor: '#EEF2FF' },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  badgeMain: { fontSize: 10, fontWeight: '700', backgroundColor: '#C8E6C9', color: colors.primaryDark, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
  badgeReply: { fontSize: 10, fontWeight: '700', backgroundColor: '#C5CAE9', color: '#283593', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  commentText: { fontSize: 14, color: colors.text },
  commentMeta: { flexDirection: 'row', gap: 12, marginTop: 4, alignItems: 'center' },
  time: { fontSize: 11, color: colors.textMuted },
  replyBtn: { fontSize: 12, fontWeight: '600', color: colors.primary },
  replyForm: { marginLeft: spacing.md, marginTop: spacing.sm },
  replyActions: { flexDirection: 'row', gap: spacing.sm },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  sendBtn: { backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
