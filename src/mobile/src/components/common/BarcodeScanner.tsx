import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { X, Camera, Delete, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIEWFINDER_SIZE = SCREEN_WIDTH * 0.7;

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  showKeypad?: boolean;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  visible,
  onClose,
  onScan,
  showKeypad = true,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualEntry, setManualEntry] = useState('');
  const [showManualKeypad, setShowManualKeypad] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setScanned(false);
      setManualEntry('');
      setShowManualKeypad(false);
    }
  }, [visible]);

  // Request permission when modal opens (separate effect to avoid re-triggers)
  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
  }, [visible]);

  const handleBarCodeScanned = useCallback((result: BarcodeScanningResult) => {
    if (scanned) return;

    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Small delay for haptic to complete
    setTimeout(() => {
      onScan(result.data);
      onClose();
    }, 100);
  }, [scanned, onScan, onClose]);

  const handleKeypadPress = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (key === 'delete') {
      setManualEntry(prev => prev.slice(0, -1));
    } else if (key === 'submit') {
      if (manualEntry.length > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onScan(manualEntry);
        onClose();
      }
    } else {
      setManualEntry(prev => prev + key);
    }
  }, [manualEntry, onScan, onClose]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  const renderKeypadButton = (value: string, isWide = false) => (
    <TouchableOpacity
      key={value}
      style={[styles.keypadButton, isWide && styles.keypadButtonWide]}
      onPress={() => handleKeypadPress(value)}
      activeOpacity={0.7}
    >
      {value === 'delete' ? (
        <Delete size={24} color={colors.textPrimary} />
      ) : value === 'submit' ? (
        <Check size={24} color={colors.textPrimary} />
      ) : (
        <Text style={styles.keypadButtonText}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  if (!visible) return null;

  const hasPermission = permission?.granted;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Scan Barcode</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Camera / Permission State */}
        <View style={styles.cameraContainer}>
          {!permission ? (
            <View style={styles.permissionContainer}>
              <Camera size={48} color={colors.textTertiary} />
              <Text style={styles.permissionText}>Requesting camera permission...</Text>
            </View>
          ) : !hasPermission ? (
            <View style={styles.permissionContainer}>
              <Camera size={48} color={colors.error} />
              <Text style={styles.permissionText}>Camera permission denied</Text>
              <Text style={styles.permissionSubtext}>
                Please enable camera access in Settings
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={requestPermission}
              >
                <Text style={styles.retryButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
              {/* Viewfinder Overlay */}
              <View style={styles.overlay}>
                <View style={styles.overlayTop} />
                <View style={styles.overlayMiddle}>
                  <View style={styles.overlaySide} />
                  <View style={styles.viewfinder}>
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />
                  </View>
                  <View style={styles.overlaySide} />
                </View>
                <View style={styles.overlayBottom}>
                  <Text style={styles.helperText}>
                    Point camera at barcode
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Manual Entry Section */}
        {showKeypad && (
          <View style={styles.manualSection}>
            {!showManualKeypad ? (
              <TouchableOpacity
                style={styles.manualToggleButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowManualKeypad(true);
                }}
              >
                <Text style={styles.manualToggleText}>Enter Manually</Text>
              </TouchableOpacity>
            ) : (
              <>
                {/* Manual Entry Display */}
                <View style={styles.manualEntryDisplay}>
                  <Text style={styles.manualEntryText}>
                    {manualEntry || 'Enter barcode...'}
                  </Text>
                </View>

                {/* Keypad */}
                <View style={styles.keypad}>
                  <View style={styles.keypadRow}>
                    {renderKeypadButton('1')}
                    {renderKeypadButton('2')}
                    {renderKeypadButton('3')}
                  </View>
                  <View style={styles.keypadRow}>
                    {renderKeypadButton('4')}
                    {renderKeypadButton('5')}
                    {renderKeypadButton('6')}
                  </View>
                  <View style={styles.keypadRow}>
                    {renderKeypadButton('7')}
                    {renderKeypadButton('8')}
                    {renderKeypadButton('9')}
                  </View>
                  <View style={styles.keypadRow}>
                    {renderKeypadButton('delete')}
                    {renderKeypadButton('0')}
                    {renderKeypadButton('submit')}
                  </View>
                </View>
              </>
            )}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: radius.base,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 44,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  permissionText: {
    fontSize: typography.size.lg,
    color: colors.textPrimary,
    marginTop: spacing.base,
    textAlign: 'center',
  },
  permissionSubtext: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.base,
  },
  retryButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: VIEWFINDER_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  viewfinder: {
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  helperText: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  manualSection: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  manualToggleButton: {
    backgroundColor: colors.background,
    borderRadius: radius.base,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  manualToggleText: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
  },
  manualEntryDisplay: {
    backgroundColor: colors.background,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    minHeight: 50,
    justifyContent: 'center',
  },
  manualEntryText: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  keypad: {
    gap: spacing.sm,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  keypadButton: {
    width: 72,
    height: 56,
    backgroundColor: colors.background,
    borderRadius: radius.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadButtonWide: {
    width: 152,
  },
  keypadButtonText: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
});

export default BarcodeScanner;
