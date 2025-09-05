'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { COLORS, SPACING } from '@/constants/design';
import { Player } from '@/types/game';

interface MatchingPageProps {
  players: Player[];
  isHost: boolean;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export default function MatchingPage({ 
  players, 
  isHost, 
  onStartGame, 
  onLeaveRoom 
}: MatchingPageProps) {
  const canStart = players.length >= 2; // Minimum 2 players

  return (
    <div style={{ 
      padding: SPACING.md,
      background: COLORS.neutral.background,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Card>
        <div style={{ 
          textAlign: 'center',
          minWidth: '400px',
          padding: SPACING.lg
        }}>
          <h1 style={{ 
            fontSize: '28px',
            fontWeight: 'bold',
            color: COLORS.neutral.text,
            marginBottom: SPACING.lg
          }}>
            대기실
          </h1>

          {/* Player Count */}
          <div style={{ 
            marginBottom: SPACING.xl,
            padding: SPACING.md,
            background: COLORS.neutral.background,
            borderRadius: '12px'
          }}>
            <p style={{ 
              fontSize: '18px',
              fontWeight: '600',
              color: COLORS.primary.main
            }}>
              {players.length}/4 명 참여 중
            </p>
          </div>

          {/* Players List */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: SPACING.sm,
            marginBottom: SPACING.xl
          }}>
            {Array.from({ length: 4 }).map((_, index) => {
              const player = players[index];
              return (
                <div
                  key={index}
                  style={{
                    padding: SPACING.md,
                    background: player ? COLORS.primary.sub : COLORS.neutral.border,
                    borderRadius: '8px',
                    color: player ? 'white' : COLORS.neutral.subtext,
                    fontWeight: '500'
                  }}
                >
                  {player ? `플레이어 ${index + 1}` : '대기 중...'}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex',
            gap: SPACING.sm,
            justifyContent: 'center'
          }}>
            <Button variant="outline" onClick={onLeaveRoom}>
              나가기
            </Button>
            {isHost && (
              <Button 
                disabled={!canStart}
                onClick={onStartGame}
              >
                게임 시작
              </Button>
            )}
          </div>

          {!isHost && (
            <p style={{ 
              marginTop: SPACING.md,
              color: COLORS.neutral.subtext,
              fontSize: '14px'
            }}>
              방장이 게임을 시작하기를 기다리는 중...
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
