import { NotesBoard } from '@/components/NotesBoard';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const gaEnabled = Boolean(process.env.NEXT_PUBLIC_GA_ID);
  return <NotesBoard gaEnabled={gaEnabled} />;
}
