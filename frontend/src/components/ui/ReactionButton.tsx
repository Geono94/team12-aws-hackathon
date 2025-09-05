'use client';

import { COLORS, SPACING } from '@/constants/design';
import { Reaction } from '@/types/ui';

interface ReactionButtonProps {
  reaction: Reaction;
  onReact: () => void;
}

const reactionEmojis = {
  like: '❤️',
  clap: '👏',
  wow: '😲',
  laugh: '😂'
};

export default function ReactionButton({ reaction, onReact }: ReactionButtonProps) {
  return (
    <button
      onClick={onReact}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: `${SPACING.xs} ${SPACING.sm}`,
        borderRadius: '20px',
        border: 'none',
        background: reaction.userReacted ? COLORS.primary.main : COLORS.neutral.background,
        color: reaction.userReacted ? 'white' : COLORS.neutral.text,
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease-out',
        transform: reaction.userReacted ? 'scale(1.05)' : 'scale(1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = reaction.userReacted ? 'scale(1.05)' : 'scale(1)';
      }}
    >
      <span style={{ fontSize: '16px' }}>
        {reactionEmojis[reaction.type]}
      </span>
      <span>{reaction.count}</span>
    </button>
  );
}
