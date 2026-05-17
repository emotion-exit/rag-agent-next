import type { Metadata } from 'next';
import ConversationStage from '@/components/coversation-stage';

export const metadata: Metadata = {
  title: 'index'
};

export default function Home() {
  return (
    <>
      <ConversationStage />
    </>
  );
}
