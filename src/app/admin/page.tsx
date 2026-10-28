import React from 'react';
import type { Metadata } from 'next';
import { AdminPortal } from '@/components/admin/AdminPortal';

export const metadata: Metadata = {
  title: 'AUVARE — Admin & Store Manager Portal',
  description: 'Manage garment catalog drops, sizes, variants, pricing, and process real-time customer orders.',
};

export default function AdminPage() {
  return <AdminPortal />;
}
