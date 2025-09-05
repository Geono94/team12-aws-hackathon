
import { SPACING } from '@/constants/design';
import { memo } from 'react';

export const Title = memo(() => {
    return <h1 style={{ 
        fontSize: '36px',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: SPACING.sm,
        position: 'relative',
        }}
    >
        DrawTogether
    </h1>
})

Title.displayName = 'Title'; 