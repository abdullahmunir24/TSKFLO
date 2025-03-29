import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TextInputField from '../../../components/common/TextInputField';

describe('TextInputField Component', () => {
  test('renders with label and input', () => {
    render(
      <TextInputField
        id="test-input"
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
      <TextInputField
        id="test-input"
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
      <TextInputField
        id="test-input"
        name="test"
        label="Test Label"
        value=""
        onChange={() => {}}
        error={errorMessage}
      />
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('calls onChange handler when input value changes', () => {
    const handleChange = vi.fn();
    render(
      <TextInputField
        id="test-input"
        name="test"
        label="Test Label"
        value=""
        onChange={handleChange}
      />
    );
    
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('shows character count when showCharCount and maxLength are provided', () => {
    render(
      <TextInputField
        id="test-input"
        name="test"
        label="Test Label"
        value="Hello"
        onChange={() => {}}
        maxLength={100}
        showCharCount={true}
      />
    );
    
    expect(screen.getByText('5/100')).toBeInTheDocument();
  });

  test('applies different color to character count based on usage percentage', () => {
    const { rerender } = render(
      <TextInputField
        id="test-input"
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
      <TextInputField
        id="test-input"
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
      <TextInputField
        id="test-input"
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
});