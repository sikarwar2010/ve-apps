'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/convex/_generated/api';
import { getRoleLabel } from '@/lib/permissions';
import { useQuery } from 'convex/react';

export function SettingsView() {
  const company = useQuery(api.modules.settings.getCompany, {});
  const branches = useQuery(api.modules.settings.listBranches, {});
  const users = useQuery(api.modules.settings.listUsers, {});
  const warehouses = useQuery(api.modules.inventory.listWarehouses, {});

  if (company === undefined || branches === undefined || users === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Company profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {company ? (
            <>
              <p className="font-semibold">{company.name}</p>
              <p className="text-muted-foreground">{company.legalName}</p>
              <p>GSTIN: {company.gstin}</p>
              <p>
                {company.city}, {company.state} {company.pincode}
              </p>
              <p>
                {company.email} · {company.phone}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">Organization setup runs on first login.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Branches ({branches.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {branches.map((b) => (
            <div key={b._id} className="rounded-lg border border-border/50 px-3 py-2 text-sm">
              <p className="font-medium">{b.name}</p>
              <p className="text-xs text-muted-foreground">
                {b.code} · {b.city}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Warehouses ({warehouses?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {warehouses?.map((w) => (
            <div key={w._id} className="rounded-lg border border-border/50 px-3 py-2 text-sm">
              <p className="font-medium">{w.name}</p>
              <p className="text-xs text-muted-foreground">
                {w.code} · {w.city}
              </p>
            </div>
          )) ?? null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.map((u) => (
            <div
              key={u._id}
              className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <span className="text-xs text-muted-foreground">{getRoleLabel(u.role)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
