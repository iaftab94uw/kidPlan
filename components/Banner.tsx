import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { CircleAlert as AlertCircle, CircleCheck as CheckCircle, X } from 'lucide-react-native';

interface BannerProps {
  type: 'error' | 'success';
  message: string;
  visible: boolean;
  onDismiss: () => void;
  autoHide?: boolean;
  autoHideDuration?: number;
}

const Banner: React.FC<BannerProps> = ({ 
  type, 
  message, 
  visible, 
  onDismiss, 
  autoHide = true, 
  autoHideDuration = 1500 
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      // Show animation sequence - all using native driver
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      if (autoHide) {
        const timer = setTimeout(() => {
          onDismiss();
        }, autoHideDuration);
        return () => clearTimeout(timer);
      }
    } else {
      // Hide animation sequence - all using native driver
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim, scaleAnim, autoHide, autoHideDuration, onDismiss]);

  return (
    <Animated.View 
      style={[
        styles.bannerContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
        }
      ]}
    >
      <View style={[
        styles.banner,
        type === 'error' ? styles.errorBanner : styles.successBanner,
      ]}>
        {type === 'error' ? (
          <AlertCircle size={20} color="#DC2626" />
        ) : (
          <CheckCircle size={20} color="#059669" />
        )}
        <Text style={[
          styles.bannerText,
          type === 'error' ? styles.errorText : styles.successText
        ]}>
          {message}
        </Text>
        <TouchableOpacity onPress={onDismiss} style={styles.bannerClose}>
          <X size={16} color={type === 'error' ? '#DC2626' : '#059669'} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    marginBottom: 20,
    minHeight: 56, // Reserve space to prevent layout shifts
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minHeight: 56,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  successBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
    lineHeight: 20,
  },
  bannerClose: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    color: '#DC2626',
  },
  successText: {
    color: '#059669',
  },
});

export default Banner;
