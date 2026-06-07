import { redirect } from 'next/navigation';

export default function LegacyNewLeadRedirect() {
  redirect('/crm/leads/new');
}
