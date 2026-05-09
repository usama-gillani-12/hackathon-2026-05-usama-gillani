import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing, shadow } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: s(24), paddingBottom: vs(32) },

  // Orbs
  orb1: {
    position: 'absolute', width: ms(320), height: ms(320), borderRadius: ms(160),
    top: -ms(100), right: -ms(80), overflow: 'hidden',
  },
  orb2: {
    position: 'absolute', width: ms(260), height: ms(260), borderRadius: ms(130),
    top: ms(160), left: -ms(100), overflow: 'hidden',
  },
  orb3: {
    position: 'absolute', width: ms(180), height: ms(180), borderRadius: ms(90),
    bottom: ms(100), right: ms(40), overflow: 'hidden',
  },

  // Hero
  heroSection: { paddingTop: vs(36), paddingBottom: vs(28) },
  freeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: ms(5),
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(192,139,48,0.15)',
    borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(192,139,48,0.3)',
    paddingHorizontal: s(10), paddingVertical: vs(4),
    marginBottom: vs(14),
  },
  freeBadgeText: { letterSpacing: ms(0.4) },
  heroTitle: { marginBottom: vs(8) },
  heroSub: { lineHeight: ms(24) },

  // Social
  socialSection: { gap: vs(10), marginBottom: vs(20) },
  appleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: s(10),
    height: vs(48), borderRadius: radius.pill,
    backgroundColor: '#000000',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    ...shadow.sm,
  },
  appleBtnText: { fontWeight: '600' },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: s(10),
    height: vs(48), borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    ...shadow.sm,
  },
  googleG: {
    width: ms(22), height: ms(22), borderRadius: ms(11),
    alignItems: 'center', justifyContent: 'center',
  },
  googleGText: { color: '#4285F4', fontSize: ms(14), fontWeight: '700' },
  googleBtnText: { fontWeight: '600' },

  // Divider
  dividerRow: {
    flexDirection: 'row', alignItems: 'center', gap: s(10),
    marginBottom: vs(20),
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: {},

  // Form card
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: s(20),
    gap: vs(4),
    marginBottom: vs(24),
  },
  fieldWrap: { marginBottom: vs(4) },
  fieldErr: { marginTop: vs(4), marginLeft: s(4) },

  strengthWrap: {
    flexDirection: 'row', alignItems: 'center', gap: s(8),
    marginTop: vs(8),
  },
  strengthBars: { flexDirection: 'row', gap: s(4) },
  strengthBar: { width: s(28), height: vs(4), borderRadius: ms(2) },

  errorBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: s(8),
    backgroundColor: 'rgba(192,57,43,0.15)',
    borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(192,57,43,0.3)',
    paddingVertical: vs(10), paddingHorizontal: s(12),
    marginBottom: vs(4),
  },
  errorBannerText: { flex: 1, lineHeight: ms(18) },

  confirmBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: s(8),
    backgroundColor: 'rgba(46,125,90,0.15)',
    borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(46,125,90,0.3)',
    paddingVertical: vs(10), paddingHorizontal: s(12),
    marginBottom: vs(4),
  },
  confirmBannerContent: { flex: 1, gap: vs(2) },
  confirmBannerTitle: { letterSpacing: ms(0.5) },
  confirmBannerText: { lineHeight: ms(17) },

  ctaWrap: { marginTop: vs(12) },

  // Footer
  switchRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginBottom: vs(16),
  },
  switchLink: { fontWeight: '700' },
  legal: { paddingHorizontal: s(8), lineHeight: ms(16) },
});

export const floatStyles = StyleSheet.create({
  wrap: {
    height: vs(50),
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: s(14),
    justifyContent: 'center',
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: s(14),
    top: '50%',
    marginTop: -ms(7),
    fontWeight: '500',
    pointerEvents: 'none',
  } as any,
  input: {
    color: colors.white,
    fontSize: ms(14),
    paddingTop: vs(10),
    paddingBottom: 0,
    paddingRight: s(36),
  },
  rightSlot: {
    position: 'absolute',
    right: s(14),
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});

export const ctaStyles = StyleSheet.create({
  outer: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    height: vs(50),
    ...shadow.md,
    shadowColor: colors.premium,
  },
  outerDisabled: { opacity: 0.45 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { color: colors.white, fontSize: ms(16), fontWeight: '700', letterSpacing: 0.3 },
  spinnerWrap: { position: 'absolute' },
});
