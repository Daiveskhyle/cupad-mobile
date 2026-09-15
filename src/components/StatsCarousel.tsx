import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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

export default function StatsCarousel({ items }: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        decelerationRate="fast"
        snapToAlignment="start"
        snapToInterval={296}
      >
        {items.map((item, index) => (
          <LinearGradient
            key={`${item.title}-${index}`}
            colors={item.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.topRow}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon as any} size={21} color="#fff" />
              </View>
              <Text style={styles.index}>{index + 1}/{items.length}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{item.value}</Text>
            <View style={styles.bottomRow}>
              <Text style={styles.swipeHint}>Swipe for more</Text>
              <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.85)" />
            </View>
          </LinearGradient>
        ))}
      </ScrollView>
      {items.length > 1 ? (
        <View style={styles.dots}>
          {items.map((item, index) => <View key={`${item.title}-dot-${index}`} style={[styles.dot, index === 0 && styles.activeDot]} />)}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.md },
  content: { paddingRight: SPACING.md, gap: 10 },
  card: { width: 286, minHeight: 138, borderRadius: RADIUS.lg, padding: 17, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  index: { color: 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: '700' },
  title: { color: 'rgba(255,255,255,0.88)', fontSize: 12, fontWeight: '700', marginTop: 12 },
  value: { color: '#fff', fontSize: 23, fontWeight: '900', marginTop: 2 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 },
  swipeHint: { color: 'rgba(255,255,255,0.68)', fontSize: 10, fontWeight: '600' },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 8 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#CBD5E1' },
  activeDot: { width: 16, backgroundColor: '#64748B' },
});
