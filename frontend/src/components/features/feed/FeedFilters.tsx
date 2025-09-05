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
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(filters.topicFilter ? [filters.topicFilter] : []);

  const handleSortChange = (sortBy: FeedFilters['sortBy']) => {
    onFiltersChange({ ...filters, sortBy });
    setShowSortSheet(false);
  };

  const handleTopicToggle = (topic: string) => {
    const newSelectedTopics = selectedTopics.includes(topic)
      ? selectedTopics.filter(t => t !== topic)
      : [...selectedTopics, topic];
    
    setSelectedTopics(newSelectedTopics);
    onFiltersChange({ 
      ...filters, 
      topicFilter: newSelectedTopics.length > 0 ? newSelectedTopics[0] : undefined 
    });
  };

  const handleReset = () => {
    setSelectedTopics([]);
    onFiltersChange({ ...filters, topicFilter: undefined });
  };

  const buttonStyle = {
    padding: `8px ${SPACING.sm}`,
    borderRadius: '12px',
    border: '1px solid #333333',
    background: '#1a1a1a',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    outline: 'none',
    height: '36px',
    transition: 'all 0.2s ease-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
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
              ...buttonStyle,
              flex: 1
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
              {selectedTopics.length > 0 
                ? selectedTopics.length === 1 
                  ? `#${selectedTopics[0]}` 
                  : `${selectedTopics.length}개 선택됨`
                : '주제 선택'
              }
            </span>
            <span style={{ color: '#888888', fontSize: '12px' }}>
              ▼
            </span>
          </button>

          {/* Sort Button */}
          <button
            onClick={() => setShowSortSheet(true)}
            style={{
              ...buttonStyle,
              minWidth: '100px',
              flexShrink: 0
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
              {filters.sortBy === 'latest' ? '최신순' : '인기순'}
            </span>
            <span style={{ color: '#888888', fontSize: '12px' }}>
              ▼
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Sheet for Tag Selection */}
      <BottomSheet
        isOpen={showTagSheet}
        onClose={() => setShowTagSheet(false)}
        title="주제 선택"
      >
        <div style={{ marginBottom: SPACING.md }}>
          {/* Header with Reset Button */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: SPACING.md 
          }}>
            <span style={{ fontSize: '14px', color: '#888888' }}>
              {selectedTopics.length}개 선택됨
            </span>
            <button
              onClick={handleReset}
              style={{
                padding: `4px ${SPACING.sm}`,
                borderRadius: '12px',
                border: '1px solid #333333',
                background: '#2a2a2a',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease-out'
              }}
            >
              초기화
            </button>
          </div>

          {/* Animals Category */}
          <div style={{ marginBottom: SPACING.md }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#888888', marginBottom: SPACING.xs }}>
              🐾 동물
            </h4>
            <div style={{
              display: 'flex',
              gap: SPACING.xs,
              flexWrap: 'wrap'
            }}>
              {['고양이', '강아지', '새', '물고기', '나비'].filter(topic => availableTopics.includes(topic)).map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicToggle(topic)}
                  style={{
                    padding: `4px ${SPACING.sm}`,
                    borderRadius: '12px',
                    border: 'none',
                    background: selectedTopics.includes(topic) ? '#4ECDC4' : '#2a2a2a',
                    color: selectedTopics.includes(topic) ? '#000000' : '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-out'
                  }}
                >
                  #{topic}
                </button>
              ))}
            </div>
          </div>

          {/* Nature Category */}
          <div style={{ marginBottom: SPACING.md }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#888888', marginBottom: SPACING.xs }}>
              🌿 자연
            </h4>
            <div style={{
              display: 'flex',
              gap: SPACING.xs,
              flexWrap: 'wrap'
            }}>
              {['나무', '꽃', '태양', '달', '별', '구름', '무지개', '산', '바다'].filter(topic => availableTopics.includes(topic)).map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicToggle(topic)}
                  style={{
                    padding: `4px ${SPACING.sm}`,
                    borderRadius: '12px',
                    border: 'none',
                    background: selectedTopics.includes(topic) ? '#4ECDC4' : '#2a2a2a',
                    color: selectedTopics.includes(topic) ? '#000000' : '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-out'
                  }}
                >
                  #{topic}
                </button>
              ))}
            </div>
          </div>

          {/* Objects Category */}
          <div style={{ marginBottom: SPACING.md }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#888888', marginBottom: SPACING.xs }}>
              🏠 사물
            </h4>
            <div style={{
              display: 'flex',
              gap: SPACING.xs,
              flexWrap: 'wrap'
            }}>
              {['집', '자동차', '로봇', '우주선', '성'].filter(topic => availableTopics.includes(topic)).map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicToggle(topic)}
                  style={{
                    padding: `4px ${SPACING.sm}`,
                    borderRadius: '12px',
                    border: 'none',
                    background: selectedTopics.includes(topic) ? '#4ECDC4' : '#2a2a2a',
                    color: selectedTopics.includes(topic) ? '#000000' : '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-out'
                  }}
                >
                  #{topic}
                </button>
              ))}
            </div>
          </div>

          {/* Fantasy Category */}
          <div style={{ marginBottom: SPACING.md }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#888888', marginBottom: SPACING.xs }}>
              ✨ 판타지
            </h4>
            <div style={{
              display: 'flex',
              gap: SPACING.xs,
              flexWrap: 'wrap'
            }}>
              {['용'].filter(topic => availableTopics.includes(topic)).map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicToggle(topic)}
                  style={{
                    padding: `4px ${SPACING.sm}`,
                    borderRadius: '12px',
                    border: 'none',
                    background: selectedTopics.includes(topic) ? '#4ECDC4' : '#2a2a2a',
                    color: selectedTopics.includes(topic) ? '#000000' : '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-out'
                  }}
                >
                  #{topic}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Info Text */}
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#666666',
          marginTop: SPACING.md
        }}>
          원하는 주제를 여러 개 선택할 수 있습니다
        </p>
      </BottomSheet>

      {/* Bottom Sheet for Sort Selection */}
      <BottomSheet
        isOpen={showSortSheet}
        onClose={() => setShowSortSheet(false)}
        title=""
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          margin: `-${SPACING.md} 0`
        }}>
          <div
            onClick={() => handleSortChange('latest')}
            style={{
              padding: `${SPACING.sm} 0`,
              borderBottom: '1px solid #333333',
              color: filters.sortBy === 'latest' ? '#4ECDC4' : '#FFFFFF',
              fontSize: '16px',
              fontWeight: filters.sortBy === 'latest' ? '600' : '400',
              cursor: 'pointer',
              transition: 'color 0.2s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>최신순</span>
            {filters.sortBy === 'latest' && (
              <span style={{ color: '#4ECDC4', fontSize: '14px' }}>✓</span>
            )}
          </div>
          <div
            onClick={() => handleSortChange('popular')}
            style={{
              padding: `${SPACING.sm} 0`,
              color: filters.sortBy === 'popular' ? '#4ECDC4' : '#FFFFFF',
              fontSize: '16px',
              fontWeight: filters.sortBy === 'popular' ? '600' : '400',
              cursor: 'pointer',
              transition: 'color 0.2s ease-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>인기순</span>
            {filters.sortBy === 'popular' && (
              <span style={{ color: '#4ECDC4', fontSize: '14px' }}>✓</span>
            )}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
