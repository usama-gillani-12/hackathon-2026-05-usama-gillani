import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, shadow } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  orb1: {
    position: 'absolute', width: ms(300), height: ms(300), borderRadius: ms(150),
    top: -ms(80), left: -ms(80), overflow: 'hidden',
  },
  orb2: {
    position: 'absolute', width: ms(240), height: ms(240), borderRadius: ms(120),
    top: ms(100), right: -ms(100), overflow: 'hidden',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(24),
    paddingTop: vs(8),
    paddingBottom: vs(8),
  },
  wordmarkRow: { flexDirection: 'row', alignItems: 'center', gap: ms(6) },
  wordmark: { fontWeight: '800', letterSpacing: -0.3 },
  skipBtn: { paddingVertical: vs(6) },

  // Slides
  slidesWrap: { flex: 1 },
  slide: { flex: 1 },
  illuArea: {
    flex: 1.1,
    paddingHorizontal: s(24),
    overflow: 'hidden', // clip illustration's absolute children to bounds
  },
  copyArea: {
    flex: 0.9,
    paddingHorizontal: s(24),
    paddingTop: vs(8),
    paddingBottom: vs(20), // breathing room above footer card
    justifyContent: 'center',
  },
  eyebrow: { marginBottom: vs(10), letterSpacing: ms(1.4) },
  slideTitle: {
    lineHeight: ms(34),
    marginBottom: vs(10),
  },
  slideBody: {
    lineHeight: ms(24),
  },

  // ── Footer card ──
  footerCard: {
    paddingHorizontal: s(24),
    paddingTop: vs(20),
    paddingBottom: vs(10),
    gap: vs(18),
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  footerScrim: {
    position: 'absolute',
    left: 0, right: 0, top: -vs(24),
    height: vs(24),
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: ms(6),
    height: ms(8), // fixed height so animating width doesn't push siblings
  },
  proofWrap: {
    alignItems: 'center',
    height: ms(18), // fixed height — fade-out doesn't collapse the layout
    justifyContent: 'center',
  },

  // Next button
  nextBtn: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    height: vs(54),
    ...shadow.md,
    shadowColor: colors.premium,
  },
  nextBtnInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(8),
  },
  nextBtnText: { fontWeight: '700' },

  // Signup wall
  signupWall: { gap: vs(12) },
  appleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: s(10),
    height: vs(54), borderRadius: radius.pill,
    backgroundColor: '#000000',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    ...shadow.sm,
  },
  appleBtnText: { fontWeight: '600' },
  emailBtn: {
    height: vs(54), borderRadius: radius.pill,
    borderWidth: 1, borderColor: 'rgba(192,139,48,0.4)',
    backgroundColor: 'rgba(192,139,48,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  emailBtnText: { fontWeight: '600' },
  guestBtn: { paddingVertical: vs(6), marginTop: vs(2) },
});
