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
        background: 'rgba(0, 0, 0, 0.95)',
        borderBottom: '1px solid #333333',
        backdropFilter: 'blur(20px)',
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
              padding: `8px ${SPACING.md}`,
              borderRadius: '12px',
              border: '1px solid #333333',
              background: '#1a1a1a',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease-out',
              minHeight: '36px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2a2a2a';
              e.currentTarget.style.borderColor = '#444444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1a1a1a';
              e.currentTarget.style.borderColor = '#333333';
            }}
          >
            <span>
              {filters.topicFilter ? `#${filters.topicFilter}` : '주제 선택'}
            </span>
            <span style={{ color: '#888888', fontSize: '12px' }}>
              {filters.topicFilter ? '✕' : '▼'}
            </span>
          </button>

          {/* Sort Dropdown */}
          <div style={{ position: 'relative', zIndex: 200 }}>
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              style={{
                padding: `8px ${SPACING.md}`,
                borderRadius: '12px',
                border: '1px solid #333333',
                background: '#1a1a1a',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '100px',
                flexShrink: 0,
                height: '36px',
                position: 'relative',
                zIndex: 200
              }}
            >
              <option value="latest" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>최신순</option>
              <option value="popular" style={{ background: '#1a1a1a', color: '#FFFFFF' }}>인기순</option>
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
              border: '1px solid #333333',
              background: !filters.topicFilter ? '#4ECDC4' : '#1a1a1a',
              color: !filters.topicFilter ? '#000000' : '#FFFFFF',
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
                background: filters.topicFilter === topic ? '#4ECDC4' : '#2a2a2a',
                color: filters.topicFilter === topic ? '#000000' : '#FFFFFF',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease-out',
                boxShadow: filters.topicFilter === topic ? '0 2px 8px rgba(78, 205, 196, 0.3)' : 'none',
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
          color: '#888888',
          marginTop: SPACING.md
        }}>
          원하는 주제를 선택하거나 '전체'를 선택하세요
        </p>
      </BottomSheet>
    </>
  );
}
