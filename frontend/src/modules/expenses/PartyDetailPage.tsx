import { useParams } from 'react-router-dom';
import { PartyTimeline } from './components/PartyTimeline';

export default function PartyDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <PartyTimeline partyId={id} />;
}
