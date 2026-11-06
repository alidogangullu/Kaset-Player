import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../theme';
import type { AppColors } from '../../../theme/colors';
import { radius, spacing } from '../../../theme/layout';
import { RedeemService } from '../redeemService';

type Props = Readonly<{
  visible: boolean;
  onClose: () => void;
  onRedeemed: () => void;
}>;

export function RedeemCodeModal({ visible, onClose, onRedeemed }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setCode('');
    setError(null);
    onClose();
  };

  const submit = async () => {
    if (!code.trim() || busy) return;
    setBusy(true);
    setError(null);
    const result = await RedeemService.redeem(code);
    setBusy(false);
    if (result.ok) {
      setCode('');
      onRedeemed();
      onClose();
    } else {
      setError(t(`redeem.error.${result.error}`, t('redeem.error.server_error')));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      {visible && (
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text style={styles.title}>{t('redeem.title')}</Text>
            <Text style={styles.hint}>{t('redeem.hint')}</Text>
            <TextInput
              style={styles.input}
              placeholder="KASET-XXXX-XXXX-XXXX"
              placeholderTextColor={colors.modalInputPlaceholder}
              value={code}
              onChangeText={text => setCode(text.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={24}
              hasTVPreferredFocus
              onSubmitEditing={submit}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <View style={styles.buttons}>
              <Pressable
                style={({ focused }) => [styles.button, styles.cancelButton, focused && styles.focused]}
                onPress={close}
                focusable>
                <Text style={styles.buttonText}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable
                style={({ focused }) => [styles.button, styles.redeemButton, focused && styles.focused]}
                onPress={submit}
                disabled={busy}
                focusable>
                {busy
                  ? <ActivityIndicator color={colors.onDarkTextPrimary} />
                  : <Text style={[styles.buttonText, styles.buttonTextBold]}>{t('redeem.submit')}</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
}

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: c.modalOverlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      width: '60%',
      backgroundColor: c.modalBg,
      borderRadius: radius.lg,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: c.modalBorder,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: c.onDarkTextPrimary,
      marginBottom: spacing.sm,
    },
    hint: {
      fontSize: 14,
      lineHeight: 20,
      color: c.onDarkTextSecondary,
      marginBottom: spacing.lg,
    },
    input: {
      backgroundColor: c.modalInputBg,
      color: c.onDarkTextPrimary,
      borderRadius: radius.md,
      padding: spacing.md,
      fontSize: 18,
      letterSpacing: 1,
      borderWidth: 1,
      borderColor: c.modalBorder,
      marginBottom: spacing.md,
    },
    error: {
      fontSize: 14,
      color: c.alertRed,
      marginBottom: spacing.md,
    },
    buttons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    button: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: radius.md,
      minWidth: 120,
      alignItems: 'center',
    },
    cancelButton: { backgroundColor: c.modalBorder },
    redeemButton: { backgroundColor: c.accent },
    focused: { opacity: 0.9, transform: [{ scale: 1.05 }] },
    buttonText: { color: c.onDarkTextPrimary },
    buttonTextBold: { fontWeight: '700' },
  });
