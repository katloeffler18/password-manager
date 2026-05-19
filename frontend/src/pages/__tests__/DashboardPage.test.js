import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import DashboardPage from "../../pages/DashboardPage";

// Mock the React Router navigation hook
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
	...jest.requireActual("react-router-dom"),
	useNavigate: () => mockNavigate,
}));

jest.mock("../../context/AuthContext", () => ({
	useAuth: () => ({
		isAuthenticated: true,
		user: { email: "test@example.com" },
		logout: jest.fn(),
		vaultPassword: "MasterPass2026!",
	}),
}));

// Mock the custom useVault hook to bypass actual API network fetch streams
jest.mock("../../hooks/useVault", () => ({
	__esModule: true,
	default: () => ({
		items: [
			{
				id: 1,
				title: "GitHub Profile",
				username: "spencer_lan",
				service: "github.com",
				password: "gHp_K9x27mNqZ4vLpQ99!",
			},
			{
				id: 2,
				title: "Personal Gmail",
				username: "spencerlan@example.com",
				service: "mail.google.com",
				password: "mAsTeR_gMaIl_2026$",
			},
		],
		loading: false,
		error: null,
		createItem: jest.fn(),
		updateItem: jest.fn(),
		deleteItem: jest.fn(),
	}),
}));

// Mock clipboard API functionality
const mockWriteText = jest.fn();
Object.assign(navigator, {
	clipboard: { writeText: mockWriteText },
});

describe("DashboardPage Component Tests", () => {
	beforeEach(() => {
		jest.useFakeTimers();
		mockWriteText.mockClear();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	test("renders dummy vault credentials cards properly", () => {
		render(<DashboardPage />);

		expect(screen.getByText("GitHub Profile")).toBeInTheDocument();
		expect(screen.getByText("Username: spencer_lan")).toBeInTheDocument();
		expect(screen.getByText("Personal Gmail")).toBeInTheDocument();
	});

	test("filters vault items grid interactively when using search input bar", () => {
		render(<DashboardPage />);

		const searchInput = screen.getByPlaceholderText(
			"Search saved passwords",
		);

		// Type "Gmail" into the persistent filter engine input
		fireEvent.change(searchInput, { target: { value: "Gmail" } });

		expect(screen.getByText("Personal Gmail")).toBeInTheDocument();
		expect(screen.queryByText("GitHub Profile")).not.toBeInTheDocument();
	});

	test("triggers copy tracking clipboard operation and toggles success button text indicator", async () => {
		render(<DashboardPage />);

		// Grab the first copy button mapped on the grid system layout
		const copyButtons = screen.getAllByText("Copy Password");
		fireEvent.click(copyButtons[0]);

		// Check if the underlying browser native clipboard function was called
		expect(mockWriteText).toHaveBeenCalledWith("gHp_K9x27mNqZ4vLpQ99!");

		// Verify immediate visual feedback success state
		expect(screen.getByText("Copied!")).toBeInTheDocument();

		// Advance timers by 2 seconds to check if button state text automatically reverts safely
		act(() => {
			jest.advanceTimersByTime(2000);
		});

		expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
	});
});
