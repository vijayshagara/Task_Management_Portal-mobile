import { useState } from 'react';
import { Platform, Pressable, Text, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing } from '../theme';

function formatTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function parseTime(str) {
  const d = new Date();
  if (!str) return d;
  const [h, m] = str.split(':').map(Number);
  if (Number.isFinite(h) && Number.isFinite(m)) d.setHours(h, m, 0, 0);
  return d;
}

function display(str) {
  if (!str) return '';
  const d = parseTime(str);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

/** Time picker field. value/onChange use 24h "HH:MM". */
export default function TimeInput({ value, onChange, placeholder, style }) {
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState(() => parseTime(value));

  const open = () => {
    setDraft(parseTime(value));
    setShow(true);
  };

  const onPickerChange = (event, selected) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type === 'dismissed' || !selected) return;
      onChange(formatTime(selected));
      return;
    }
    if (selected) setDraft(selected);
  };

  return (
    <View style={style}>
      <Pressable style={styles.input} onPress={open}>
        <Text style={value ? styles.text : styles.placeholder}>{value ? display(value) : placeholder}</Text>
      </Pressable>
      {show && (
        <>
          <DateTimePicker
            value={draft}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onPickerChange}
          />
          {Platform.OS === 'ios' && (
            <Pressable
              style={styles.doneBtn}
              onPress={() => {
                onChange(formatTime(draft));
                setShow(false);
              }}
            >
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.sm,
  },
  text: { fontSize: 15, color: colors.text },
  placeholder: { fontSize: 15, color: colors.textMuted },
  doneBtn: { alignSelf: 'flex-end', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  doneText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
});
