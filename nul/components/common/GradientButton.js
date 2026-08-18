'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = GradientButton;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactNative = require('react-native');

var _expoLinearGradient = require('expo-linear-gradient');

var _theme = require('../../theme');

function GradientButton(_ref) {
  var title = _ref.title;
  var onPress = _ref.onPress;
  var _ref$loading = _ref.loading;
  var loading = _ref$loading === undefined ? false : _ref$loading;
  var _ref$disabled = _ref.disabled;
  var disabled = _ref$disabled === undefined ? false : _ref$disabled;
  var _ref$variant = _ref.variant;
  var variant = _ref$variant === undefined ? 'primary' : _ref$variant;
  var // 'primary' | 'outline' | 'ghost'
  icon = _ref.icon;
  var style = _ref.style;

  if (variant === 'outline') {
    return _react2['default'].createElement(
      _reactNative.TouchableOpacity,
      {
        onPress: onPress,
        disabled: disabled || loading,
        style: [styles.outlineButton, disabled && styles.disabled, style],
        activeOpacity: 0.7
      },
      loading ? _react2['default'].createElement(_reactNative.ActivityIndicator, { color: _theme.colors.primary }) : _react2['default'].createElement(
        _reactNative.View,
        { style: styles.content },
        icon && _react2['default'].createElement(
          _reactNative.View,
          { style: styles.iconWrap },
          icon
        ),
        _react2['default'].createElement(
          _reactNative.Text,
          { style: [_theme.typography.button, styles.outlineText] },
          title
        )
      )
    );
  }

  if (variant === 'ghost') {
    return _react2['default'].createElement(
      _reactNative.TouchableOpacity,
      {
        onPress: onPress,
        disabled: disabled || loading,
        style: [styles.ghostButton, disabled && styles.disabled, style],
        activeOpacity: 0.7
      },
      loading ? _react2['default'].createElement(_reactNative.ActivityIndicator, { color: _theme.colors.textSecondary }) : _react2['default'].createElement(
        _reactNative.View,
        { style: styles.content },
        icon && _react2['default'].createElement(
          _reactNative.View,
          { style: styles.iconWrap },
          icon
        ),
        _react2['default'].createElement(
          _reactNative.Text,
          { style: [_theme.typography.button, styles.ghostText] },
          title
        )
      )
    );
  }

  return _react2['default'].createElement(
    _reactNative.TouchableOpacity,
    {
      onPress: onPress,
      disabled: disabled || loading,
      activeOpacity: 0.8,
      style: [disabled && styles.disabled, style]
    },
    _react2['default'].createElement(
      _expoLinearGradient.LinearGradient,
      {
        colors: _theme.gradients.primary,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        style: [styles.gradient, _theme.shadows.button]
      },
      loading ? _react2['default'].createElement(_reactNative.ActivityIndicator, { color: _theme.colors.white }) : _react2['default'].createElement(
        _reactNative.View,
        { style: styles.content },
        icon && _react2['default'].createElement(
          _reactNative.View,
          { style: styles.iconWrap },
          icon
        ),
        _react2['default'].createElement(
          _reactNative.Text,
          { style: [_theme.typography.button, styles.primaryText] },
          title
        )
      )
    )
  );
}

var styles = _reactNative.StyleSheet.create({
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: _theme.spacing.xxl,
    borderRadius: _theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52
  },
  outlineButton: {
    paddingVertical: 16,
    paddingHorizontal: _theme.spacing.xxl,
    borderRadius: _theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: _theme.colors.primary
  },
  ghostButton: {
    paddingVertical: 16,
    paddingHorizontal: _theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconWrap: {
    marginRight: _theme.spacing.sm
  },
  primaryText: {
    color: _theme.colors.white
  },
  outlineText: {
    color: _theme.colors.primary
  },
  ghostText: {
    color: _theme.colors.textSecondary
  },
  disabled: {
    opacity: 0.5
  }
});
module.exports = exports['default'];