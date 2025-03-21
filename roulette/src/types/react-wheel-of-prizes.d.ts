declare module 'react-wheel-of-prizes' {
  interface WheelComponentProps {
    segments: string[];
    segColors: string[];
    winningSegment: string;
    onFinished: (winner: string) => void;
    primaryColor: string;
    contrastColor: string;
    buttonText: string;
    isOnlyOnce?: boolean;
    size?: number;
    upDuration?: number;
    downDuration?: number;
  }

  const WheelComponent: React.FC<WheelComponentProps>;
  export default WheelComponent;
} 