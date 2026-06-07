import { redirect } from 'next/navigation';

export default function LegacyLeadListRedirect() {
  redirect('/crm/leads');
}
