import Animated from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

cssInterop(Animated.View, { className: 'style' });
cssInterop(Animated.Text, { className: 'style' });
