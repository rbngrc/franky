import { render, screen } from '@testing-library/react';
import { LoadingIndicator } from '../LoadingIndicator';

describe('LoadingIndicator', () => {
  it('renders the loading text and container', () => {
    const { container } = render(<LoadingIndicator />);

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    expect(container.querySelector('.loading-container')).toBeInTheDocument();
    expect(container.querySelector('.loading-bar')).toBeInTheDocument();
    expect(container.querySelector('.loading-bar-fill')).toBeInTheDocument();
  });
});