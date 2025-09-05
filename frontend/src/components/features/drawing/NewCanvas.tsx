'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useSvgDrawing } from '@svg-drawing/react';
import { useYjs } from '@/contexts/YjsContext';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/design';

interface PlayerDrawing {
  paths: string[];
  colors: string[];
  strokeWidths: number[];
  lastUpdate: number;
}

interface NewCanvasProps {
  roomId: string;
  playerId: string;
  gameState?: 'waiting' | 'topicSelection' | 'countdown' | 'playing' | 'ended';
  disabled?: boolean;
}

export const NewCanvas = ({ 
  roomId, 
  playerId, 
  gameState = 'playing',
  disabled = false 
}: NewCanvasProps) => {
  const [currentColor, setCurrentColor] = useState<string>(COLORS.primary.main);
  const [brushSize, setBrushSize] = useState(5);
  const otherPlayersRef = useRef<HTMLDivElement>(null);

  const { doc, connected } = useYjs();
  const drawingMap = doc?.getMap<PlayerDrawing>('svgDrawing');

  if (!drawingMap) {
    return null;
  }

  // SVG Drawing 훅 설정
  const [divRef, draw] = useSvgDrawing({
    penWidth: brushSize,
    penColor: currentColor,
    curve: true,
    close: false,
    delay: 50
  });

  const colors = [
    COLORS.primary.main,
    COLORS.primary.sub,
    COLORS.primary.accent,
    '#FFD93D',
    '#6BCF7F',
    '#FF8C42',
    '#9B59B6',
    '#2D3748'
  ];

  // SVG 드로잉 설정 업데이트
  useEffect(() => {
    if (draw) {
      draw.changePenWidth(brushSize);
    }
  }, [brushSize, draw]);

  useEffect(() => {
    if (draw) {
      draw.changePenColor(currentColor);
    }
  }, [currentColor, draw]);

  // 50ms마다 새로운 path 체크하여 Y.js에 전송
  useEffect(() => {
    if (!divRef.current || !drawingMap || gameState !== 'playing') return;

    let lastPathCount = 0;
    const containerDiv = divRef.current;

    const interval = setInterval(() => {
      const svgElement = containerDiv.querySelector('svg');
      if (!svgElement) return;

      const paths = svgElement.querySelectorAll('path[data-player="' + playerId + '"], path:not([data-player])');
      console.log("paths", paths)
        const playerDrawing = drawingMap.get(playerId) || { paths: [], colors: [], strokeWidths: [], lastUpdate: 0 };
        
        for (let i = 0; i < paths.length; i++) {
          const path = paths[i] as SVGPathElement;
          const pathData = path.getAttribute('d');
          if (pathData) {
            playerDrawing.paths.push(pathData);
            playerDrawing.colors.push(path.getAttribute('stroke') ?? currentColor);
            playerDrawing.strokeWidths.push(brushSize);
          }
        }
         
        drawingMap.set(playerId, playerDrawing);
        lastPathCount = paths.length; 
    }, 120);

    return () => {
      clearInterval(interval);
    };
  }, [divRef, drawingMap, currentColor, brushSize, playerId, gameState]);

  // Y.js Map 변경 감지 및 다른 플레이어 그림 동기화
  useEffect(() => {
    if (!drawingMap || !otherPlayersRef.current) return;

    const syncOtherPlayersDrawings = () => {
      const container = otherPlayersRef.current;
      if (!container) return;

      // 기존 SVG 제거
      container.innerHTML = '';

      // 새 SVG 생성
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.position = 'absolute';
      svg.style.top = '0';
      svg.style.left = '0';
      svg.style.pointerEvents = 'none';

      // 모든 다른 플레이어의 그림 렌더링
      drawingMap.forEach((playerDrawing, pid) => {
        if (pid === playerId) return; // 자신의 그림은 건너뛰기
        
        playerDrawing.paths.forEach((pathData, index) => {
          const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          pathElement.setAttribute('d', pathData);
          pathElement.setAttribute('stroke', playerDrawing.colors[index] || '#000');
          pathElement.setAttribute('stroke-width', (playerDrawing.strokeWidths[index] || 5).toString());
          pathElement.setAttribute('fill', 'none');
          pathElement.setAttribute('stroke-linecap', 'round');
          pathElement.setAttribute('stroke-linejoin', 'round');
          pathElement.setAttribute('data-player', pid);
          
          svg.appendChild(pathElement);
        });
      });
      requestAnimationFrame(() => {
        container.appendChild(svg);
      });
    };

    // 초기 동기화
    syncOtherPlayersDrawings();

    // Map 변경 감지
    drawingMap.observe(syncOtherPlayersDrawings);
    return () => drawingMap.unobserve(syncOtherPlayersDrawings);
  }, [drawingMap, playerId]);

  // 캔버스 전체 지우기
  const clearCanvas = useCallback(() => {
    if (!drawingMap || disabled) return;

    // 로컬 SVG 클리어
    if (draw) {
      draw.clear();
    }

    // 모든 플레이어의 그림 데이터 클리어
    drawingMap.clear();
  }, [drawingMap, draw, disabled]);


  if (!connected || !doc) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '90vw',
        maxWidth: '400px',
        height: '90vw',
        maxHeight: '400px',
        background: '#f5f5f5',
        borderRadius: BORDER_RADIUS.md,
        color: '#666',
        border: `2px solid ${COLORS.neutral.border}`
      }}>
        Y.js 연결 중...
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: SPACING.md
    }}>
      {/* 드로잉 도구 (게임 중일 때만 표시) */}
      {gameState === 'playing' && !disabled && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACING.md,
          marginBottom: SPACING.md,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {/* 컬러 팔레트 */}
          <div style={{ display: 'flex', gap: SPACING.xs }}>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: currentColor === color ? `3px solid ${COLORS.neutral.text}` : '2px solid white',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              />
            ))}
          </div>
          
          {/* 브러시 크기 조절 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.xs }}>
            <label style={{ color: COLORS.neutral.text }}>크기:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              style={{ width: '80px' }}
            />
            <span style={{ color: COLORS.neutral.text, minWidth: '30px' }}>{brushSize}px</span>
          </div>
          
          {/* 지우기 버튼 */}
          <button 
            onClick={clearCanvas}
            disabled={disabled}
            style={{
              padding: `${SPACING.xs} ${SPACING.sm}`,
              backgroundColor: disabled ? COLORS.neutral.border : COLORS.primary.main,
              color: 'white',
              border: 'none',
              borderRadius: BORDER_RADIUS.sm,
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: disabled ? 0.5 : 1
            }}
          >
            🗑️ 모두 지우기
          </button>
        </div>
      )}
      <div style={{
        position: 'relative',
        width: '90vw',
        maxWidth: '400px',
        height: '90vw',
        maxHeight: '400px',
        border: `2px solid ${disabled ? COLORS.neutral.border : COLORS.primary.main}`,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: 'white',
        overflow: 'hidden'
      }}>
        <div
          ref={otherPlayersRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
        <div
          ref={divRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            touchAction: 'none',
            cursor: gameState === 'playing' && !disabled ? 'crosshair' : 'not-allowed',
            opacity: disabled ? 0.5 : 1,
            zIndex: 2
          }}
        />
      </div>
    </div>
  );
};

export default NewCanvas;