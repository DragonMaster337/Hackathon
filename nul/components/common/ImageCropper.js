'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = ImageCropper;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactNative = require('react-native');

var _reactNativeViewShot = require('react-native-view-shot');

var _expoVectorIcons = require('@expo/vector-icons');

var _theme = require('../../theme');

var _Dimensions$get = _reactNative.Dimensions.get('window');

var SCREEN_WIDTH = _Dimensions$get.width;
var SCREEN_HEIGHT = _Dimensions$get.height;

var DEAD_SPACE_COLOR = '#14141F';

function ImageCropper(_ref) {
  var _this = this;

  var visible = _ref.visible;
  var imageUri = _ref.imageUri;
  var _ref$cropShape = _ref.cropShape;
  var cropShape = _ref$cropShape === undefined ? 'rectangle' : _ref$cropShape;
  var _ref$aspectRatio = _ref.aspectRatio;
  var // 'rectangle' or 'circle'
  aspectRatio = _ref$aspectRatio === undefined ? [5, 3] : _ref$aspectRatio;
  var // [width, height] for rectangle
  onComplete = _ref.onComplete;
  var onCancel = _ref.onCancel;

  var cropRef = (0, _react.useRef)(null);

  // Calculate crop area dimensions
  var padding = 20;
  var maxCropWidth = SCREEN_WIDTH - padding * 2;
  var cropWidth = undefined,
      cropHeight = undefined;

  if (cropShape === 'circle') {
    cropWidth = maxCropWidth * 0.7;
    cropHeight = cropWidth;
  } else {
    cropWidth = maxCropWidth;
    cropHeight = maxCropWidth * (aspectRatio[1] / aspectRatio[0]);
  }

  // Image state
  var scale = (0, _react.useRef)(new _reactNative.Animated.Value(1)).current;
  var translateX = (0, _react.useRef)(new _reactNative.Animated.Value(0)).current;
  var translateY = (0, _react.useRef)(new _reactNative.Animated.Value(0)).current;

  // Tracking values for gestures
  var lastScale = (0, _react.useRef)(1);
  var lastTranslateX = (0, _react.useRef)(0);
  var lastTranslateY = (0, _react.useRef)(0);
  var initialDistance = (0, _react.useRef)(0);

  var getDistance = function getDistance(touches) {
    var dx = touches[0].pageX - touches[1].pageX;
    var dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  var panResponder = (0, _react.useRef)(_reactNative.PanResponder.create({
    onStartShouldSetPanResponder: function onStartShouldSetPanResponder() {
      return true;
    },
    onMoveShouldSetPanResponder: function onMoveShouldSetPanResponder() {
      return true;
    },

    onPanResponderGrant: function onPanResponderGrant(evt) {
      if (evt.nativeEvent.touches.length === 2) {
        initialDistance.current = getDistance(evt.nativeEvent.touches);
      }
    },

    onPanResponderMove: function onPanResponderMove(evt, gestureState) {
      if (evt.nativeEvent.touches.length === 2) {
        // Pinch to zoom
        var currentDistance = getDistance(evt.nativeEvent.touches);
        if (initialDistance.current > 0) {
          var newScale = lastScale.current * (currentDistance / initialDistance.current);
          var clampedScale = Math.max(0.2, Math.min(5, newScale));
          scale.setValue(clampedScale);
        }
      } else if (evt.nativeEvent.touches.length === 1) {
        // Pan
        var newX = lastTranslateX.current + gestureState.dx;
        var newY = lastTranslateY.current + gestureState.dy;
        translateX.setValue(newX);
        translateY.setValue(newY);
      }
    },

    onPanResponderRelease: function onPanResponderRelease(evt) {
      lastScale.current = scale.__getValue();
      lastTranslateX.current = translateX.__getValue();
      lastTranslateY.current = translateY.__getValue();
      initialDistance.current = 0;
    }
  })).current;

  var handleDone = function handleDone() {
    var uri;
    return regeneratorRuntime.async(function handleDone$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          context$2$0.prev = 0;
          context$2$0.next = 3;
          return regeneratorRuntime.awrap((0, _reactNativeViewShot.captureRef)(cropRef, {
            format: 'jpg',
            quality: 0.9
          }));

        case 3:
          uri = context$2$0.sent;

          onComplete(uri);
          context$2$0.next = 11;
          break;

        case 7:
          context$2$0.prev = 7;
          context$2$0.t0 = context$2$0['catch'](0);

          console.error('Capture error:', context$2$0.t0);
          onCancel();

        case 11:
        case 'end':
          return context$2$0.stop();
      }
    }, null, _this, [[0, 7]]);
  };

  var handleReset = function handleReset() {
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    lastScale.current = 1;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;
  };

  if (!visible || !imageUri) return null;

  return _react2['default'].createElement(
    _reactNative.Modal,
    { visible: visible, animationType: 'slide', statusBarTranslucent: true },
    _react2['default'].createElement(
      _reactNative.View,
      { style: styles.container },
      _react2['default'].createElement(
        _reactNative.View,
        { style: styles.header },
        _react2['default'].createElement(
          _reactNative.TouchableOpacity,
          { onPress: onCancel, style: styles.headerBtn },
          _react2['default'].createElement(
            _reactNative.Text,
            { style: styles.cancelText },
            'Cancel'
          )
        ),
        _react2['default'].createElement(
          _reactNative.Text,
          { style: styles.headerTitle },
          'Adjust Photo'
        ),
        _react2['default'].createElement(
          _reactNative.TouchableOpacity,
          { onPress: handleReset, style: styles.headerBtn },
          _react2['default'].createElement(_expoVectorIcons.Ionicons, { name: 'refresh', size: 20, color: _theme.colors.primary })
        )
      ),
      _react2['default'].createElement(
        _reactNative.Text,
        { style: styles.instruction },
        'Pinch to zoom • Drag to position'
      ),
      _react2['default'].createElement(
        _reactNative.View,
        { style: styles.cropContainer },
        _react2['default'].createElement(
          _reactNative.View,
          {
            ref: cropRef,
            style: [styles.cropArea, {
              width: cropWidth,
              height: cropHeight,
              borderRadius: cropShape === 'circle' ? cropWidth / 2 : _theme.borderRadius.lg,
              overflow: 'hidden'
            }],
            collapsable: false
          },
          _react2['default'].createElement(
            _reactNative.View,
            { style: [styles.deadSpace, { backgroundColor: DEAD_SPACE_COLOR }] },
            _react2['default'].createElement(_reactNative.Animated.Image, {
              source: { uri: imageUri },
              style: [styles.image, {
                transform: [{ translateX: translateX }, { translateY: translateY }, { scale: scale }]
              }],
              resizeMode: 'contain'
            })
          )
        ),
        _react2['default'].createElement(_reactNative.View, _extends({
          style: styles.gestureLayer
        }, panResponder.panHandlers)),
        _react2['default'].createElement(_reactNative.View, {
          style: [styles.cropBorder, {
            width: cropWidth,
            height: cropHeight,
            borderRadius: cropShape === 'circle' ? cropWidth / 2 : _theme.borderRadius.lg
          }],
          pointerEvents: 'none'
        })
      ),
      _react2['default'].createElement(
        _reactNative.Text,
        { style: styles.shapeLabel },
        cropShape === 'circle' ? 'Profile Picture' : 'Event Cover'
      ),
      _react2['default'].createElement(
        _reactNative.View,
        { style: styles.controls },
        _react2['default'].createElement(
          _reactNative.TouchableOpacity,
          { style: styles.doneBtn, onPress: handleDone, activeOpacity: 0.8 },
          _react2['default'].createElement(
            _reactNative.Text,
            { style: styles.doneText },
            'Done'
          )
        )
      )
    )
  );
}

var styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: _theme.spacing.xl,
    paddingBottom: _theme.spacing.lg
  },
  headerBtn: {
    paddingVertical: _theme.spacing.sm,
    paddingHorizontal: _theme.spacing.sm
  },
  cancelText: _extends({}, _theme.typography.body, {
    color: _theme.colors.textSecondary
  }),
  headerTitle: _extends({}, _theme.typography.h3, {
    color: _theme.colors.white
  }),
  instruction: _extends({}, _theme.typography.bodySmall, {
    color: _theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: _theme.spacing.xl
  }),
  cropContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cropArea: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  deadSpace: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH
  },
  gestureLayer: _extends({}, _reactNative.StyleSheet.absoluteFillObject, {
    zIndex: 10
  }),
  cropBorder: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.6)'
  },
  shapeLabel: _extends({}, _theme.typography.bodySmall, {
    color: _theme.colors.textMuted,
    textAlign: 'center',
    marginTop: _theme.spacing.lg,
    marginBottom: _theme.spacing.md
  }),
  controls: {
    paddingHorizontal: _theme.spacing.xxl,
    paddingBottom: 50,
    paddingTop: _theme.spacing.lg
  },
  doneBtn: {
    backgroundColor: _theme.colors.primary,
    paddingVertical: 16,
    borderRadius: _theme.borderRadius.lg,
    alignItems: 'center'
  },
  doneText: _extends({}, _theme.typography.button, {
    color: _theme.colors.white
  })
});
module.exports = exports['default'];
/* Header */ /* Instruction */ /* Crop area */ /* The capturable area */ /* Background fill for dead space */ /* The movable/zoomable image */ /* Invisible gesture layer on top */ /* Crop border overlay */ /* Shape label */ /* Bottom controls */