import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Modal,
  Animated,
  PanResponder,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEAD_SPACE_COLOR = '#14141F';

export default function ImageCropper({
  visible,
  imageUri,
  cropShape = 'rectangle', // 'rectangle' or 'circle'
  aspectRatio = [5, 3],     // [width, height] for rectangle
  onComplete,
  onCancel,
}) {
  const cropRef = useRef(null);

  // Calculate crop area dimensions
  const padding = 20;
  const maxCropWidth = SCREEN_WIDTH - padding * 2;
  let cropWidth, cropHeight;

  if (cropShape === 'circle') {
    cropWidth = maxCropWidth * 0.7;
    cropHeight = cropWidth;
  } else {
    cropWidth = maxCropWidth;
    cropHeight = maxCropWidth * (aspectRatio[1] / aspectRatio[0]);
  }

  // Image state
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Tracking values for gestures
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const initialDistance = useRef(0);

  const getDistance = (touches) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        if (evt.nativeEvent.touches.length === 2) {
          initialDistance.current = getDistance(evt.nativeEvent.touches);
        }
      },

      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 2) {
          // Pinch to zoom
          const currentDistance = getDistance(evt.nativeEvent.touches);
          if (initialDistance.current > 0) {
            const newScale = lastScale.current * (currentDistance / initialDistance.current);
            const clampedScale = Math.max(0.2, Math.min(5, newScale));
            scale.setValue(clampedScale);
          }
        } else if (evt.nativeEvent.touches.length === 1) {
          // Pan
          const newX = lastTranslateX.current + gestureState.dx;
          const newY = lastTranslateY.current + gestureState.dy;
          translateX.setValue(newX);
          translateY.setValue(newY);
        }
      },

      onPanResponderRelease: (evt) => {
        lastScale.current = scale.__getValue();
        lastTranslateX.current = translateX.__getValue();
        lastTranslateY.current = translateY.__getValue();
        initialDistance.current = 0;
      },
    })
  ).current;

  const handleDone = async () => {
    try {
      const uri = await captureRef(cropRef, {
        format: 'jpg',
        quality: 0.9,
      });
      onComplete(uri);
    } catch (err) {
      console.error('Capture error:', err);
      onCancel();
    }
  };

  const handleReset = () => {
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    lastScale.current = 1;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;
  };

  if (!visible || !imageUri) return null;

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.headerBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Adjust Photo</Text>
          <TouchableOpacity onPress={handleReset} style={styles.headerBtn}>
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Instruction */}
        <Text style={styles.instruction}>
          Pinch to zoom • Drag to position
        </Text>

        {/* Crop area */}
        <View style={styles.cropContainer}>
          {/* The capturable area */}
          <View
            ref={cropRef}
            style={[
              styles.cropArea,
              {
                width: cropWidth,
                height: cropHeight,
                borderRadius: cropShape === 'circle' ? cropWidth / 2 : borderRadius.lg,
                overflow: 'hidden',
              },
            ]}
            collapsable={false}
          >
            {/* Background fill for dead space */}
            <View style={[styles.deadSpace, { backgroundColor: DEAD_SPACE_COLOR }]}>
              {/* The movable/zoomable image */}
              <Animated.Image
                source={{ uri: imageUri }}
                style={[
                  styles.image,
                  {
                    transform: [
                      { translateX },
                      { translateY },
                      { scale },
                    ],
                  },
                ]}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Invisible gesture layer on top */}
          <View
            style={styles.gestureLayer}
            {...panResponder.panHandlers}
          />

          {/* Crop border overlay */}
          <View
            style={[
              styles.cropBorder,
              {
                width: cropWidth,
                height: cropHeight,
                borderRadius: cropShape === 'circle' ? cropWidth / 2 : borderRadius.lg,
              },
            ]}
            pointerEvents="none"
          />
        </View>

        {/* Shape label */}
        <Text style={styles.shapeLabel}>
          {cropShape === 'circle' ? 'Profile Picture' : 'Event Cover'}
        </Text>

        {/* Bottom controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.8}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  cancelText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.white,
  },
  instruction: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  cropContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropArea: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deadSpace: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  gestureLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  cropBorder: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.6)',
  },
  shapeLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  controls: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 50,
    paddingTop: spacing.lg,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  doneText: {
    ...typography.button,
    color: colors.white,
  },
});
