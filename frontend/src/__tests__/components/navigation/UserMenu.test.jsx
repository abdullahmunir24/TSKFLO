import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logOut } from '../../../features/auth/authSlice';
import { useLogoutMutation } from '../../../features/auth/authApiSlice';
import UserMenu from '../../../components/navigation/UserMenu';

// Mock the dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

vi.mock('react-redux', () => ({
  useDispatch: vi.fn()
}));

vi.mock('../../../features/auth/authSlice', () => ({
  logOut: vi.fn()
}));

vi.mock('../../../features/auth/authApiSlice', () => ({
  useLogoutMutation: vi.fn()
}));

// Mock UserProfilePopup since we'll test it separately
vi.mock('../../../components/UserProfilePopup', () => ({
  default: ({ onClose }) => (
    <div data-testid="mock-profile-popup">
      <button onClick={onClose} data-testid="close-popup-button">Close</button>
    </div>
  )
}));

describe('UserMenu Component', () => {
  const mockNavigate = vi.fn();
  const mockDispatch = vi.fn();
  const mockLogout = vi.fn().mockResolvedValue({});
  
  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useDispatch.mockReturnValue(mockDispatch);
    useLogoutMutation.mockReturnValue([
      mockLogout,
      { isLoading: false }
    ]);
  });

  test('renders user name correctly', () => {
    render(
      <BrowserRouter>
        <UserMenu 
          userName="John Doe" 
          userData={null} 
          isUserLoading={false} 
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
  
  test('displays userData.name when available', () => {
    render(
      <BrowserRouter>
        <UserMenu 
          userName="John Doe" 
          userData={{ name: 'Jane Smith' }} 
          isUserLoading={false} 
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });
  
  test('displays "Loading..." when isUserLoading is true', () => {
    render(
      <BrowserRouter>
        <UserMenu 
          userName="John Doe" 
          userData={null} 
          isUserLoading={true} 
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  test('toggles profile popup when user icon is clicked', async () => {
    render(
      <BrowserRouter>
        <UserMenu 
          userName="John Doe" 
          userData={null} 
          isUserLoading={false} 
        />
      </BrowserRouter>
    );
    
    // Initially, popup should not be visible
    expect(screen.queryByTestId('mock-profile-popup')).not.toBeInTheDocument();
    
    // Click on user profile button
    fireEvent.click(screen.getByText('John Doe'));
    
    // Popup should be visible now
    expect(screen.getByTestId('mock-profile-popup')).toBeInTheDocument();
    
    // Click the close button in the popup
    fireEvent.click(screen.getByTestId('close-popup-button'));
    
    // Popup should be closed now
    expect(screen.queryByTestId('mock-profile-popup')).not.toBeInTheDocument();
  });
  
  test('handles logout correctly when successful', async () => {
    render(
      <BrowserRouter>
        <UserMenu 
          userName="John Doe" 
          userData={null} 
          isUserLoading={false} 
        />
      </BrowserRouter>
    );
    
    // Click logout button
    fireEvent.click(screen.getByText('Logout'));
    
    // Verify dispatch was called with logout action
    expect(mockDispatch).toHaveBeenCalledWith(logOut());
    
    // Verify logout API was called
    expect(mockLogout).toHaveBeenCalled();
    
    // Verify navigation to login page
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });
  
  test('handles logout correctly when API call fails', async () => {
    // Mock API failure
    mockLogout.mockRejectedValueOnce(new Error('Logout failed'));
    
    render(
      <BrowserRouter>
        <UserMenu 
          userName="John Doe" 
          userData={null} 
          isUserLoading={false} 
        />
      </BrowserRouter>
    );
    
    // Spy on console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Click logout button
    fireEvent.click(screen.getByText('Logout'));
    
    // Wait for promise to resolve
    await vi.waitFor(() => {
      // Verify the error was logged
      expect(consoleSpy).toHaveBeenCalled();
      
      // Verify we still dispatch logout and navigate even if API fails
      expect(mockDispatch).toHaveBeenCalledWith(logOut());
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
    
    // Restore console
    consoleSpy.mockRestore();
  });
});