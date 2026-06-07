import PageHeader from '@/components/layout/Pageheader';
import { ScheduleSurveyDialog } from '@/components/surveys/ScheduleSurveyDialog';
import { SurveyTable } from '@/components/surveys/SurveyTable';

export default function SurveyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Survey"
        description="Engineer-led rooftop assessment and system sizing"
        breadcrumbs={[{ label: 'Pre-Sales' }, { label: 'Site Survey' }]}
        actions={<ScheduleSurveyDialog />}
      />
      <SurveyTable />
    </div>
  );
}
