import { ModulePage } from '@/components/shared/ModulePage';
import { MODULE_PAGES } from '@/lib/modules';

export default function Page() {
  return <ModulePage config={MODULE_PAGES['rfq']} />;
}

