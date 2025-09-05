export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export interface Reaction {
  type: 'like' | 'clap' | 'wow' | 'laugh';
  count: number;
  userReacted: boolean;
}

export interface ArtworkItem {
  id: string;
  originalImage: string;
  aiImage: string;
  topic: string;
  playerCount: number;
  createdAt: string;
  aiModel?: string;
  reactions: Reaction[];
}

export interface FeedFilters {
  sortBy: 'latest' | 'popular';
  topicFilter?: string;
}
