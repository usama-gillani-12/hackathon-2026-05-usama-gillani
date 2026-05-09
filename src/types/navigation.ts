import { NavigatorScreenParams } from '@react-navigation/native';
import { CreditPackage, CreditTransaction } from './credits';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type BottomTabParamList = {
  Dashboard: undefined;
  TrendingProducts: undefined;
  Discover: undefined;
  Watchlist: undefined;
  BuyCredits: undefined;
};

export type DrawerParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList>;
  Profile: undefined;
  Analytics: undefined;
  Notifications: undefined;
  Settings: undefined;
  TransactionHistory: undefined;
  InvestorMetrics: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  DrawerRoot: NavigatorScreenParams<DrawerParamList>;
  ProductDetail: { productId: string };
  ScoreBreakdown: { productId: string };
  CompareProducts: { initialProductId?: string } | undefined;
  ProductTestPlan: { productId: string };
  PaymentSuccess: { transaction: CreditTransaction; packageInfo: CreditPackage };
};
