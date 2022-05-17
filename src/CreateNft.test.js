import { render, screen } from '@testing-library/react';
import CreateNft from './CreateNft';

test('renders learn react link', () => {
  render(<CreateNft />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
