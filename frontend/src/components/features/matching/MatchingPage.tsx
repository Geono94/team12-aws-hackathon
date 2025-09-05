'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { COLORS, SPACING } from '@/constants/design';
import { GAME_CONFIG } from '@/constants/game';
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
      background: '#000000',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.lg
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: SPACING.xl
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: SPACING.sm
        }}>
          🎮
        </div>
        <h1 style={{ 
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#FFFFFF',
          marginBottom: SPACING.sm
        }}>
          대기실
        </h1>
      </div>

      {/* Main Card */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: SPACING.xl,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        minWidth: '400px',
        maxWidth: '500px'
      }}>
        {/* Player Count */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: SPACING.xl,
          padding: SPACING.lg,
          background: COLORS.primary.main,
          borderRadius: '12px',
          color: 'white'
        }}>
          <p style={{ 
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {players.length}/{GAME_CONFIG.MAX_PLAYERS} 명 참여 중
          </p>
        </div>

        {/* Players Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: SPACING.md,
          marginBottom: SPACING.xl
        }}>
          {Array.from({ length: GAME_CONFIG.MAX_PLAYERS }).map((_, index) => {
            const player = players[index];
            return (
              <div
                key={index}
                style={{
                  padding: SPACING.lg,
                  background: player 
                    ? COLORS.primary.main
                    : 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: player ? 'white' : '#888888',
                  fontWeight: '600',
                  textAlign: 'center',
                  fontSize: '16px',
                  border: player ? 'none' : '1px dashed rgba(255,255,255,0.2)'
                }}
              >
                {player ? (
                  <>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>👤</div>
                    플레이어 {index + 1}
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                    대기 중...
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex',
          gap: SPACING.md,
          justifyContent: 'center'
        }}>
          <Button 
            variant="outline" 
            onClick={onLeaveRoom}
            style={{
              borderRadius: '12px',
              padding: '12px 24px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: '#FFFFFF'
            }}
          >
            🚪 나가기
          </Button>
          {isHost && (
            <Button 
              disabled={!canStart}
              onClick={onStartGame}
              style={{
                background: canStart 
                  ? COLORS.primary.main
                  : 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px',
                opacity: canStart ? 1 : 0.5
              }}
            >
              🚀 게임 시작
            </Button>
          )}
        </div>

        {!isHost && (
          <p style={{ 
            marginTop: SPACING.lg,
            color: '#888888',
            fontSize: '14px',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            방장이 게임을 시작하기를 기다리는 중...
          </p>
        )}
      </div>
    </div>
  );
}
