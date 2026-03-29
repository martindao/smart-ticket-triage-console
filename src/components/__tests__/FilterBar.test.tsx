import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import App from '../../App';

describe('FilterBar integration', () => {
  it('updates visible ticket list when filters change', async () => {
    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByPlaceholderText('Search tickets...');
    await user.type(searchInput, 'Dark mode');

    expect(screen.getByText('Feature request: Dark mode')).toBeInTheDocument();
    expect(screen.queryByText('API rate limit errors')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    const filterSelects = screen.getAllByRole('combobox');
    await user.selectOptions(filterSelects[1], 'Resolved');

    expect(screen.getByText('Login page slow on mobile')).toBeInTheDocument();
    expect(screen.queryByText('Invoice PDF not downloading')).not.toBeInTheDocument();
  });
});
