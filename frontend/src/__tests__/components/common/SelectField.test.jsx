import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SelectField from '../../../components/common/SelectField';

describe('SelectField Component', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  test('renders with label and select dropdown', () => {
    render(
      <SelectField
        id="test-select"
        name="test"
        label="Test Select"
        value="option1"
        onChange={() => {}}
        options={mockOptions}
      />
    );
    
    expect(screen.getByLabelText(/Test Select/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('shows required asterisk when required is true', () => {
    render(
      <SelectField
        id="test-select"
        name="test"
        label="Test Select"
        value="option1"
        onChange={() => {}}
        options={mockOptions}
        required={true}
      />
    );
    
    const label = screen.getByText('Test Select');
    expect(label.parentElement).toHaveTextContent('*');
  });

  test('displays all provided options', () => {
    render(
      <SelectField
        id="test-select"
        name="test"
        label="Test Select"
        value="option1"
        onChange={() => {}}
        options={mockOptions}
      />
    );
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement.children.length).toBe(mockOptions.length);
    
    // Check all option texts
    mockOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  test('calls onChange handler when selection changes', () => {
    const handleChange = vi.fn();
    render(
      <SelectField
        id="test-select"
        name="test"
        label="Test Select"
        value="option1"
        onChange={handleChange}
        options={mockOptions}
      />
    );
    
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'option2' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('displays error message when error is provided', () => {
    const errorMessage = 'Please select an option';
    render(
      <SelectField
        id="test-select"
        name="test"
        label="Test Select"
        value=""
        onChange={() => {}}
        options={mockOptions}
        error={errorMessage}
      />
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('applies error styling when error is provided', () => {
    render(
      <SelectField
        id="test-select"
        name="test"
        label="Test Select"
        value="option1"
        onChange={() => {}}
        options={mockOptions}
        error="Error message"
      />
    );
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveClass('border-danger-300');
    expect(selectElement).not.toHaveClass('border-secondary-300');
  });
});