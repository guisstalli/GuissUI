import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  useAttachments,
  useDeleteAttachment,
  useUploadAttachment,
} from '@/features/exams/api/attachments';

import { ExamAttachmentsSection } from '../exam-attachments-section';

vi.mock('@/features/exams/api/attachments', () => ({
  useAttachments: vi.fn(),
  useUploadAttachment: vi.fn(),
  useDeleteAttachment: vi.fn(),
  downloadAttachment: vi.fn(),
}));

const mockedUseAttachments = vi.mocked(useAttachments);
const mockedUseUpload = vi.mocked(useUploadAttachment);
const mockedUseDelete = vi.mocked(useDeleteAttachment);

const uploadMutate = vi.fn();

function setAttachments(data: unknown[]) {
  mockedUseAttachments.mockReturnValue({
    data,
    isLoading: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useAttachments>);
}

beforeEach(() => {
  vi.clearAllMocks();
  setAttachments([]);
  mockedUseUpload.mockReturnValue({
    mutate: uploadMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUploadAttachment>);
  mockedUseDelete.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useDeleteAttachment>);
});

describe('ExamAttachmentsSection', () => {
  test('shows a warning and no upload form when there is no clinical exam id', () => {
    render(<ExamAttachmentsSection clinicalExamId={null} />);

    expect(
      screen.getByText(/enregistrez d'abord les données cliniques/i),
    ).toBeInTheDocument();
    // The upload form (and its submit button) only renders with a clinical exam id
    expect(
      screen.queryByRole('button', { name: /uploader/i }),
    ).not.toBeInTheDocument();
  });

  test('shows the upload form and empty state when a clinical exam id is set', () => {
    render(<ExamAttachmentsSection clinicalExamId={5} />);

    expect(screen.getByText(/ajouter des fichiers/i)).toBeInTheDocument();
    expect(
      screen.getByText(/aucun fichier joint pour le moment/i),
    ).toBeInTheDocument();
  });

  test('renders an existing attachment', () => {
    setAttachments([
      {
        id: 1,
        original_filename: 'fond-oeil-od.pdf',
        file_size: 2048,
        description: 'Fond d’œil OD',
        is_image: false,
        is_pdf: true,
        file_url: null,
      },
    ]);

    render(<ExamAttachmentsSection clinicalExamId={5} />);

    expect(screen.getByText('fond-oeil-od.pdf')).toBeInTheDocument();
  });

  test('uploads the selected file with its description on submit', async () => {
    const user = userEvent.setup();
    render(<ExamAttachmentsSection clinicalExamId={5} />);

    const file = new File(['x'], 'oct.png', { type: 'image/png' });
    await user.upload(
      screen.getByLabelText(/sélectionner des fichiers/i),
      file,
    );
    await user.type(
      screen.getByLabelText(/titre du document/i),
      'Résultat OCT',
    );
    await user.click(screen.getByRole('button', { name: /uploader/i }));

    expect(uploadMutate).toHaveBeenCalledTimes(1);
    expect(uploadMutate.mock.calls[0][0]).toMatchObject({
      clinicalExamId: 5,
      file,
      description: 'Résultat OCT',
    });
  });
});
