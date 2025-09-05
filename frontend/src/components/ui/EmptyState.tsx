'use client';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ 
  icon = '🎨', 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div style={{
      background: '#000000',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '300px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {icon}
        </div>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600',
          marginBottom: description ? '8px' : '16px',
          color: '#FFFFFF'
        }}>
          {title}
        </h2>
        {description && (
          <p style={{ 
            fontSize: '14px', 
            color: '#888888',
            marginBottom: '16px',
            lineHeight: '1.4'
          }}>
            {description}
          </p>
        )}
        {action && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
}