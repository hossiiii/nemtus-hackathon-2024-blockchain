'use client';
import Image from 'next/image';
function Loading(): JSX.Element {

  return (
    <Image
      src='/loading.gif'
      width={300}
      height={300}
      style={{
        width: 'auto',
      }}
      alt='logo'
    />
  );
}

export default Loading;
