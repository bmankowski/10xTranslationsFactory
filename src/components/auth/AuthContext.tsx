// Import necessary React hooks and Supabase client
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../db/supabase';
import type { Session, User } from '@supabase/supabase-js';

// Define the shape of our authentication context
type AuthContextType = {
	user: User | null;          // Current authenticated user or null
	session: Session | null;    // Current auth session or null
	loading: boolean;           // Whether auth state is being initialized
	// Authentication methods that components can use:
	login: (email: string, password: string) => Promise<{ error: Error | null }>;
	register: (email: string, password: string) => Promise<{ error: Error | null }>;
	loginWithGoogle: () => Promise<{ error: Error | null }>;
	logout: () => Promise<void>;
	resetPassword: (email: string) => Promise<{ error: Error | null }>;
	updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
};

// Create the context with initial null value (will be populated by AuthProvider)
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component that wraps the application
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	// State for storing user, session, and loading status
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true); // Start in loading state

	// Effect hook for initial auth setup and subscription
	useEffect(() => {
		// Async function to fetch the current session
		const fetchSession = async () => {
			// Get the current session from Supabase
			const { data: { session } } = await supabase.auth.getSession();
			setSession(session);         // Update session state
			setUser(session?.user || null); // Update user state (null if no session)
			setLoading(false);           // Mark initialization as complete
		};

		// Call the session fetcher
		fetchSession();

		// Set up real-time auth state listener
		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			// Callback fires on all auth changes (login, logout, token refresh, etc.)
			(_event, session) => {
				setSession(session);       // Update session on change
				setUser(session?.user || null); // Update user on change
			}
		);

		// Cleanup function to unsubscribe when component unmounts
		return () => subscription.unsubscribe();
	}, []); // Empty dependency array means this runs only on mount

	/**
	 * Logs in a user with email and password
	 * @param email - User's email address
	 * @param password - User's password
	 * @returns Object with error if login fails
	 */
	const login = async (email: string, password: string) => {
		// Call Supabase's password login method
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		return { error }; // Return error object (null if successful)
	};

	/**
	 * Registers a new user with email and password
	 * @param email - New user's email
	 * @param password - New user's password
	 * @returns Object with error if registration fails
	 */
	const register = async (email: string, password: string) => {
		// Call Supabase's signup method
		const { error } = await supabase.auth.signUp({ email, password });
		return { error }; // Return error object (null if successful)
	};

	/**
	 * Initiates Google OAuth login flow
	 * @returns Object with error if OAuth flow fails
	 */
	const loginWithGoogle = async () => {
		// Call Supabase's OAuth method with Google provider
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				// Specify where Google should redirect after auth
				redirectTo: `${window.location.origin}/auth/callback`
			}
		});
		return { error }; // Return error object (null if successful)
	};

	/**
	 * Logs out the current user
	 */
	const logout = async () => {
		// Call Supabase's logout method
		await supabase.auth.signOut();
		// Note: onAuthStateChange listener will handle state updates
	};

	/**
	 * Initiates password reset flow for a user
	 * @param email - Email address to send reset instructions to
	 * @returns Object with error if request fails
	 */
	const resetPassword = async (email: string) => {
		// Call Supabase's password reset method
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			// Specify where user should be redirected after clicking reset link
			redirectTo: `${window.location.origin}/auth/new-password`
		});
		return { error }; // Return error object (null if successful)
	};

	/**
	 * Updates the current user's password
	 * @param newPassword - The new password to set
	 * @returns Object with error if update fails
	 */
	const updatePassword = async (newPassword: string) => {
		// Call Supabase's user update method
		const { error } = await supabase.auth.updateUser({ password: newPassword });
		return { error }; // Return error object (null if successful)
	};

	// The value object that will be provided to consumers
	const value = {
		user,
		session,
		loading,
		login,
		register,
		loginWithGoogle,
		logout,
		resetPassword,
		updatePassword,
	};

	// Render the provider with the context value
	return (
		<AuthContext.Provider value={value}>
			{children}  {/* Render child components */}
		</AuthContext.Provider>
	);
};

/**
 * Custom hook for consuming auth context
 * @throws Error if used outside AuthProvider
 * @returns The auth context value
 */
export const useAuth = () => {
	// Get the context from React's context system
	const context = useContext(AuthContext);

	// Safety check - ensures hook is used within a provider
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}

	return context; // Return the auth context
};