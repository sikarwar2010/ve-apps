import { SurveyDetailView } from '@/components/surveys/SurveyDetailView';
import type { Id } from '@/convex/_generated/dataModel';

type PageProps = { params: Promise<{ surveyId: string }> };

export default async function SurveyDetailPage({ params }: PageProps) {
  const { surveyId } = await params;
  return <SurveyDetailView surveyId={surveyId as Id<'surveys'>} />;
}
