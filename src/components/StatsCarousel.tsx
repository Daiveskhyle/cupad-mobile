import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { RADIUS, SPACING } from '../constants/config';

type StatItem = {
  title: string;
  value: string;
  icon: string;
  colors: [string, string];
};

type Props = {
  items: StatItem[];
};

const CARD_GAP = 12;

export default function StatsCarousel({ items }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  // Dashboard content already has horizontal padding, so reserve another
  // SPACING.md on both sides inside the carousel to keep every card fully visible.
  const cardWidth = Math.max(0, screenWidth - SPACING.md * 4);
  const snapInterval = cardWidth + CARD_GAP;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        decelerationRate="fast"
        snapToAlignment="start"
        snapToInterval={snapInterval}
        disableIntervalMomentum
      >
        {items.map((item, index) => (
          <LinearGradient
            key={`${item.title}-${index}`}
            colors={item.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, { width: cardWidth, marginRight: index === items.length - 1 ? 0 : CARD_GAP }]}
          >
            <View style={styles.topRow}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon as any} size={23} color="#fff" />
              </View>
              <Text style={styles.index}>{index + 1}/{items.length}</Text>
            </View>

            <View style={styles.statBody}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>{item.value}</Text>
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.swipeHint}>Swipe for more</Text>
              <Ionicons name="arrow-forward" size={17} color="rgba(255,255,255,0.85)" />
            </View>
          </LinearGradient>
        ))}
      </ScrollView>

      {items.length > 1 ? (
        <View style={styles.dots}>
          {items.map((item, index) => (
            <View
              key={`${item.title}-dot-${index}`}
              style={[styles.dot, index === 0 && styles.activeDot]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.md },
  content: {
    paddingHorizontal: SPACING.md,
  },
  card: {
    minHeight: 168,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 20,
    paddingVertical: 18,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBody: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  index: { color: 'rgba(255,255,255,0.78)', fontSize: 12, fontWeight: '800' },
  title: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '700', marginTop: 14 },
  value: { color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 4 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  swipeHint: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 9 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#CBD5E1' },
  activeDot: { width: 16, backgroundColor: '#64748B' },
});
