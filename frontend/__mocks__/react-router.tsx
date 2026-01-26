import { vi } from "vitest";

// Mock react-router hooks
export const useNavigate = vi.fn(() => vi.fn());
export const useLocation = vi.fn(() => ({
  pathname: "/",
  search: "",
  hash: "",
  state: null,
  key: "default",
}));
export const useParams = vi.fn(() => ({}));
export const useSearchParams = vi.fn(() => [new URLSearchParams(), vi.fn()]);

// Mock Link component
export const Link = ({
  children,
  to,
  ...props
}: {
  children: React.ReactNode;
  to: string;
  [key: string]: unknown;
}) => (
  <a href={to} {...props}>
    {children}
  </a>
);

// Mock NavLink component
export const NavLink = ({
  children,
  to,
  ...props
}: {
  children: React.ReactNode;
  to: string;
  [key: string]: unknown;
}) => (
  <a href={to} {...props}>
    {children}
  </a>
);

// Mock Outlet component
export const Outlet = () => <div data-testid="outlet" />;

// Mock Navigate component
export const Navigate = ({
  to,
  replace,
}: {
  to: string;
  replace?: boolean;
}) => {
  const navigate = useNavigate();
  navigate(to, { replace });
  return null;
};

export default {
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Link,
  NavLink,
  Outlet,
  Navigate,
};
