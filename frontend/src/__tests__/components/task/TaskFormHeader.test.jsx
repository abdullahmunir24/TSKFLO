import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import TaskFormHeader from '../../../components/task/TaskFormHeader';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe('TaskFormHeader Component', () => {
  const mockNavigate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });
  
  test('renders title and description correctly', () => {
    render(
      <TaskFormHeader 
        title="Test Task Title" 
        description="Test task description" 
      />
    );
    
    expect(screen.getByText('Test Task Title')).toBeInTheDocument();
    expect(screen.getByText('Test task description')).toBeInTheDocument();
  });
  
  test('shows back button and navigates when clicked', () => {
    render(<TaskFormHeader />);
    
    const backButton = screen.getByText(/Back to Dashboard/i);
    expect(backButton).toBeInTheDocument();
    
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/admindashboard');
  });
  
  test('calls onBack prop when provided instead of navigating', () => {
    const mockOnBack = vi.fn();
    render(<TaskFormHeader onBack={mockOnBack} />);
    
    const backButton = screen.getByText(/Back to Dashboard/i);
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  test('does not render header when isModal is true', () => {
    render(<TaskFormHeader isModal={true} />);
    
    expect(screen.queryByText(/Back to Dashboard/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
  });
  
  test('renders tips section when showTips is true', () => {
    render(<TaskFormHeader showTips={true} />);
    
    expect(screen.getByText('Tips for Effective Tasks')).toBeInTheDocument();
    expect(screen.getByText('• Use clear, action-oriented titles')).toBeInTheDocument();
    expect(screen.getByText('• Set realistic due dates')).toBeInTheDocument();
    expect(screen.getByText('• Add sufficient details in the description')).toBeInTheDocument();
    expect(screen.getByText('• Assign to relevant team members')).toBeInTheDocument();
  });
  
  test('does not render tips section when showTips is false', () => {
    render(<TaskFormHeader showTips={false} />);
    
    expect(screen.queryByText('Tips for Effective Tasks')).not.toBeInTheDocument();
  });
  
  test('uses default title and description when not provided', () => {
    render(<TaskFormHeader />);
    
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByText('Fill in the details below to create a new task')).toBeInTheDocument();
  });
});