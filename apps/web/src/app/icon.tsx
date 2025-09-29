import { ImageResponse } from 'next/og';

// 图片元数据
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// 图片生成
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#4B69C6',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '20%',
        }}
      >
        R
      </div>
    ),
    {
      ...size,
    }
  );
}
