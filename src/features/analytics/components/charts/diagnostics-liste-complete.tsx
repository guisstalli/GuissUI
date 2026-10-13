import { useState } from 'react';

import { Button } from '@/components/ui/button';

type DiagnosticsListeCompleteProps = {
  diagnostics: Array<[string, number]>;
};

/** Liste complète des diagnostics CIM-11, affichée sur demande (C9, Pre R8). */
export const DiagnosticsListeComplete = ({
  diagnostics,
}: DiagnosticsListeCompleteProps) => {
  const [ouverte, setOuverte] = useState(false);

  return (
    <div className="mt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOuverte((v) => !v)}
        aria-expanded={ouverte}
      >
        {ouverte
          ? 'Masquer la liste complète'
          : `Voir les ${diagnostics.length} diagnostics`}
      </Button>
      {ouverte && (
        <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto pr-2 text-xs">
          {diagnostics.map(([nom, nombre]) => (
            <li key={nom} className="flex justify-between gap-2">
              <span>{nom}</span>
              <span className="font-medium">{nombre}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
