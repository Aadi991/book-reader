export default function CenterState({
  icon,
  title,
  subtitle,
  loading = false
}) {
  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(to bottom, #f8fafc, #eef2ff)',
          zIndex: 50
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            padding: 40,
            minWidth: 360,
            maxWidth: 420,
            borderRadius: 24,
            background: '#fff',
            boxShadow:
              '0 20px 40px rgba(0,0,0,.08)',
            border:
              '1px solid rgba(0,0,0,.05)'
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40
            }}
          >
            {loading ? (
              <div
                style={{
                  width: 36,
                  height: 36,
                  border:
                    '4px solid #d1d5db',
                  borderTop:
                    '4px solid #3b82f6',
                  borderRadius: '50%',
                  animation:
                    'spin 1s linear infinite'
                }}
              />
            ) : (
              icon
            )}
          </div>

          <div
            style={{
              textAlign: 'center'
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700
              }}
            >
              {title}
            </h2>

            <p
              style={{
                marginTop: 12,
                color: '#6b7280',
                lineHeight: 1.6
              }}
            >
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}