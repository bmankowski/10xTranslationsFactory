import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import ChatInterface from '@/components/exercise-chat/ChatInterface';
import type { ChatMessageVM } from '@/components/exercise-chat/viewModels';
import type { QuestionDTO } from '@/types';

describe('ChatInterface User Interactions', () => {
  const mockQuestion: QuestionDTO = {
    id: 'q1',
    text_id: 'text1',
    content: 'Introduce yourself in English.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  const defaultProps = {
    messages: [] as ChatMessageVM[],
    currentQuestion: mockQuestion,
    onAnswerSubmit: vi.fn(),
    isLoadingSubmission: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits answer when user enters text and clicks send', async () => {
    // Arrange
    const user = userEvent.setup();
    const onAnswerSubmit = vi.fn();
    
    render(
      <ChatInterface 
        {...defaultProps}
        onAnswerSubmit={onAnswerSubmit}
      />
    );

    // Act
    const input = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Hello, my name is John');
    await user.click(submitButton);

    // Assert
    expect(onAnswerSubmit).toHaveBeenCalledWith(
      'Hello, my name is John',
      mockQuestion.id
    );
  });

  it('clears input after submission', async () => {
    // Arrange
    const user = userEvent.setup();
    
    render(<ChatInterface {...defaultProps} />);

    // Act
    const input = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Test message');
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('handles empty input validation', async () => {
    // Arrange
    const user = userEvent.setup();
    const onAnswerSubmit = vi.fn();
    
    render(
      <ChatInterface 
        {...defaultProps}
        onAnswerSubmit={onAnswerSubmit}
      />
    );

    // Act
    const submitButton = screen.getByRole('button', { name: /send/i });
    await user.click(submitButton);

    // Assert
    expect(onAnswerSubmit).not.toHaveBeenCalled();
    expect(submitButton).toBeDisabled();
  });

  it('disables submit button during loading state', () => {
    // Arrange
    render(
      <ChatInterface 
        {...defaultProps}
        isLoadingSubmission={true}
      />
    );

    // Assert
    const submitButton = screen.getByRole('button', { name: /send/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when input has text', async () => {
    // Arrange
    const user = userEvent.setup();
    
    render(<ChatInterface {...defaultProps} />);

    // Act
    const input = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Test');

    // Assert
    expect(submitButton).toBeEnabled();
  });
}); 