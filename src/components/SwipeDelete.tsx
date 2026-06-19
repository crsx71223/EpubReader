import { Ionicons } from "@expo/vector-icons";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { BorderRadius, Spacing } from "../constants/theme";

interface SwipeDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
  dangerColor: string;
  iconColor: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// 30% of the screen width ensures the user has to make a deliberate motion
// to delete, preventing accidental triggers when just trying to scroll.
const SWIPE_THRESHOLD = -SCREEN_WIDTH * 0.3;

export default function SwipeDelete({
  children,
  onDelete,
  dangerColor,
  iconColor,
}: SwipeDeleteProps) {
  const translateX = useSharedValue<number>(0);
  const itemHeight = useSharedValue<number>(120);
  const marginVertical = useSharedValue<number>(Spacing.sm);
  const opacity = useSharedValue<number>(1);

  const panGesture = Gesture.Pan()
    // Fail parameters are required here so the PanGesture doesn't steal touches
    // from the FlatList when the user's intent is to scroll vertically.
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onChange((event) => {
      // Math.min forces a hard stop at 0, preventing the user from dragging
      // the card to the right where there is no UI.
      translateX.value = Math.min(0, event.translationX);
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 }, () => {
          // Collapsing the height BEFORE triggering the deletion state prevents
          // a visual jump in the FlatList when the item is suddenly removed from memory.
          itemHeight.value = withTiming(0);
          marginVertical.value = withTiming(0);
          opacity.value = withTiming(0, undefined, (isFinished) => {
            if (isFinished) {
              // scheduleOnRN is necessary to safely pass execution back from the
              // isolated UI worklet thread to the main JavaScript thread.
              scheduleOnRN(onDelete);
            }
          });
        });
      } else {
        // If the threshold wasn't met, the spring physics automatically return
        // the card to the neutral position without needing to hardcode a reset.
        translateX.value = withSpring(0);
      }
    });

  const rCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const rContainerStyle = useAnimatedStyle(() => ({
    height: itemHeight.value === 120 ? "auto" : itemHeight.value,
    marginBottom: marginVertical.value,
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, rContainerStyle]}>
      <View style={[styles.deleteBackground, { backgroundColor: dangerColor }]}>
        <Ionicons name="trash-outline" size={28} color={iconColor} />
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={rCardStyle}>{children}</Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  deleteBackground: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
});
