import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';

type Dot = {
  x: number;
  y: number;
  radius: number;
  color: string;
};

type IshiharaPlateProps = {
  digit: string;
  type: 'demonstration' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'hidden';
  size?: number;
};

const COLOR_COMBINATIONS = {
  demonstration: {
    background: ['#F87171', '#FCA5A5', '#FECACA'],
    digit: ['#059669', '#34D399', '#6EE7B7'],
    noise: ['#DC2626', '#EF4444', '#FEE2E2']
  },
  protanopia: {
    background: ['#FCD34D', '#FBBF24', '#F59E0B'],
    digit: ['#4B5563', '#6B7280', '#9CA3AF'],
    noise: ['#F59E0B', '#D97706', '#B45309']
  },
  deuteranopia: {
    background: ['#60A5FA', '#3B82F6', '#2563EB'],
    digit: ['#EC4899', '#DB2777', '#BE185D'],
    noise: ['#818CF8', '#6366F1', '#4F46E5']
  },
  tritanopia: {
    background: ['#A78BFA', '#8B5CF6', '#7C3AED'],
    digit: ['#F97316', '#EA580C', '#C2410C'],
    noise: ['#C084FC', '#A855F7', '#9333EA']
  },
  hidden: {
    background: ['#9CA3AF', '#6B7280', '#4B5563'],
    digit: ['#374151', '#1F2937', '#111827'],
    noise: ['#6B7280', '#4B5563', '#374151']
  }
};

const DIGIT_PATHS = {
  '0': [[0.5, 0.2], [0.7, 0.3], [0.8, 0.5], [0.7, 0.7], [0.5, 0.8], [0.3, 0.7], [0.2, 0.5], [0.3, 0.3]],
  '1': [[0.4, 0.3], [0.5, 0.2], [0.5, 0.8]],
  '2': [[0.3, 0.3], [0.5, 0.2], [0.7, 0.3], [0.6, 0.5], [0.4, 0.7], [0.3, 0.8], [0.7, 0.8]],
  '3': [[0.3, 0.3], [0.5, 0.2], [0.7, 0.3], [0.6, 0.5], [0.7, 0.7], [0.5, 0.8], [0.3, 0.7]],
  '4': [[0.7, 0.8], [0.7, 0.2], [0.3, 0.6], [0.7, 0.6]],
  '5': [[0.7, 0.2], [0.3, 0.2], [0.3, 0.5], [0.5, 0.5], [0.7, 0.6], [0.6, 0.8], [0.3, 0.8]],
  '6': [[0.7, 0.3], [0.5, 0.2], [0.3, 0.3], [0.3, 0.7], [0.5, 0.8], [0.7, 0.7], [0.6, 0.5], [0.3, 0.5]],
  '7': [[0.3, 0.2], [0.7, 0.2], [0.5, 0.8]],
  '8': [[0.5, 0.2], [0.7, 0.3], [0.7, 0.4], [0.5, 0.5], [0.3, 0.6], [0.3, 0.7], [0.5, 0.8], [0.7, 0.7], [0.7, 0.6], [0.5, 0.5], [0.3, 0.4], [0.3, 0.3]],
  '9': [[0.3, 0.7], [0.5, 0.8], [0.7, 0.7], [0.7, 0.3], [0.5, 0.2], [0.3, 0.3], [0.4, 0.5], [0.7, 0.5]]
};

export default function IshiharaPlate({ digit, type, size = 300 }: IshiharaPlateProps) {
  const { width } = useWindowDimensions();
  const plateSize = Math.min(width - 48, size);
  
  const dots = generatePlate(plateSize, digit, type);

  return (
    <View style={[styles.container, { width: plateSize, height: plateSize }]}>
      <svg width={plateSize} height={plateSize} style={{ borderRadius: '50%' }}>
        {dots.map((dot, index) => (
          <circle
            key={index}
            cx={dot.x}
            cy={dot.y}
            r={dot.radius}
            fill={dot.color}
          />
        ))}
      </svg>
    </View>
  );
}

function generatePlate(size: number, digit: string, type: string): Dot[] {
  const dots: Dot[] = [];
  const colors = COLOR_COMBINATIONS[type as keyof typeof COLOR_COMBINATIONS];
  const digitPath = DIGIT_PATHS[digit as keyof typeof DIGIT_PATHS] || [];

  // Generate background dots
  const numBackgroundDots = 1000;
  for (let i = 0; i < numBackgroundDots; i++) {
    dots.push(generateRandomDot(size, colors.background));
  }

  // Generate digit dots
  const digitDots = generateDigitDots(size, digitPath, colors.digit);
  dots.push(...digitDots);

  // Generate noise dots
  const numNoiseDots = 300;
  for (let i = 0; i < numNoiseDots; i++) {
    dots.push(generateRandomDot(size, colors.noise));
  }

  return dots;
}

function generateRandomDot(size: number, colors: string[]): Dot {
  const minRadius = size * 0.01;
  const maxRadius = size * 0.03;
  
  return {
    x: Math.random() * size,
    y: Math.random() * size,
    radius: minRadius + Math.random() * (maxRadius - minRadius),
    color: colors[Math.floor(Math.random() * colors.length)]
  };
}

function generateDigitDots(size: number, path: number[][], colors: string[]): Dot[] {
  const dots: Dot[] = [];
  const numDotsPerSegment = 20;
  const minRadius = size * 0.015;
  const maxRadius = size * 0.035;

  // Generate dots along each path segment
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];
    
    for (let j = 0; j < numDotsPerSegment; j++) {
      const t = j / numDotsPerSegment;
      const x = size * (start[0] + (end[0] - start[0]) * t);
      const y = size * (start[1] + (end[1] - start[1]) * t);
      
      // Add some randomness to dot positions
      const jitter = size * 0.02;
      const jitteredX = x + (Math.random() - 0.5) * jitter;
      const jitteredY = y + (Math.random() - 0.5) * jitter;

      dots.push({
        x: jitteredX,
        y: jitteredY,
        radius: minRadius + Math.random() * (maxRadius - minRadius),
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  return dots;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
});