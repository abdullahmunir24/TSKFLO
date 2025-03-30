import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AssigneeSelector from '../../../components/task/AssigneeSelector';

describe('AssigneeSelector Component', () => {
  const mockUsers = [
    { _id: '1', name: 'John Doe', email: 'john@example.com' },
    { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { _id: '3', name: 'Bob Johnson', email: 'bob@example.com' }
  ];
  
  const mockSearchResults = [
    { _id: '4', name: 'Alice Williams', email: 'alice@example.com' },
    { _id: '5', name: 'Charlie Brown', email: 'charlie@example.com' }
  ];
  
  test('renders empty state correctly', () => {
    render(
      <AssigneeSelector 
        assignees={[]}
        onAssigneeAdd={() => {}}
        onAssigneeRemove={() => {}}
        searchResults={[]}
        isSearching={false}
        onSearchQueryChange={() => {}}
      />
    );
    
    expect(screen.getByText('Assign To')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search for users to assign...')).toBeInTheDocument();
  });
  
  test('renders assigned users correctly', () => {
    render(
      <AssigneeSelector 
        assignees={mockUsers}
        onAssigneeAdd={() => {}}
        onAssigneeRemove={() => {}}
        searchResults={[]}
        isSearching={false}
        onSearchQueryChange={() => {}}
      />
    );
    
    // Check if all assigned users are displayed
    mockUsers.forEach(user => {
      expect(screen.getByText(user.name)).toBeInTheDocument();
    });
  });
  
  test('calls onAssigneeRemove when remove button is clicked', () => {
    const mockRemove = vi.fn();
    render(
      <AssigneeSelector 
        assignees={mockUsers}
        onAssigneeAdd={() => {}}
        onAssigneeRemove={mockRemove}
        searchResults={[]}
        isSearching={false}
        onSearchQueryChange={() => {}}
      />
    );
    
    // Find the first user's remove button and click it
    const removeButtons = screen.getAllByRole('button');
    const firstRemoveButton = removeButtons.find(
      button => button.parentElement.textContent.includes(mockUsers[0].name)
    );
    
    fireEvent.click(firstRemoveButton);
    expect(mockRemove).toHaveBeenCalledWith(mockUsers[0]._id);
  });
  
  test('updates search input and calls onSearchQueryChange', async () => {
    vi.useFakeTimers();
    const mockSearchChange = vi.fn();
    
    render(
      <AssigneeSelector 
        assignees={[]}
        onAssigneeAdd={() => {}}
        onAssigneeRemove={() => {}}
        searchResults={[]}
        isSearching={false}
        onSearchQueryChange={mockSearchChange}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search for users to assign...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Fast-forward timers to trigger the debounced search
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    
    expect(mockSearchChange).toHaveBeenCalledWith('test');
    vi.useRealTimers();
  });
  
  test('shows dropdown with search results when searching', () => {
    render(
      <AssigneeSelector 
        assignees={[]}
        onAssigneeAdd={() => {}}
        onAssigneeRemove={() => {}}
        searchResults={mockSearchResults}
        isSearching={false}
        onSearchQueryChange={() => {}}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search for users to assign...');
    fireEvent.change(searchInput, { target: { value: 'alice' } });
    
    // Each search result should be visible
    mockSearchResults.forEach(user => {
      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
    });
  });
  
  test('shows loading state when searching', () => {
    render(
      <AssigneeSelector 
        assignees={[]}
        onAssigneeAdd={() => {}}
        onAssigneeRemove={() => {}}
        searchResults={[]}
        isSearching={true}
        onSearchQueryChange={() => {}}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search for users to assign...');
    fireEvent.change(searchInput, { target: { value: 'alice' } });
    
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });
  
  test('calls onAssigneeAdd when a search result is clicked', () => {
    const mockAdd = vi.fn();
    render(
      <AssigneeSelector 
        assignees={[]}
        onAssigneeAdd={mockAdd}
        onAssigneeRemove={() => {}}
        searchResults={mockSearchResults}
        isSearching={false}
        onSearchQueryChange={() => {}}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search for users to assign...');
    fireEvent.change(searchInput, { target: { value: 'alice' } });
    
    // Click on the first search result
    fireEvent.click(screen.getByText(mockSearchResults[0].name));
    
    expect(mockAdd).toHaveBeenCalledWith(mockSearchResults[0]);
    // Input should be cleared after selection
    expect(searchInput.value).toBe('');
  });
  
  test('does not show "No users found" when there are results', () => {
    render(
      <AssigneeSelector 
        assignees={[]}
        onAssigneeAdd={() => {}}
        onAssigneeRemove={() => {}}
        searchResults={mockSearchResults}
        isSearching={false}
        onSearchQueryChange={() => {}}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search for users to assign...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    expect(screen.queryByText('No users found')).not.toBeInTheDocument();
  });
  
  test('shows "No users found" when search returns empty results with valid query', () => {
    render(
      <AssigneeSelector 
        assignees={[]}
        onAssigneeAdd={() => {}}
        onAssigneeRemove={() => {}}
        searchResults={[]}
        isSearching={false}
        onSearchQueryChange={() => {}}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search for users to assign...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });
});