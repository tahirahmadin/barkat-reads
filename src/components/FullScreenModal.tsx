import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FullScreenModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const FullScreenModal: React.FC<FullScreenModalProps> = ({
  visible,
  onClose,
  title,
  content,
}) => {
  const [mode, setMode] = useState<'read' | 'listen'>('read');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Top Navigation Bar */}
        <View style={styles.topBar}>
          {/* Left: Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <Text style={styles.iconText}>✕</Text>
          </TouchableOpacity>

          {/* Center: Read/Listen Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, mode === 'read' && styles.toggleButtonActive]}
              onPress={() => setMode('read')}
            >
              <Text style={[styles.toggleIcon, mode === 'read' && styles.toggleIconActive]}>
                ☰
              </Text>
              <Text style={[styles.toggleText, mode === 'read' && styles.toggleTextActive]}>
                Read
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, mode === 'listen' && styles.toggleButtonActive]}
              onPress={() => setMode('listen')}
            >
              <Text style={[styles.toggleIcon, mode === 'listen' && styles.toggleIconActive]}>
                🎧
              </Text>
              <Text style={[styles.toggleText, mode === 'listen' && styles.toggleTextActive]}>
                Listen
              </Text>
            </TouchableOpacity>
          </View>

          {/* Right: Menu and Settings Icons */}
          <View style={styles.rightIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>☰</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>Aa</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
        >
          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Body Content */}
          <View style={styles.bodyContent}>
            {content.split('\n').map((line, index) => {
              const trimmedLine = line.trim();
              // Format step headers
              if (trimmedLine.startsWith('Step ')) {
                return (
                  <Text key={index} style={styles.stepHeader}>
                    {line}
                    {'\n'}
                  </Text>
                );
              }
              // Format fun fact
              if (trimmedLine.startsWith('Fun Fact:')) {
                return (
                  <Text key={index} style={styles.funFact}>
                    {line}
                    {'\n'}
                  </Text>
                );
              }
              // Skip empty lines
              if (trimmedLine === '') {
                return <Text key={index}>{'\n'}</Text>;
              }
              // Regular content
              return (
                <Text key={index} style={styles.contentLine}>
                  {line}
                  {'\n'}
                </Text>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 2,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: '#1A1A1A',
  },
  toggleIcon: {
    fontSize: 14,
    marginRight: 6,
    color: '#666666',
  },
  toggleIconActive: {
    color: '#FFFFFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 24,
    lineHeight: 40,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
  bodyContent: {
    marginTop: 8,
  },
  contentLine: {
    fontSize: 17,
    lineHeight: 28,
    color: '#1A1A1A',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif',
      },
    }),
  },
  stepHeader: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginTop: 24,
    marginBottom: 16,
    lineHeight: 32,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
  funFact: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontStyle: 'italic',
    marginTop: 16,
    marginBottom: 16,
    lineHeight: 24,
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 8,
  },
});
