'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

import { InsightsTable } from './insights-table';
import { ProposalsTable } from './proposals-table';

type TabId = 'proposals' | 'rules';

const TABS: { id: TabId; label: string }[] = [
  { id: 'proposals', label: 'Propositions à examiner' },
  { id: 'rules', label: 'Règles en vigueur' },
];

/**
 * Panneau principal de revue des insights IA.
 *
 * Deux vues :
 * - Propositions : actions apply / reject / quarantine / retract
 * - Règles vivantes : état courant, reaffirmations
 */
export function AiInsightsPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('proposals');

  return (
    <div className="space-y-6">
      {/* Navigation par onglets */}
      <div
        className="inline-flex overflow-hidden rounded-md border border-input"
        role="tablist"
        aria-label="Vues des insights IA"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 text-sm transition-colors',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-transparent text-muted-foreground hover:bg-muted',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu de l'onglet actif */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === 'proposals' ? <ProposalsTable /> : <InsightsTable />}
      </div>
    </div>
  );
}
