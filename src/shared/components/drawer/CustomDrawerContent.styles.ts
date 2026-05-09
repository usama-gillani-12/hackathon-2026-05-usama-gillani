import { StyleSheet } from 'react-native';
import { colors, withOpacity } from '@theme/colors';
import { ms, s, vs } from '@theme/responsive';

// Width of each segment — half the track. Used to calculate thumb translateX.
const SEGMENT_WIDTH = s(70);

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.heroDark,
  },
  header: {
    paddingHorizontal: s(20),
    paddingBottom: vs(20),
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(16),
  },
  logoCircle: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(12),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(12),
  },
  logoText: {
    color: colors.white,
    fontSize: ms(16),
    fontWeight: '800',
  },
  logoInfo: {
    flex: 1,
  },
  appName: {
    color: colors.white,
    fontSize: ms(20),
    fontWeight: '800',
    letterSpacing: ms(-0.5),
  },
  appTagline: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: ms(11),
    marginTop: vs(1),
  },
  userEmail: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: ms(11),
    marginTop: vs(1),
  },
  creditCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: ms(12),
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  creditLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
  },
  creditBalance: {
    color: colors.white,
    fontSize: ms(14),
    fontWeight: '700',
  },
  creditBuyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(2),
  },
  creditBuyLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: ms(12),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: vs(16),
    paddingBottom: vs(8),
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: ms(10),
    fontWeight: '700',
    letterSpacing: ms(1.5),
    paddingHorizontal: s(20),
    marginBottom: vs(4),
    marginTop: vs(4),
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(12),
    marginHorizontal: s(8),
    borderRadius: ms(10),
    gap: ms(12),
  },
  navItemActive: {
    // Gold at 18% on the dark drawer — visible without washing out the text.
    backgroundColor: withOpacity(colors.accent, 0.18),
    borderWidth: 1,
    borderColor: withOpacity(colors.accent, 0.30),
  },
  navLabel: {
    flex: 1,
    color: 'rgba(255,255,255,0.65)',
    fontSize: ms(14),
    fontWeight: '500',
  },
  navLabelActive: {
    // Gold label on dark bg — high contrast, matches the icon tint.
    color: colors.accent,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: colors.premium,
    borderRadius: ms(10),
    minWidth: ms(20),
    height: ms(20),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(6),
  },
  badgeText: {
    color: colors.white,
    fontSize: ms(10),
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: s(20),
    marginVertical: vs(12),
  },
  footer: {
    paddingHorizontal: s(20),
    paddingTop: vs(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  footerTop: {
    marginBottom: vs(12),
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    borderRadius: ms(10),
    backgroundColor: colors.dangerSubtle,
    borderWidth: 1,
    borderColor: colors.dangerSoft,
  },
  logoutLabel: {
    color: colors.danger,
    fontSize: ms(14),
    fontWeight: '600',
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(10),
  },
  networkLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: ms(10),
    fontWeight: '700',
    letterSpacing: ms(1.2),
  },
  segmentTrack: {
    flexDirection: 'row',
    width: SEGMENT_WIDTH * 2,
    height: vs(30),
    borderRadius: ms(8),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    position: 'relative',
  },
  segmentThumb: {
    position: 'absolute',
    width: SEGMENT_WIDTH,
    height: '100%',
    borderRadius: ms(7),
  },
  segmentThumbDemo: {
    backgroundColor: colors.premium,
  },
  segmentThumbTestnet: {
    backgroundColor: colors.accent,
  },
  segment: {
    width: SEGMENT_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(4),
    zIndex: 1,
  },
  segmentLabel: {
    fontSize: ms(11),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.45)',
  },
  segmentLabelActive: {
    color: colors.heroDark,
  },
  segmentLabelActiveTestnet: {
    color: colors.heroDark,
  },
  footerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  versionText: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: ms(11),
  },
});
