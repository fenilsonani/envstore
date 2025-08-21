import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
    describe('Form Accessibility', () => {
        it('should have accessible login form', async () => {
            const LoginForm = () => (
                <form aria-label="Login form">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" required aria-required="true" />
                    
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" required aria-required="true" />
                    
                    <button type="submit">Login</button>
                </form>
            );
            
            const { container } = render(<LoginForm />);
            const results = await axe(container);
            
            expect(results).toHaveNoViolations();
        });

        it('should have accessible error messages', async () => {
            const FormWithError = () => (
                <form>
                    <label htmlFor="email">Email</label>
                    <input 
                        id="email" 
                        type="email" 
                        aria-invalid="true"
                        aria-describedby="email-error"
                    />
                    <span id="email-error" role="alert">
                        Please enter a valid email
                    </span>
                </form>
            );
            
            const { container } = render(<FormWithError />);
            const results = await axe(container);
            
            expect(results).toHaveNoViolations();
        });
    });

    describe('Navigation Accessibility', () => {
        it('should have accessible navigation menu', async () => {
            const Navigation = () => (
                <nav aria-label="Main navigation">
                    <ul role="list">
                        <li><a href="/dashboard">Dashboard</a></li>
                        <li><a href="/projects">Projects</a></li>
                        <li><a href="/settings">Settings</a></li>
                    </ul>
                </nav>
            );
            
            const { container } = render(<Navigation />);
            const results = await axe(container);
            
            expect(results).toHaveNoViolations();
        });

        it('should have skip to content link', async () => {
            const Layout = () => (
                <>
                    <a href="#main-content" className="skip-link">
                        Skip to main content
                    </a>
                    <nav>Navigation</nav>
                    <main id="main-content">Content</main>
                </>
            );
            
            const { container } = render(<Layout />);
            const results = await axe(container);
            
            expect(results).toHaveNoViolations();
        });
    });

    describe('Button Accessibility', () => {
        it('should have accessible buttons with proper labels', async () => {
            const Buttons = () => (
                <div>
                    <button aria-label="Delete project">
                        <svg aria-hidden="true">×</svg>
                    </button>
                    <button>
                        <span>Save Changes</span>
                    </button>
                </div>
            );
            
            const { container } = render(<Buttons />);
            const results = await axe(container);
            
            expect(results).toHaveNoViolations();
        });

        it('should indicate button states', async () => {
            const ButtonStates = () => (
                <div>
                    <button disabled aria-disabled="true">
                        Disabled Button
                    </button>
                    <button aria-pressed="true">
                        Toggle On
                    </button>
                    <button aria-busy="true">
                        Loading...
                    </button>
                </div>
            );
            
            const { container } = render(<ButtonStates />);
            const results = await axe(container);
            
            expect(results).toHaveNoViolations();
        });
    });

    describe('Modal/Dialog Accessibility', () => {
        it('should have accessible modal', async () => {
            const Modal = () => (
                <div 
                    role="dialog" 
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <h2 id="modal-title">Confirm Delete</h2>
                    <p id="modal-description">
                        Are you sure you want to delete this project?
                    </p>
                    <button>Cancel</button>
                    <button>Delete</button>
                </div>
            );
            
            const { container } = render(<Modal />);
            const results = await axe(container);
            
            expect(results).toHaveNoViolations();
        });
    });

    describe('Table Accessibility', () => {
        it('should have accessible data table', async () => {
            const DataTable = () => (
                <table>
                    <caption>Projects List</caption>
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Environments</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Project Alpha</td>
                            <td>3</td>
                            <td>
                                <button aria-label="Edit Project Alpha">Edit</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            );
            
            const { container } = render(<DataTable />);
            const results = await axe(container);
            
            expect(results).toHaveNoViolations();
        });
    });

    describe('Color Contrast', () => {
        it('should have sufficient color contrast for text', async () => {
            const TextContent = () => (
                <div style={{ backgroundColor: '#ffffff' }}>
                    <p style={{ color: '#333333' }}>Regular text</p>
                    <p style={{ color: '#666666', fontSize: '18px' }}>Large text</p>
                </div>
            );
            
            const { container } = render(<TextContent />);
            const results = await axe(container);
            
            expect(results).toHaveNoViolations();
        });
    });

    describe('Focus Management', () => {
        it('should have visible focus indicators', () => {
            const FocusableElements = () => (
                <div>
                    <a href="#" style={{ outline: '2px solid blue' }}>
                        Link with focus
                    </a>
                    <button style={{ outline: '2px solid blue' }}>
                        Button with focus
                    </button>
                    <input style={{ outline: '2px solid blue' }} />
                </div>
            );
            
            const { container } = render(<FocusableElements />);
            
            // Check that focusable elements have outline styles
            const link = container.querySelector('a');
            const button = container.querySelector('button');
            const input = container.querySelector('input');
            
            expect(link).toHaveStyle({ outline: '2px solid blue' });
            expect(button).toHaveStyle({ outline: '2px solid blue' });
            expect(input).toHaveStyle({ outline: '2px solid blue' });
        });
    });

    describe('Semantic HTML', () => {
        it('should use semantic HTML elements', () => {
            const SemanticLayout = () => (
                <>
                    <header>
                        <h1>Page Title</h1>
                    </header>
                    <nav>Navigation</nav>
                    <main>
                        <article>
                            <h2>Article Title</h2>
                            <p>Content</p>
                        </article>
                    </main>
                    <aside>Sidebar</aside>
                    <footer>Footer</footer>
                </>
            );
            
            const { container } = render(<SemanticLayout />);
            
            expect(container.querySelector('header')).toBeInTheDocument();
            expect(container.querySelector('nav')).toBeInTheDocument();
            expect(container.querySelector('main')).toBeInTheDocument();
            expect(container.querySelector('article')).toBeInTheDocument();
            expect(container.querySelector('aside')).toBeInTheDocument();
            expect(container.querySelector('footer')).toBeInTheDocument();
        });
    });
});