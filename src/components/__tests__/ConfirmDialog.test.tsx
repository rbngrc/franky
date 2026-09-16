import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows title and message when open', () => {
    render(<ConfirmDialog open={true} title="Eliminar camión" message="¿Seguro que quieres eliminar este camión?" onConfirm={onConfirm} onCancel={onCancel} />);

    expect(screen.getByText('Eliminar camión')).toBeInTheDocument();
    expect(screen.getByText('¿Seguro que quieres eliminar este camión?')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    const { container } = render(<ConfirmDialog open={false} title="Eliminar camión" message="¿Seguro?" onConfirm={onConfirm} onCancel={onCancel} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('calls onConfirm when the confirm button is clicked', () => {
    render(<ConfirmDialog open={true} title="Eliminar" message="¿Seguro?" onConfirm={onConfirm} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the cancel button is clicked', () => {
    render(<ConfirmDialog open={true} title="Eliminar" message="¿Seguro?" onConfirm={onConfirm} onCancel={onCancel} />);

    fireEvent.click(screen.getByText('Cancelar'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});