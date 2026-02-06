Parfait 👍
Ci-dessous **LE DOCUMENT EN PLAIN TEXT**, prêt à **copier-coller tel quel** (sans code fences), utilisable comme **source de vérité**, prompt IA ou documentation interne.

Aucun formatage Markdown spécial, aucun JSX, aucun TS — **texte brut**.

---

GUISS — DESIGN TOKENS INTERNES (APPLICATION COMPLÈTE)
SINGLE SOURCE OF TRUTH
Applies to: Medical UI, Consultations, Appointments, Agenda, Analytics, Admin

==================================================
PHILOSOPHIE GLOBALE
===================

* Application médicale professionnelle
* Interface sobre, lisible, non décorative
* Priorité à la lisibilité des données
* Hiérarchie visuelle claire
* Aucun effet marketing
* Light mode et Dark mode obligatoires
* Les composants consomment uniquement des TOKENS SÉMANTIQUES
* Jamais de couleurs “hardcodées” dans les composants

==================================================
COLOR TOKENS — LIGHT MODE
=========================

background: #f8fafc          (slate-50)
surface: #ffffff
surfaceMuted: #f1f5f9        (slate-100)
surfaceSubtle: #e2e8f0       (slate-200)

border: #e2e8f0
borderStrong: #cbd5e1

textPrimary: #0f172a         (slate-900)
textSecondary: #334155       (slate-700)
textMuted: #64748b           (slate-500)
textDisabled: #94a3b8

primary: #0ea5e9              (sky-500)
primaryHover: #0284c7         (sky-600)
primarySubtle: #e0f2fe        (sky-100)

success: #16a34a
successSubtle: #dcfce7

warning: #d97706
warningSubtle: #fef3c7

danger: #dc2626
dangerSubtle: #fee2e2

info: #0284c7
infoSubtle: #e0f2fe

==================================================
COLOR TOKENS — DARK MODE
========================

background: #020617          (slate-950)
surface: #020617
surfaceMuted: #020617
surfaceSubtle: #020617

border: #1e293b              (slate-800)
borderStrong: #334155

textPrimary: #f8fafc
textSecondary: #cbd5e1
textMuted: #94a3b8
textDisabled: #64748b

primary: #38bdf8              (sky-400)
primaryHover: #7dd3fc
primarySubtle: #0c4a6e

success: #22c55e
successSubtle: #14532d

warning: #f59e0b
warningSubtle: #78350f

danger: #ef4444
dangerSubtle: #7f1d1d

info: #38bdf8
infoSubtle: #075985

==================================================
TYPOGRAPHY TOKENS
=================

Font family:
Inter, system-ui, sans-serif

Font sizes:
pageTitle: text-xl        (titres d’écrans)
sectionTitle: text-base   (sections)
body: text-sm             (contenu principal)
table: text-sm            (tableaux)
label: text-sm
caption: text-xs          (métadonnées, aides)

Font weights:
regular: font-normal
medium: font-medium
semibold: font-semibold

Line height:
normal
relaxed

RÈGLES:

* Une seule police
* Hiérarchie par taille et poids uniquement
* Pas d’italique décoratif
* Pas de capitales longues

==================================================
SPACING & LAYOUT TOKENS
=======================

pagePadding: p-6
pagePaddingCompact: p-4

sectionGap: space-y-6
subsectionGap: space-y-4

cardPadding: p-4
formGap: space-y-3

tableCell: px-3 py-2
tableHeader: px-3 py-2

modalPadding: p-6

LAYOUT RULES:

* Écrans médicaux : verticaux, respirants
* Tables préférées aux cards pour données
* Maximum 3 niveaux visuels
* Largeur utile max: 1200–1400px
* Formulaires toujours verticaux

==================================================
FORM COMPONENT TOKENS
=====================

Input:

* fond surface
* border border
* texte textPrimary
* placeholder textMuted
* focus ring primary

Label:

* text-sm
* font-medium
* textSecondary

Helper text:

* text-xs
* textMuted

Error text:

* text-xs
* danger

==================================================
TABLE TOKENS
============

Table wrapper:

* border
* rounded
* overflow hidden

Header:

* surfaceMuted
* textSecondary
* text-sm

Row:

* hover surfaceMuted léger

Cell:

* text-sm
* textPrimary

==================================================
BADGE TOKENS (STATUS)
=====================

default: surfaceMuted + textSecondary
success: successSubtle + success
warning: warningSubtle + warning
danger: dangerSubtle + danger
info: infoSubtle + info

==================================================
ALERT TOKENS
============

Base:

* border
* rounded
* padding
* text-sm

Success:

* border success
* background successSubtle
* text success

Warning:

* border warning
* background warningSubtle
* text warning

Danger:

* border danger
* background dangerSubtle
* text danger

Info:

* border info
* background infoSubtle
* text info

==================================================
USAGE RULES — MEDICAL VS ADMIN
==============================

Medical / Exams:

* primary
* info
* warning
* danger uniquement pour alertes réelles

Consultations:

* primary
* success

Agenda:

* primary
* surfaceMuted

Analytics:

* info uniquement
* jamais de couleur décorative

Admin:

* gris, texte, bordures
* danger pour actions sensibles
* jamais primarySubtle décoratif

==================================================
ACCESSIBILITY RULES (NON NÉGOCIABLE)
====================================

* Contraste WCAG AA minimum
* Focus visible sur tous les éléments
* Pas de couleur seule pour signifier un état
* Taille minimum du texte: text-sm
* Labels toujours visibles

==================================================
FINAL RULES
===========

DO NOT:

* Utiliser des couleurs brutes
* Ajouter des animations décoratives
* Mélanger admin et médical visuellement
* Surcharger les écrans

ALWAYS:

* Consommer les tokens sémantiques
* Favoriser lisibilité > esthétique
* Respecter le contexte médical
* Séparer clairement les responsabilités UI

---

Si tu veux, je peux maintenant :

* 🔹 transformer ça en `tailwind.config.ts`
* 🔹 générer un **prompt IA unique global** basé sur ces tokens
* 🔹 décliner une version **Figma Tokens**
* 🔹 créer un **design system shadcn médical + admin**

Dis-moi la suite.
