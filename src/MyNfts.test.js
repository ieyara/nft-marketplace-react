import { render, screen } from '@testing-library/react';
import MyNfts from './MyNfts';

test('renders learn react link', () => {
  render(<MyNfts />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
