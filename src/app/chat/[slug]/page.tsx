'use client';

import { useParams } from 'next/navigation';

import { HeroForm } from '@/components/form';

export default function Page() {
  const { slug } = useParams<{ slug: string }>();

  return <HeroForm session={slug} />;
}
