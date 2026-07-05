import { useState } from 'react';
import { Platform, Pressable, Text, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing } from '../theme';

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDate(str) {
  if (!str) return new Date();
  const [y, m, d] = str.split('-').map(Number);
  if (y && m && d) return new Date(y, m - 1, d);
  return new Date();
}

export default function DateInput({ value, onChange, placeholder, maximumDate, minimumDate, style }) {
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState(() => parseDate(value));

  const open = () => {
    setDraft(parseDate(value));
    setShow(true);
  };

  const apply = (date) => {
    onChange(formatDate(date));
    setShow(false);
  };

  const onPickerChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type === 'dismissed' || !selectedDate) return;
      onChange(formatDate(selectedDate));
      return;
    }
    if (selectedDate) setDraft(selectedDate);
  };

  return (
    <View style={style}>
      <Pressable style={styles.input} onPress={open}>
        <Text style={value ? styles.text : styles.placeholder}>{value || placeholder}</Text>
      </Pressable>
      {show && (
        <>
          <DateTimePicker
            value={draft}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onPickerChange}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
          />
          {Platform.OS === 'ios' && (
            <Pressable style={styles.doneBtn} onPress={() => apply(draft)}>
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
  doneBtn: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  doneText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
});
