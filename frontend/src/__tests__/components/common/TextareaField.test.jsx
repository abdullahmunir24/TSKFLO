import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TextareaField from '../../../components/common/TextareaField';

describe('TextareaField Component', () => {
  test('renders with label and textarea', () => {
    render(
      <TextareaField
        id="test-textarea"
        name="test"
        label="Test Label"
        value=""
        onChange={() => {}}
      />
    );
    
    expect(screen.getByLabelText(/Test Label/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('shows required asterisk when required is true', () => {
    render(
      <TextareaField
        id="test-textarea"
        name="test"
        label="Test Label"
        value=""
        onChange={() => {}}
        required={true}
      />
    );
    
    const label = screen.getByText('Test Label');
    expect(label.parentElement).toHaveTextContent('*');
  });

  test('displays error message when error is provided', () => {
    const errorMessage = 'This field is required';
    render(
      <TextareaField
        id="test-textarea"
        name="test"
        label="Test Label"
        value=""
        onChange={() => {}}
        error={errorMessage}
      />
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('calls onChange handler when textarea value changes', () => {
    const handleChange = vi.fn();
    render(
      <TextareaField
        id="test-textarea"
        name="test"
        label="Test Label"
        value=""
        onChange={handleChange}
      />
    );
    
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New text content' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('shows character count when maxLength is provided', () => {
    render(
      <TextareaField
        id="test-textarea"
        name="test"
        label="Test Label"
        value="Hello world"
        onChange={() => {}}
        maxLength={100}
        showCharCount={true}
      />
    );
    
    expect(screen.getByText('11/100')).toBeInTheDocument();
  });

  test('does not show character count when showCharCount is false', () => {
    render(
      <TextareaField
        id="test-textarea"
        name="test"
        label="Test Label"
        value="Hello world"
        onChange={() => {}}
        maxLength={100}
        showCharCount={false}
      />
    );
    
    expect(screen.queryByText('11/100')).not.toBeInTheDocument();
  });

  test('applies different color to character count based on usage percentage', () => {
    const { rerender } = render(
      <TextareaField
        id="test-textarea"
        name="test"
        label="Test Label"
        value={'a'.repeat(5)}
        onChange={() => {}}
        maxLength={100}
        showCharCount={true}
      />
    );
    
    let charCount = screen.getByText('5/100');
    expect(charCount).toHaveClass('text-success-600');
    
    // Test for warning color (70-90%)
    rerender(
      <TextareaField
        id="test-textarea"
        name="test"
        label="Test Label"
        value={'a'.repeat(75)}
        onChange={() => {}}
        maxLength={100}
        showCharCount={true}
      />
    );
    
    charCount = screen.getByText('75/100');
    expect(charCount).toHaveClass('text-warning-600');
    
    // Test for danger color (>90%)
    rerender(
      <TextareaField
        id="test-textarea"
        name="test"
        label="Test Label"
        value={'a'.repeat(95)}
        onChange={() => {}}
        maxLength={100}
        showCharCount={true}
      />
    );
    
    charCount = screen.getByText('95/100');
    expect(charCount).toHaveClass('text-danger-600');
  });

  test('uses the specified number of rows', () => {
    render(
      <TextareaField
        id="test-textarea"
        name="test"
        label="Test Label"
        value=""
        onChange={() => {}}
        rows={8}
      />
    );
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '8');
  });

  test('applies error styling when error is provided', () => {
    render(
      <TextareaField
        id="test-textarea"
        name="test"
        label="Test Label"
        value=""
        onChange={() => {}}
        error="Error message"
      />
    );
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('border-danger-300');
    expect(textarea).not.toHaveClass('border-secondary-300');
  });
});