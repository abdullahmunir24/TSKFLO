import socketReducer, { setConnected } from '../../../features/socket/socketSlice';

describe('Socket Slice', () => {
  test('should return the initial state when passed an empty action', () => {
    const initialState = { connected: false };
    const action = { type: '' };
    const result = socketReducer(undefined, action);
    
    expect(result).toEqual(initialState);
  });
  
  test('should handle setConnected action', () => {
    const initialState = { connected: false };
    const action = setConnected(true);
    const result = socketReducer(initialState, action);
    
    expect(result.connected).toBe(true);
  });
  
  test('should handle toggling connection state', () => {
    // Starting with connected: true
    const connectedState = { connected: true };
    const disconnectAction = setConnected(false);
    const disconnectedResult = socketReducer(connectedState, disconnectAction);
    
    expect(disconnectedResult.connected).toBe(false);
    
    // Toggle back to connected: true
    const reconnectAction = setConnected(true);
    const reconnectedResult = socketReducer(disconnectedResult, reconnectAction);
    
    expect(reconnectedResult.connected).toBe(true);
  });
});