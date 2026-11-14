export function confirmBulkDelete(count, onConfirm, noun = 'item') {
  const { Alert } = require('react-native');
  Alert.alert(
    `Delete ${count} ${noun}${count === 1 ? '' : 's'}?`,
    'This cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onConfirm },
    ],
  );
}
