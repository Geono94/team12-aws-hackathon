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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          color: 'white',
          marginBottom: SPACING.sm,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          대기실
        </h1>
      </div>

      {/* Main Card */}
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '20px',
        padding: SPACING.xl,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        backdropFilter: 'blur(10px)',
        minWidth: '400px',
        maxWidth: '500px'
      }}>
        {/* Player Count */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: SPACING.xl,
          padding: SPACING.lg,
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          borderRadius: '15px',
          color: 'white'
        }}>
          <p style={{ 
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {players.length}/4 명 참여 중
          </p>
        </div>

        {/* Players Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: SPACING.md,
          marginBottom: SPACING.xl
        }}>
          {Array.from({ length: 4 }).map((_, index) => {
            const player = players[index];
            return (
              <div
                key={index}
                style={{
                  padding: SPACING.lg,
                  background: player 
                    ? 'linear-gradient(45deg, #ff6b6b, #ffa726)' 
                    : 'rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  color: player ? 'white' : '#666',
                  fontWeight: '600',
                  textAlign: 'center',
                  fontSize: '16px',
                  border: player ? 'none' : '2px dashed #ccc'
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
              borderRadius: '25px',
              padding: '12px 24px',
              border: '2px solid #ccc',
              background: 'white'
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
                  ? 'linear-gradient(45deg, #ff6b6b, #ffa726)' 
                  : '#ccc',
                border: 'none',
                borderRadius: '25px',
                padding: '12px 24px',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              🚀 게임 시작
            </Button>
          )}
        </div>

        {!isHost && (
          <p style={{ 
            marginTop: SPACING.lg,
            color: '#666',
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
