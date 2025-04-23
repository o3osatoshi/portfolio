import { Button } from "@workspace/ui/components/button";
import "./header.css";

type User = {
  name: string;
};

export interface HeaderProps {
  user?: User;
  onLogin?: () => void;
  onLogout?: () => void;
  onCreateAccount?: () => void;
}

export const Header = ({
  user,
  onLogin,
  onLogout,
  onCreateAccount,
}: HeaderProps) => (
  <header>
    <div className="storybook-header">
      <div>
        <h1>Acme</h1>
      </div>
      <div>
        {user ? (
          <>
            <span className="welcome">
              Welcome, <b>{user.name}</b>!
            </span>
            <Button onClick={onLogout}>Log out</Button>
          </>
        ) : (
          <>
            <Button onClick={onLogin}>Log in</Button>
            <Button onClick={onCreateAccount}>Sign up</Button>
          </>
        )}
      </div>
    </div>
  </header>
);
