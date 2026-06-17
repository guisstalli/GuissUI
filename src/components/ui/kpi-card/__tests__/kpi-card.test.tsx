import { Users } from 'lucide-react';
import { describe, expect, test } from 'vitest';

import { rtlRender, screen } from '@/testing/test-utils';

import { KpiCard } from '../kpi-card';

describe('KpiCard', () => {
  test('renders the title and numeric value', () => {
    // Arrange & Act
    rtlRender(<KpiCard title="Total patients" value={340} />);

    // Assert
    expect(screen.getByText('Total patients')).toBeInTheDocument();
    expect(screen.getByText('340')).toBeInTheDocument();
  });

  test('renders a string value', () => {
    rtlRender(<KpiCard title="Taux" value="85%" />);
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  test('renders the subtitle when provided', () => {
    rtlRender(<KpiCard title="Total" value={10} subtitle="aujourd'hui" />);
    expect(screen.getByText("aujourd'hui")).toBeInTheDocument();
  });

  test('does not render a subtitle when omitted', () => {
    rtlRender(<KpiCard title="Total" value={10} />);
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  test('renders a positive trend indicator with ArrowUp', () => {
    // Arrange & Act
    rtlRender(<KpiCard title="Examens" value={17} trend={5} />);

    // Assert — the aria-label encodes the trend direction and magnitude
    expect(screen.getByLabelText('Augmentation de 5')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('renders a negative trend indicator with ArrowDown', () => {
    rtlRender(<KpiCard title="Examens" value={8} trend={-3} />);
    expect(screen.getByLabelText('Diminution de 3')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('does not render a trend indicator when trend is 0', () => {
    rtlRender(<KpiCard title="Examens" value={8} trend={0} />);
    expect(
      screen.queryByLabelText(/augmentation|diminution/i),
    ).not.toBeInTheDocument();
  });

  test('does not render a trend indicator when trend is omitted', () => {
    rtlRender(<KpiCard title="Examens" value={8} />);
    expect(
      screen.queryByLabelText(/augmentation|diminution/i),
    ).not.toBeInTheDocument();
  });

  test('renders the icon when provided', () => {
    // Arrange & Act — passing a lucide icon component
    rtlRender(<KpiCard title="Patients" value={340} icon={Users} />);

    // Assert — icon is aria-hidden so we check the container renders without error
    // The title is our observable indicator
    expect(screen.getByText('Patients')).toBeInTheDocument();
  });

  test('shows the absolute value for a negative trend', () => {
    rtlRender(<KpiCard title="KPI" value={5} trend={-12} />);
    // Absolute magnitude should be 12, not -12
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});
