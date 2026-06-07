import PageHeader from '@/components/layout/Pageheader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ModulePageConfig } from '@/lib/modules';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function ModulePage({ config }: { config: ModulePageConfig }) {
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={config.description}
        breadcrumbs={[{ label: config.phase }, { label: config.title }]}
        actions={
          config.primaryHref ? (
            <Button asChild variant="outline" size="sm">
              <Link href={config.primaryHref}>
                {config.primaryLabel ?? 'Go back'}
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          ) : undefined
        }
      />

      <Card className="overflow-hidden border-border/60">
        <div className="relative border-b border-border/50 bg-linear-to-br from-amber-500/8 via-background to-background px-6 py-8">
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/12 text-amber-600 ring-1 ring-amber-500/15 dark:text-amber-400">
                <Icon className="size-7" />
              </span>
              <div>
                <Badge variant="secondary" className="mb-2">
                  <Sparkles className="mr-1 size-3" />
                  Coming in next sprint
                </Badge>
                <h2 className="text-lg font-semibold tracking-tight">Module scaffold ready</h2>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  Navigation, permissions, and Convex schema are wired per SuryaERP architecture. Backend mutations and
                  UI workflows for this module are next.
                </p>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="grid gap-3 p-6 sm:grid-cols-2">
          {config.features.map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm"
            >
              <span className="size-1.5 rounded-full bg-amber-500" />
              {feature}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
