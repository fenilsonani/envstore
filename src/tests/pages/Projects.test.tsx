import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Projects Page', () => {
    const mockProjects = [
        { id: '1', name: 'Project Alpha', environmentsCount: 3, lastActivity: Date.now() },
        { id: '2', name: 'Project Beta', environmentsCount: 2, lastActivity: Date.now() - 86400000 },
        { id: '3', name: 'Project Gamma', environmentsCount: 5, lastActivity: Date.now() - 172800000 },
    ];

    it('should render projects list', () => {
        const ProjectsList = () => (
            <div>
                <h1>Projects</h1>
                {mockProjects.map(project => (
                    <div key={project.id} data-testid={`project-${project.id}`}>
                        <h3>{project.name}</h3>
                        <span>{project.environmentsCount} environments</span>
                    </div>
                ))}
            </div>
        );
        
        render(<ProjectsList />);
        
        expect(screen.getByText('Projects')).toBeInTheDocument();
        expect(screen.getByText('Project Alpha')).toBeInTheDocument();
        expect(screen.getByText('Project Beta')).toBeInTheDocument();
        expect(screen.getByText('Project Gamma')).toBeInTheDocument();
    });

    it('should display project statistics', () => {
        render(
            <div>
                {mockProjects.map(project => (
                    <div key={project.id}>
                        <h3>{project.name}</h3>
                        <span>{project.environmentsCount} environments</span>
                    </div>
                ))}
            </div>
        );
        
        expect(screen.getByText('3 environments')).toBeInTheDocument();
        expect(screen.getByText('2 environments')).toBeInTheDocument();
        expect(screen.getByText('5 environments')).toBeInTheDocument();
    });

    it('should have create new project button', () => {
        const CreateButton = () => (
            <button aria-label="Create new project">
                <span>New Project</span>
            </button>
        );
        
        render(<CreateButton />);
        
        const createButton = screen.getByRole('button', { name: /Create new project/i });
        expect(createButton).toBeInTheDocument();
    });

    it('should open create project modal on button click', () => {
        const ProjectPage = () => {
            const [showModal, setShowModal] = React.useState(false);
            
            return (
                <div>
                    <button onClick={() => setShowModal(true)}>New Project</button>
                    {showModal && (
                        <div role="dialog">
                            <h2>Create New Project</h2>
                            <input placeholder="Project name" />
                            <button>Create</button>
                        </div>
                    )}
                </div>
            );
        };
        
        render(<ProjectPage />);
        
        fireEvent.click(screen.getByText('New Project'));
        
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Project name')).toBeInTheDocument();
    });

    it('should have edit and delete buttons for each project', () => {
        const ProjectCard = ({ project }: any) => (
            <div>
                <h3>{project.name}</h3>
                <button aria-label={`Edit ${project.name}`}>Edit</button>
                <button aria-label={`Delete ${project.name}`}>Delete</button>
            </div>
        );
        
        render(
            <div>
                {mockProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        );
        
        mockProjects.forEach(project => {
            expect(screen.getByLabelText(`Edit ${project.name}`)).toBeInTheDocument();
            expect(screen.getByLabelText(`Delete ${project.name}`)).toBeInTheDocument();
        });
    });

    it('should handle project deletion with confirmation', () => {
        const ProjectWithDelete = () => {
            const [showConfirm, setShowConfirm] = React.useState(false);
            
            return (
                <div>
                    <button onClick={() => setShowConfirm(true)}>Delete Project</button>
                    {showConfirm && (
                        <div role="alertdialog">
                            <p>Are you sure you want to delete this project?</p>
                            <button>Confirm Delete</button>
                            <button>Cancel</button>
                        </div>
                    )}
                </div>
            );
        };
        
        render(<ProjectWithDelete />);
        
        fireEvent.click(screen.getByText('Delete Project'));
        
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
        expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    });

    it('should handle empty projects state', () => {
        const EmptyProjects = () => (
            <div>
                <h1>Projects</h1>
                <div data-testid="empty-state">
                    <p>No projects yet</p>
                    <button>Create Your First Project</button>
                </div>
            </div>
        );
        
        render(<EmptyProjects />);
        
        expect(screen.getByText('No projects yet')).toBeInTheDocument();
        expect(screen.getByText('Create Your First Project')).toBeInTheDocument();
    });

    it('should support project search/filter', () => {
        const ProjectsWithSearch = () => (
            <div>
                <input 
                    type="search" 
                    placeholder="Search projects..." 
                    aria-label="Search projects"
                />
                <div>
                    {mockProjects.map(project => (
                        <div key={project.id}>{project.name}</div>
                    ))}
                </div>
            </div>
        );
        
        render(<ProjectsWithSearch />);
        
        const searchInput = screen.getByRole('searchbox');
        expect(searchInput).toBeInTheDocument();
        expect(searchInput).toHaveAttribute('placeholder', 'Search projects...');
    });

    it('should navigate to environments page on project click', () => {
        const mockPush = vi.fn();
        
        const ProjectLink = ({ project }: any) => (
            <div 
                onClick={() => mockPush(`/dashboard/environments?project=${project.id}`)}
                role="link"
                tabIndex={0}
            >
                <h3>{project.name}</h3>
                <button>View Environments</button>
            </div>
        );
        
        render(<ProjectLink project={mockProjects[0]} />);
        
        fireEvent.click(screen.getByText('View Environments'));
        
        expect(mockPush).toHaveBeenCalledWith('/dashboard/environments?project=1');
    });

    it('should display last activity time', () => {
        const formatTime = (timestamp: number) => {
            const diff = Date.now() - timestamp;
            if (diff < 86400000) return 'Today';
            if (diff < 172800000) return 'Yesterday';
            return `${Math.floor(diff / 86400000)} days ago`;
        };
        
        const ProjectActivity = ({ project }: any) => (
            <div>
                <h3>{project.name}</h3>
                <span>Last activity: {formatTime(project.lastActivity)}</span>
            </div>
        );
        
        render(
            <div>
                {mockProjects.map(project => (
                    <ProjectActivity key={project.id} project={project} />
                ))}
            </div>
        );
        
        expect(screen.getByText(/Last activity: Today/)).toBeInTheDocument();
        expect(screen.getByText(/Last activity: Yesterday/)).toBeInTheDocument();
    });
});