import { COLORS, SPACING } from "@/constants/design";
import { useEffect, useState } from "react";

export const Countdown = (props: {
    topic: string | null;
    countdown: number;
}) => {
    const { topic, countdown } = props;
    const [animate, setAnimate] = useState(false);
    const [shake, setShake] = useState(false);

    useEffect(() => {
        if (countdown > 0) {
            setAnimate(true);
            setShake(true);
            const timer1 = setTimeout(() => setAnimate(false), 800);
            const timer2 = setTimeout(() => setShake(false), 400);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [countdown]);

    const pulseScale = animate ? 1.6 : 1;
    const rotation = animate ? (countdown % 2 === 0 ? 15 : -15) : 0;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            overflow: 'hidden',
            width: '100%',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1000
        }}>
            {topic && (
                <div style={{
                    fontSize: '24px',
                    marginBottom: SPACING.md,
                    color: COLORS.primary.main,
                    fontWeight: '600'
                }}>
                    주제: {topic}
                </div>
            )}
            <div style={{
                fontSize: '80px',
                fontWeight: 'bold',
                color: countdown <= 3 ? '#FF4444' : COLORS.primary.main,
                transform: `scale(${animate ? pulseScale : 1}) rotate(${rotation}deg) ${shake ? 'translateX(5px)' : ''}`,
                transition: animate ? 'none' : 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                textShadow: animate ? `0 0 20px ${countdown <= 3 ? '#FF4444' : COLORS.primary.main}, 0 4px 15px rgba(255,107,107,0.8)` : 'none',
                animation: shake ? 'shake 0.4s ease-in-out' : 'none',
                filter: 'none',
                background: 'none'
            }}>
                { countdown}
            </div>
            
            <style jsx>{`

                @keyframes shake {
                    0%, 100% { transform: translateX(0) rotate(0deg); }
                    10% { transform: translateX(-10px) rotate(-5deg); }
                    20% { transform: translateX(10px) rotate(5deg); }
                    30% { transform: translateX(-8px) rotate(-3deg); }
                    40% { transform: translateX(8px) rotate(3deg); }
                    50% { transform: translateX(-6px) rotate(-2deg); }
                    60% { transform: translateX(6px) rotate(2deg); }
                    70% { transform: translateX(-4px) rotate(-1deg); }
                    80% { transform: translateX(4px) rotate(1deg); }
                    90% { transform: translateX(-2px) rotate(-0.5deg); }
                }
            `}</style>
        </div>
    );
};

