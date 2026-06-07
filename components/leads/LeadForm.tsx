'use client';

import {
  LEAD_FORM_STEPS,
  PROPERTY_OPTIONS,
  ROOFTOP_OPTIONS,
  SOURCE_OPTIONS,
  STEP_FIELDS,
  estimateCapacityKw,
  getSourceLabel,
} from '@/components/leads/lead-form-config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';
import { createLeadSchema, type CreateLeadInput } from '@/schemas/lead/lead.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Sun,
  User,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const STEP_ICONS = {
  origin: Sparkles,
  contact: User,
  solar: Sun,
  review: CheckCircle2,
} as const;

const fieldClass =
  'h-11 rounded-xl border-border/60 bg-muted/25 px-3.5 shadow-none transition-colors focus-visible:bg-background';

function NumberInput({
  value,
  onChange,
  ...props
}: Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> & {
  value?: number;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <Input
      type="number"
      className={fieldClass}
      value={value ?? ''}
      onChange={(event) => {
        const next = event.target.valueAsNumber;
        onChange(Number.isNaN(next) ? undefined : next);
      }}
      {...props}
    />
  );
}

function ProgressRing({ value }: { value: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative size-16 shrink-0">
      <svg className="size-16 -rotate-90" viewBox="0 0 64 64" aria-hidden>
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-white/15"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-amber-400 transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
        {Math.round(value)}%
      </span>
    </div>
  );
}

function StepTimeline({ currentStep, onStepClick }: { currentStep: number; onStepClick: (index: number) => void }) {
  return (
    <ol className="space-y-0">
      {LEAD_FORM_STEPS.map((step, index) => {
        const Icon = STEP_ICONS[step.id];
        const isActive = index === currentStep;
        const isComplete = index < currentStep;
        const isLast = index === LEAD_FORM_STEPS.length - 1;

        return (
          <li key={step.id} className="relative flex gap-3">
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  'absolute top-9 left-4 w-px -translate-x-1/2',
                  isComplete ? 'h-[calc(100%-0.25rem)] bg-amber-400/70' : 'h-[calc(100%-0.25rem)] bg-white/15',
                )}
              />
            )}
            <button
              type="button"
              disabled={!isComplete}
              onClick={() => isComplete && onStepClick(index)}
              className={cn(
                'group relative z-1 mb-5 flex w-full items-start gap-3 text-left transition-opacity',
                !isActive && !isComplete && 'opacity-45',
                isComplete && 'cursor-pointer',
              )}
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full border transition-all',
                  isActive && 'border-amber-300 bg-amber-400 text-amber-950 shadow-[0_0_20px_oklch(0.78_0.14_75/0.45)]',
                  isComplete && 'border-emerald-400/50 bg-emerald-400/15 text-emerald-300',
                  !isActive && !isComplete && 'border-white/20 bg-white/5 text-white/50',
                )}
              >
                {isComplete ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
              </span>
              <span className="min-w-0 pt-0.5">
                <span className={cn('block text-sm font-medium', isActive ? 'text-white' : 'text-white/80')}>
                  {step.title}
                </span>
                <span className="block text-xs text-white/45">{step.description}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function LeadSnapshot({ values, variant = 'dark' }: { values: CreateLeadInput; variant?: 'dark' | 'light' }) {
  const suggestedKw = estimateCapacityKw(values.monthlyConsumptionKwh, values.electricityBillAmt);
  const displayKw = values.expectedCapacityKw ?? suggestedKw;
  const isDark = variant === 'dark';

  return (
    <div
      className={cn(
        'rounded-2xl p-4',
        isDark ? 'border border-white/10 bg-white/5 backdrop-blur-sm' : 'border border-border/60 bg-background',
      )}
    >
      <p
        className={cn(
          'text-[11px] font-medium uppercase tracking-[0.14em]',
          isDark ? 'text-amber-200/70' : 'text-muted-foreground',
        )}
      >
        Live snapshot
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div
          className={cn(
            'flex size-10 items-center justify-center rounded-xl',
            isDark ? 'bg-white/10 text-amber-200' : 'bg-amber-500/10 text-amber-600',
          )}
        >
          <User className="size-4" />
        </div>
        <div className="min-w-0">
          <p className={cn('truncate text-sm font-semibold', isDark ? 'text-white' : 'text-foreground')}>
            {values.name || 'Awaiting name'}
          </p>
          <p className={cn('truncate text-xs', isDark ? 'text-white/50' : 'text-muted-foreground')}>
            {values.mobile || 'Mobile pending'}
          </p>
        </div>
      </div>
      <div className={cn('mt-3 space-y-2 text-xs', isDark ? 'text-white/55' : 'text-muted-foreground')}>
        <p className="flex items-start gap-2">
          <MapPin className={cn('mt-0.5 size-3.5 shrink-0', isDark ? 'text-white/35' : 'text-muted-foreground/60')} />
          <span>
            {values.city && values.state ? `${values.city}, ${values.state}` : 'Site location will appear here'}
          </span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span
            className={cn(
              'rounded-md px-2 py-0.5 text-[11px]',
              isDark ? 'bg-white/10 text-white/75' : 'bg-muted text-foreground/80',
            )}
          >
            {getSourceLabel(values.source)}
          </span>
          {displayKw ? (
            <span
              className={cn(
                'rounded-md px-2 py-0.5 text-[11px]',
                isDark ? 'bg-amber-400/20 text-amber-100' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
              )}
            >
              ~{displayKw} kW
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SectionIntro({ step, index }: { step: (typeof LEAD_FORM_STEPS)[number]; index: number }) {
  const Icon = STEP_ICONS[step.id];
  return (
    <div className="mb-8 space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400">
        <span className="tabular-nums">0{index + 1}</span>
        <span className="size-1 rounded-full bg-amber-500/50" />
        <span>{step.title}</span>
      </div>
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/15 dark:text-amber-400">
          <Icon className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{step.title}</h2>
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted-foreground">{step.description}</p>
        </div>
      </div>
    </div>
  );
}

function OptionTile({
  selected,
  onClick,
  title,
  description,
  icon: Icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200',
        selected
          ? 'border-amber-500/50 bg-amber-500/6 shadow-[0_8px_30px_-12px_oklch(0.78_0.14_75/0.35)] ring-1 ring-amber-500/20'
          : 'border-border/50 bg-background hover:border-amber-500/25 hover:bg-muted/20',
      )}
    >
      {Icon ? (
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors',
            selected
              ? 'bg-amber-500 text-white'
              : 'bg-muted text-muted-foreground group-hover:bg-amber-500/10 group-hover:text-amber-600',
          )}
        >
          <Icon className="size-4" />
        </span>
      ) : null}
      <span>
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{description}</span>
      </span>
      {selected && (
        <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-amber-500 text-white">
          <Check className="size-3" />
        </span>
      )}
    </button>
  );
}

export function LeadForm() {
  const router = useRouter();
  const createLead = useMutation(api.modules.lead.createLead);
  const [stepIndex, setStepIndex] = useState(0);

  const form = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      source: 'manual',
      propertyType: 'residential',
      name: '',
      mobile: '',
      email: '',
      addressLine1: '',
      city: '',
      state: '',
      pincode: '',
      discomName: '',
      discomConsumerNo: '',
    },
    mode: 'onTouched',
  });

  const values = form.watch();
  const currentStep = LEAD_FORM_STEPS[stepIndex];
  const progressValue = ((stepIndex + 1) / LEAD_FORM_STEPS.length) * 100;
  const suggestedKw = useMemo(
    () => estimateCapacityKw(values.monthlyConsumptionKwh, values.electricityBillAmt),
    [values.monthlyConsumptionKwh, values.electricityBillAmt],
  );

  async function goToStep(nextIndex: number) {
    if (nextIndex < stepIndex) {
      setStepIndex(nextIndex);
      return;
    }
    const fields = STEP_FIELDS[currentStep.id];
    if (fields.length > 0) {
      const valid = await form.trigger(fields);
      if (!valid) return;
    }
    setStepIndex(nextIndex);
  }

  async function onSubmit(formValues: CreateLeadInput) {
    try {
      await createLead({
        source: formValues.source,
        propertyType: formValues.propertyType,
        name: formValues.name,
        mobile: formValues.mobile,
        email: formValues.email || undefined,
        addressLine1: formValues.addressLine1,
        city: formValues.city,
        state: formValues.state,
        pincode: formValues.pincode,
        electricityBillAmt: formValues.electricityBillAmt,
        monthlyConsumptionKwh: formValues.monthlyConsumptionKwh,
        rooftopType: formValues.rooftopType,
        expectedCapacityKw: formValues.expectedCapacityKw,
        discomName: formValues.discomName || undefined,
      });
      toast.success('Lead created successfully');
      router.push('/crm/leads');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to create lead');
    }
  }

  const isLastStep = stepIndex === LEAD_FORM_STEPS.length - 1;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="-mx-4 overflow-hidden rounded-none border-y border-border/50 md:-mx-6 lg:-mx-8 lg:rounded-2xl lg:border">
          <div className="grid min-h-[calc(100svh-8rem)] lg:grid-cols-[minmax(17rem,22rem)_1fr] xl:grid-cols-[minmax(19rem,24rem)_1fr]">
            {/* Left rail */}
            <aside className="relative flex flex-col bg-[linear-gradient(165deg,oklch(0.32_0.08_65)_0%,oklch(0.18_0.02_50)_48%,oklch(0.14_0.01_260)_100%)] px-5 py-6 text-white sm:px-6 lg:min-h-full lg:px-7 lg:py-8">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,oklch(0.78_0.14_75/0.28),transparent_42%),radial-gradient(circle_at_80%_100%,oklch(0.55_0.1_250/0.18),transparent_40%)]"
              />

              <div className="relative flex flex-1 flex-col">
                <Link
                  href="/crm/leads"
                  className="mb-6 inline-flex w-fit items-center gap-1.5 text-xs text-white/55 transition-colors hover:text-white"
                >
                  <ArrowLeft className="size-3.5" />
                  Back to leads
                </Link>

                <div className="mb-8 flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Badge className="border-0 bg-white/10 text-[11px] text-amber-100 hover:bg-white/10">
                      PM Surya Ghar
                    </Badge>
                    <h1 className="text-2xl font-semibold tracking-tight text-white">New lead intake</h1>
                    <p className="text-sm leading-relaxed text-white/55">
                      Four quick steps. Solar details are optional if the customer is still exploring.
                    </p>
                  </div>
                  <ProgressRing value={progressValue} />
                </div>

                <div className="hidden lg:block">
                  <StepTimeline currentStep={stepIndex} onStepClick={setStepIndex} />
                </div>

                {/* Mobile step pills */}
                <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
                  {LEAD_FORM_STEPS.map((step, index) => (
                    <span
                      key={step.id}
                      className={cn(
                        'shrink-0 rounded-full px-3 py-1 text-[11px] font-medium',
                        index === stepIndex
                          ? 'bg-amber-400 text-amber-950'
                          : index < stepIndex
                            ? 'bg-white/15 text-white/80'
                            : 'bg-white/5 text-white/40',
                      )}
                    >
                      {step.title}
                    </span>
                  ))}
                </div>

                <div className="mt-auto hidden pt-6 lg:block">
                  <LeadSnapshot values={values} />
                </div>
              </div>
            </aside>

            {/* Main panel */}
            <div className="flex min-h-0 flex-col bg-background">
              <div className="flex-1 overflow-y-auto overscroll-y-contain scroll-smooth px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
                <div
                  key={currentStep.id}
                  className="mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <SectionIntro step={currentStep} index={stepIndex} />

                  {currentStep.id === 'origin' && (
                    <div className="space-y-8">
                      <FormField
                        control={form.control}
                        name="source"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">How did they find you?</FormLabel>
                            <FormControl>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {SOURCE_OPTIONS.map((option) => (
                                  <OptionTile
                                    key={option.value}
                                    selected={field.value === option.value}
                                    onClick={() => field.onChange(option.value)}
                                    title={option.label}
                                    description={option.description}
                                    icon={option.icon}
                                  />
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="propertyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Property type</FormLabel>
                            <FormControl>
                              <div className="grid gap-3 sm:grid-cols-3">
                                {PROPERTY_OPTIONS.map((option) => (
                                  <OptionTile
                                    key={option.value}
                                    selected={field.value === option.value}
                                    onClick={() => field.onChange(option.value)}
                                    title={option.label}
                                    description={option.description}
                                  />
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {currentStep.id === 'contact' && (
                    <div className="space-y-8">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel>Full name</FormLabel>
                              <FormControl>
                                <Input
                                  className={fieldClass}
                                  placeholder="Rajesh Kumar"
                                  autoComplete="name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="mobile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground/60" />
                                  <Input
                                    className={cn(fieldClass, 'pl-10')}
                                    placeholder="9876543210"
                                    inputMode="numeric"
                                    maxLength={10}
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>10-digit Indian mobile</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground/60" />
                                  <Input
                                    className={cn(fieldClass, 'pl-10')}
                                    type="email"
                                    placeholder="optional@email.com"
                                    autoComplete="email"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="addressLine1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Installation address</FormLabel>
                            <FormControl>
                              <Textarea
                                className="min-h-24 resize-none rounded-xl border-border/60 bg-muted/25 px-3.5 py-3"
                                placeholder="House no., street, locality, landmark"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-5 sm:grid-cols-3">
                        {(['city', 'state', 'pincode'] as const).map((name) => (
                          <FormField
                            key={name}
                            control={form.control}
                            name={name}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="capitalize">{name === 'pincode' ? 'Pincode' : name}</FormLabel>
                                <FormControl>
                                  <Input
                                    className={fieldClass}
                                    placeholder={name === 'city' ? 'Jaipur' : name === 'state' ? 'Rajasthan' : '302001'}
                                    maxLength={name === 'pincode' ? 6 : undefined}
                                    inputMode={name === 'pincode' ? 'numeric' : undefined}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep.id === 'solar' && (
                    <div className="space-y-8">
                      <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
                        Optional step — skip if you only have contact details for now.
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="monthlyConsumptionKwh"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly usage (kWh)</FormLabel>
                              <FormControl>
                                <NumberInput placeholder="350" value={field.value} onChange={field.onChange} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="electricityBillAmt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monthly bill (₹)</FormLabel>
                              <FormControl>
                                <NumberInput placeholder="3500" value={field.value} onChange={field.onChange} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {suggestedKw && !values.expectedCapacityKw && (
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/25 bg-linear-to-r from-amber-500/8 to-transparent p-4">
                          <div className="flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
                              <Zap className="size-4" />
                            </span>
                            <div>
                              <p className="text-sm font-semibold">Recommended ~{suggestedKw} kW system</p>
                              <p className="text-xs text-muted-foreground">Based on bill / consumption</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-amber-500/30"
                            onClick={() => form.setValue('expectedCapacityKw', suggestedKw, { shouldDirty: true })}
                          >
                            Apply
                          </Button>
                        </div>
                      )}

                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="expectedCapacityKw"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>System size (kW)</FormLabel>
                              <FormControl>
                                <NumberInput placeholder="3" step="0.5" value={field.value} onChange={field.onChange} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="discomName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>DISCOM</FormLabel>
                              <FormControl>
                                <Input className={fieldClass} placeholder="JVVNL, MSEDCL…" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="rooftopType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rooftop type</FormLabel>
                            <FormControl>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {ROOFTOP_OPTIONS.map((option) => (
                                  <OptionTile
                                    key={option.value}
                                    selected={field.value === option.value}
                                    onClick={() => field.onChange(option.value)}
                                    title={option.label}
                                    description={option.description}
                                  />
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {currentStep.id === 'review' && (
                    <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/15">
                      <div className="border-b border-border/50 bg-background/80 px-5 py-4">
                        <p className="text-sm font-semibold">Ready to add to pipeline</p>
                        <p className="text-xs text-muted-foreground">Status will be set to New automatically</p>
                      </div>
                      <dl className="grid gap-4 p-5 sm:grid-cols-2">
                        <ReviewRow label="Customer" value={values.name} />
                        <ReviewRow label="Mobile" value={values.mobile} />
                        <ReviewRow label="Email" value={values.email || '—'} />
                        <ReviewRow label="Source" value={getSourceLabel(values.source)} />
                        <ReviewRow
                          label="Property"
                          value={values.propertyType ?? 'residential'}
                          className="capitalize"
                        />
                        <ReviewRow
                          label="System"
                          value={
                            values.expectedCapacityKw
                              ? `${values.expectedCapacityKw} kW`
                              : suggestedKw
                                ? `~${suggestedKw} kW suggested`
                                : '—'
                          }
                        />
                        <ReviewRow
                          label="Site"
                          value={
                            values.addressLine1
                              ? `${values.addressLine1}, ${values.city}, ${values.state} ${values.pincode}`
                              : '—'
                          }
                          className="sm:col-span-2"
                        />
                      </dl>
                    </div>
                  )}

                  {/* Mobile snapshot */}
                  <div className="mt-8 lg:hidden">
                    <LeadSnapshot values={values} variant="light" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-border/60 bg-background/95 px-5 py-4 backdrop-blur-sm sm:px-8 lg:px-10">
                <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-xl"
                    onClick={() => (stepIndex === 0 ? router.push('/crm/leads') : goToStep(stepIndex - 1))}
                  >
                    <ArrowLeft className="mr-1.5 size-4" />
                    {stepIndex === 0 ? 'Cancel' : 'Back'}
                  </Button>

                  <div className="flex items-center gap-2">
                    {currentStep.id === 'solar' && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-xl"
                        onClick={() => goToStep(stepIndex + 1)}
                      >
                        Skip
                      </Button>
                    )}
                    {isLastStep ? (
                      <Button type="submit" disabled={form.formState.isSubmitting} className="min-w-36 rounded-xl">
                        {form.formState.isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Creating…
                          </>
                        ) : (
                          <>
                            Create lead
                            <ChevronRight className="ml-1 size-4" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button type="button" onClick={() => goToStep(stepIndex + 1)} className="min-w-32 rounded-xl">
                        Continue
                        <ArrowRight className="ml-1.5 size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

function ReviewRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-background/70 px-3.5 py-3">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={cn('mt-1 text-sm font-medium text-foreground', className)}>{value}</dd>
    </div>
  );
}
