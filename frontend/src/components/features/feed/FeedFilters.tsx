'use client';

import { useState } from 'react';
import BottomSheet from '@/components/ui/BottomSheet';
import { COLORS, SPACING } from '@/constants/design';
import { FeedFilters } from '@/types/ui';

interface FeedFiltersProps {
  filters: FeedFilters;
  onFiltersChange: (filters: FeedFilters) => void;
  availableTopics: string[];
}

export default function FeedFiltersComponent({ 
  filters, 
  onFiltersChange, 
  availableTopics 
}: FeedFiltersProps) {
  const [showTagSheet, setShowTagSheet] = useState(false);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, sortBy: e.target.value as FeedFilters['sortBy'] });
  };

  const handleTopicFilter = (topic: string) => {
    const newFilter = filters.topicFilter === topic ? undefined : topic;
    onFiltersChange({ ...filters, topicFilter: newFilter });
    setShowTagSheet(false);
  };

  const clearTopicFilter = () => {
    onFiltersChange({ ...filters, topicFilter: undefined });
    setShowTagSheet(false);
  };

  return (
    <>
      <div style={{ 
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: COLORS.neutral.background,
        borderBottom: `2px solid ${COLORS.neutral.border}`,
        backdropFilter: 'blur(10px)',
        margin: `-${SPACING.md} -${SPACING.md} ${SPACING.lg} -${SPACING.md}`,
        padding: SPACING.md
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex', 
          alignItems: 'center',
          gap: SPACING.md
        }}>
          {/* Topic Filter Button */}
          <button
            onClick={() => setShowTagSheet(true)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${SPACING.sm} ${SPACING.md}`,
              borderRadius: '8px',
              border: `1px solid ${COLORS.neutral.border}`,
              background: COLORS.neutral.card,
              color: COLORS.neutral.text,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease-out',
              minHeight: '40px'
            }}
          >
            <span>
              {filters.topicFilter ? `#${filters.topicFilter}` : '주제 선택'}
            </span>
            <span style={{ color: COLORS.neutral.subtext }}>
              {filters.topicFilter ? '✕' : '▼'}
            </span>
          </button>

          {/* Sort Dropdown */}
          <div style={{ position: 'relative', zIndex: 200 }}>
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              style={{
                padding: `${SPACING.sm} ${SPACING.md}`,
                borderRadius: '8px',
                border: `1px solid ${COLORS.neutral.border}`,
                background: COLORS.neutral.card,
                color: COLORS.neutral.text,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '100px',
                flexShrink: 0,
                height: '40px',
                position: 'relative',
                zIndex: 200
              }}
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Sheet for Tag Selection */}
      <BottomSheet
        isOpen={showTagSheet}
        onClose={() => setShowTagSheet(false)}
        title="주제 선택"
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: SPACING.sm,
          marginBottom: SPACING.md
        }}>
          {/* Clear Filter Option */}
          <button
            onClick={clearTopicFilter}
            style={{
              padding: `${SPACING.sm} ${SPACING.md}`,
              borderRadius: '20px',
              border: `1px solid ${COLORS.neutral.border}`,
              background: !filters.topicFilter ? COLORS.primary.main : 'transparent',
              color: !filters.topicFilter ? 'white' : COLORS.neutral.text,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease-out',
              textAlign: 'center'
            }}
          >
            전체
          </button>

          {/* Topic Tags */}
          {availableTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => handleTopicFilter(topic)}
              style={{
                padding: `${SPACING.sm} ${SPACING.md}`,
                borderRadius: '20px',
                border: 'none',
                background: filters.topicFilter === topic ? COLORS.primary.main : COLORS.neutral.background,
                color: filters.topicFilter === topic ? 'white' : COLORS.neutral.text,
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease-out',
                boxShadow: filters.topicFilter === topic ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                textAlign: 'center'
              }}
            >
              #{topic}
            </button>
          ))}
        </div>
        
        {/* Info Text */}
        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: COLORS.neutral.subtext,
          marginTop: SPACING.md
        }}>
          원하는 주제를 선택하거나 '전체'를 선택하세요
        </p>
      </BottomSheet>
    </>
  );
}
